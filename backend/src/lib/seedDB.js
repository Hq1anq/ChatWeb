import bcrypt from 'bcryptjs'
import { getConnection } from './db.js'

async function seedDatabase() {
  try {
    const pool = await getConnection()

    // Clear existing data (optional)
    await pool.request().query('DELETE FROM Messages')
    await pool.request().query('DELETE FROM Users')

    // Reset identity counter to 1
    await pool.request().query('DBCC CHECKIDENT (Users, RESEED, 0)')
    await pool.request().query('DBCC CHECKIDENT (Messages, RESEED, 0)')

    console.log('🌱 Seeding database...')

    // Create test users
    const users = [
      {
        email: 'alice@example.com',
        fullname: 'Alice Johnson',
        password: 'password123',
        bio: 'Hello, I am Alice!',
      },
      {
        email: 'bob@example.com',
        fullname: 'Bob Smith',
        password: 'password123',
      },
      {
        email: 'charlie@example.com',
        fullname: 'Charlie Brown',
        password: 'password123',
      },
    ]

    const hashedUsers = []

    for (const user of users) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(user.password, salt)

      const result = await pool
        .request()
        .input('email', user.email)
        .input('fullname', user.fullname)
        .input('password', hashedPassword)
        .input('bio', user.bio || null)
        .query(
          'INSERT INTO Users (email, fullname, password) OUTPUT INSERTED.userid, INSERTED.email, INSERTED.fullname VALUES (@email, @fullname, @password)'
        )

      hashedUsers.push(result.recordset[0])
      console.log(`✅ User created: ${user.email}`)
    }

    // Create test messages
    const messages = [
      {
        senderid: hashedUsers[0].userid,
        receiverid: hashedUsers[1].userid,
        content: 'Hey Bob, how are you?',
      },
      {
        senderid: hashedUsers[1].userid,
        receiverid: hashedUsers[0].userid,
        content: 'Hi Alice! Doing great, thanks for asking!',
      },
      {
        senderid: hashedUsers[0].userid,
        receiverid: hashedUsers[1].userid,
        content: 'Want to grab coffee later?',
      },
      {
        senderid: hashedUsers[1].userid,
        receiverid: hashedUsers[0].userid,
        content: 'Sure! What time works for you?',
      },
      {
        senderid: hashedUsers[2].userid,
        receiverid: hashedUsers[0].userid,
        content: 'Hi Alice!',
      },
      {
        senderid: hashedUsers[0].userid,
        receiverid: hashedUsers[2].userid,
        content: 'Hi Charlie! Good to hear from you!',
      },
    ]

    for (const message of messages) {
      await pool
        .request()
        .input('senderid', message.senderid)
        .input('receiverid', message.receiverid)
        .input('content', message.content)
        .query(
          'INSERT INTO Messages (senderid, receiverid, content) VALUES (@senderid, @receiverid, @content)'
        )
      console.log(`✅ Message created: "${message.content}"`)
    }

    console.log('🎉 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
