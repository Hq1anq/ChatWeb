import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    trustServerCertificate: true
  },
}

let pool

export const getConnection = async (retries = 5) => {
  while (retries) {
    try {
      if (!pool) {
        pool = await sql.connect(config);
        console.log('✔️ ', 'Connected to MSSQL Database');
      }
      return pool;
    } catch (err) {
      console.error(`❌ Connection failed. Retries left: ${retries - 1}`, err.message);
      retries -= 1;
      if (retries === 0) throw err;
      // Đợi 5 giây trước khi thử lại
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};