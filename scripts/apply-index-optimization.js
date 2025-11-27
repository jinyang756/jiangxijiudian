// 应用数据库索引优化的脚本
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置 Supabase 客户端
const supabaseUrl = process.env.SUPABASE_URL || 'https://kdlhyzsihflwkwumxzfw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyIndexOptimization() {
  console.log('🚀 开始应用数据库索引优化...');
  
  try {
    // 读取索引优化SQL脚本
    const scriptPath = join(process.cwd(), 'sql', 'index-optimization.sql');
    const sqlScript = await readFile(scriptPath, 'utf8');
    
    console.log('📄 读取索引优化脚本...');
    console.log('📁 脚本路径:', scriptPath);
    
    // 按分号分割SQL语句
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📋 共计 ${statements.length} 条SQL语句`);
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const truncatedStatement = statement.length > 100 ? 
        statement.substring(0, 100) + '...' : statement;
      
      console.log(`\n🔧 执行第 ${i + 1} 条语句: ${truncatedStatement}`);
      
      try {
        // 使用RPC执行SQL语句
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.warn(`⚠️  语句执行警告:`, error.message);
          // 对于某些DDL语句，RPC可能返回警告但实际执行成功
        } else {
          console.log(`✅ 第 ${i + 1} 条语句执行成功`);
        }
      } catch (executeError) {
        console.error(`❌ 第 ${i + 1} 条语句执行失败:`, executeError.message);
        
        // 如果是扩展相关语句，可能需要特殊处理
        if (statement.includes('CREATE EXTENSION')) {
          console.log('💡 提示: 扩展创建语句可能需要在数据库控制台手动执行');
        }
      }
      
      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 索引优化脚本执行完成!');
    console.log('\n📋 建议后续操作:');
    console.log('1. 验证新索引是否创建成功');
    console.log('2. 运行性能测试验证优化效果');
    console.log('3. 监控数据库性能指标');
    
  } catch (error) {
    console.error('❌ 索引优化过程中发生错误:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('not exist')) {
      console.log('\n💡 解决方案:');
      console.log('   请确保以下文件存在:');
      console.log('   - sql/index-optimization.sql');
      console.log('   - 确保SUPABASE_SERVICE_ROLE_KEY环境变量已正确配置');
    }
  }
}

// 验证索引创建是否成功
async function verifyIndexes() {
  console.log('\n🔍 验证索引创建情况...');
  
  try {
    // 查询所有索引信息
    const { data: indexes, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('❌ 查询索引信息失败:', error.message);
      return;
    }
    
    console.log('📊 当前数据库索引列表:');
    const indexMap = {};
    
    indexes.forEach(index => {
      if (!indexMap[index.tablename]) {
        indexMap[index.tablename] = [];
      }
      indexMap[index.tablename].push(index.indexname);
    });
    
    Object.keys(indexMap).sort().forEach(tableName => {
      console.log(`\n📋 ${tableName} 表索引:`);
      indexMap[tableName].sort().forEach(indexName => {
        console.log(`   • ${indexName}`);
      });
    });
    
    // 检查关键索引是否存在
    const keyIndexes = [
      'idx_dishes_category_available',
      'idx_dishes_name_zh_trgm',
      'idx_orders_table_status_created',
      'idx_service_requests_table_status_created',
      'idx_tagged_orders_table_tag_status_created'
    ];
    
    console.log('\n✅ 关键索引检查:');
    keyIndexes.forEach(indexName => {
      const exists = indexes.some(idx => idx.indexname === indexName);
      console.log(`   ${exists ? '✅' : '❌'} ${indexName}: ${exists ? '已创建' : '未找到'}`);
    });
    
  } catch (error) {
    console.error('❌ 验证索引时发生错误:', error.message);
  }
}

// 性能测试函数
async function runPerformanceTest() {
  console.log('\n⚡ 运行性能测试...');
  
  try {
    // 测试菜单查询性能
    console.log('⏱️  测试菜单查询性能...');
    const menuStartTime = Date.now();
    
    const { data: menuData, error: menuError } = await supabase
      .from('dishes')
      .select('id, name_zh, name_en, price, available')
      .eq('available', true)
      .limit(10);
    
    const menuEndTime = Date.now();
    console.log(`   菜单查询耗时: ${menuEndTime - menuStartTime}ms`);
    
    if (menuError) {
      console.error('   菜单查询错误:', menuError.message);
    } else {
      console.log(`   返回 ${menuData.length} 条记录`);
    }
    
    // 测试订单查询性能
    console.log('⏱️  测试订单查询性能...');
    const orderStartTime = Date.now();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, table_id, status, total_amount, created_at')
      .eq('status', 'pending')
      .limit(10);
    
    const orderEndTime = Date.now();
    console.log(`   订单查询耗时: ${orderEndTime - orderStartTime}ms`);
    
    if (orderError) {
      console.error('   订单查询错误:', orderError.message);
    } else {
      console.log(`   返回 ${orderData.length} 条记录`);
    }
    
    console.log('\n✅ 性能测试完成!');
    
  } catch (error) {
    console.error('❌ 性能测试过程中发生错误:', error.message);
  }
}

// 主函数
async function main() {
  console.log('=== 江西酒店数据库索引优化工具 ===\n');
  
  // 应用索引优化
  await applyIndexOptimization();
  
  // 验证索引
  await verifyIndexes();
  
  // 运行性能测试
  await runPerformanceTest();
  
  console.log('\n✨ 数据库索引优化流程完成!');
  console.log('\n📝 后续建议:');
  console.log('1. 定期监控索引使用情况');
  console.log('2. 根据查询模式调整索引策略');
  console.log('3. 移除不常用的索引以减少维护开销');
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { applyIndexOptimization, verifyIndexes, runPerformanceTest };