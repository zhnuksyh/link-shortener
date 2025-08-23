-- Add columns for TinyURL integration
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS tinyurl_alias TEXT,
ADD COLUMN IF NOT EXISTS external_short_url TEXT;

-- Update the table to make short_code optional since we'll use TinyURL aliases
ALTER TABLE links 
ALTER COLUMN short_code DROP NOT NULL;

-- Add index for faster lookups on TinyURL alias
CREATE INDEX IF NOT EXISTS idx_links_tinyurl_alias ON links(tinyurl_alias);
