-- Fix the links table schema to properly support TinyURL integration
-- This script addresses the issues with short_code constraints

-- First, drop the unique constraint on short_code since we're using TinyURL aliases
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_short_code_key;

-- Make short_code nullable and increase its length to accommodate TinyURL aliases
ALTER TABLE public.links 
ALTER COLUMN short_code TYPE VARCHAR(50),
ALTER COLUMN short_code DROP NOT NULL;

-- Add a unique constraint on tinyurl_alias instead (if it doesn't exist)
ALTER TABLE public.links 
ADD CONSTRAINT links_tinyurl_alias_unique UNIQUE (tinyurl_alias);

-- Ensure the tinyurl_alias and external_short_url columns exist
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS tinyurl_alias TEXT,
ADD COLUMN IF NOT EXISTS external_short_url TEXT;

-- Create index for faster lookups on TinyURL alias
CREATE INDEX IF NOT EXISTS idx_links_tinyurl_alias ON public.links(tinyurl_alias);

-- Update any existing records to have proper values
UPDATE public.links 
SET tinyurl_alias = short_code,
    external_short_url = CONCAT('https://tinyurl.com/', short_code)
WHERE tinyurl_alias IS NULL 
  AND short_code IS NOT NULL;
