import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: 'localhost',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS',
  },
}

let pool

export const getConnection = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config)
      console.log('✔️ ', 'Connected to MSSQL Database')
    }
    return pool
  } catch (err) {
    console.error('❌ ', 'Database connection failed:', err)
    throw err
  }
}