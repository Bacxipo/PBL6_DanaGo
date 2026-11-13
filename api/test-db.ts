import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Nạp biến môi trường từ file .env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

console.log('--------------------------------------------------');
console.log('🔄 Đang kiểm tra kết nối tới Supabase Database...');

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('❌ LỖI: Bạn chưa điền đúng mật khẩu [YOUR-PASSWORD] trong file api/.env!');
  console.log('--------------------------------------------------');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Hỗ trợ Supabase SSL connection
  },
});

async function testConnection() {
  try {
    await client.connect();
    console.log('🎉 KẾT NỐI THÀNH CÔNG TỚI SUPABASE POSTGRESQL DATABASE!');
    
    const res = await client.query('SELECT NOW() as current_time, version() as version;');
    console.log('⏰ Thời gian trên Server Supabase:', res.rows[0].current_time);
    console.log('📦 Phiên bản Postgres:', res.rows[0].version.split(',')[0]);
    console.log('--------------------------------------------------');
  } catch (err: any) {
    console.error('❌ KẾT NỐI THẤT BẠI!');
    console.error('Chi tiết lỗi:', err.message);
    console.log('--------------------------------------------------');
  } finally {
    await client.end();
  }
}

testConnection();
