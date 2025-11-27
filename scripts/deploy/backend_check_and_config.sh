#!/bin/bash
# 江西酒店中控系统后端服务检查和配置脚本

echo "🔍 检查和配置江西酒店中控系统后端服务"

# 1. 检查PocketBase是否已安装
echo "📋 检查PocketBase安装状态..."
if [ ! -f "/opt/pocketbase/pocketbase" ]; then
    echo " PocketBase未安装，正在安装..."
    mkdir -p /opt/pocketbase
    cd /opt/pocketbase
    wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.8/pocketbase_0.22.8_linux_amd64.zip
    unzip pocketbase_0.22.8_linux_amd64.zip
    chmod +x pocketbase
    mkdir -p pb_data
else
    echo "✅ PocketBase已安装"
fi

# 2. 检查SSL证书
echo "🔐 检查SSL证书..."
if [ ! -f "/opt/projects/jiangxijiudian/ssl/cert.pem" ] || [ ! -f "/opt/projects/jiangxijiudian/ssl/key.pem" ]; then
    echo " SSL证书不存在，请先获取证书"
    echo " 请运行以下命令获取证书："
    echo "  sudo yum install -y certbot python3-certbot-nginx"
    echo "  sudo certbot certonly --standalone -d your-domain.com"
    echo "  mkdir -p /opt/projects/jiangxijiudian/ssl"
    echo "  cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem"
    echo "  cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem"
else
    echo "✅ SSL证书存在"
fi

# 3. 检查并配置PocketBase服务
echo "⚙️ 检查PocketBase服务配置..."
cat > /etc/systemd/system/pocketbase.service << EOF
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=0.0.0.0:8090 --https=0.0.0.0:8443 --cert=/opt/projects/jiangxijiudian/ssl/cert.pem --key=/opt/projects/jiangxijiudian/ssl/key.pem --origins=https://jiangxijiudian.vercel.app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 4. 重新加载systemd配置
echo "🔄 重新加载systemd配置..."
systemctl daemon-reload

# 5. 检查服务状态
echo "📊 检查服务状态..."
systemctl status pocketbase --no-pager

# 6. 重启服务以应用新配置
echo "🔄 重启PocketBase服务..."
systemctl restart pocketbase

# 7. 检查端口监听状态
echo "🔌 检查端口监听状态..."
netstat -tlnp | grep :8090
netstat -tlnp | grep :8443

# 8. 防火墙配置检查
echo "🛡️ 检查防火墙配置..."
firewall-cmd --list-all | grep -E "(8090|8443)"

echo "✅ 后端服务检查和配置完成！"
echo "请使用以下命令检查服务状态："
echo "systemctl status pocketbase"
echo "请使用以下命令查看服务日志："
echo "journalctl -u pocketbase -f"