-- 更新行级安全策略以允许插入数据

-- 为 dishes 表添加插入策略
CREATE POLICY "public can insert dishes"
ON dishes
FOR INSERT TO anon
WITH CHECK (true);

-- 为 categories 表添加插入策略
CREATE POLICY "public can insert categories"
ON categories
FOR INSERT TO anon
WITH CHECK (true);

-- 为 orders 表添加插入策略（如果不存在）
CREATE POLICY "public can insert orders"
ON orders
FOR INSERT TO anon
WITH CHECK (true);

-- 为 service_requests 表添加插入策略（如果不存在）
CREATE POLICY "public can insert service_requests"
ON service_requests
FOR INSERT TO anon
WITH CHECK (true);