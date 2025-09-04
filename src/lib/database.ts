import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'taphoaxanhdb-phongndps37996-14cb.g.aivencloud.com',
  port: 28230,
  user: 'avnadmin',
  password: 'AVNS_Dcgk_RhLePmjVWjk95p',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
};

let connection: mysql.Connection | null = null;

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  
  // Kiểm tra kết nối còn hoạt động không
  try {
    await connection.ping();
  } catch (error) {
    // Nếu mất kết nối, tạo lại
    connection = await mysql.createConnection(dbConfig);
  }
  
  return connection;
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

