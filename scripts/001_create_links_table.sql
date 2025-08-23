-- Create links table for storing shortened URLs
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create policies for CRUD operations
CREATE POLICY "Users can view their own links" 
  ON public.links FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links" 
  ON public.links FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" 
  ON public.links FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" 
  ON public.links FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_links_short_code ON public.links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_links_updated_at 
  BEFORE UPDATE ON public.links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
