-- Migration V2b: Backfill name_norm column (single batch)
-- This migration performs a single batch update to populate the name_norm column.
-- It's designed to be run multiple times by migration runners until 0 rows are affected.
-- Batch size: 10,000 rows per execution
--
-- Note: This should be run repeatedly until no more rows are updated.
-- In migration runners like Flyway, this file would be executed in a loop
-- until the update affects 0 rows.

-- Single batch update (10,000 rows)
WITH batch AS (
  SELECT id
  FROM public.dishes
  WHERE coalesce(name_norm, '') = ''       -- only rows with empty/NULL name_norm
    AND coalesce(name, '') <> ''           -- skip rows with empty/NULL name
  ORDER BY id
  LIMIT 10000
)
UPDATE public.dishes d
SET name_norm = public.normalize_dish_name(d.name)
FROM batch b
WHERE d.id = b.id;

-- Return the number of rows updated for monitoring
-- This won't work in all migration tools, but can be useful for manual execution
-- GET DIAGNOSTICS rows_affected = ROW_COUNT;
-- SELECT rows_affected;

-- Verification query (can be run separately to check progress):
-- SELECT 
--   COUNT(*) as total_rows,
--   COUNT(name_norm) as filled_rows,
--   COUNT(*) - COUNT(name_norm) as remaining_rows
-- FROM public.dishes;