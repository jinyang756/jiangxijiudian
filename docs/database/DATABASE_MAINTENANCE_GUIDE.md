# 数据库维护指南

本文档提供了江西酒店菜单系统数据库的维护指南，包括初始化、更新和优化操作。

## 数据库初始化

### 完整初始化
使用 `complete-database-init.sql` 脚本进行完整的数据库初始化：

```bash
# 使用 psql 命令执行
psql -f sql/complete-database-init.sql

# 或者使用 npm 脚本（如果已配置）
npm run init-db-complete
```

该脚本包含：
- 所有表的创建
- 索引优化
- RLS（行级安全）策略
- 审计功能
- API密钥管理

### 优化初始化
使用 `optimized-init.sql` 脚本进行优化的数据库初始化：

```bash
psql -f sql/optimized-init.sql
```

## 视图管理

### 创建菜单视图
使用 `create-menu-view.sql` 脚本创建或更新菜单视图：

```bash
psql -f sql/create-menu-view.sql
```

该视图将 `categories` 和 `dishes` 表连接，为前端应用提供嵌套的菜单数据结构。

### 验证视图
验证 `menu_view` 是否存在：

```sql
SELECT viewname FROM pg_views WHERE viewname = 'menu_view';
```

## 策略更新

### 更新RLS策略
使用 `update-policies.sql` 脚本更新行级安全策略：

```bash
psql -f sql/update-policies.sql
```

这将确保公众用户可以插入数据到必要的表中。

## 索引优化

### 应用索引优化
使用 `index-optimization.sql` 脚本优化数据库索引：

```bash
psql -f sql/index-optimization.sql
```

## 审计和维护

### 审计表维护
使用 `audit-maintenance.sql` 脚本维护审计表：

```bash
psql -f audit-maintenance.sql
```

这包括：
- 按月分区的审计表创建
- 数据归档策略
- 定期清理策略
- 性能监控查询

## 日常维护任务

### 1. 监控数据库大小
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    (SELECT COUNT(*) FROM audit.table_changes) as row_count
FROM pg_tables 
WHERE schemaname = 'public';
```

### 2. 检查索引使用情况
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

### 3. 性能基准测试
```sql
-- 测试不同时间范围的查询性能
EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM public.dishes 
WHERE created_at > NOW() - INTERVAL '1 day';

EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM public.dishes 
WHERE created_at > NOW() - INTERVAL '1 week';
```

## 故障排除

### 常见问题

1. **视图不存在**
   - 运行 `create-menu-view.sql` 脚本重新创建视图

2. **RLS策略问题**
   - 运行 `update-policies.sql` 脚本更新策略

3. **性能问题**
   - 运行 `index-optimization.sql` 脚本优化索引
   - 检查慢查询日志

4. **数据不一致**
   - 验证表结构是否与前端期望一致
   - 检查触发器是否正常工作

### 验证脚本执行

可以通过以下方式验证脚本是否正确执行：

1. **检查表是否存在**
   ```sql
   \dt
   ```

2. **检查视图是否存在**
   ```sql
   \dv
   ```

3. **检查索引**
   ```sql
   \di
   ```

4. **检查RLS策略**
   ```sql
   SELECT * FROM pg_policy;
   ```

## 安全最佳实践

### 1. 凭据管理
- 定期轮换数据库凭据
- 使用最小权限原则
- 避免在代码中硬编码凭据

### 2. 数据保护
- 启用加密传输（SSL/TLS）
- 对敏感数据进行加密存储
- 定期备份数据库

### 3. 访问控制
- 使用RLS限制数据访问
- 定期审查用户权限
- 监控异常访问模式

## 备份和恢复

### 备份策略
```bash
# 创建完整备份
pg_dump -h hostname -U username database_name > backup.sql

# 创建特定表备份
pg_dump -h hostname -U username -t table_name database_name > table_backup.sql
```

### 恢复策略
```bash
# 恢复完整备份
psql -h hostname -U username database_name < backup.sql

# 恢复特定表
psql -h hostname -U username database_name < table_backup.sql
```

## 相关文档

- [完整数据库初始化指南](COMPLETE_DATABASE_INITIALIZATION.md)
- [生产环境部署指南](../deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [环境配置最佳实践](../development/ENVIRONMENT_CONFIGURATION_GUIDE.md)