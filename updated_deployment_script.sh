#!/bin/bash
# 江西酒店中控系统部署脚本
# 适用于支持Node.js 18的新系统

echo "🚀 开始部署江西酒店中控系统"

# 1. 系统更新
echo "🔄 更新系统..."
yum update -y

# 2. 安装必要工具
echo "🛠️ 安装必要工具..."
yum install -y wget curl git unzip nginx

# 3. 安装Node.js 18
echo "🟢 安装Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version

# 4. 部署前端项目
echo "📂 部署前端项目..."
mkdir -p /opt/projects
cd /opt/projects
git clone https://github.com/jinyang756/jiangxijiudian.git
cd jiangxijiudian
npm install
npm run build

# 5. 安装PocketBase
echo "📦 安装PocketBase..."
mkdir -p /opt/pocketbase
cd /opt/pocketbase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.8/pocketbase_0.22.8_linux_amd64.zip
unzip pocketbase_0.22.8_linux_amd64.zip
chmod +x pocketbase

# 创建数据目录
mkdir -p pb_data

# 6. 获取SSL证书
echo "🔒 获取SSL证书..."
yum install -y certbot python3-certbot-nginx
certbot certonly --standalone -d jcstjj.top -d www.jcstjj.top

# 创建SSL目录并复制证书
mkdir -p /opt/projects/jiangxijiudian/ssl
cp /etc/letsencrypt/live/jcstjj.top/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem
cp /etc/letsencrypt/live/jcstjj.top/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem

# 7. 创建PocketBase服务
echo "⚙️ 创建PocketBase服务..."
cat > /etc/systemd/system/pocketbase.service << EOF
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=0.0.0.0:8090 --https=0.0.0.0:8443 --cert=/opt/projects/jiangxijiudian/ssl/cert.pem --key=/opt/projects/jiangxijiudian/ssl/key.pem --origins=https://jcstjj.top,https://www.jcstjj.top,https://jiangxijiudian.vercel.app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 8. 配置Nginx
echo "🌐 配置Nginx..."
cat > /etc/nginx/conf.d/jiangxijiudian.conf << EOF
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

# 9. 启动服务
echo "⚡ 启动服务..."
systemctl daemon-reload
systemctl enable pocketbase
systemctl start pocketbase
systemctl start nginx
systemctl enable nginx

# 10. 配置防火墙
echo "🛡️ 配置防火墙..."
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=8090/tcp
firewall-cmd --permanent --add-port=8443/tcp
firewall-cmd --reload

echo "✅ 部署完成！"
echo "请检查服务状态："
echo "systemctl status pocketbase"
echo "systemctl status nginx"