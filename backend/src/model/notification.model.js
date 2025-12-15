import { getConnection } from '../lib/db.js';

export const NotificationModel = {
  // Tạo thông báo mới
  create: async ({ receiver_id, sender_id, group_id, type, content }) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('receiver_id', receiver_id)
      .input('sender_id', sender_id)
      .input('group_id', group_id)
      .input('type', type) // 'TAG', 'ADD_GROUP'
      .input('content', content)
      .query(`
        INSERT INTO Notifications (receiver_id, sender_id, group_id, type, content)
        OUTPUT INSERTED.*
        VALUES (@receiver_id, @sender_id, @group_id, @type, @content)
      `);
    return result.recordset[0];
  },

  // Lấy thông báo của user (sắp xếp mới nhất trước)
  getByUser: async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', userId)
      .query(`
        SELECT n.*, 
               s.fullname as senderName, 
               s.profilepic as senderPic,
               g.name as groupName,
               g.group_pic as groupPic -- <--- LẤY THÊM ẢNH NHÓM
        FROM Notifications n
        LEFT JOIN Users s ON n.sender_id = s.userid
        LEFT JOIN Groups g ON n.group_id = g.groupid
        WHERE n.receiver_id = @user_id
        ORDER BY n.created_at DESC
      `);
    return result.recordset;
  },

  // Đánh dấu đã đọc
  markAsRead: async (notifId) => {
    const pool = await getConnection();
    await pool.request()
      .input('notif_id', notifId)
      .query(`UPDATE Notifications SET is_read = 1 WHERE notif_id = @notif_id`);
  }
};