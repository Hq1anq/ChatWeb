import { getConnection } from '../lib/db.js';

export const GroupModel = {
  // 1. Tạo nhóm mới
  create: async (name, ownerId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('name', name)
      .input('owner_id', ownerId)
      .query(`
        INSERT INTO Groups (name, owner_id) 
        OUTPUT INSERTED.groupid, INSERTED.name, INSERTED.group_pic, INSERTED.owner_id
        VALUES (@name, @owner_id)
      `);
    return result.recordset[0];
  },

  // 2. Thêm thành viên vào nhóm
  addMember: async (groupId, userId, role = 'member') => {
    const pool = await getConnection();
    await pool.request()
      .input('group_id', groupId)
      .input('user_id', userId)
      .input('role', role)
      .query(`
        INSERT INTO GroupMembers (group_id, user_id, role)
        VALUES (@group_id, @user_id, @role)
      `);
  },

  // 3. Lấy danh sách nhóm mà user đang tham gia (để hiển thị Sidebar)
  getGroupsByUser: async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', userId)
      .query(`
        SELECT g.* FROM Groups g
        JOIN GroupMembers gm ON g.groupid = gm.group_id
        WHERE gm.user_id = @user_id
        ORDER BY g.updated_at DESC
      `);
    return result.recordset;
  },

  // 4. Lấy chi tiết thành viên trong nhóm (để hiển thị trong chat hoặc settings)
  getGroupMembers: async (groupId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('group_id', groupId)
      .query(`
        SELECT u.userid, u.fullname, u.profilepic, gm.role, gm.nickname, gm.joined_at
        FROM GroupMembers gm
        JOIN Users u ON gm.user_id = u.userid
        WHERE gm.group_id = @group_id
      `);
    return result.recordset;
  },

  // 5. Kiểm tra xem user có phải admin của nhóm không (để cho phép xóa/sửa nhóm)
  isGroupAdmin: async (groupId, userId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('group_id', groupId)
      .input('user_id', userId)
      .query(`
        SELECT role FROM GroupMembers 
        WHERE group_id = @group_id AND user_id = @user_id AND role = 'admin'
      `);
    return result.recordset.length > 0;
  },

  getGroupsByUser: async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('user_id', userId)
      .query(`
        -- 1. Lấy danh sách Group mà user tham gia
        WITH UserGroups AS (
            SELECT g.*
            FROM Groups g
            JOIN GroupMembers gm ON g.groupid = gm.group_id
            WHERE gm.user_id = @user_id
        ),
        -- 2. Lấy tin nhắn mới nhất cho từng Group
        LatestMessages AS (
            SELECT 
                m.group_id, 
                m.content, 
                m.[file], -- <--- SỬA LỖI: Thêm ngoặc vuông [file]
                m.created, 
                m.senderid,
                u.fullname as senderName,
                ROW_NUMBER() OVER (PARTITION BY m.group_id ORDER BY m.created DESC) as rn
            FROM Messages m
            JOIN Users u ON m.senderid = u.userid
            WHERE m.group_id IN (SELECT groupid FROM UserGroups)
        )
        -- 3. Kết hợp lại
        SELECT 
            ug.*, 
            lm.content AS latestMessage, 
            lm.[file] AS latestFile, -- <--- SỬA LỖI: Thêm ngoặc vuông [file]
            lm.created AS latestTime,
            lm.senderName AS latestSenderName,
            lm.senderid AS latestSenderId
        FROM UserGroups ug
        LEFT JOIN LatestMessages lm ON ug.groupid = lm.group_id AND lm.rn = 1
        ORDER BY COALESCE(lm.created, ug.created_at) DESC
      `);
    return result.recordset;
  },

  updateNickname: async (groupId, userId, nickname) => {
    const pool = await getConnection();
    await pool.request()
      .input('group_id', groupId)
      .input('user_id', userId)
      .input('nickname', nickname)
      .query(`
        UPDATE GroupMembers
        SET nickname = @nickname
        WHERE group_id = @group_id AND user_id = @user_id
      `);
  },
};