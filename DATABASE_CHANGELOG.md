# Database Changelog

This file tracks all database schema changes for the GatsisHub project. Always update this file AND `updated_database.json` when making database changes.

## Format
- Date: YYYY-MM-DD
- Migration File: filename.sql
- Description: What changed and why
- Tables Affected: List of tables

---

## 2024-11-08 - Add Employee Authentication System

**Migration:** `add_salesadmin_auth.sql`

**Purpose:**
- Enable login system for Sales Admin, Operational Manager, and other employees
- Secure employee accounts with bcrypt password hashing
- Create fallback admin account for initial access

**Changes:**
- Added `email` VARCHAR(150) UNIQUE to `employees` table
- Added `password` VARCHAR(60) to `employees` table (for bcrypt hashes)
- Added `role` VARCHAR(30) to `employees` table (Sales Admin, Operational Manager, Employee)
- Added `accountstatus` VARCHAR(20) to `employees` table (Active, Inactive, Suspended)
- Created index `idx_employees_email` for faster login queries
- Inserted fallback Sales Admin account:
  - Email: `admin@gatsishub.com`
  - Password: `Admin@123` (can be changed after first login)
  - Role: Sales Admin

**Tables Affected:**
- `employees`

**Related Files:**
- `backend/routes/employees.js` - NEW: Employee login, profile, and password change endpoints
- `backend/server.js` - Added `/employees` route
- `frontend/src/pages/SalesAdminPages/AuthSA.jsx` - Functional login with authentication

---

## 2024-11-08 - Add Deadline Column to Orders

**Migration:** `add_deadline_column.sql`

**Purpose:**
- Allow Sales Admin to set expected completion deadline for orders
- Display deadline to customers in their order information

**Changes:**
- Added `deadline` DATE column to `orders` table
- Column is nullable (optional)

**Tables Affected:**
- `orders`

**Related Files:**
- `backend/routes/orders.js` - Added PATCH `/orders/:orderid/deadline` endpoint
- `frontend/src/pages/SalesAdminPages/OrderDetail.jsx` - Added deadline input field with edit/save functionality
- `frontend/src/pages/CustomerPages/Order.jsx` - Display deadline in order details if set

---

## 2024-11-08 - Fix Payment OrderID Type Mismatch

**Migration:** `fix_payment_orderid_type.sql`

**Issue:** 
- `payment.orderid` was `INTEGER`
- `orders.orderid` is `UUID`
- No foreign key relationship possible due to type mismatch

**Changes:**
- Dropped `payment.orderid` column
- Re-added as `UUID` type
- Added foreign key constraint `fk_payment_order` referencing `orders(orderid)` with CASCADE delete
- Added index `idx_payment_orderid` for query performance

**Tables Affected:**
- `payment`

**Related Files:**
- `updated_database.json` - Updated payment.orderid data_type to uuid

---

## Previous Migrations (Already Applied)

### Add Total Price Column
**Migration:** `add_totalprice_column.sql`
- Added `totalprice` NUMERIC(10,2) to `orders` table
- Used for Sales Admin validated pricing

### Add Order Instructions Column
**Migration:** `add_order_instructions_column.sql`
- Added `orderinstructions` TEXT to `orders` table
- Separate from delivery notes for internal order handling

### Add Addresses Column
**Migration:** `add_addresses_column.sql`
- Added `addresses` JSONB to `customers` table (default: '[]')
- Migrated data from old `companyaddress` column
- Dropped `companyaddress` column

### Add Feedback Rating Column
**Migration:** `add_feedback_rating.sql`
- Added `rating` INTEGER to `feedback` table (default: 5)
- 5-star rating system for completed orders

### Add Feedback Timestamp
**Migration:** `add_feedbacks_timestamp.sql`
- Added `created_at` TIMESTAMP to `feedback` table
- Tracks when reviews were submitted

### Create Password Reset Codes Table
**Migration:** `create_password_reset_codes_table.sql`
- Created new table `password_reset_codes` with columns:
  - `id` (PK, serial)
  - `email` (varchar 255)
  - `code` (varchar 6)
  - `expires_at` (timestamp)
  - `used` (boolean, default false)
  - `created_at` (timestamp)
- Added indexes on email, code, and used columns

---

## Current Database Schema Summary

**Total Tables:** 11

| Table | Columns | Purpose |
|-------|---------|---------|
| customers | 11 | User accounts and company info |
| orders | 26 | Order details with 3D design data |
| designs | 7 | Saved customer designs |
| feedback | 6 | Customer reviews with ratings |
| employees | 6 | Employee management |
| messages | 6 | Customer support chat |
| payment | 6 | Payment tracking and proof |
| password_reset_codes | 6 | Password reset verification |
| quota | 7 | Production quotas |
| teams | 7 | Team assignments |
| orders_with_designs | 11 | VIEW - Simplified order data |

**Key JSONB Columns:**
- `orders.materials` - Material composition percentages
- `orders.threeddesigndata` - Complete 3D design JSON with thumbnail
- `orders.textposition` - 3D coordinates for custom text
- `orders.logoposition` - 3D coordinates for logo placement
- `customers.addresses` - Array of customer addresses

**Foreign Keys:**
- `designs.customerid` → `customers.customerid`
- `feedback.customerid` → `customers.customerid`
- `feedback.orderid` → `orders.orderid`
- `messages.customerid` → `customers.customerid`
- `messages.employeeid` → `employees.employeeid`
- `payment.orderid` → `orders.orderid` (FIXED 2024-11-08)
- `quota.employeeid` → `employees.employeeid`
- `teams.employeeid` → `employees.employeeid`

---

## Maintenance Notes

**Before Making Database Changes:**
1. Create a migration SQL file in the project root
2. Test the migration in Supabase SQL Editor
3. Run the migration on production database
4. Update `updated_database.json` with new schema
5. Document changes in this file (DATABASE_CHANGELOG.md)
6. Commit all three files together

**Naming Convention for Migration Files:**
- Action format: `verb_tablename_description.sql`
- Examples: `add_totalprice_column.sql`, `create_payment_table.sql`, `fix_payment_orderid_type.sql`

**Reference Files:**
- `updated_database.json` - Complete schema dump (regenerate with `view_complete_database_schema.sql`)
- `view_complete_database_schema.sql` - Script to view all schema info in Supabase
- `DATABASE_SCHEMA_REFERENCE.md` - Human-readable schema documentation
- `DATABASE_CHANGELOG.md` - This file, tracks all changes chronologically
