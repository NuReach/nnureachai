-- Create clients table for storing client project information
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  country TEXT NOT NULL,
  price TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'In Progress', 'Completed', 'On Hold')),
  problems JSONB NOT NULL,
  target_customers TEXT NOT NULL,
  warranty TEXT NOT NULL,
  promotion TEXT NOT NULL,
  uniqueness TEXT NOT NULL,
  immersion_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Create an index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;

-- Create policies for authenticated users
-- Users can only view their own clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own clients
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own clients
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own clients
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create scripts table for storing generated content
CREATE TABLE IF NOT EXISTS scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  angle_title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_typology TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for scripts
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Policies for scripts
CREATE POLICY "Users can view own scripts" ON scripts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts" ON scripts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts" ON scripts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts" ON scripts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create branding_scripts table for storing branding video scripts
CREATE TABLE IF NOT EXISTS branding_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  viral_angle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for branding_scripts
ALTER TABLE branding_scripts ENABLE ROW LEVEL SECURITY;

-- Policies for branding_scripts
CREATE POLICY "Users can view own branding scripts" ON branding_scripts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own branding scripts" ON branding_scripts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding scripts" ON branding_scripts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own branding scripts" ON branding_scripts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_scripts_updated_at
  BEFORE UPDATE ON branding_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add immersion_data column if it doesn't exist (for existing databases)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS immersion_data JSONB;

-- Add viral_angle column to branding_scripts table (for storing the selected viral angle)
ALTER TABLE branding_scripts ADD COLUMN IF NOT EXISTS viral_angle TEXT;

-- Add content_typology column to scripts table (for storing the selected typology name)
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS content_typology TEXT;
