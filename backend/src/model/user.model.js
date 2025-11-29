import { getConnection } from '../lib/db.js'
import sql from 'mssql'

export const User = {
  async create({ email, fullname, password, profilepic = '' }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('email', sql.NVarChar(50), email)
      .input('fullname', sql.NVarChar(30), fullname)
      .input('password', sql.NVarChar(100), password)
      .input('profilepic', sql.NVarChar(100), profilepic).query(`
				INSERT INTO Users (email, fullname, [password], profilepic)
        OUTPUT INSERTED.*
				VALUES (@email, @fullname, @password, @profilepic);
			`)
    return result.recordset[0]
  },

  async getAll() {
    const pool = await getConnection()
    const result = await pool
      .request()
      .query('SELECT userid, email, fullname, profilepic FROM Users')
    return result.recordset
  },

  async findByEmail(email) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('email', sql.NVarChar(50), email)
      .query('SELECT * FROM Users WHERE email = @email')
    return result.recordset[0]
  },

  async findById(userid) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('userid', sql.Int, userid)
      .query('SELECT * FROM Users WHERE userid = @userid')
    return result.recordset[0]
  },

  async updateProfilePic(userid, profilepic) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('userid', sql.Int, userid)
      .input('profilepic', sql.NVarChar(sql.MAX), profilepic).query(`
        -- 1. Update Ảnh
        UPDATE Users
        SET profilepic = @profilepic
        WHERE userid = @userid;

        -- 2. Select lại TOÀN BỘ thông tin (Dùng ISNULL cho Bio)
        SELECT 
            userid, 
            email, 
            fullname, 
            profilepic, 
            ISNULL(bio, '') as bio -- <--- Quan trọng: Biến NULL thành ''
        FROM Users 
        WHERE userid = @userid;
        SELECT userid, fullname, profilepic FROM Users WHERE userid = @userid;
      `)
    return result.recordset[0]
  },

  async getSidebarList(userid) {
    const pool = await getConnection()
    const result = await pool.request().input('userid', sql.Int, userid).query(`
        SELECT
          u.userid,
          u.fullname,
          u.profilepic,
          mLatest.content as latestMessage,
          mLatest.created as latestTime
        FROM Users u
        OUTER APPLY (
          SELECT TOP 1 Content, created
          FROM Messages
          Where (senderid = @userid AND receiverid = u.userid)
             OR (receiverid = @userid AND senderid = u.userid)
          ORDER BY created DESC
        ) mLatest
        WHERE userid <> @userid
        ORDER BY mLatest.created DESC`)
    return result.recordset
  },
  async updateBio(userid, bio) {
    // Nhận vào object chứa bio
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('userid', sql.Int, userid)
      .input('bio', sql.NVarChar(500), bio).query(`
      -- Bước 1: Update dữ liệu
        UPDATE Users
        SET bio = @bio
        WHERE userid = @userid;

        -- Bước 2: Select lại dữ liệu vừa update để trả về cho Frontend
        SELECT userid, email, fullname, profilepic, bio
        FROM Users
        WHERE userid = @userid;
    `)
    return result.recordset[0]
  },
  async updatePassword(userid, newPassword) {
    const pool = await getConnection()
    await pool
      .request()
      .input('userid', sql.Int, userid)
      .input('password', sql.NVarChar(255), newPassword) // Password đã hash
      .query(`
        UPDATE Users
        SET password = @password
        WHERE userid = @userid
      `)
    return true
  },
}
