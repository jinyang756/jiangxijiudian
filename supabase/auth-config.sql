-- 创建管理员角色
create role admin;

-- 为管理员角色授予所有表的完全访问权限
grant all privileges on table categories to admin;
grant all privileges on table dishes to admin;
grant all privileges on table orders to admin;
grant all privileges on table service_requests to admin;

-- 为管理员角色授予序列操作权限（如果需要插入数据）
grant usage, select on all sequences in schema public to admin;

-- 创建管理员用户（需要替换 'your_admin_email' 和 'your_admin_password' 为实际值）
-- 注意：这需要在 Supabase 控制台中手动完成，或者通过 Supabase Auth API 完成
-- create user 'your_admin_email' with password 'your_admin_password';
-- grant admin to 'your_admin_email';

-- 创建只读角色（用于普通员工查看数据）
create role readonly;

-- 为只读角色授予 SELECT 权限
grant select on table categories to readonly;
grant select on table dishes to readonly;
grant select on table orders to readonly;
grant select on table service_requests to readonly;

-- 设置行级安全策略，允许管理员访问所有数据
alter table categories force row level security;
alter table dishes force row level security;
alter table orders force row level security;
alter table service_requests force row level security;

-- 为管理员创建策略
create policy "admin full access"
on categories
for all
to admin
using (true)
with check (true);

create policy "admin full access"
on dishes
for all
to admin
using (true)
with check (true);

create policy "admin full access"
on orders
for all
to admin
using (true)
with check (true);

create policy "admin full access"
on service_requests
for all
to admin
using (true)
with check (true);

-- 为只读用户创建策略
create policy "readonly access"
on categories
for select
to readonly
using (true);

create policy "readonly access"
on dishes
for select
to readonly
using (true);

create policy "readonly access"
on orders
for select
to readonly
using (true);

create policy "readonly access"
on service_requests
for select
to readonly
using (true);