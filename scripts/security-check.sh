#!/bin/bash

# 检查是否有环境变量文件被意外提交
echo "检查环境变量文件..."

# 检查暂存区是否有.env文件
if git diff --cached --name-only | grep -E "^\.env"; then
  echo "错误: 环境变量文件已被暂存，取消提交!"
  echo "请确保敏感信息已移至GitHub Secrets"
  exit 1
fi

# 检查工作区是否有.env文件
if git status --porcelain | grep -E "^\?\? .*\.env"; then
  echo "警告: 发现未跟踪的环境变量文件:"
  git status --porcelain | grep -E "^\?\? .*\.env" | cut -d' ' -f2-
  echo "请确保这些文件已在.gitignore中或移至GitHub Secrets"
fi

echo "安全检查通过"
exit 0