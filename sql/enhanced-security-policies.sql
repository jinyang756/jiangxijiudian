-- 增强安全策略脚本
-- 包含更严格的RLS策略和安全措施

-- 1. 更新 dishes 表的安全策略
-- 允许 authenticated 用户读取所有菜品
-- 限制插入和更新操作，只允许特定角色
DO $$
BEGIN
  -- 删除旧的插入策略（如果存在）
  DROP POLICY IF EXISTS "public can insert dishes" ON dishes;
  
  -- 创建新的插入策略，只允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'dishes_insert_authenticated_only' AND polrelid = 'public.dishes'::regclass
  ) THEN
    CREATE POLICY dishes_insert_authenticated_only ON dishes
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 更新选择策略，确保只允许 authenticated 用户读取
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'dishes_select_authenticated_only' AND polrelid = 'public.dishes'::regclass
  ) THEN
    CREATE POLICY dishes_select_authenticated_only ON dishes
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- 2. 更新 categories 表的安全策略
DO $$
BEGIN
  -- 删除旧的插入策略（如果存在）
  DROP POLICY IF EXISTS "public can insert categories" ON categories;
  
  -- 创建新的插入策略，只允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'categories_insert_authenticated_only' AND polrelid = 'public.categories'::regclass
  ) THEN
    CREATE POLICY categories_insert_authenticated_only ON categories
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 更新选择策略，确保只允许 authenticated 用户读取
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'categories_select_authenticated_only' AND polrelid = 'public.categories'::regclass
  ) THEN
    CREATE POLICY categories_select_authenticated_only ON categories
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END $$;

-- 3. 更新 orders 表的安全策略
-- 限制用户只能访问自己的订单
DO $$
BEGIN
  -- 删除旧的插入策略（如果存在）
  DROP POLICY IF EXISTS "public can insert orders" ON orders;
  
  -- 创建新的插入策略，允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'orders_insert_authenticated' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_insert_authenticated ON orders
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 创建选择策略，用户只能查看自己的订单
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'orders_select_own_only' AND polrelid = 'public.orders'::regclass
  ) THEN
    CREATE POLICY orders_select_own_only ON orders
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- 4. 更新 service_requests 表的安全策略
-- 限制用户只能访问自己提交的服务请求
DO $$
BEGIN
  -- 删除旧的插入策略（如果存在）
  DROP POLICY IF EXISTS "public can insert service_requests" ON service_requests;
  
  -- 创建新的插入策略，允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'service_requests_insert_authenticated' AND polrelid = 'public.service_requests'::regclass
  ) THEN
    CREATE POLICY service_requests_insert_authenticated ON service_requests
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 创建选择策略，用户只能查看自己提交的服务请求
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'service_requests_select_own_only' AND polrelid = 'public.service_requests'::regclass
  ) THEN
    CREATE POLICY service_requests_select_own_only ON service_requests
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- 5. 为 transaction_account_ledger 表添加安全策略
-- 限制用户只能访问自己的交易记录
DO $$
BEGIN
  -- 创建插入策略，允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'ledger_insert_authenticated' AND polrelid = 'public.transaction_account_ledger'::regclass
  ) THEN
    CREATE POLICY ledger_insert_authenticated ON transaction_account_ledger
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 创建选择策略，用户只能查看自己的交易记录
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'ledger_select_own_only' AND polrelid = 'public.transaction_account_ledger'::regclass
  ) THEN
    CREATE POLICY ledger_select_own_only ON transaction_account_ledger
    FOR SELECT TO authenticated
    USING (account_id = auth.uid());
  END IF;
END $$;

-- 6. 为 api_keys 表加强安全策略
-- 确保用户只能访问自己的API密钥
DO $$
BEGIN
  -- 更新选择策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'api_keys_select_owner_only' AND polrelid = 'public.api_keys'::regclass
  ) THEN
    CREATE POLICY api_keys_select_owner_only ON api_keys
    FOR SELECT TO authenticated
    USING (owner = auth.uid());
  END IF;
  
  -- 更新插入策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'api_keys_insert_owner_only' AND polrelid = 'public.api_keys'::regclass
  ) THEN
    CREATE POLICY api_keys_insert_owner_only ON api_keys
    FOR INSERT TO authenticated
    WITH CHECK (owner = auth.uid());
  END IF;
END $$;

-- 7. 添加审计日志安全策略
-- 确保只有管理员可以读取审计日志
DO $$
BEGIN
  -- 更新审计日志的选择策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_admin_select' AND polrelid = 'public.example_audit_logs'::regclass
  ) THEN
    CREATE POLICY audit_logs_admin_select ON example_audit_logs
    FOR SELECT TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin');
  END IF;
  
  -- 更新审计日志的插入策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_service_insert' AND polrelid = 'public.example_audit_logs'::regclass
  ) THEN
    CREATE POLICY audit_logs_service_insert ON example_audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
      (auth.jwt() ->> 'service_role') = 'internal' OR 
      (auth.jwt() ->> 'user_role') = 'admin'
    );
  END IF;
END $$;

-- 8. 为 operation_logs 表添加安全策略
-- 限制操作日志的访问
DO $$
BEGIN
  -- 创建插入策略，允许 authenticated 用户插入
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'operation_logs_insert_authenticated' AND polrelid = 'public.operation_logs'::regclass
  ) THEN
    CREATE POLICY operation_logs_insert_authenticated ON operation_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- 创建选择策略，只有管理员可以读取
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'operation_logs_select_admin_only' AND polrelid = 'public.operation_logs'::regclass
  ) THEN
    CREATE POLICY operation_logs_select_admin_only ON operation_logs
    FOR SELECT TO authenticated
    USING ((auth.jwt() ->> 'user_role') = 'admin');
  END IF;
END $$;

-- 9. 添加安全检查函数
-- 检查用户是否具有特定角色
CREATE OR REPLACE FUNCTION public.check_user_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_role') = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 添加数据脱敏函数
-- 对敏感数据进行脱敏处理
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(input_value TEXT)
RETURNS TEXT AS $$
BEGIN
  -- 如果用户不是管理员，则返回脱敏后的数据
  IF NOT public.check_user_role('admin') THEN
    RETURN '***MASKED***';
  END IF;
  
  -- 管理员可以查看原始数据
  RETURN input_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加注释
COMMENT ON FUNCTION public.check_user_role(TEXT) IS '检查用户是否具有指定角色';
COMMENT ON FUNCTION public.mask_sensitive_data(TEXT) IS '对敏感数据进行脱敏处理';

-- 输出确认信息
SELECT 'Enhanced security policies applied successfully' as result;