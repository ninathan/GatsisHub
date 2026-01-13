-- Create order_logs table for tracking all order modifications
CREATE TABLE IF NOT EXISTS order_logs (
    logid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orderid UUID NOT NULL REFERENCES orders(orderid) ON DELETE CASCADE,
    employeeid UUID REFERENCES employees(employeeid) ON DELETE SET NULL,
    employeename VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_logs_orderid ON order_logs(orderid);
CREATE INDEX IF NOT EXISTS idx_order_logs_timestamp ON order_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_order_logs_employeeid ON order_logs(employeeid);

-- Add comments for documentation
COMMENT ON TABLE order_logs IS 'Tracks all modifications and activities on orders';
COMMENT ON COLUMN order_logs.action IS 'Type of action performed (e.g., Price Updated, Status Changed, Deadline Modified)';
COMMENT ON COLUMN order_logs.field_changed IS 'Name of the field that was modified';
COMMENT ON COLUMN order_logs.old_value IS 'Previous value before the change';
COMMENT ON COLUMN order_logs.new_value IS 'New value after the change';
COMMENT ON COLUMN order_logs.description IS 'Human-readable description of the change';
