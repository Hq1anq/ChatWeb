import { getConnection } from '../lib/db.js'
import sql from 'mssql'

const Message = {
  async create({ senderid, receiverid, content, image }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('senderid', sql.Int, senderid)
      .input('receiverid', sql.Int, receiverid)
      .input('content', sql.NVarChar(sql.MAX), content)
      // 1. Sửa độ dài ảnh thành MAX cho an toàn
      .input('image', sql.NVarChar(sql.MAX), image)
      .query(`
        INSERT INTO Messages (senderId, receiverId, content, image) 
        OUTPUT INSERTED.*
        VALUES (@senderid, @receiverid, @content, @image);
      `)
    return result.recordset[0]
  },

  async getConversation({ myId, friendId }) {
    // console.log(myId, friendId)
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
}

export default Message