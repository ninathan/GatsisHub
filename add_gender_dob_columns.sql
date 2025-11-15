-- Add gender and date of birth columns to customers table
-- Run this in your Supabase SQL Editor

-- Add gender column
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Add date of birth column
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS dateofbirth DATE;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('gender', 'dateofbirth');

-- Optional: Add comments to document these columns
COMMENT ON COLUMN customers.gender IS 'Customer gender (Male, Female, Other, Prefer not to say)';
COMMENT ON COLUMN customers.dateofbirth IS 'Customer date of birth';
