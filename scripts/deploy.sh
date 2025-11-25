#!/bin/bash
# 部署脚本

echo "开始部署江西酒店中控系统前端..."

# 1. 检查git状态
echo "1. 检查git状态..."
git status

# 2. 添加所有更改
echo "2. 添加所有更改..."
git add .

# 3. 提交更改
echo "3. 提交更改..."
git commit -m "Auto deploy: $(date)"

# 4. 推送到GitHub
echo "4. 推送到GitHub..."
git push origin main

# 5. 触发Vercel部署
echo "5. 触发Vercel部署..."
# 这将自动触发Vercel的部署，因为Vercel与GitHub集成

echo "部署完成！请访问Vercel控制台查看部署状态。"