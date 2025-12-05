-- Create login_verification_codes table for 2FA email authentication
-- This table stores temporary verification codes sent to users during login

CREATE TABLE IF NOT EXISTS login_verification_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for faster lookups
CREATE INDEX idx_login_verification_email ON login_verification_codes(email);
CREATE INDEX idx_login_verification_code ON login_verification_codes(code);
CREATE INDEX idx_login_verification_used ON login_verification_codes(used);

-- Add comments for documentation
COMMENT ON TABLE login_verification_codes IS 'Stores temporary verification codes for 2FA login authentication';
COMMENT ON COLUMN login_verification_codes.email IS 'Email address of the user attempting to login';
COMMENT ON COLUMN login_verification_codes.code IS '6-digit verification code sent to user via email';
COMMENT ON COLUMN login_verification_codes.expires_at IS 'Timestamp when the code expires (typically 15 minutes from creation)';
COMMENT ON COLUMN login_verification_codes.used IS 'Flag indicating whether the code has been used';
COMMENT ON COLUMN login_verification_codes.ip_address IS 'IP address from which the login attempt originated';
COMMENT ON COLUMN login_verification_codes.user_agent IS 'Browser user agent string for security tracking';
