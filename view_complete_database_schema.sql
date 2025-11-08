-- ============================================
-- COMPLETE DATABASE SCHEMA VIEWER
-- Run this in Supabase SQL Editor to see all tables, columns, and structure
-- ============================================

-- 1. List all tables in the public schema
SELECT tablename as table_name
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY table_name;

-- 2. Get detailed column information for ALL tables
SELECT 
    table_name,
    column_name,
    data_type,
    COALESCE(character_maximum_length::text, '-') as character_maximum_length,
    is_nullable,
    COALESCE(column_default, '-') as column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Get primary keys for all tables
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY table_name;

-- 4. Get foreign keys for all tables
SELECT 
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
    AND tc.table_schema = 'public'
ORDER BY table_name;

-- 5. Get indexes for all tables
SELECT 
    t.relname AS table_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY t.relname, i.relname;

-- 6. Count rows in each table (run separately for each table)
SELECT 'customers' as table_name, COUNT(*) as row_count FROM public.customers
UNION ALL
SELECT 'designs' as table_name, COUNT(*) as row_count FROM public.designs
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as row_count FROM public.employees
UNION ALL
SELECT 'feedback' as table_name, COUNT(*) as row_count FROM public.feedback
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM public.messages
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as row_count FROM public.orders
UNION ALL
SELECT 'orders_with_designs' as table_name, COUNT(*) as row_count FROM public.orders_with_designs
UNION ALL
SELECT 'password_reset_codes' as table_name, COUNT(*) as row_count FROM public.password_reset_codes
UNION ALL
SELECT 'payment' as table_name, COUNT(*) as row_count FROM public.payment
UNION ALL
SELECT 'quota' as table_name, COUNT(*) as row_count FROM public.quota
UNION ALL
SELECT 'teams' as table_name, COUNT(*) as row_count FROM public.teams
ORDER BY table_name;

-- 7. Show table structure AND sample data together
-- TABLE: customers
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

SELECT * FROM customers LIMIT 3;

-- TABLE: designs
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'designs'
ORDER BY ordinal_position;

SELECT * FROM designs LIMIT 3;

-- TABLE: employees
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'employees'
ORDER BY ordinal_position;

SELECT * FROM employees LIMIT 3;

-- TABLE: feedback
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'feedback'
ORDER BY ordinal_position;

SELECT * FROM feedback LIMIT 3;

-- TABLE: messages
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
ORDER BY ordinal_position;

SELECT * FROM messages LIMIT 3;

-- TABLE: orders
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

SELECT * FROM orders LIMIT 3;

-- TABLE: orders_with_designs
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders_with_designs'
ORDER BY ordinal_position;

SELECT * FROM orders_with_designs LIMIT 3;

-- TABLE: password_reset_codes
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'password_reset_codes'
ORDER BY ordinal_position;

SELECT * FROM password_reset_codes LIMIT 3;

-- TABLE: payment
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment'
ORDER BY ordinal_position;

SELECT * FROM payment LIMIT 3;

-- TABLE: quota
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'quota'
ORDER BY ordinal_position;

SELECT * FROM quota LIMIT 3;

-- TABLE: teams
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'teams'
ORDER BY ordinal_position;

SELECT * FROM teams LIMIT 3;

-- 8. Show JSONB column structures (for materials, threeddesigndata, etc.)
SELECT 
    'orders' as table_name,
    'materials' as column_name,
    materials::text as sample_data
FROM orders
WHERE materials IS NOT NULL
LIMIT 3;

SELECT 
    'orders' as table_name,
    'threeddesigndata' as column_name,
    LEFT(threeddesigndata::text, 200) || '...' as sample_data
FROM orders
WHERE threeddesigndata IS NOT NULL
LIMIT 3;

SELECT 
    'orders' as table_name,
    'textposition' as column_name,
    textposition::text as sample_data
FROM orders
WHERE textposition IS NOT NULL
LIMIT 3;

SELECT 
    'orders' as table_name,
    'logoposition' as column_name,
    logoposition::text as sample_data
FROM orders
WHERE logoposition IS NOT NULL
LIMIT 3;

-- 9. Show specific table column details
-- TABLE: customers
SELECT 
    'customers' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- TABLE: designs
SELECT 
    'designs' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'designs'
ORDER BY ordinal_position;

-- TABLE: employees
SELECT 
    'employees' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'employees'
ORDER BY ordinal_position;

-- TABLE: feedback
SELECT 
    'feedback' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'feedback'
ORDER BY ordinal_position;

-- TABLE: messages
SELECT 
    'messages' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
ORDER BY ordinal_position;

-- TABLE: orders
SELECT 
    'orders' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- TABLE: orders_with_designs
SELECT 
    'orders_with_designs' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders_with_designs'
ORDER BY ordinal_position;

-- TABLE: password_reset_codes
SELECT 
    'password_reset_codes' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'password_reset_codes'
ORDER BY ordinal_position;

-- TABLE: payment
SELECT 
    'payment' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment'
ORDER BY ordinal_position;

-- TABLE: quota
SELECT 
    'quota' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'quota'
ORDER BY ordinal_position;

-- TABLE: teams
SELECT 
    'teams' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'teams'
ORDER BY ordinal_position;

-- 10. Check for missing expected columns
-- Check if totalprice exists in orders table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'totalprice'
        ) 
        THEN '✓ totalprice column EXISTS in orders table'
        ELSE '✗ totalprice column MISSING from orders table - Run add_totalprice_column.sql'
    END as status;

-- Check if orderinstructions exists in orders table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'orderinstructions'
        ) 
        THEN '✓ orderinstructions column EXISTS in orders table'
        ELSE '✗ orderinstructions column MISSING from orders table - Run add_order_instructions_column.sql'
    END as status;

-- Check if addresses exists in customers table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = 'addresses'
        ) 
        THEN '✓ addresses column EXISTS in customers table'
        ELSE '✗ addresses column MISSING from customers table - Run add_addresses_column.sql'
    END as status;

-- Check if password_reset_codes table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'password_reset_codes'
        ) 
        THEN '✓ password_reset_codes table EXISTS'
        ELSE '✗ password_reset_codes table MISSING - Run create_password_reset_codes_table.sql'
    END as status;

-- Check if rating column exists in feedback table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'feedback' AND column_name = 'rating'
        ) 
        THEN '✓ rating column EXISTS in feedback table'
        ELSE '✗ rating column MISSING from feedback table - Run add_feedback_rating.sql'
    END as status;

-- 11. Summary
SELECT 
    COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';

SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;
