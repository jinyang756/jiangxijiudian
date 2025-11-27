-- 数据库索引优化脚本
-- 使用CONCURRENTLY避免锁表，确保在线服务不受影响

-- 启用pg_trgm扩展以支持模糊搜索
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- dishes表优化索引
-- 优化菜单查询性能：按分类和可用性筛选
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_category_available 
ON dishes(category_id, available);

-- 优化菜品搜索性能
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_search 
ON dishes USING gin(name_zh gin_trgm_ops);

-- 为菜品中文名称创建全文搜索索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_zh_trgm 
ON dishes USING gin(name_zh gin_trgm_ops);

-- 为菜品英文名称创建全文搜索索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_en_trgm 
ON dishes USING gin(name_en gin_trgm_ops);

-- orders表优化索引
-- 优化订单查询性能：按桌号、状态和创建时间排序
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_table_status_created 
ON orders(table_id, status, created_at DESC, id DESC);

-- 优化最近订单查询：部分索引提高性能
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_recent 
ON orders(created_at DESC, id DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- service_requests表优化索引
-- 优化服务请求查询性能：按桌号、状态和创建时间排序
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_table_status_created 
ON service_requests(table_id, status, created_at DESC, id DESC);

-- 优化最近服务请求查询：部分索引提高性能
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_recent 
ON service_requests(created_at DESC, id DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- tagged_orders表优化索引
-- 优化标签化订单查询性能：按桌号、标签、状态和创建时间排序
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tagged_orders_table_tag_status_created 
ON tagged_orders(table_id, tag, status, created_at DESC, id DESC);

-- 添加注释
COMMENT ON INDEX idx_dishes_category_available IS '优化菜单查询性能的复合索引';
COMMENT ON INDEX idx_dishes_name_zh_trgm IS '支持菜品中文名称模糊搜索的全文索引';
COMMENT ON INDEX idx_orders_table_status_created IS '优化订单查询性能的复合索引';
COMMENT ON INDEX idx_service_requests_table_status_created IS '优化服务请求查询性能的复合索引';
COMMENT ON INDEX idx_tagged_orders_table_tag_status_created IS '优化标签化订单查询性能的复合索引';