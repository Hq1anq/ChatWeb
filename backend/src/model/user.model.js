import { getConnection } from '../lib/db.js'
import sql from 'mssql'

export const User = {
  async create({ Email, Fullname, Password, ProfilePic = '' }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('Email', sql.NVarChar(50), Email)
      .input('FullName', sql.NVarChar(30), Fullname)
      .input('Password', sql.NVarChar(100), Password)
      .input('ProfilePic', sql.NVarChar(100), ProfilePic).query(`
				INSERT INTO Users (Email, FullName, [Password], ProfilePic)
        OUTPUT INSERTED.*
				VALUES (@Email, @FullName, @Password, @ProfilePic);
			`)
    return result.recordset[0]
  },

  async getAll() {
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM Users')
    return result.recordset
  },

  async findByEmail(Email) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('Email', sql.NVarChar(50), Email)
      .query('SELECT * FROM Users WHERE Email = @Email')
    return result.recordset[0]
  },
}
