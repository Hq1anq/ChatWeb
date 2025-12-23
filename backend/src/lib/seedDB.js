import bcrypt from 'bcryptjs'
import { getConnection } from './db.js' // Đảm bảo đường dẫn đúng

async function seedDatabase() {
  try {
    const pool = await getConnection()

    console.log('🗑️  Cleaning database...')
    // Xóa theo thứ tự để tránh lỗi khóa ngoại
    await pool.request().query('DELETE FROM Notifications')
    await pool.request().query('DELETE FROM Messages')
    await pool.request().query('DELETE FROM GroupMembers')
    await pool.request().query('DELETE FROM Groups')
    await pool.request().query('DELETE FROM Users')

    // Reset identity
    await pool.request().query('DBCC CHECKIDENT (Users, RESEED, 0)')
    await pool.request().query('DBCC CHECKIDENT (Groups, RESEED, 0)')
    await pool.request().query('DBCC CHECKIDENT (Messages, RESEED, 0)')

    console.log('🌱 Seeding Users...')
    
    // 1. Tạo Users
    const users = [
      { email: 'alice@example.com', fullname: 'Alice Johnson', password: 'password123', bio: 'Admin team' },
      { email: 'bob@example.com', fullname: 'Bob Smith', password: 'password123', bio: 'Dev' },
      { email: 'charlie@example.com', fullname: 'Charlie Brown', password: 'password123', bio: 'Tester' },
    ]

    const createdUsers = []

    for (const user of users) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(user.password, salt)

      const result = await pool.request()
        .input('email', user.email)
        .input('fullname', user.fullname)
        .input('password', hashedPassword)
        .input('bio', user.bio)
        .query(`
          INSERT INTO Users (email, fullname, password, bio) 
          OUTPUT INSERTED.userid, INSERTED.email, INSERTED.fullname 
          VALUES (@email, @fullname, @password, @bio)
        `)
      createdUsers.push(result.recordset[0])
    }
    console.log(`✅ Created ${createdUsers.length} users`)

    // 2. Tạo Group (Alice tạo nhóm "Project Alpha")
    console.log('🌱 Seeding Groups...')
    const groupRes = await pool.request()
      .input('name', 'Project Alpha')
      .input('owner_id', createdUsers[0].userid) // Alice is owner
      .query(`
        INSERT INTO Groups (name, owner_id) 
        OUTPUT INSERTED.groupid, INSERTED.name 
        VALUES (@name, @owner_id)
      `)
    const group = groupRes.recordset[0]
    console.log(`✅ Created Group: ${group.name}`)

    // 3. Add Members to Group
    console.log('🌱 Adding Members...')
    // Add Alice (Admin)
    await pool.request()
       .query(`INSERT INTO GroupMembers (group_id, user_id, role, nickname) VALUES (${group.groupid}, ${createdUsers[0].userid}, 'admin', 'Ali-Boss')`)
    
    // Add Bob (Member)
    await pool.request()
       .query(`INSERT INTO GroupMembers (group_id, user_id, role, nickname) VALUES (${group.groupid}, ${createdUsers[1].userid}, 'member', 'Bobby')`)
    
    // Add Charlie (Member)
    await pool.request()
       .query(`INSERT INTO GroupMembers (group_id, user_id, role, nickname) VALUES (${group.groupid}, ${createdUsers[2].userid}, 'member', NULL)`)

    // 4. Seeding Messages
    console.log('🌱 Seeding Messages...')
    
    const messages = [
      // Chat 1-1: Alice -> Bob
      { senderid: createdUsers[0].userid, receiverid: createdUsers[1].userid, group_id: null, content: 'Hey Bob, private message here.' },
      // Chat 1-1: Bob -> Alice
      { senderid: createdUsers[1].userid, receiverid: createdUsers[0].userid, group_id: null, content: 'Got it Alice.' },
      
      // Chat Group: Alice -> Group
      { senderid: createdUsers[0].userid, receiverid: null, group_id: group.groupid, content: 'Hello everyone in Project Alpha!' },
      // Chat Group: Bob -> Group
      { senderid: createdUsers[1].userid, receiverid: null, group_id: group.groupid, content: 'Hi Alice, nice group.' },
      // Chat Group: Charlie -> Group
      { senderid: createdUsers[2].userid, receiverid: null, group_id: group.groupid, content: 'Hi all! @Alice Johnson check this out.' }
    ]

    for (const msg of messages) {
      await pool.request()
        .input('senderid', msg.senderid)
        .input('receiverid', msg.receiverid) // Có thể null
        .input('group_id', msg.group_id)     // Có thể null
        .input('content', msg.content)
        .query(`
          INSERT INTO Messages (senderid, receiverid, group_id, content) 
          VALUES (@senderid, @receiverid, @group_id, @content)
        `)
    }
    console.log(`✅ Created ${messages.length} messages (Direct & Group)`)

    console.log('🎉 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()