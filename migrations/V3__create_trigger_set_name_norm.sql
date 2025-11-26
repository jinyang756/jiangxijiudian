-- Migration V3: Create trigger to automatically set name_norm
-- This migration creates a trigger function and trigger to automatically 
-- populate the name_norm column on INSERT or UPDATE operations.
-- It can be run in a transactional context.

BEGIN;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.dishes_set_name_norm() 
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN 
  IF NEW.name IS NOT NULL THEN 
    NEW.name_norm := public.normalize_dish_name(NEW.name); 
  ELSE 
    NEW.name_norm := NULL; 
  END IF; 
  RETURN NEW; 
END;
$$;

-- Drop the trigger if it already exists to ensure a clean replacement
DROP TRIGGER IF EXISTS set_name_norm_trigger ON public.dishes;

-- Create the trigger
CREATE TRIGGER set_name_norm_trigger 
BEFORE INSERT OR UPDATE ON public.dishes 
FOR EACH ROW 
EXECUTE FUNCTION public.dishes_set_name_norm();

COMMIT;

-- Verification queries (optional, can be run separately to verify):
-- Check if the function exists:
-- SELECT proname, prokind FROM pg_proc WHERE proname = 'dishes_set_name_norm';

-- Check if the trigger exists:
-- SELECT tgname, tgtype FROM pg_trigger WHERE tgname = 'set_name_norm_trigger';