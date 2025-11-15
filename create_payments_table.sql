-- Create payments table to store payment proof submissions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
    paymentid SERIAL PRIMARY KEY,
    orderid UUID REFERENCES orders(orderid) ON DELETE CASCADE,
    customerid INTEGER REFERENCES customers(customerid) ON DELETE SET NULL,
    paymentmethod VARCHAR(50) NOT NULL,
    proofofpayment TEXT NOT NULL, -- URL to uploaded file
    paymentstatus VARCHAR(50) DEFAULT 'Pending Verification',
    amountpaid DECIMAL(10, 2),
    transactionreference VARCHAR(100),
    notes TEXT,
    datesubmitted TIMESTAMP DEFAULT NOW(),
    dateverified TIMESTAMP,
    verifiedby INTEGER REFERENCES employees(employeeid) ON DELETE SET NULL,
    createdat TIMESTAMP DEFAULT NOW(),
    updatedat TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_orderid ON payments(orderid);
CREATE INDEX IF NOT EXISTS idx_payments_customerid ON payments(customerid);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(paymentstatus);

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores payment proof submissions from customers';
COMMENT ON COLUMN payments.paymentmethod IS 'Payment method: Bank Transfer or Cheque Payment';
COMMENT ON COLUMN payments.proofofpayment IS 'URL/path to uploaded payment proof file';
COMMENT ON COLUMN payments.paymentstatus IS 'Status: Pending Verification, Verified, Rejected';
COMMENT ON COLUMN payments.amountpaid IS 'Amount paid by customer';
COMMENT ON COLUMN payments.transactionreference IS 'Bank transaction reference or cheque number';

-- Grant permissions (adjust as needed)
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
