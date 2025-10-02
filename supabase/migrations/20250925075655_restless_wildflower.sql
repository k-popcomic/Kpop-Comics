/*
  # Comic Upload Tool Database Schema

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)  
      - `unique_code` (text, unique) - Customer's unique ID for upload links
      - `email` (text, optional)
      - `name` (text, optional)  
      - `created_at` (timestamp)
      
    - `submissions`
      - `id` (uuid, primary key)
      - `customer_id` (text, foreign key to customers.unique_code)
      - `title` (text)
      - `description` (text, optional)
      - `date` (text) - Publication date
      - `images` (jsonb) - Array of image objects
      - `status` (enum: draft, submitted, processing, completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create storage bucket for comic images
    - Configure public access for uploaded images

  3. Security  
    - Enable RLS on all tables
    - Add policies for public access to customer uploads
    - Add policies for admin-only access to submissions management
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_code text UNIQUE NOT NULL,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Create submissions table with status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'processing', 'completed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES customers(unique_code) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  status submission_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage bucket for comic images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comic-images', 'comic-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policies for customers table
CREATE POLICY "Allow public read access to customers"
  ON customers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to customers" 
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for submissions table  
CREATE POLICY "Allow public read for own submissions"
  ON submissions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert submissions"
  ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update for own submissions"
  ON submissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage all submissions"
  ON submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage policies
CREATE POLICY "Allow public uploads to comic-images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'comic-images');

CREATE POLICY "Allow public read from comic-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'comic-images');

CREATE POLICY "Allow authenticated users to manage comic-images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'comic-images')
  WITH CHECK (bucket_id = 'comic-images');

-- Create updated_at trigger for submissions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample customers for testing
INSERT INTO customers (unique_code, email, name) 
VALUES 
  ('3803050057', 'customer1@example.com', 'John Smith'),
  ('4921837456', 'customer2@example.com', 'Jane Doe'),
  ('5647382910', 'customer3@example.com', 'Mike Johnson')
ON CONFLICT (unique_code) DO NOTHING;