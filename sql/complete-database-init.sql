-- BEGIN SCRIPT

-- 1) 扩展（如果需要）
DO $$
BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
CREATE EXTENSION pgcrypto;
END IF;
END $$;

-- 2) 表：categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) 表：dishes
CREATE TABLE IF NOT EXISTS public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0.00,
  currency text DEFAULT 'CNY',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  available boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) 表：_staging_dishes（暂存表）
CREATE TABLE IF NOT EXISTS public._staging_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_name text,
  raw_description text,
  raw_price text,
  raw_currency text,
  raw_category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  inserted_at timestamptz DEFAULT now()
);

-- 5) 表：orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  total_amount numeric(12,2) DEFAULT 0.00,
  currency text DEFAULT 'CNY',
  status text DEFAULT 'pending',
  placed_at timestamptz DEFAULT now()
);

-- 6) 表：service_requests
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  table_number text,
  request_text text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 7) 表：transaction_account_ledger
CREATE TABLE IF NOT EXISTS public.transaction_account_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  amount numeric(14,2),
  currency text DEFAULT 'CNY',
  description text,
  created_at timestamptz DEFAULT now()
);

-- 8) 表：example_audit_logs
CREATE TABLE IF NOT EXISTS public.example_audit_logs (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL,
  performed_by uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 9) 表：api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  owner uuid,
  key_hash text, -- store hash, not plaintext
  created_at timestamptz DEFAULT now()
);

-- 10) 表：operation_logs
CREATE TABLE IF NOT EXISTS public.operation_logs (
  id bigserial PRIMARY KEY,
  op text,
  details jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 11) 索引（性能）
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON public.dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_name ON public.dishes USING gin (to_tsvector('english', coalesce(name, '')));
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (name);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_account_ledger_account_id ON public.transaction_account_ledger (account_id);
CREATE INDEX IF NOT EXISTS idx_example_audit_logs_table_name ON public.example_audit_logs (table_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON public.api_keys (owner);

-- 12) 启用 RLS
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public._staging_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_account_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.example_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operation_logs ENABLE ROW LEVEL SECURITY;

-- 13) RLS 策略：categories（允许 authenticated SELECT/INSERT）
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'categories_select_authenticated' AND polrelid = 'public.categories'::regclass
) THEN
CREATE POLICY categories_select_authenticated ON public.categories FOR SELECT TO authenticated USING (true);
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'categories_insert_authenticated' AND polrelid = 'public.categories'::regclass
) THEN
CREATE POLICY categories_insert_authenticated ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
END IF;
END $$;

-- 14) RLS 策略：dishes（允许 authenticated SELECT/INSERT/UPDATE）
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'dishes_select_authenticated' AND polrelid = 'public.dishes'::regclass
) THEN
CREATE POLICY dishes_select_authenticated ON public.dishes FOR SELECT TO authenticated USING (true);
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'dishes_insert_authenticated' AND polrelid = 'public.dishes'::regclass
) THEN
CREATE POLICY dishes_insert_authenticated ON public.dishes FOR INSERT TO authenticated WITH CHECK (true);
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'dishes_update_authenticated' AND polrelid = 'public.dishes'::regclass
) THEN
CREATE POLICY dishes_update_authenticated ON public.dishes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
END IF;
END $$;

-- 15) RLS 策略：api_keys（只允许 owner 访问/插入自己的 key）
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'api_keys_owner_select' AND polrelid = 'public.api_keys'::regclass
) THEN
CREATE POLICY api_keys_owner_select ON public.api_keys FOR SELECT TO authenticated USING (owner IS NOT DISTINCT FROM (SELECT auth.uid()));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'api_keys_owner_insert' AND polrelid = 'public.api_keys'::regclass
) THEN
CREATE POLICY api_keys_owner_insert ON public.api_keys FOR INSERT TO authenticated WITH CHECK (owner IS NOT DISTINCT FROM (SELECT auth.uid()));
END IF;
END $$;

-- 16) RLS 策略：_staging_dishes（禁止 PUBLIC 访问）
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'staging_no_public_access' AND polrelid = 'public._staging_dishes'::regclass
) THEN
CREATE POLICY staging_no_public_access ON public._staging_dishes FOR ALL TO PUBLIC USING (false);
END IF;
END $$;

-- 17) 审计函数：simple_audit
CREATE OR REPLACE FUNCTION public.simple_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.example_audit_logs(table_name, record_id, action, performed_by, details)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id::text, ''), 'INSERT', (SELECT auth.uid()), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.example_audit_logs(table_name, record_id, action, performed_by, details)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id::text, ''), 'UPDATE', (SELECT auth.uid()), jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.example_audit_logs(table_name, record_id, action, performed_by, details)
    VALUES (TG_TABLE_NAME, COALESCE(OLD.id::text, ''), 'DELETE', (SELECT auth.uid()), row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 18) 将 simple_audit 安装到 public.dishes（触发器）
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgname = 'dishes_simple_audit_trigger'
) THEN
CREATE TRIGGER dishes_simple_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.dishes
FOR EACH ROW
EXECUTE FUNCTION public.simple_audit();
END IF;
END $$;

-- 19) 建议的 RLS：example_audit_logs（仅 service_role 写入，限制读取）
-- 注意：service_role bypasses RLS. 这里我们允许 authenticated 不能读审计日志，只有具有特定管理员 claim 的用户可读。
DO $$
BEGIN
-- deny read to public/anonymous by default (no explicit policy -> deny)
-- create policy to allow read only to users with admin claim in JWT
IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_admin_select' AND polrelid = 'public.example_audit_logs'::regclass
) THEN
CREATE POLICY audit_logs_admin_select ON public.example_audit_logs FOR SELECT TO authenticated USING ((auth.jwt() ->> 'user_role') = 'admin');
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_service_insert' AND polrelid = 'public.example_audit_logs'::regclass
) THEN
CREATE POLICY audit_logs_service_insert ON public.example_audit_logs FOR INSERT TO authenticated WITH CHECK (
  (auth.jwt() ->> 'service_role') = 'internal' OR (auth.jwt() ->> 'user_role') = 'admin'
);
END IF;
END $$;

-- 20) 可选：辅助函数用于 api_keys 在插入时生成并存储哈希（示例）
-- 说明：此函数会生成一个随机 key，返回明文以供显示一次，并在表中存储其 bcrypt/sha256 散列（示例中使用 pgcrypto 的 hmac/'sha256'）。
-- 运行此函数需要适当权限。如果你要启用我可进一步调整为 SECURITY DEFINER 并 REVOKE/GRANT。
CREATE OR REPLACE FUNCTION public.generate_api_key(name text, owner_uuid uuid)
RETURNS TABLE (key_plain text, key_hash text, id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  raw text;
  hashed text;
  new_id uuid;
BEGIN
  raw := encode(gen_random_bytes(32), 'hex');
  hashed := encode(digest(raw, 'sha256'), 'hex');
  new_id := gen_random_uuid();
  INSERT INTO public.api_keys(id, name, owner, key_hash, created_at)
  VALUES (new_id, name, owner_uuid, hashed, now());
  RETURN QUERY SELECT raw, hashed, new_id;
END;
$$;

-- 21) 触发器更新 updated_at（示例，用于自动更新时间戳）
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 将触发器安装到 dishes 和 categories
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'dishes_set_updated_at') THEN
CREATE TRIGGER dishes_set_updated_at
BEFORE UPDATE ON public.dishes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
END IF;

IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'categories_set_updated_at') THEN
CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
END IF;
END $$;

-- END SCRIPT