import { getConnection } from '../lib/db.js'
import sql from 'mssql'

const Message = {
  // Cập nhật: Thêm tham số group_id
  async create({ senderid, receiverid, group_id, content, file }) {
    const pool = await getConnection()
    
    // Nếu là chat nhóm -> receiverid = null. Nếu chat riêng -> group_id = null
    // Logic này đã được handle ở Controller, ở đây chỉ cần nhận vào
    
    const result = await pool
      .request()
      .input('senderid', sql.Int, senderid)
      .input('receiverid', sql.Int, receiverid || null) // Cho phép null
      .input('group_id', sql.Int, group_id || null)     // MỚI: Cho phép null
      .input('content', sql.NVarChar(sql.MAX), content)
      .input('file', sql.NVarChar(sql.MAX), file ?? null)
      .query(`
        INSERT INTO Messages (senderid, receiverid, group_id, content, [file])
        OUTPUT INSERTED.*
        VALUES (@senderid, @receiverid, @group_id, @content, @file);
      `)
    
    // <--- MỚI: Nếu là tin nhắn nhóm, cần trả về thêm thông tin người gửi (fullname, profilepic)
    // để Socket emit về Client hiển thị được ngay lập tức
    if (group_id) {
       const msg = result.recordset[0];
       const userRes = await pool.request().input('uid', senderid).query('SELECT fullname, profilepic FROM Users WHERE userid = @uid');
       return { ...msg, sender: userRes.recordset[0] }; 
    }
    
    return result.recordset[0]
  },

  async getConversation({ myId, friendId }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('myId', sql.Int, myId)
      .input('friendId', sql.Int, friendId).query(`
        SELECT *
        FROM Messages
        WHERE (senderid = @myId AND receiverid = @friendId)
           OR (senderid = @friendId AND receiverid = @myId)
        ORDER BY created ASC;
      `)
    return result.recordset
  },

  // <--- MỚI: Hàm lấy tin nhắn của Group
  async getGroupMessages({ groupId }) {
    const pool = await getConnection()
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT 
            m.*, 
            u.fullname, 
            u.profilepic,
            gm.nickname -- <--- LẤY THÊM CỘT NÀY
        FROM Messages m
        JOIN Users u ON m.senderid = u.userid
        -- Join để lấy biệt danh của người gửi TRONG nhóm này
        LEFT JOIN GroupMembers gm ON m.group_id = gm.group_id AND m.senderid = gm.user_id
        WHERE m.group_id = @groupId
        ORDER BY m.created ASC;
      `)
    return result.recordset
  }
}

export default Message