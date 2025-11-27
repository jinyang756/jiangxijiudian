#!/bin/bash

# 启动管理面板开发服务器的脚本

# 检查是否安装了所需的工具
if ! command -v python3 &> /dev/null
then
    echo "未找到python3，请先安装Python 3"
    exit 1
fi

echo "正在启动管理面板开发服务器..."
echo "请在浏览器中访问: http://localhost:8000"

# 使用Python内置的HTTP服务器启动服务
python3 -m http.server 8000