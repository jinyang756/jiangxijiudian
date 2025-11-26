-- 1. 前置检查（非必需，但建议在手动执行前运行） -- 确认 normalize_dish_name 函数存在（如果不存在，请先部署该函数） -- SELECT 1 FROM pg_proc WHERE proname = 'normalize_dish_name';

-- ====================================================== -- STEP 1: 在表上添加列（可在事务内安全执行） -- ====================================================== BEGIN;

ALTER TABLE IF EXISTS public.dishes ADD COLUMN IF NOT EXISTS name_norm text;

COMMIT;

-- ====================================================== -- STEP 2: 回填现有行（分批执行，避免长事务） -- ====================================================== -- 说明： -- - 推荐分批大小：5000 - 20000。根据表大小与数据库性能调整。 -- - 在 psql 中可通过循环脚本重复运行，或在迁移 runner 中循环直到受影响行数为 0。 -- - 以下为单次批量更新示例（请重复执行直到没有行被更新）。 -- - 如果使用 Flyway 等工具，建议把循环逻辑放在迁移脚本外（脚本仅包含单次批次 SQL）。

-- 单次批次（修改 LIMIT 为合适值） WITH cte AS ( SELECT id FROM public.dishes WHERE name IS NOT NULL AND (name_norm IS NULL OR name_norm = '') ORDER BY id LIMIT 5000 ) UPDATE public.dishes d SET name_norm = public.normalize_dish_name(d.name) FROM cte WHERE d.id = cte.id;

-- 重复上面的块直到没有更多行需要更新（受影响行数为 0）

-- ====================================================== -- STEP 3: 创建触发器函数并安装触发器 -- ====================================================== -- 说明：此步骤可在事务内执行。触发器会确保后续 INSERT/UPDATE 自动填充 name_norm。

BEGIN;

CREATE OR REPLACE FUNCTION public.dishes_set_name_norm() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.name IS NOT NULL THEN NEW.name_norm := public.normalize_dish_name(NEW.name); ELSE NEW.name_norm := NULL; END IF; RETURN NEW; END;

-- 确保旧触发器被替换 DROP TRIGGER IF EXISTS set_name_norm_trigger ON public.dishes;

CREATE TRIGGER set_name_norm_trigger BEFORE INSERT OR UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION public.dishes_set_name_norm();

COMMIT;

-- ====================================================== -- STEP 4: 检查重复（必须在创建唯一索引前执行） -- ====================================================== -- 说明：如果存在重复的 name_norm，CREATE UNIQUE INDEX 会失败。请在此处人工或程序化解决冲突。 -- 如果返回行，表示存在冲突。结果会列出冲突的 name_norm 及对应 id 列表。

SELECT name_norm, count() AS cnt, array_agg(id) AS ids FROM public.dishes WHERE name_norm IS NOT NULL GROUP BY name_norm HAVING count() > 1 ORDER BY cnt DESC LIMIT 200;

-- 如果上面返回任何行，请根据业务策略处理： -- - 合并重复项（合并库存/销量/关联记录并删除重复行） -- - 删除/标记重复行 -- - 追加后缀或生成新的 name_norm（不推荐） -- 处理完成后再次运行上面的检查直到无重复为止。

-- ====================================================== -- STEP 5: 创建唯一索引（CONCURRENTLY — 必须单独运行） -- ====================================================== -- 说明： -- - CREATE UNIQUE INDEX CONCURRENTLY 不能在事务块中执行。 -- - 在 psql 中请将以下两行单独复制执行（或作为单独迁移文件由迁移工具执行），不要与 BEGIN/COMMIT 结合使用。 -- - 如环境不允许 CONCURRENTLY（例如某些受限迁移 runner），只能使用普通 CREATE INDEX，这会在执行期间获取更严格的锁，可能导致短暂停写/读。

-- Run this command OUTSIDE any transaction: -- (Execute the next line alone) CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_norm_unique ON public.dishes(name_norm);

-- 如果您希望只对非空值强制唯一（节省索引空间并允许多个 NULL）： -- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_norm_unique ON public.dishes(name_norm) WHERE name_norm IS NOT NULL;

-- ====================================================== -- STEP 6 (可选): 将列设置为 NOT NULL（仅在确认所有行都有值） -- ====================================================== -- 说明：在设置 NOT NULL 前请再次确认没有 NULL 值存在 -- SELECT count() FROM public.dishes WHERE name_norm IS NULL;

-- 仅当确认无 NULL 且业务允许时执行（会在写入期间加短暂锁）： -- ALTER TABLE public.dishes ALTER COLUMN name_norm SET NOT NULL;

-- ====================================================== -- STEP 7 (可选): 在批量导入期间的优化方案（禁用触发器） -- ====================================================== -- 说明与注意： -- - DISABLE TRIGGER 需要足够权限（通常只有表的 owner 或超级用户可执行）。 -- - 禁用触发器后必须在导入后手动回填 name_norm 并重新启用触发器，否则新行将不会得到自动填充。 -- - 在托管环境（如受限的 Supabase 管理权限）可能无法使用 DISABLE TRIGGER，请先确认。

-- 如果您决定在导入前禁用触发器： -- 注意：以下命令会影响所有触发器（使用名称定向可能更安全），并需要以表 owner / superuser 执行。 -- ALTER TABLE public.dishes DISABLE TRIGGER set_name_norm_trigger; -- 执行批量导入（COPY / INSERT ...） -- 回填所有未填充的 name_norm（使用分批脚本） -- WITH cte AS ( -- SELECT id -- FROM public.dishes -- WHERE name IS NOT NULL AND (name_norm IS NULL OR name_norm = '') -- ORDER BY id -- LIMIT 5000 -- ) -- UPDATE public.dishes d -- SET name_norm = public.normalize_dish_name(d.name) -- FROM cte -- WHERE d.id = cte.id; -- 重复直到没有行被更新 -- 重新启用触发器： -- ALTER TABLE public.dishes ENABLE TRIGGER set_name_norm_trigger;

-- ====================================================== -- STEP 8: 回滚/清理（如果需要） -- ====================================================== -- 若需回滚此迁移（例如索引问题或其他原因），可按如下步骤： -- 1) DROP INDEX CONCURRENTLY idx_dishes_name_norm_unique; -- 在单独会话中执行 -- 2) DROP TRIGGER IF EXISTS set_name_norm_trigger ON public.dishes; -- 3) DROP FUNCTION IF EXISTS public.dishes_set_name_norm(); -- 4) ALTER TABLE public.dishes DROP COLUMN IF EXISTS name_norm; -- 在执行 DROP 操作前请谨慎验证并做好备份。