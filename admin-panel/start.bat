@echo off
title 江西酒店管理面板开发服务器

echo 江西酒店管理面板开发服务器启动脚本
echo.

REM 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到Python，请先安装Python
    pause
    exit /b 1
)

echo 正在启动管理面板开发服务器...
echo 请在浏览器中访问: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.

REM 使用Python内置的HTTP服务器启动服务
python -m http.server 8000