-- Update order statuses to new naming convention
-- Replace "Pending" with "For Evaluation" for existing orders

UPDATE orders
SET orderstatus = 'For Evaluation'
WHERE orderstatus = 'Pending';

-- Optional: Update other old statuses if they exist
UPDATE orders
SET orderstatus = 'In Transit'
WHERE orderstatus = 'Shipped';

UPDATE orders
SET orderstatus = 'In Production'
WHERE orderstatus = 'Processing';

-- Add a comment to document the changes
COMMENT ON COLUMN orders.orderstatus IS 'Order status: For Evaluation, Waiting for Payment, Approved, In Production, Waiting for Shipment, In Transit, Completed, Cancelled';
