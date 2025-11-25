# 江西酒店中控系统部署说明

## 项目架构

### 前端部署
- **平台**: Vercel
- **源码**: GitHub仓库
- **域名**: jcstjj.top
- **特性**: 全球CDN加速、自动HTTPS、自动部署

### 后端部署
- **服务器**: 154.221.19.68
- **服务**: PocketBase
- **HTTP端口**: 8090
- **HTTPS端口**: 8443
- **域名**: jcstjj.top
- **证书**: Let's Encrypt SSL证书

## 部署状态

### 后端服务状态
- [x] PocketBase服务已安装
- [x] SSL证书已配置
- [x] HTTPS服务正常运行
- [x] systemd服务配置完成
- [x] CORS配置已完成

### 前端部署状态
- [x] 项目构建测试完成
- [x] 自定义域名已配置
- [x] API连接测试通过

## 部署计划

### 第一阶段：文档和清理
- [x] 创建项目自述文件
- [x] 清理根目录无关文件
- [x] 备份重要配置文件

### 第二阶段：前端部署
- [x] 将前端项目推送到GitHub
- [x] 从GitHub拉取项目
- [x] 项目构建测试
- [x] 配置环境变量
- [x] 更新GitHub仓库
- [x] 配置自定义域名
- [x] 部署测试完成

详细部署计划请参考 [前端部署到Vercel计划.md](前端部署到Vercel计划.md)

### 第三阶段：后端优化
- [x] 完善CORS配置
- [x] 配置API访问规则
- [x] 测试前后端连接
- [x] 性能优化完成

### 第四阶段：安全加固
- [x] 配置防火墙规则
- [x] 设置API速率限制
- [x] 完善错误处理
- [x] 日志监控配置

### 第五阶段：移动端优化
- [x] 响应式布局优化
- [x] 触控交互优化
- [x] 屏幕适配测试
- [x] 性能调优完成

### 第六阶段：后端部署
- [x] PocketBase服务配置
- [x] SSL证书配置
- [x] Nginx反向代理配置
- [x] 前后端连接测试

## 重要配置信息

### 后端访问地址
- **管理面板**: https://jcstjj.top:8443/_/
- **API接口**: https://jcstjj.top:8443/api/
- **HTTP备用**: http://154.221.19.68:8090

### 环境变量
```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=https://jcstjj.top:8443/api
NEXT_PUBLIC_ADMIN_URL=https://jcstjj.top:8443/_

# 后端环境变量
PB_HTTPS_CERT=/opt/projects/jiangxijiudian/ssl/cert.pem
PB_HTTPS_KEY=/opt/projects/jiangxijiudian/ssl/key.pem
PB_CORS_ORIGINS=https://jcstjj.top,https://www.jcstjj.top,https://jiangxijiudian.vercel.app
```

## 维护命令

### 后端服务管理
```bash
# 查看服务状态
systemctl status pocketbase

# 重启服务
systemctl restart pocketbase

# 查看日志
journalctl -u pocketbase -f
```

### 证书更新
```bash
# 复制新证书
cp /etc/letsencrypt/live/jcstjj.top/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem
cp /etc/letsencrypt/live/jcstjj.top/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem

# 重启服务
systemctl restart pocketbase
```

## 联系信息
- **维护人员**: 技术支持团队
- **最后更新**: 2025年11月25日