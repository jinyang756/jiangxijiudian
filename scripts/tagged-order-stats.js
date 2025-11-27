#!/usr/bin/env node

/**
 * 标签化订单统计脚本
 * 用于生成和分析标签化订单的统计信息
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置Supabase客户端
const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseAnonKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误: 缺少Supabase配置');
  console.error('请确保在.env文件中设置以下环境变量:');
  console.error('VITE_APP_DB_URL=你的Supabase项目URL');
  console.error('VITE_APP_DB_POSTGRES_PASSWORD=你的Supabase anon key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTaggedOrderStats() {
  try {
    console.log('正在获取标签化订单统计信息...\n');

    // 1. 获取总订单数
    const { count: totalOrders, error: countError } = await supabase
      .from('tagged_orders')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 2. 按标签分组统计
    const { data: tagStats, error: tagError } = await supabase
      .from('tagged_orders')
      .select('tag, count()')
      .group('tag')
      .order('count', { ascending: false });

    if (tagError) throw tagError;

    // 3. 按状态统计
    const { data: statusStats, error: statusError } = await supabase
      .from('tagged_orders')
      .select('status, count()')
      .group('status')
      .order('count', { ascending: false });

    if (statusError) throw statusError;

    // 4. 按日期统计（最近7天）
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    const { data: dailyStats, error: dailyError } = await supabase
      .from('tagged_orders')
      .select('created_at, count()')
      .gte('created_at', oneWeekAgoStr)
      .group('date_trunc(\'day\', created_at)')
      .order('date_trunc(\'day\', created_at)', { ascending: true });

    if (dailyError) throw dailyError;

    // 5. 获取桌号统计
    const { data: tableStats, error: tableError } = await supabase
      .from('tagged_orders')
      .select('table_id, count()')
      .group('table_id')
      .order('count', { ascending: false })
      .limit(10);

    if (tableError) throw tableError;

    // 输出统计结果
    console.log('=== 标签化订单统计报告 ===\n');
    
    console.log(`总订单数: ${totalOrders || 0}\n`);

    console.log('按标签分组:');
    tagStats.forEach(stat => {
      console.log(`  ${stat.tag}: ${stat.count} 个订单`);
    });
    console.log();

    console.log('按状态分组:');
    statusStats.forEach(stat => {
      const statusText = {
        'pending': '待处理',
        'printed': '已打印',
        'completed': '已完成'
      }[stat.status] || stat.status;
      
      console.log(`  ${statusText}: ${stat.count} 个订单`);
    });
    console.log();

    console.log('最近7天订单趋势:');
    dailyStats.forEach(stat => {
      // 提取日期部分
      const dateKey = Object.keys(stat).find(key => key.includes('date_trunc'));
      if (dateKey) {
        const date = new Date(stat[dateKey]).toLocaleDateString('zh-CN');
        console.log(`  ${date}: ${stat.count} 个订单`);
      }
    });
    console.log();

    console.log('热门桌号 (前10):');
    tableStats.forEach(stat => {
      console.log(`  ${stat.table_id}: ${stat.count} 个订单`);
    });
    console.log();

    // 6. 计算平均订单金额
    const { data: avgAmountData, error: avgError } = await supabase
      .from('tagged_orders')
      .select('total_amount');

    if (avgError) throw avgError;

    if (avgAmountData.length > 0) {
      const totalAmount = avgAmountData.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      const averageAmount = totalAmount / avgAmountData.length;
      console.log(`平均订单金额: ₱${averageAmount.toFixed(2)}`);
    }

  } catch (error) {
    console.error('获取统计信息时出错:', error.message);
    process.exit(1);
  }
}

// 执行统计函数
getTaggedOrderStats();