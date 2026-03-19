// 纯 pg 模块直接测试连接，绕过 Prisma
import pg from 'pg';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
console.log('Testing URL:', url?.replace(/:[^@]+@/, ':***@'));

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15000 });

try {
  console.log('Connecting...');
  await client.connect();
  console.log('✅ Connected!');
  const res = await client.query('SELECT current_database(), current_user, version()');
  console.log('DB:', res.rows[0].current_database);
  console.log('User:', res.rows[0].current_user);
  // 检查 users 表是否存在
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  console.log('Tables:', tables.rows.map(r => r.tablename).join(', '));
  // 检查是否有用户
  const users = await client.query('SELECT id, student_id, name, role, status FROM users LIMIT 5');
  console.log('Users:', JSON.stringify(users.rows, null, 2));
} catch (err) {
  console.error('❌ Error:', err.message);
  if (err.message.includes('Tenant')) {
    console.log('\n=== 诊断 ===');
    console.log('Tenant or user not found 通常意味着:');
    console.log('1. 连接串中的项目引用(project ref)不匹配');
    console.log('2. Pooler 域名中的区域不对');
    console.log('3. 密码不正确');
    // 解析连接串
    try {
      const u = new URL(url);
      console.log('\n解析结果:');
      console.log('  Host:', u.hostname);
      console.log('  Port:', u.port);
      console.log('  Username:', u.username);
      console.log('  Database:', u.pathname);
    } catch(e) {}
  }
} finally {
  await client.end();
}
