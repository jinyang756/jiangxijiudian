# 江西酒店中控系统后端部署与连接指南

## 🚀 后端部署步骤

### 1. 服务器环境准备

#### 系统要求
- CentOS 7/8 或 Ubuntu 18.04/20.04 LTS
- 至少 2GB RAM
- 至少 20GB 磁盘空间
- 公网IP地址: 154.221.19.68

#### 必要软件安装
```bash
# 更新系统
sudo yum update -y  # CentOS/RHEL
# 或
sudo apt update -y  # Ubuntu/Debian

# 安装必要工具
sudo yum install -y wget curl git unzip nginx  # CentOS/RHEL
# 或
sudo apt install -y wget curl git unzip nginx   # Ubuntu/Debian
```

### 2. 安装PocketBase

```bash
# 创建目录
sudo mkdir -p /opt/pocketbase
cd /opt/pocketbase

# 下载PocketBase (使用最新稳定版本)
sudo wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.8/pocketbase_0.22.8_linux_amd64.zip
sudo unzip pocketbase_0.22.8_linux_amd64.zip
sudo chmod +x pocketbase

# 创建数据目录
sudo mkdir -p pb_data
```

### 3. 配置SSL证书

#### 使用Let's Encrypt获取证书
```bash
# 安装Certbot
sudo yum install -y certbot python3-certbot-nginx  # CentOS/RHEL
# 或
sudo apt install -y certbot python3-certbot-nginx   # Ubuntu/Debian

# 获取SSL证书
sudo certbot certonly --standalone -d jcstjj.top -d www.jcstjj.top
```

#### 创建证书软链接
```bash
# 创建SSL目录
sudo mkdir -p /opt/projects/jiangxijiudian/ssl

# 复制证书文件
sudo cp /etc/letsencrypt/live/jcstjj.top/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem
sudo cp /etc/letsencrypt/live/jcstjj.top/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem

# 设置权限
sudo chown -R $USER:$USER /opt/projects/jiangxijiudian/ssl
```

### 4. 配置PocketBase服务

#### 创建systemd服务文件
```bash
sudo tee /etc/systemd/system/pocketbase.service > /dev/null <<EOF
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=0.0.0.0:8090 --https=0.0.0.0:8443 --cert=/opt/projects/jiangxijiudian/ssl/cert.pem --key=/opt/projects/jiangxijiudian/ssl/key.pem --origins=https://jcstjj.top,https://www.jcstjj.top
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### 5. 配置Nginx反向代理

#### 创建Nginx配置文件
```bash
sudo tee /etc/nginx/conf.d/jiangxijiudian.conf > /dev/null <<EOF
server {
    listen 80;
    server_name jcstjj.top www.jcstjj.top;
    
    # 重定向到HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name jcstjj.top www.jcstjj.top;
    
    ssl_certificate /etc/letsencrypt/live/jcstjj.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jcstjj.top/privkey.pem;
    
    # 前端静态文件服务
    location / {
        root /opt/projects/jiangxijiudian/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:8090/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 管理面板代理
    location /_/ {
        proxy_pass http://localhost:8090/_/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
```

### 6. 启动服务

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用并启动PocketBase服务
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# 启用并启动Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 检查服务状态
sudo systemctl status pocketbase
sudo systemctl status nginx
```

### 7. 配置防火墙

```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8090/tcp
sudo firewall-cmd --permanent --add-port=8443/tcp
sudo firewall-cmd --reload

# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp
sudo ufw allow 8443/tcp
sudo ufw reload
```

## 🔗 前后端连接配置

### 前端环境变量

前端应用通过环境变量连接到后端服务。在Vercel部署时，需要配置以下环境变量：

```
NEXT_PUBLIC_API_URL=https://jcstjj.top:8443/api
NEXT_PUBLIC_ADMIN_URL=https://jcstjj.top:8443/_
```

### CORS配置

PocketBase需要正确配置CORS以允许前端域名访问：

```bash
# 在PocketBase服务启动参数中已配置
--origins=https://jcstjj.top,https://www.jcstjj.top,https://jiangxijiudian.vercel.app
```

## 🧪 连接测试

### 1. 后端服务测试

```bash
# 测试API健康检查
curl -k https://jcstjj.top:8443/api/health

# 测试管理面板
curl -k https://jcstjj.top:8443/_/

# 检查服务状态
sudo systemctl status pocketbase
```

### 2. 前端连接测试

在浏览器中访问以下URL进行测试：

1. **前端应用**: https://jcstjj.top/
2. **管理面板**: https://jcstjj.top:8443/_/
3. **API接口**: https://jcstjj.top:8443/api/

### 3. API连接测试

```bash
# 测试菜单数据获取
curl -k https://jcstjj.top:8443/api/collections/menus/records

# 测试CORS配置
curl -H "Origin: https://jcstjj.top" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     -k https://jcstjj.top:8443/api/collections/menus/records
```

## 🛠️ 维护操作

### 证书更新

Let's Encrypt证书每90天需要更新一次：

```bash
# 手动更新证书
sudo certbot renew

# 复制新证书到PocketBase目录
sudo cp /etc/letsencrypt/live/jcstjj.top/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem
sudo cp /etc/letsencrypt/live/jcstjj.top/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem

# 重启PocketBase服务
sudo systemctl restart pocketbase
```

### 日志监控

```bash
# 查看PocketBase日志
sudo journalctl -u pocketbase -f

# 查看Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据备份

```bash
# 备份PocketBase数据库
cp /opt/pocketbase/pb_data/data.db /backup/pb_data_backup_$(date +%Y%m%d).db

# 备份配置文件
cp -r /opt/projects/jiangxijiudian/ssl /backup/ssl_backup_$(date +%Y%m%d)
```

## 🚨 常见问题排查

### 1. API连接失败
- 检查PocketBase服务是否运行: `sudo systemctl status pocketbase`
- 验证SSL证书是否有效: `sudo certbot certificates`
- 确认防火墙设置: `sudo firewall-cmd --list-all`

### 2. 前端无法加载
- 检查Nginx配置: `sudo nginx -t`
- 重启Nginx服务: `sudo systemctl restart nginx`
- 验证静态文件路径: `ls /opt/projects/jiangxijiudian/dist`

### 3. CORS错误
- 检查PocketBase启动参数中的`--origins`配置
- 确认前端域名已正确添加到CORS白名单

### 4. SSL证书错误
- 更新证书: `sudo certbot renew`
- 重启服务: `sudo systemctl restart pocketbase nginx`

## 📞 技术支持

如遇任何问题，请联系技术支持团队。

---
*江西酒店中控系统 © 2024*