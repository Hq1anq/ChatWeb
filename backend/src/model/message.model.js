import { getConnection } from '../lib/db.js'
import sql from 'mssql'

const Message = {
  // Tạo tin nhắn mới - hỗ trợ Reply và Forward
  async create({ senderid, receiverid, group_id, content, file, replyToId = null, isForwarded = false }) {
    const pool = await getConnection()
    
    const result = await pool
      .request()
      .input('senderid', sql.Int, senderid)
      .input('receiverid', sql.Int, receiverid || null)
      .input('group_id', sql.Int, group_id || null)
      .input('content', sql.NVarChar(sql.MAX), content)
      .input('file', sql.NVarChar(sql.MAX), file ?? null)
      .input('replyToId', sql.Int, replyToId || null)
      .input('isForwarded', sql.Bit, isForwarded ? 1 : 0)
      .query(`
        INSERT INTO Messages (senderid, receiverid, group_id, content, [file], replyToId, isForwarded)
        OUTPUT INSERTED.*
        VALUES (@senderid, @receiverid, @group_id, @content, @file, @replyToId, @isForwarded);
      `)
    
    // Nếu là tin nhắn nhóm, trả về thêm thông tin người gửi
    if (group_id) {
       const msg = result.recordset[0];
       const userRes = await pool.request().input('uid', senderid).query('SELECT fullname, profilepic FROM Users WHERE userid = @uid');
       return { ...msg, sender: userRes.recordset[0] }; 
    }
    
    return result.recordset[0]
  },

  // Lấy tin nhắn theo ID
  async getById(messageId) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('messageId', sql.Int, messageId)
      .query(`
        SELECT m.messageid, m.senderid, m.receiverid, m.group_id, m.content, m.[file], m.created, m.replyToId, m.isForwarded, u.fullname, u.profilepic
        FROM Messages m
        JOIN Users u ON m.senderid = u.userid
        WHERE m.messageid = @messageId
      `)
    return result.recordset[0]
  },

  async getConversation({ myId, friendId }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('myId', sql.Int, myId)
      .input('friendId', sql.Int, friendId)
      .query(`
        SELECT 
          m.messageid, m.senderid, m.receiverid, m.group_id, m.content, m.[file], m.created, m.seen, m.seenAt, m.replyToId, m.isForwarded,
          rm.content as replyContent,
          rm.[file] as replyFile,
          ru.fullname as replySenderName,
          rm.senderid as replySenderId
        FROM Messages m
        LEFT JOIN Messages rm ON m.replyToId = rm.messageid
        LEFT JOIN Users ru ON rm.senderid = ru.userid
        WHERE (m.senderid = @myId AND m.receiverid = @friendId)
           OR (m.senderid = @friendId AND m.receiverid = @myId)
        ORDER BY m.created ASC;
      `)
    return result.recordset
  },

  // Lấy tin nhắn của Group - có thêm thông tin reply
  async getGroupMessages({ groupId }) {
    const pool = await getConnection()
    const result = await pool.request()
      .input('groupId', sql.Int, groupId)
      .query(`
        SELECT 
          m.messageid, m.senderid, m.receiverid, m.group_id, m.content, m.[file], m.created, m.seen, m.seenAt, m.replyToId, m.isForwarded,
          u.fullname, 
          u.profilepic,
          gm.nickname,
          rm.content as replyContent,
          rm.[file] as replyFile,
          ru.fullname as replySenderName,
          rm.senderid as replySenderId
        FROM Messages m
        JOIN Users u ON m.senderid = u.userid
        LEFT JOIN GroupMembers gm ON m.group_id = gm.group_id AND m.senderid = gm.user_id
        LEFT JOIN Messages rm ON m.replyToId = rm.messageid
        LEFT JOIN Users ru ON rm.senderid = ru.userid
        WHERE m.group_id = @groupId
        ORDER BY m.created ASC;
      `)
    return result.recordset
  }
}

export default Message