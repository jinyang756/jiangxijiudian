# Supabase MCP 集成指南

本文档说明了如何在VS Code中集成和使用Supabase MCP (Management Control Point)。

## 什么是MCP？

Supabase MCP (Management Control Point) 是一个集成的管理控制台，提供了对Supabase项目的全面管理功能，包括：
- 账户管理
- 文档查阅
- 数据库管理
- 开发工具
- 调试功能
- 函数管理
- 分支管理
- 存储管理

## 集成方式

### 1. VS Code集成（推荐）

MCP现在通过VS Code扩展集成，无需在项目中添加额外组件。

### 2. 配置文件
- `.vscode/settings.json` - VS Code Supabase配置
- `.vscode/extensions.json` - 推荐扩展配置
- `mcp.config.json` - MCP服务器配置文件（保留用于参考）

## 使用方法

### 在VS Code中访问MCP

1. 安装推荐的Supabase VS Code扩展
2. 在VS Code中打开命令面板（Ctrl+Shift+P或Cmd+Shift+P）
3. 搜索并选择"Supabase: Open Management Control Point"
4. 或者直接点击状态栏中的Supabase图标

### 手动访问MCP

您也可以直接访问以下URL来使用MCP：
```
https://mcp.supabase.com/mcp?project_ref=kdlhyzsihflwkwumxzfw&features=account%2Cdocs%2Cdatabase%2Cdevelopment%2Cdebugging%2Cfunctions%2Cbranching%2Cstorage
```

## 配置说明

### VS Code配置

`.vscode/settings.json`文件包含以下配置：
```json
{
  "supabase.projectId": "kdlhyzsihflwkwumxzfw",
  "supabase.mcp.enabled": true,
  "supabase.mcp.url": "https://mcp.supabase.com/mcp?project_ref=kdlhyzsihflwkwumxzfw&features=account%2Cdocs%2Cdatabase%2Cdevelopment%2Cdebugging%2Cfunctions%2Cbranching%2Cstorage"
}
```

### 推荐扩展

`.vscode/extensions.json`文件推荐以下扩展：
```json
{
  "recommendations": [
    "supabase.supabase-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 安全性

通过VS Code集成MCP，无需在项目代码中添加任何MCP相关组件，提高了项目的安全性和简洁性。

## 故障排除

如果无法访问MCP，请检查：
1. VS Code Supabase扩展是否已安装并启用
2. 网络连接是否正常
3. Supabase项目是否正常运行
4. MCP URL是否正确

## 相关文档

- [Supabase官方文档](https://supabase.com/docs)
- [MCP功能说明](https://supabase.com/docs/guides/platform/mcp)