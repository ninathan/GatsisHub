-- Add two_factor_enabled column to customers table
-- This allows users to enable/disable Two-Factor Authentication

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT true;

-- Set all existing users to have 2FA enabled by default
UPDATE customers 
SET two_factor_enabled = true 
WHERE two_factor_enabled IS NULL;

COMMENT ON COLUMN customers.two_factor_enabled IS 'Enable/disable Two-Factor Authentication for login';
