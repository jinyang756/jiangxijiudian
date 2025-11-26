-- Migration V2a: Backfill name_norm column in batches (psql script with loop)
-- This script performs batched updates to populate the name_norm column.
-- It uses psql meta-commands to loop through batches and commit each one.
-- Recommended for large tables to avoid long-running transactions.
-- 
-- To run this script:
-- psql -d your_database -f V2a__backfill_name_norm_psql_loop.sql
--
-- Batch size: 10,000 rows per batch

\echo 'Starting batch backfill for name_norm column...'
\echo 'Batch size: 10,000 rows'
\echo 'Press Ctrl+C to cancel'

-- Set variables for the loop
\set batch_size 10000
\set rows_updated 1

-- Loop until no more rows are updated
\while :rows_updated > 0
\do
  -- Update a batch of rows
  WITH cte AS (
    SELECT id 
    FROM public.dishes 
    WHERE name IS NOT NULL 
      AND (name_norm IS NULL OR name_norm = '') 
    ORDER BY id 
    LIMIT :batch_size
  )
  UPDATE public.dishes d 
  SET name_norm = public.normalize_dish_name(d.name) 
  FROM cte 
  WHERE d.id = cte.id;

  -- Get the number of rows updated in the last batch
  \get lastoid
  \set rows_updated `echo $_`

  -- Display progress
  \echo 'Updated batch. Rows affected:' :rows_updated
  \echo 'Continuing to next batch...'
\do

\echo 'Backfill complete.'