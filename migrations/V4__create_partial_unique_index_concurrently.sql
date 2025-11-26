-- V4__create_partial_unique_index_concurrently.sql
-- Create a partial unique index on name_norm (only for non-NULL values)
-- NOTE: This file must NOT contain BEGIN/COMMIT and must be run outside a transaction.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_name_norm_unique
ON public.dishes(name_norm)
WHERE name_norm IS NOT NULL;