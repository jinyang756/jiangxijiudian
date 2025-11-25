#!/bin/bash
# 测试后端连接脚本

echo "🧪 测试后端服务连接"

# 测试HTTP端口
echo "🌐 测试HTTP连接 (端口8090)..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://154.221.19.68:8090/api/health

# 测试HTTPS端口
echo "🔒 测试HTTPS连接 (端口8443)..."
curl -k -s -o /dev/null -w "HTTPS状态码: %{http_code}\n" https://154.221.19.68:8443/api/health

# 测试CORS配置
echo "🔗 测试CORS配置..."
curl -H "Origin: https://jiangxijiudian.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     -k -s -o /dev/null -w "CORS预检请求状态码: %{http_code}\n" \
     https://154.221.19.68:8443/api/collections/menus/records

echo "✅ 后端连接测试完成"