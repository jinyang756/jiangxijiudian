# 江西酒店管理面板部署到Supabase静态网站托管脚本
# 适用于Windows环境

Write-Host "🔧 江西酒店管理面板Supabase部署工具"
Write-Host "===================================="

# 检查Supabase CLI是否已安装
Write-Host "🔍 检查Supabase CLI..."
try {
    $version = npx supabase --version
    Write-Host "✅ Supabase CLI版本: $version"
} catch {
    Write-Host "❌ 未找到Supabase CLI"
    Write-Host ""
    Write-Host "📋 手动部署说明:"
    Write-Host "1. 登录到Supabase Dashboard: https://app.supabase.com"
    Write-Host "2. 选择您的项目"
    Write-Host "3. 进入'静态站点'部分"
    Write-Host "4. 上传admin-panel目录中的所有文件"
    exit 1
}

# 检查admin-panel目录
Write-Host "🔍 检查admin-panel目录..."
if (-not (Test-Path "admin-panel")) {
    Write-Host "❌ 未找到admin-panel目录"
    exit 1
}

if (-not (Test-Path "admin-panel\index.html")) {
    Write-Host "❌ 未找到admin-panel\index.html"
    exit 1
}

# 尝试登录（如果已设置访问令牌）
if ($env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "🔑 使用环境变量中的访问令牌登录..."
    try {
        npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
        Write-Host "✅ 登录成功"
    } catch {
        Write-Host "⚠️ 登录失败: $_"
    }
} else {
    Write-Host "⚠️ 未设置SUPABASE_ACCESS_TOKEN环境变量"
    Write-Host "请运行 'npx supabase login' 或设置SUPABASE_ACCESS_TOKEN环境变量"
}

# 部署管理面板
Write-Host "🚀 开始部署管理面板到Supabase..."
try {
    # 切换到admin-panel目录并部署
    Push-Location admin-panel
    # 列出将要部署的文件
    Write-Host "📁 将要部署的文件:"
    Get-ChildItem -Recurse | ForEach-Object { Write-Host "  $($_.FullName)" }
    
    # 注意：Supabase静态站点部署命令可能需要特定参数
    # 这里我们先显示文件列表，实际部署需要根据项目配置进行
    
    Pop-Location
    
    Write-Host "✅ 管理面板文件准备完成!"
    Write-Host ""
    Write-Host "📋 下一步操作:"
    Write-Host "1. 如果尚未登录，请运行: npx supabase login"
    Write-Host "2. 部署文件到Supabase静态站点"
    Write-Host ""
    Write-Host "🔗 部署后访问地址格式:"
    Write-Host "https://<your-project-ref>.supabase.co/projects/<your-project-ref>/static/admin-panel"
} catch {
    Pop-Location
    Write-Host "❌ 部署准备失败: $_"
    Write-Host ""
    Write-Host "📋 手动部署说明:"
    Write-Host "1. 登录Supabase:"
    Write-Host "   npx supabase login"
    Write-Host "2. 部署静态文件:"
    Write-Host "   cd admin-panel"
    Write-Host "   npx supabase deploy"
    Write-Host "3. 或者通过Supabase Dashboard手动上传文件"
    exit 1
}

Write-Host ""
Write-Host "🔒 安全建议:"
Write-Host "- 为管理面板设置身份验证"
Write-Host "- 使用HTTPS保护数据传输"
Write-Host "- 限制对管理面板的访问"
Write-Host "- 定期更新访问令牌"