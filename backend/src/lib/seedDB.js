import bcrypt from 'bcryptjs'
import { getConnection } from './db.js'

async function seedDatabase() {
  try {
    const pool = await getConnection()

    console.log('🗑️  Đang dọn dẹp dữ liệu cũ theo thứ tự ràng buộc...')
    await pool.request().query('DELETE FROM Notifications')
    await pool.request().query('DELETE FROM Reactions')
    await pool.request().query('DELETE FROM Messages')
    await pool.request().query('DELETE FROM GroupMembers')
    await pool.request().query('DELETE FROM Groups')
    await pool.request().query('DELETE FROM Users')

    // Reset Identity về 0
    const tables = ['Users', 'Groups', 'Messages', 'GroupMembers', 'Reactions', 'Notifications']
    for (const table of tables) {
      await pool.request().query(`IF EXISTS (SELECT * FROM sys.identity_columns WHERE object_id = OBJECT_ID('${table}')) DBCC CHECKIDENT (${table}, RESEED, 0)`)
    }

    console.log('🌱 Đang tạo 10 người dùng...')
    const usersData = [
      { email: 'admin@gmail.com', fullname: 'Nguyễn Văn Admin', password: 'password123', bio: 'Quản trị viên' },
      { email: 'hoang.le@gmail.com', fullname: 'Lê Minh Hoàng', password: 'password123', bio: 'Fullstack Developer' },
      { email: 'thu.hien@gmail.com', fullname: 'Trần Thu Hiền', password: 'password123', bio: 'UI/UX Designer' },
      { email: 'quoc.anh@gmail.com', fullname: 'Phạm Quốc Anh', password: 'password123', bio: 'Backend Engineer' },
      { email: 'lan.chi@gmail.com', fullname: 'Nguyễn Lan Chi', password: 'password123', bio: 'Tester' },
      { email: 'minh.duc@gmail.com', fullname: 'Vũ Minh Đức', password: 'password123', bio: 'Mobile App Dev' },
      { email: 'thanh.thao@gmail.com', fullname: 'Lê Thanh Thảo', password: 'password123', bio: 'Product Owner' },
      { email: 'quang.huy@gmail.com', fullname: 'Trần Quang Huy', password: 'password123', bio: 'Data Scientist' },
      { email: 'ngoc.diep@gmail.com', fullname: 'Đỗ Ngọc Diệp', password: 'password123', bio: 'Marketing' },
      { email: 'bao.long@gmail.com', fullname: 'Trương Bảo Long', password: 'password123', bio: 'DevOps' },
    ]

    const createdUsers = []
    const salt = await bcrypt.genSalt(10)
    for (const u of usersData) {
      const hashedPassword = await bcrypt.hash(u.password, salt)
      const result = await pool.request()
        .input('email', u.email)
        .input('fullname', u.fullname)
        .input('password', hashedPassword)
        .input('bio', u.bio)
        .query(`
          INSERT INTO Users (email, fullname, password, bio) 
          OUTPUT INSERTED.userid 
          VALUES (@email, @fullname, @password, @bio)
        `)
      createdUsers.push({ ...u, userid: result.recordset[0].userid })
    }

    // --- TẠO 2 NHÓM ---
    console.log('🌱 Đang tạo 2 nhóm chat...')
    
    // Nhóm 1: 5 thành viên
    const g1Res = await pool.request()
      .input('name', 'Dự Án Chat App 🚀')
      .input('owner', createdUsers[0].userid)
      .query(`INSERT INTO Groups (name, owner_id) OUTPUT INSERTED.groupid VALUES (@name, @owner)`)
    const g1Id = g1Res.recordset[0].groupid

    // Nhóm 2: 4 thành viên
    const g2Res = await pool.request()
      .input('name', 'Team Ăn Trưa 🍜')
      .input('owner', createdUsers[6].userid)
      .query(`INSERT INTO Groups (name, owner_id) OUTPUT INSERTED.groupid VALUES (@name, @owner)`)
    const g2Id = g2Res.recordset[0].groupid

    // Thêm thành viên Nhóm 1 (Admin + 4 người đầu)
    const g1Members = [0, 1, 2, 3, 4]
    for (const idx of g1Members) {
      await pool.request()
        .input('gid', g1Id)
        .input('uid', createdUsers[idx].userid)
        .input('role', idx === 0 ? 'admin' : 'member')
        .query(`INSERT INTO GroupMembers (group_id, user_id, role) VALUES (@gid, @uid, @role)`)
    }

    // Thêm thành viên Nhóm 2 (Thảo + 3 người cuối)
    const g2Members = [6, 7, 8, 9]
    for (const idx of g2Members) {
      await pool.request()
        .input('gid', g2Id)
        .input('uid', createdUsers[idx].userid)
        .input('role', idx === 6 ? 'admin' : 'member')
        .query(`INSERT INTO GroupMembers (group_id, user_id, role) VALUES (@gid, @uid, @role)`)
    }

    // --- TIN NHẮN ĐA NGÀY ---
    console.log('🌱 Đang tạo tin nhắn...')
    const daysAgo = (n) => {
      let d = new Date();
      d.setDate(d.getDate() - n);
      return d;
    };

    // Chat 1-1: Admin & Hoàng (Chat qua 5 ngày)
    const directMsgs = [
      { s: 0, r: 1, c: 'Hoàng ơi, check task Docker trên Jira nhé.', d: daysAgo(5) },
      { s: 1, r: 0, c: 'Dạ em đang xem, có vài lỗi phân quyền file.', d: daysAgo(4) },
      { s: 0, r: 1, c: 'Cứ fix đi rồi báo anh.', d: daysAgo(3) },
      { s: 1, r: 0, c: 'Em fix xong rồi ạ, anh pull code nhé.', d: daysAgo(1) },
      { s: 0, r: 1, c: 'Ok em, để anh check.', d: daysAgo(0) },
    ]

    for (const m of directMsgs) {
      await pool.request()
        .input('sid', createdUsers[m.s].userid)
        .input('rid', createdUsers[m.r].userid)
        .input('content', m.c)
        .input('date', m.d)
        .query(`INSERT INTO Messages (senderid, receiverid, content, created) VALUES (@sid, @rid, @content, @date)`)
    }

    // Chat Nhóm 1: Tin nhắn rải rác
    const g1Msgs = [
      { s: 0, c: 'Chào cả nhà, hôm nay bắt đầu sprint mới.', d: daysAgo(6) },
      { s: 2, c: 'Thiết kế đã xong 80% rồi ạ.', d: daysAgo(4) },
      { s: 3, c: 'Backend đã sẵn sàng API Auth.', d: daysAgo(2) },
      { s: 4, c: 'Em sẽ viết test case cho phần này.', d: daysAgo(0) },
    ]

    for (const m of g1Msgs) {
      await pool.request()
        .input('sid', createdUsers[m.s].userid)
        .input('gid', g1Id)
        .input('content', m.c)
        .input('date', m.d)
        .query(`INSERT INTO Messages (senderid, group_id, content, created) VALUES (@sid, @gid, @content, @date)`)
    }

    // Tin nhắn chuyển tiếp (Forwarded)
    // Theo schema: isForwarded là BIT
    await pool.request()
      .input('sid', createdUsers[5].userid)
      .input('rid', createdUsers[0].userid)
      .input('content', 'Dự án này cần hoàn thành trước thứ 6 tới.')
      .input('isFwd', 1)
      .input('date', daysAgo(0))
      .query(`INSERT INTO Messages (senderid, receiverid, content, isForwarded, created) VALUES (@sid, @rid, @content, @isFwd, @date)`)

    console.log('🎉 Seed dữ liệu thành công!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi Seed DB:', error)
    process.exit(1)
  }
}

seedDatabase()