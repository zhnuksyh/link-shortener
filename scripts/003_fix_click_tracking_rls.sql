-- Fix Row Level Security policies to allow anonymous click tracking
-- This allows anonymous users to increment click counts when visiting shortened links

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;

-- Create a new UPDATE policy that allows:
-- 1. Users to update their own links (for status changes, etc.)
-- 2. Anonymous users to update click counts only
CREATE POLICY "Users can update their own links, anonymous can update clicks" 
  ON public.links FOR UPDATE 
  USING (
    -- Allow users to update their own links
    auth.uid() = user_id 
    OR 
    -- Allow anonymous users to update click counts only
    (auth.uid() IS NULL AND is_active = true)
  );

-- Also need to allow anonymous users to SELECT active links for redirects
-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own links" ON public.links;

-- Create a new SELECT policy that allows:
-- 1. Users to view their own links
-- 2. Anonymous users to view active links for redirects
CREATE POLICY "Users can view their own links, anonymous can view active links" 
  ON public.links FOR SELECT 
  USING (
    -- Allow users to view their own links
    auth.uid() = user_id 
    OR 
    -- Allow anonymous users to view active links for redirects
    (auth.uid() IS NULL AND is_active = true)
  );
