import fs from 'fs'
import path from 'path'
import { getConnection } from './db.js'

async function rebuildDatabase() {
  let pool
  try {
    const filePath = path.join(process.cwd(), 'src/lib/setupDB.sql')
    const sqlFileContent = fs.readFileSync(filePath, 'utf8')

    // 1. Chỉ lấy nội dung giữa START_SCHEMA và END_SCHEMA
    const schemaMatch = sqlFileContent.match(
      /-- START_SCHEMA --([\s\S]*?)-- END_SCHEMA --/
    )

    if (!schemaMatch) {
      console.error('❌ Không tìm thấy thẻ -- START_SCHEMA -- trong file SQL!')
      return
    }

    const schemaSql = schemaMatch[1]

    // 2. Tách các khối lệnh bằng từ khóa "GO"
    // MSSQL Driver không hỗ trợ chạy nhiều khối lệnh chứa GO trong 1 request
    const commands = schemaSql
      .split(/\bGO\b/i)
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0)

    pool = await getConnection()
    const transaction = pool.transaction()

    console.log('🚀 Bắt đầu quá trình rebuild database...')

    await transaction.begin()

    for (const query of commands) {
      try {
        await transaction.request().query(query)
      } catch (err) {
        console.error('❌ Lỗi tại khối lệnh: ', query.substring(0, 100) + '...')
        throw err // Bắn lỗi để rollback
      }
    }

    await transaction.commit()
    console.log('✅ Rebuild Database thành công!')
  } catch (error) {
    console.error('💥 Lỗi Rebuild:', error.message)
    if (pool) {
      // Rollback nếu có lỗi xảy ra trong quá trình chạy
      // Lưu ý: DROP/CREATE TABLE trong SQL Server vẫn có thể rollback được trong Transaction
    }
  } finally {
    process.exit()
  }
}

rebuildDatabase()
