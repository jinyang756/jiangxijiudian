// postgresql-test.js
// 测试PostgreSQL直接连接

const { Client } = require('pg');

// PostgreSQL连接配置
const config = {
  connectionString: 'postgresql://postgres:J2nkgp0cGZYF8iHk@db.kdlhyzsihflwkwumxzfw.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('正在测试PostgreSQL直接连接...');
console.log('连接字符串 (隐藏密码):', 'postgresql://postgres:****@db.kdlhyzsihflwkwumxzfw.supabase.co:5432/postgres');

async function testPostgreSQL() {
  const client = new Client(config);
  
  try {
    // 连接到数据库
    console.log('\n--- 连接数据库 ---');
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    console.log('\n--- 测试查询 ---');
    const res = await client.query('SELECT version()');
    console.log('✅ 查询成功');
    console.log('PostgreSQL版本:', res.rows[0].version);
    
    // 查询表信息
    console.log('\n--- 查询表信息 ---');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ 表查询成功');
    console.log('公共模式下的表:');
    tablesRes.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 查询categories表
    console.log('\n--- 查询categories表 ---');
    try {
      const categoriesRes = await client.query('SELECT * FROM categories LIMIT 5');
      console.log('✅ categories表查询成功');
      console.log(`找到 ${categoriesRes.rows.length} 条记录`);
      if (categoriesRes.rows.length > 0) {
        console.log('示例数据:');
        console.log(JSON.stringify(categoriesRes.rows[0], null, 2));
      }
    } catch (error) {
      console.error('❌ categories表查询失败:', error.message);
    }
    
    // 查询dishes表
    console.log('\n--- 查询dishes表 ---');
    try {
      const dishesRes = await client.query('SELECT * FROM dishes LIMIT 5');
      console.log('✅ dishes表查询成功');
      console.log(`找到 ${dishesRes.rows.length} 条记录`);
      if (dishesRes.rows.length > 0) {
        console.log('示例数据:');
        console.log(JSON.stringify(dishesRes.rows[0], null, 2));
      }
    } catch (error) {
      console.error('❌ dishes表查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL连接测试失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('堆栈跟踪:', error.stack);
  } finally {
    // 关闭连接
    try {
      await client.end();
      console.log('\n--- 连接已关闭 ---');
    } catch (error) {
      console.error('关闭连接时出错:', error.message);
    }
  }
}

// 执行测试
testPostgreSQL();