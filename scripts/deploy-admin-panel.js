#!/usr/bin/env node

/**
 * 部署管理面板到Supabase静态网站托管
 * 
 * 此脚本将管理面板部署到Supabase的静态网站托管服务
 * 管理面板将可以通过 https://project-ref.supabase.co/projects/project-ref/static/admin-panel 访问
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// 检查Supabase CLI是否已安装
function checkSupabaseCLI() {
  try {
    const version = execSync('npx supabase --version', { encoding: 'utf8' });
    console.log(`✅ Supabase CLI版本: ${version.trim()}`);
    return true;
  } catch (error) {
    console.error('❌ 未找到Supabase CLI，请先安装:');
    console.error('npm install -g supabase');
    return false;
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!projectId) {
    console.warn('⚠️ 未设置SUPABASE_PROJECT_ID环境变量');
    console.warn('请设置环境变量或在脚本中指定项目ID');
  }
  
  if (!accessToken) {
    console.warn('⚠️ 未设置SUPABASE_ACCESS_TOKEN环境变量');
    console.warn('请运行 supabase login 或设置访问令牌');
  }
  
  return { projectId, accessToken };
}

// 部署管理面板
async function deployAdminPanel() {
  console.log('🚀 开始部署管理面板到Supabase...');
  
  // 检查必要文件
  const adminPanelPath = join(process.cwd(), 'admin-panel');
  if (!existsSync(adminPanelPath)) {
    console.error('❌ 未找到admin-panel目录');
    return false;
  }
  
  // 检查入口文件
  const indexPath = join(adminPanelPath, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('❌ 未找到admin-panel/index.html');
    return false;
  }
  
  try {
    // 使用Supabase CLI部署
    console.log('📤 正在部署管理面板...');
    
    // 切换到admin-panel目录并部署
    const deployCommand = `cd admin-panel && npx supabase deploy`;
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log('✅ 管理面板部署成功!');
    return true;
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    
    // 提供手动部署说明
    console.log('\n📋 手动部署说明:');
    console.log('1. 登录Supabase:');
    console.log('   npx supabase login');
    console.log('2. 部署静态文件:');
    console.log('   cd admin-panel');
    console.log('   npx supabase deploy');
    console.log('3. 或者通过Supabase Dashboard手动上传文件');
    
    return false;
  }
}

// 自动化部署（用于CI/CD）
async function autoDeploy() {
  console.log('🔄 开始自动化部署管理面板...');
  
  // 检查环境变量
  const supabaseToken = process.env.SUPABASE_TOKEN;
  if (!supabaseToken) {
    console.error('❌ 未设置SUPABASE_TOKEN环境变量');
    console.error('请在GitHub Secrets中设置SUPABASE_TOKEN');
    return false;
  }
  
  try {
    // 安装Supabase CLI
    console.log('📥 安装Supabase CLI...');
    execSync('npm install -g supabase', { stdio: 'inherit' });
    
    // 登录Supabase
    console.log('🔑 登录Supabase...');
    execSync(`npx supabase login --token ${supabaseToken}`, { stdio: 'inherit' });
    
    // 部署管理面板
    console.log('📤 部署管理面板...');
    const deployCommand = `cd admin-panel && npx supabase deploy`;
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log('✅ 管理面板自动化部署成功!');
    return true;
  } catch (error) {
    console.error('❌ 自动化部署失败:', error.message);
    return false;
  }
}

// 生成部署说明
function generateDeploymentInstructions() {
  console.log('\n📋 Supabase静态网站托管部署说明');
  console.log('=====================================');
  
  console.log('\n🔧 方法一：使用Supabase CLI（推荐）');
  console.log('1. 安装Supabase CLI（如果尚未安装）:');
  console.log('   npm install -g supabase');
  console.log('2. 登录Supabase:');
  console.log('   npx supabase login');
  console.log('3. 部署管理面板:');
  console.log('   cd admin-panel');
  console.log('   npx supabase deploy');
  
  console.log('\n🌐 方法二：通过Supabase Dashboard');
  console.log('1. 登录到Supabase Dashboard: https://app.supabase.com');
  console.log('2. 选择您的项目');
  console.log('3. 进入"静态站点"部分');
  console.log('4. 上传admin-panel目录中的所有文件');
  console.log('5. 配置自定义域名（可选）');
  
  console.log('\n🔒 安全建议:');
  console.log('- 为管理面板设置身份验证');
  console.log('- 使用HTTPS保护数据传输');
  console.log('- 限制对管理面板的访问');
  console.log('- 定期更新访问令牌');
  console.log('- 在管理面板入口页添加Supabase Auth验证');
  console.log('- 仅允许admin角色访问');
  
  console.log('\n🔗 访问地址:');
  console.log('部署后，管理面板可通过以下URL访问:');
  console.log('https://<your-project-ref>.supabase.co/projects/<your-project-ref>/static/admin-panel');
}

// 主函数
async function main() {
  console.log('🔧 江西酒店管理面板Supabase部署工具');
  console.log('====================================');
  
  // 检查是否为自动化部署模式
  const isAutoDeploy = process.argv.includes('--auto');
  
  if (isAutoDeploy) {
    // 自动化部署模式
    return await autoDeploy();
  }
  
  // 手动部署模式
  // 检查Supabase CLI
  if (!checkSupabaseCLI()) {
    generateDeploymentInstructions();
    return;
  }
  
  // 检查环境变量
  checkEnvironmentVariables();
  
  // 尝试自动部署
  const success = await deployAdminPanel();
  
  if (!success) {
    generateDeploymentInstructions();
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 部署过程中发生错误:', error.message);
    process.exit(1);
  });
}

export { autoDeploy, deployAdminPanel };