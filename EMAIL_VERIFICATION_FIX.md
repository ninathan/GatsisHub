# Email Verification Fix

## Issue
The email verification system was not working because:
1. The old `/signup` endpoint was still creating accounts directly without verification
2. The `signup_verification_codes` table doesn't exist in the database yet

## Solution

### Step 1: Create the Database Table
Run this SQL in your Supabase SQL Editor:

```sql
-- Create table for signup email verification codes
CREATE TABLE IF NOT EXISTS signup_verification_codes (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_signup_verification_email ON signup_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_signup_verification_code ON signup_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_signup_verification_used ON signup_verification_codes(used);

-- Add comment
COMMENT ON TABLE signup_verification_codes IS 'Stores verification codes for email confirmation during signup';
```

### Step 2: Deploy Backend Changes
The backend has been updated with:
- `/send-signup-verification` - Sends verification code email
- `/verify-signup-code` - Verifies code and creates account
- Old `/signup` endpoint now returns error directing to use verification flow

### Step 3: Test the Flow
1. Go to signup page
2. Fill in Steps 1-3 (Personal Info, Address, Security)
3. Click "Next" on Step 3 - this will send verification email
4. Check email for 6-digit code
5. Enter code in Step 4
6. Click "Verify & Create Account"
7. Account will ONLY be created after successful verification

## How It Works

### Frontend Flow:
1. User fills Steps 1-3
2. On Step 3 "Next" → calls `send-signup-verification`
3. User enters code in Step 4
4. On "Verify & Create Account" → calls `verify-signup-code`
5. Account created only after verification

### Backend Flow:
```
send-signup-verification:
├── Check if email exists
├── Generate 6-digit code
├── Store in signup_verification_codes table
└── Send email with code

verify-signup-code:
├── Verify code exists and not expired
├── Mark code as used
├── Create Supabase Auth user
├── Insert into customers table
└── Send welcome email
```

## Debugging

Check backend logs for:
- `📧 Verification code request received`
- `✅ Generated code: XXXXXX`
- `✅ Code stored in database`
- `📤 Sending email via Resend API...`
- `✅ Email sent successfully`

Common issues:
1. Table doesn't exist → Run SQL above
2. Email not sending → Check RESEND_API_KEY environment variable
3. Code expired → Codes expire after 15 minutes, request new one

## Testing

1. **Delete any test accounts** created during initial testing
2. **Run the SQL** to create the table
3. **Restart backend** (redeploy to Vercel)
4. **Try signup again** - verification email should arrive

The old confirmation email you received was from the old `/signup` endpoint which has now been disabled.
