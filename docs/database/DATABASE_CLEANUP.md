# 数据库文件清理说明

## 概述
为了使项目结构更清晰，减少冗余文件，本次对数据库相关的文件进行了清理。

## 清理的文件

### 1. 根目录下的SQL文件
- `create-menu-view.sql` - 功能已被整合到优化脚本中
- `menu_import.sql` - 功能已被整合到优化脚本中

### 2. Scripts目录下的重复文件
- `scripts/create-menu-view.sql` - 重复的视图创建脚本
- `scripts/create-views.sql` - 重复的视图创建脚本

### 3. Supabase目录下的示例数据文件
- `supabase/seed-data.sql` - 包含的是示例数据而非实际菜单数据

### 4. Migrations目录下的所有迁移文件
- `migrations/2025xx_add_name_norm_to_dishes.sql`
- `migrations/V1__add_name_norm_column.sql`
- `migrations/V2a__backfill_name_norm_psql_loop.sql`
- `migrations/V2b__backfill_name_norm_single_batch.sql`
- `migrations/V3__create_trigger_set_name_norm.sql`
- `migrations/V4__create_partial_unique_index_concurrently.sql`

这些文件是早期开发阶段的迁移脚本，在当前优化后的系统中不再需要。

## 保留的重要文件

### 1. 优化后的数据库初始化脚本
- `sql/optimized-init.sql` - 包含完整的表结构和江西酒店实际菜单数据

### 2. 数据库模式文件
- `supabase/schema.sql` - 包含数据库表结构定义

## 更新的配置

### Package.json脚本更新
- 修改了 `init-db-optimized` 脚本命令，使用正确的 `psql -f sql/optimized-init.sql` 命令格式

## 清理后的优势
1. 减少了项目复杂性
2. 避免了文件功能重复
3. 使数据库相关文件更加集中和易于维护
4. 清除了过时的迁移脚本