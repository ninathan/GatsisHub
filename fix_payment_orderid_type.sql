-- Fix payment table orderid type mismatch
-- Current: payment.orderid is INTEGER
-- Should be: payment.orderid is UUID (to match orders.orderid)

-- Step 1: Drop the old column (no foreign key exists, safe to drop)
ALTER TABLE payment 
DROP COLUMN IF EXISTS orderid;

-- Step 2: Add the column back with the correct UUID type
ALTER TABLE payment 
ADD COLUMN orderid UUID;

-- Step 3: Add foreign key constraint to orders table
ALTER TABLE payment
ADD CONSTRAINT fk_payment_order
FOREIGN KEY (orderid) 
REFERENCES orders(orderid)
ON DELETE CASCADE;

-- Step 4: Add index for performance
CREATE INDEX IF NOT EXISTS idx_payment_orderid ON payment(orderid);

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payment' AND column_name = 'orderid';

-- Check foreign key was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'payment';
