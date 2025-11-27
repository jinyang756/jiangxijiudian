#!/bin/bash
# 完整后端修复脚本 - 解决SSL协议错误问题

echo "🚀 开始修复后端SSL协议错误问题"

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请以root权限运行此脚本"
  echo "sudo $0"
  exit 1
fi

# 1. 检查并安装必要工具
echo "🔧 检查必要工具..."
if ! command -v openssl &> /dev/null; then
    echo "安装openssl..."
    yum install -y openssl
fi

if ! command -v netstat &> /dev/null; then
    echo "安装net-tools..."
    yum install -y net-tools
fi

# 2. 检查SSL证书
echo "🔍 检查SSL证书..."
if [ ! -f "/opt/projects/jiangxijiudian/ssl/cert.pem" ] || [ ! -f "/opt/projects/jiangxijiudian/ssl/key.pem" ]; then
    echo "❌ SSL证书文件不存在"
    echo "请先获取SSL证书，或使用以下命令生成自签名证书进行测试："
    echo "mkdir -p /opt/projects/jiangxijiudian/ssl"
    echo "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /opt/projects/jiangxijiudian/ssl/key.pem -out /opt/projects/jiangxijiudian/ssl/cert.pem -subj '/CN=154.221.19.68'"
    read -p "是否生成自签名证书用于测试? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p /opt/projects/jiangxijiudian/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /opt/projects/jiangxijiudian/ssl/key.pem -out /opt/projects/jiangxijiudian/ssl/cert.pem -subj "/CN=154.221.19.68"
        echo "✅ 自签名证书已生成"
    else
        echo "请手动获取SSL证书后重新运行此脚本"
        exit 1
    fi
else
    echo "✅ SSL证书文件存在"
    
    # 验证证书
    if openssl x509 -in /opt/projects/jiangxijiudian/ssl/cert.pem -text -noout > /dev/null 2>&1; then
        echo "✅ 证书格式有效"
    else
        echo "❌ 证书格式无效"
        exit 1
    fi
    
    # 检查证书过期时间
    echo "📅 证书信息："
    openssl x509 -in /opt/projects/jiangxijiudian/ssl/cert.pem -noout -dates
fi

# 3. 修复PocketBase服务配置（移除内置HTTPS）
echo "⚙️ 修复PocketBase服务配置..."
cat > /etc/systemd/system/pocketbase.service << EOF
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=0.0.0.0:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 4. 配置Nginx处理HTTPS
echo "🌐 配置Nginx处理HTTPS..."
cat > /etc/nginx/conf.d/pocketbase.conf << EOF
server {
    listen 8090;
    server_name 154.221.19.68;
    
    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:8090/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /_/ {
        proxy_pass http://localhost:8090/_/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 8443 ssl;
    server_name 154.221.19.68;
    
    ssl_certificate /opt/projects/jiangxijiudian/ssl/cert.pem;
    ssl_certificate_key /opt/projects/jiangxijiudian/ssl/key.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:8090/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /_/ {
        proxy_pass http://localhost:8090/_/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 5. 设置正确的文件权限
echo "🔐 设置文件权限..."
chmod 644 /opt/projects/jiangxijiudian/ssl/cert.pem
chmod 600 /opt/projects/jiangxijiudian/ssl/key.pem

# 6. 重新加载配置
echo "🔄 重新加载配置..."
systemctl daemon-reload
nginx -t

# 7. 重启服务
echo "⚡ 重启服务..."
systemctl restart pocketbase
systemctl restart nginx

# 8. 检查服务状态
echo "📊 检查服务状态..."
echo "PocketBase服务状态:"
systemctl status pocketbase --no-pager | head -10

echo "Nginx服务状态:"
systemctl status nginx --no-pager | head -10

# 9. 检查端口监听
echo "🔌 检查端口监听..."
echo "8090端口监听状态:"
netstat -tlnp | grep :8090 || echo "8090端口未监听"

echo "8443端口监听状态:"
netstat -tlnp | grep :8443 || echo "8443端口未监听"

# 10. 防火墙配置
echo "🛡️ 检查防火墙配置..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    firewall-cmd --permanent --add-port=8090/tcp 2>/dev/null
    firewall-cmd --permanent --add-port=8443/tcp 2>/dev/null
    firewall-cmd --reload 2>/dev/null
    echo "✅ CentOS防火墙规则已更新"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    ufw allow 8090/tcp 2>/dev/null
    ufw allow 8443/tcp 2>/dev/null
    echo "✅ Ubuntu防火墙规则已更新"
fi

# 11. 测试连接
echo "🧪 测试连接..."
echo "测试HTTP连接:"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://154.221.19.68:8090/api/health || echo "HTTP连接失败"

echo "测试HTTPS连接:"
curl -k -s -o /dev/null -w "HTTPS状态码: %{http_code}\n" https://154.221.19.68:8443/api/health || echo "HTTPS连接失败"

echo "✅ 后端SSL修复完成！"
echo ""
echo "如果仍然有问题，请检查："
echo "1. SSL证书是否有效且未过期"
echo "2. 防火墙是否允许8443端口"
echo "3. 域名解析是否正确"
echo ""
echo "查看详细日志："
echo "journalctl -u pocketbase -f"
echo "journalctl -u nginx -f"