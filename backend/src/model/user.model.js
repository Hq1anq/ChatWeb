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
    const result = await pool.request().query('SELECT * FROM Users')
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
      .input('profilepic', sql.NVarChar(100), profilepic).query(`
        UPDATE Users
        SET profilepic = @profilepic
        WHERE userid = @userid;
        SELECT * FROM Users WHERE userid = @userid;
      `)
    return result.recordset[0]
  },

  async getExcept(excludeUserId) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('excludeUserId', sql.Int, excludeUserId).query(`
        SELECT userid, email, fullname, profilepic
        FROM Users WHERE userid != @excludeUserId`)
    return result.recordset
  },
}
