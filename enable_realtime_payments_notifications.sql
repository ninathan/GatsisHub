-- Enable Supabase Realtime for Payments and Admin Notifications
-- This script enables real-time updates for payment status changes and admin notifications

-- Enable realtime publication for payments table
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- Enable realtime publication for payment_history table (for transaction history)
ALTER PUBLICATION supabase_realtime ADD TABLE payment_history;

-- Verify that admin_notifications already has realtime enabled (should already be added)
-- If not, run: ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- Verify publications
SELECT 
    schemaname,
    tablename,
    'Realtime enabled' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('payments', 'payment_history', 'admin_notifications')
ORDER BY tablename;

-- Display success message
SELECT 'Realtime enabled successfully for payments, payment_history, and admin_notifications tables' AS message;
