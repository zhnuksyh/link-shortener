-- Remove the unique constraint on tinyurl_alias to allow multiple users
-- to have the same TinyURL alias (when they shorten the same URL)
-- This is necessary because TinyURL returns the same alias for the same URL
-- regardless of who requests it

-- Drop the unique constraint on tinyurl_alias
ALTER TABLE public.links 
DROP CONSTRAINT IF EXISTS links_tinyurl_alias_unique;

-- Add a composite unique constraint on (tinyurl_alias, user_id) instead
-- This ensures each user can only have one record per TinyURL alias
-- but multiple users can have the same alias
ALTER TABLE public.links 
ADD CONSTRAINT links_tinyurl_alias_user_unique UNIQUE (tinyurl_alias, user_id);

-- Add comment explaining the change
COMMENT ON CONSTRAINT links_tinyurl_alias_user_unique ON public.links IS 
'Ensures each user can only have one record per TinyURL alias, but allows multiple users to have the same alias (when they shorten the same URL)';
