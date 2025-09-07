-- Add title field to links table for better link organization
-- This allows users to give custom titles to their shortened links

-- Add title column to links table
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Create index for faster searches on title
CREATE INDEX IF NOT EXISTS idx_links_title ON public.links(title);

-- Update existing records to have a default title based on the original URL
-- Extract domain name as default title for existing links
UPDATE public.links 
SET title = CASE 
  WHEN original_url LIKE 'https://%' THEN 
    REGEXP_REPLACE(
      REGEXP_REPLACE(original_url, '^https://', ''), 
      '/.*$', ''
    )
  WHEN original_url LIKE 'http://%' THEN 
    REGEXP_REPLACE(
      REGEXP_REPLACE(original_url, '^http://', ''), 
      '/.*$', ''
    )
  ELSE 
    REGEXP_REPLACE(original_url, '/.*$', '')
END
WHERE title IS NULL;

-- Add comment to the title column
COMMENT ON COLUMN public.links.title IS 'Custom title given by user for easier link identification';
