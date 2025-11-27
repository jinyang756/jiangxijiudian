-- 江西酒店菜单系统审计表维护策略

-- 1. 创建按月分区的审计表（示例：创建下个月的分区）
-- 注意：需要根据当前日期调整分区名称和范围

-- 创建分区表的父表（如果尚未存在）
CREATE TABLE IF NOT EXISTS audit.table_changes_partitioned (
    id BIGSERIAL,
    table_name TEXT,
    operation TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT,
    old_record JSONB,
    new_record JSONB
) PARTITION BY RANGE (changed_at);

-- 为下个月创建分区（示例）
-- 注意：需要根据当前日期调整月份
CREATE TABLE IF NOT EXISTS audit.table_changes_2025_12 PARTITION OF audit.table_changes_partitioned
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- 2. 审计表数据归档策略
-- 将旧数据从主审计表移动到分区表

-- 创建归档函数
CREATE OR REPLACE FUNCTION audit.archive_old_records(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- 将指定天数之前的记录移动到归档表
    WITH moved_rows AS (
        DELETE FROM audit.table_changes
        WHERE changed_at < NOW() - INTERVAL '1 day' * days_to_keep
        RETURNING *
    )
    INSERT INTO audit.table_changes_partitioned
    SELECT * FROM moved_rows;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 3. 定期清理策略
-- 删除超过一年的旧审计记录

CREATE OR REPLACE FUNCTION audit.cleanup_old_records(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 删除指定天数之前的记录
    DELETE FROM audit.table_changes
    WHERE changed_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建定期维护作业的示例（需要在 Supabase 中设置 Cron 作业）
-- 这些作业应该每月运行一次

-- 归档 90 天前的记录
-- SELECT audit.archive_old_records(90);

-- 清理 365 天前的记录
-- SELECT audit.cleanup_old_records(365);

-- 5. 监控审计表大小的查询
-- 检查审计表的行数和大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    (SELECT COUNT(*) FROM audit.table_changes) as row_count
FROM pg_tables 
WHERE schemaname = 'audit' AND tablename = 'table_changes';

-- 6. 审计表索引使用情况分析
-- 检查索引使用统计信息
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'audit' AND tablename = 'table_changes';

-- 7. 性能基准测试查询
-- 测试不同时间范围的查询性能
EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM audit.table_changes 
WHERE changed_at > NOW() - INTERVAL '1 day';

EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM audit.table_changes 
WHERE changed_at > NOW() - INTERVAL '1 week';

EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM audit.table_changes 
WHERE changed_at > NOW() - INTERVAL '1 month';