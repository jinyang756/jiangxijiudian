#!/bin/bash
# 快速诊断脚本 - 检查后端SSL问题

echo "🔍 快速诊断后端SSL问题"

# 1. 检查服务状态
echo "1. 检查服务状态..."
echo "PocketBase:"
systemctl is-active pocketbase
echo "Nginx:"
systemctl is-active nginx

# 2. 检查端口监听
echo "2. 检查端口监听..."
netstat -tlnp | grep -E ":(8090|8443)" || echo "端口未监听"

# 3. 检查证书
echo "3. 检查证书..."
if [ -f "/opt/projects/jiangxijiudian/ssl/cert.pem" ]; then
    echo "证书存在"
    openssl x509 -in /opt/projects/jiangxijiudian/ssl/cert.pem -noout -dates
else
    echo "❌ 证书不存在"
fi

# 4. 检查Nginx配置
echo "4. 检查Nginx配置..."
nginx -t 2>&1

# 5. 快速连接测试
echo "5. 快速连接测试..."
timeout 3 curl -k https://154.221.19.68:8443/api/health -o /dev/null -w "HTTPS响应: %{http_code}\n" 2>/dev/null || echo "HTTPS连接超时或失败"

timeout 3 curl http://154.221.19.68:8090/api/health -o /dev/null -w "HTTP响应: %{http_code}\n" 2>/dev/null || echo "HTTP连接超时或失败"

echo "✅ 诊断完成"