-- Migration V1: Add name_norm column to dishes table
-- This migration adds the name_norm column to the dishes table.
-- It can be run in a transactional context.

BEGIN;

-- Add the name_norm column if it doesn't already exist
ALTER TABLE IF EXISTS public.dishes 
ADD COLUMN IF NOT EXISTS name_norm text;

COMMIT;

-- Verification query (optional, can be run separately to verify):
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'dishes' AND column_name = 'name_norm';