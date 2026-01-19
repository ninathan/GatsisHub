import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// � Send signup verification code
router.post("/send-signup-verification", async (req, res) => {
  try {
    const { emailAddress, firstName, lastName } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Check if email already exists
    const { data: existingUser, error: findError } = await supabase
      .from("customers")
      .select("emailaddress")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store verification code
    const { error: insertError } = await supabase
      .from("signup_verification_codes")
      .insert([{
        email: emailAddress,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        used: false
      }]);

    if (insertError) {
      return res.status(500).json({ 
        error: "Failed to generate verification code",
        details: insertError.message 
      });
    }

    // Send verification email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        return res.status(500).json({ error: "Email service not configured" });
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'GatsisHub <noreply@gatsishub.com>',
          to: [emailAddress],
          subject: 'Verify Your Email - GatsisHub Registration',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #35408E; margin-bottom: 10px;">Welcome to GatsisHub!</h1>
                <p style="font-size: 18px; color: #666;">Email Verification Required</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="color: #35408E; margin-top: 0;">Hello ${firstName} ${lastName}!</h2>
                <p style="color: #333; line-height: 1.6;">
                  Thank you for signing up with GatsisHub. To complete your registration, please verify your email address using the code below:
                </p>
              </div>

              <div style="background-color: #35408E; color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Your Verification Code:</p>
                <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>

              <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="color: #856404; margin: 0;">
                  ⏰ This code will expire in <strong>15 minutes</strong>
                </p>
              </div>

              <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                <p>If you didn't request this verification code, please ignore this email.</p>
                <p style="margin-top: 20px;">
                  Best regards,<br/>
                  <strong>The GatsisHub Team</strong><br/>
                  Premium Hanger Solutions
                </p>
              </div>
            </div>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      return res.status(200).json({ 
        message: "Verification code sent to your email",
        email: emailAddress 
      });

    } catch (emailError) {
      return res.status(500).json({ 
        error: "Failed to send verification email",
        details: emailError.message 
      });
    }

  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// 🔐 Verify signup code and create account
router.post("/verify-signup-code", async (req, res) => {
  try {
    const { emailAddress, code, firstName, lastName, companyNumber, gender, dateOfBirth, password, addresses } = req.body;

    if (!emailAddress || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Find valid code
    const { data: verificationRecord, error: findError } = await supabase
      .from("signup_verification_codes")
      .select("*")
      .eq("email", emailAddress)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (findError || !verificationRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // Check if code is expired
    const now = new Date();
    const expiresAt = new Date(verificationRecord.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    // Mark code as used
    await supabase
      .from("signup_verification_codes")
      .update({ used: true })
      .eq("id", verificationRecord.id);

    // Now proceed with account creation (original signup logic)
    if (!firstName || !lastName || !password || !gender || !dateOfBirth) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAddress,
      password: password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login`
      }
    });

    let userId;

    if (authError) {
      if (authError.code === 'user_already_exists' || authError.message.includes("already")) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailAddress,
          password: password
        });
        
        if (signInError) {
          return res.status(400).json({ error: "This email is already registered" });
        }
        
        userId = signInData.user?.id;
      } else {
        return res.status(400).json({ error: "Failed to create account: " + authError.message });
      }
    } else {
      userId = authData.user?.id;
    }

    if (!userId) {
      return res.status(500).json({ error: "User creation failed" });
    }

    // Insert into customers table
    const { data: customerData, error: dbError } = await supabase
      .from("customers")
      .insert([{ 
        userid: userId,
        google_id: null,
        companyname: `${firstName} ${lastName}`,
        emailaddress: emailAddress,
        companynumber: companyNumber || null,
        password: hashedPassword,
        addresses: addresses || [],
        datecreated: new Date().toISOString(),
        accountstatus: 'Active',
        profilePicture: null,
        emailnotifications: true,
        gender: gender,
        dateofbirth: dateOfBirth
      }])
      .select();

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    // Send welcome email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'GatsisHub <noreply@gatsishub.com>',
            to: [emailAddress],
            subject: 'Welcome to GatsisHub - Account Created!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #35408E; margin-bottom: 10px;">Welcome to GatsisHub!</h1>
                  <p style="font-size: 18px; color: #666;">Account Successfully Created</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <h2 style="color: #35408E; margin-top: 0;">Hello ${firstName} ${lastName}!</h2>
                  <p style="color: #333; line-height: 1.6;">
                    Your email has been verified and your account is now active. You can start ordering premium custom hangers for your business!
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login" 
                     style="background-color: #DAC325; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Login to Your Account
                  </a>
                </div>

                <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                  <p>Best regards,<br/>
                    <strong>The GatsisHub Team</strong><br/>
                    Premium Hanger Solutions
                  </p>
                </div>
              </div>
            `
          })
        });
      }
    } catch (emailError) {
      // Don't fail if welcome email fails
    }

    res.status(201).json({
      message: "Account created successfully!",
      customer: customerData[0]
    });

  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// �📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    
    const { firstName, lastName, emailAddress, companyNumber, gender, dateOfBirth, password, addresses } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !emailAddress || !password || !gender || !dateOfBirth) {

      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {

      return res.status(400).json({ error: "Invalid email format." });
    }

    // 3️⃣ Validate password strength
    if (password.length < 6) {

      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }


    // 4️⃣ Check if email already exists in customers table

    const { data: existingUser, error: findError } = await supabase
      .from("customers")
      .select("emailaddress")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (findError) {

      return res.status(500).json({ error: "Database error: " + findError.message });
    }

    if (existingUser) {

      return res.status(400).json({ error: "Email is already registered in our system." });
    }

    // 2️⃣ Hash the password before storing

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create a Supabase Auth user

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAddress,
      password: password
    });

    let userId;

    if (authError) {




      // If auth user already exists, try to get their ID and add to customers table
      if (authError.code === 'user_already_exists' || authError.message.includes("already")) {


        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailAddress,
          password: password
        });
        
        if (signInError) {

          return res.status(400).json({ 
            error: "This email is already registered. If you forgot your password, please use the password reset feature.",
            code: "USER_EXISTS"
          });
        }
        
        userId = signInData.user?.id;

        if (!userId) {
          return res.status(500).json({ error: "Could not retrieve user ID" });
        }
        
        // Check one more time if they're in customers table
        const { data: checkCustomer, error: checkError } = await supabase
          .from("customers")
          .select("userid")
          .eq("userid", userId)
          .maybeSingle();
          
        if (checkCustomer) {

          return res.status(400).json({ 
            error: "Account already exists. Please log in instead.",
            code: "ACCOUNT_EXISTS"
          });
        }

      } else {
        // Different error - return it
        return res.status(400).json({ 
          error: "Failed to create account: " + authError.message 
        });
      }
    } else {
      userId = authData.user?.id;


    }

    if (!userId) {
      return res.status(500).json({ error: "User creation failed, no user ID returned." });
    }

    // 4️⃣ Insert into your 'customers' table

    const { data: customerData, error: dbError } = await supabase
      .from("customers")
      .insert([
        { 
          userid: userId,
          google_id: null,
          companyname: `${firstName} ${lastName}`,
          emailaddress: emailAddress,
          companynumber: companyNumber || null,
          password: hashedPassword,
          addresses: addresses || [],
          datecreated: new Date().toISOString(),
          accountstatus: 'Active',
          profilePicture: null,
          emailnotifications: true,
          gender: gender,
          dateofbirth: dateOfBirth
        }
      ])
      .select();

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    // 5️⃣ Send confirmation email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'GatsisHub <noreply@gatsishub.com>',
            to: [emailAddress],
            subject: 'Welcome to GatsisHub - Registration Successful!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #35408E; margin-bottom: 10px;">Welcome to GatsisHub!</h1>
                  <p style="font-size: 18px; color: #666;">Registration Successful</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <h2 style="color: #35408E; margin-top: 0;">Hello ${firstName} ${lastName}!</h2>
                  <p style="color: #333; line-height: 1.6;">
                    Thank you for registering with GatsisHub. Your account has been successfully created!
                  </p>
                  <p style="color: #333; line-height: 1.6;">
                    You can now log in to start ordering premium custom hangers for your business.
                  </p>
                </div>

                <div style="background-color: #35408E; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Account Details:</h3>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${emailAddress}</p>
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                  ${companyNumber ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${companyNumber}</p>` : ''}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login" 
                     style="background-color: #DAC325; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Login to Your Account
                  </a>
                </div>

                <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                  <p>If you didn't create this account, please ignore this email or contact our support team.</p>
                  <p style="margin-top: 20px;">
                    Best regards,<br/>
                    <strong>The GatsisHub Team</strong><br/>
                    Premium Hanger Solutions
                  </p>
                </div>
              </div>
            `
          })
        });

        let responseData;
        try {
          responseData = await emailResponse.json();
        } catch (parseError) {

        }
        
        if (emailResponse.ok) {

        } else {

        }
      } else {

      }
    } catch (emailError) {

      // Don't fail the registration if email fails
    }

    // 6️⃣ Return success);
    
    res.status(201).json({
      message: "Signup successful!",
      customer: customerData[0]
    });
  } catch (err) {
    
    res.status(500).json({ 
      error: "Server error: " + err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 📝 Login route - Step 1: Validate credentials and send 2FA code
router.post("/login", async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (userError || !user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if 2FA is enabled for this user
    const twoFactorEnabled = user.two_factor_enabled !== undefined ? user.two_factor_enabled : true;

    // If 2FA is disabled, log in directly
    if (!twoFactorEnabled) {
      return res.status(200).json({
        message: "Login successful!",
        requiresVerification: false,
        user: {
          userid: user.userid,
          customerid: user.customerid,
          companyname: user.companyname,
          emailaddress: user.emailaddress,
          companynumber: user.companynumber,
          addresses: user.addresses || []
        }
      });
    }

    // Password is correct and 2FA is enabled - now send 2FA code
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Get client info for security tracking
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Store verification code in database
    const { error: insertError } = await supabase
      .from("login_verification_codes")
      .insert([{
        email: emailAddress,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        used: false,
        ip_address: ipAddress,
        user_agent: userAgent
      }]);

    if (insertError) {
      return res.status(500).json({ 
        error: "Failed to generate verification code",
        details: insertError.message 
      });
    }

    // Send 2FA code via email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        return res.status(500).json({ error: "Email service not configured" });
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'GatsisHub <noreply@gatsishub.com>',
          to: [emailAddress],
          subject: 'Your Login Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #35408E;">Login Verification</h2>
              <p>Hello ${user.companyname || 'there'},</p>
              <p>Someone is trying to log in to your GatsisHub account. If this is you, please use the verification code below:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p>This code will expire in 15 minutes.</p>
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
                <strong>Security Notice:</strong>
                <p style="margin: 5px 0;">IP Address: ${ipAddress}</p>
                <p style="margin: 5px 0;">Time: ${new Date().toLocaleString()}</p>
              </div>
              <p>If you didn't attempt to log in, please secure your account immediately by changing your password.</p>
              <p>Best regards,<br/>GatsisHub Security Team</p>
            </div>
          `
        })
      });

      let responseData;
      try {
        responseData = await emailResponse.json();
      } catch (parseError) {
        throw new Error("Invalid response from email service");
      }
      
      if (!emailResponse.ok) {
        throw new Error(`Failed to send verification email: ${responseData.message || responseData.error || 'Unknown error'}`);
      }

      // Return success - client should now prompt for verification code
      return res.status(200).json({ 
        message: "Verification code sent to your email",
        requiresVerification: true,
        email: emailAddress
      });

    } catch (emailError) {
      return res.status(500).json({ 
        error: "Failed to send verification email",
        details: emailError.message 
      });
    }

  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// 📝 Login route - Step 2: Verify 2FA code and complete login
router.post("/verify-login-code", async (req, res) => {
  try {
    const { emailAddress, code } = req.body;

    if (!emailAddress || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Find valid code
    const { data: verificationRecord, error: findError } = await supabase
      .from("login_verification_codes")
      .select("*")
      .eq("email", emailAddress)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (findError || !verificationRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // Check if code is expired
    const now = new Date();
    const expiresAt = new Date(verificationRecord.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Mark code as used
    await supabase
      .from("login_verification_codes")
      .update({ used: true })
      .eq("id", verificationRecord.id);

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Successful login - return user data
    res.status(200).json({
      message: "Login successful!",
      user: {
        userid: user.userid,
        customerid: user.customerid,
        companyname: user.companyname,
        emailaddress: user.emailaddress,
        companynumber: user.companynumber,
        addresses: user.addresses || []
      },
    });
  } catch (err) {

    res.status(500).json({ error: "Server error during login" });
  }
});



router.post('/google', async (req, res) => {
  try {


    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if customer already exists
    let { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('emailaddress', email)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    // If not found, create customer record with Supabase Auth user
    if (!customer) {

      let userId = null;
      
      // 1️⃣ Check if auth user already exists by email
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email);
      
      if (existingAuthUser) {

        userId = existingAuthUser.id;
      } else {
        // Create new auth user
        const randomPassword = crypto.randomUUID();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: randomPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            google_id: sub,
            name: name,
            picture: picture
          }
        });

        if (authError) {

          throw authError;
        }

        userId = authData.user?.id;

      }

      if (!userId) {
        throw new Error("Failed to get user ID");
      }

      // 2️⃣ Insert into customers table
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([{
          userid: userId,
          google_id: sub,
          companyname: name || "Google User",
          emailaddress: email,
          companynumber: null,
          password: null,
          addresses: [],
          datecreated: new Date().toISOString(),
          accountstatus: 'Active',
          profilePicture: picture || null,
          emailnotifications: true
        }])
        .select()
        .single();

      if (insertError) {

        throw insertError;
      }

      customer = newCustomer;

      // 3️⃣ Send welcome email to new Google user
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'GatsisHub <noreply@gatsishub.com>',
            to: [email],
            subject: 'Welcome to GatsisHub - Google Sign-In Successful!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #35408E; margin-bottom: 10px;">Welcome to GatsisHub!</h1>
                  <p style="font-size: 18px; color: #666;">You're All Set!</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <h2 style="color: #35408E; margin-top: 0;">Hello ${name}!</h2>
                  <p style="color: #333; line-height: 1.6;">
                    Thank you for signing up with GatsisHub using your Google account. Your account has been successfully created!
                  </p>
                  <p style="color: #333; line-height: 1.6;">
                    You can now start ordering premium custom hangers for your business.
                  </p>
                </div>

                <div style="background-color: #35408E; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Account Details:</h3>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Sign-In Method:</strong> Google Account</p>
                  <p style="margin: 5px 0;"><strong>Account Status:</strong> Active</p>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #DAC325; margin-bottom: 20px;">
                  <p style="color: #856404; margin: 0; line-height: 1.6;">
                    <strong>📍 Next Step:</strong> Complete your delivery address to start placing orders!
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login" 
                     style="background-color: #DAC325; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Access Your Account
                  </a>
                </div>

                <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                  <p>You can sign in anytime using your Google account - no password needed!</p>
                  <p>If you didn't create this account, please ignore this email or contact our support team.</p>
                  <p style="margin-top: 20px;">
                    Best regards,<br/>
                    <strong>The GatsisHub Team</strong><br/>
                    Premium Hanger Solutions
                  </p>
                </div>
              </div>
            `
          })
        });

      } catch (emailError) {

        // Don't fail the signup if email fails
      }
    }

    // ✅ Return customer data
    res.status(200).json({
      success: true,
      user: customer,
    });

  } catch (error) {



    res.status(400).json({ error: error.message || "Google login failed" });
  }
});

// 🔐 Change Password route
router.post("/change-password", async (req, res) => {
  try {
    const { userid, currentPassword, newPassword } = req.body;

    if (!userid || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    // Find user by userid
    const { data: user, error: userError } = await supabase
      .from("customers")
      .select("*")
      .eq("userid", userid)
      .single();

    if (userError || !user) {

      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {

      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("customers")
      .update({ password: hashedPassword })
      .eq("userid", userid);

    if (updateError) {

      return res.status(500).json({ error: "Failed to update password" });
    }

    // Also update in Supabase Auth
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      userid,
      { password: newPassword }
    );

    if (authUpdateError) {

      // Continue anyway since the main password is updated
    }

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {

    res.status(500).json({ error: "Server error while changing password" });
  }
});

// 🗑️ Delete Account route
router.delete("/delete-account", async (req, res) => {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Delete user's designs first (foreign key constraint)
    const { error: designsError } = await supabase
      .from("designs")
      .delete()
      .eq("userid", userid);

    if (designsError) {

      // Continue anyway, might not have any designs
    }

    // Delete user's orders (if any)
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("userid", userid);

    if (ordersError) {

      // Continue anyway, might not have any orders
    }

    // Delete customer record from database
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("userid", userid);

    if (customerError) {

      return res.status(500).json({ error: "Failed to delete account" });
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userid);

    if (authError) {

      // Continue anyway since the main customer record is deleted
    }

    res.status(200).json({ message: "Account deleted successfully" });

  } catch (err) {

    res.status(500).json({ error: "Server error while deleting account" });
  }
});

// 🔍 Get customer by userid
router.get("/customer/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress")
      .eq("userid", userid)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);

  } catch (err) {

    res.status(500).json({ error: "Server error while fetching customer" });
  }
});

// 📧 Forgot Password - Send verification code
router.post("/forgot-password", async (req, res) => {
  try {
    const { emailAddress } = req.body;

    // Validate email
    if (!emailAddress) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Check if user exists
    const { data: customer, error: findError } = await supabase
      .from("customers")
      .select("customerid, emailaddress, companyname")
      .eq("emailaddress", emailAddress)
      .single();

    if (findError || !customer) {

      return res.status(404).json({ error: "No account found with this email address" });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store verification code in database
    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert([{
        email: emailAddress,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        used: false
      }]);

    if (insertError) {
      return res.status(500).json({ 
        error: "Database error. Please ensure password_reset_codes table exists.",
        details: insertError.message 
      });
    }

    // Send email using Resend API
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {

        return res.status(500).json({ error: "Email service not configured" });
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'GatsisHub <noreply@gatsishub.com>',
          to: [emailAddress],
          subject: 'Password Reset Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #35408E;">Password Reset Request</h2>
              <p>Hello ${customer.companyname || 'there'},</p>
              <p>You requested to reset your password. Use the verification code below:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <p>Best regards,<br/>GatsisHub Team</p>
            </div>
          `
        })
      });

      let responseData;
      try {
        responseData = await emailResponse.json();
      } catch (parseError) {

        throw new Error("Invalid response from email service");
      }
      
      if (!emailResponse.ok) {
        throw new Error(`Resend API error: ${responseData.message || responseData.error || 'Unknown error'}`);
      }

      return res.status(200).json({ 
        message: "Verification code sent to your email",
        email: emailAddress 
      });

    } catch (emailError) {


      res.status(500).json({ 
        error: "Failed to send verification email",
        details: emailError.message 
      });
    }

  } catch (err) {

    res.status(500).json({ error: "Server error during password reset" });
  }
});

// 🔐 Verify reset code
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { emailAddress, code } = req.body;

    if (!emailAddress || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Find valid code
    const { data: resetCode, error: findError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", emailAddress)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (findError || !resetCode) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check if code is expired
    const now = new Date();
    const expiresAt = new Date(resetCode.expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Mark code as used
    await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", emailAddress)
      .eq("code", code);

    res.status(200).json({ 
      message: "Code verified successfully",
      email: emailAddress 
    });

  } catch (err) {

    res.status(500).json({ error: "Server error during code verification" });
  }
});

// 🔄 Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { emailAddress, newPassword } = req.body;

    if (!emailAddress || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Find customer
    const { data: customer, error: findError } = await supabase
      .from("customers")
      .select("customerid, userid")
      .eq("emailaddress", emailAddress)
      .single();

    if (findError || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("customers")
      .update({ password: hashedPassword })
      .eq("emailaddress", emailAddress);

    if (updateError) {

      return res.status(500).json({ error: "Failed to update password" });
    }

    // Update Supabase Auth password if userid exists
    if (customer.userid) {
      try {
        await supabase.auth.admin.updateUserById(customer.userid, {
          password: newPassword
        });
      } catch (authError) {

        // Continue anyway since the main password is updated
      }
    }

    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {

    res.status(500).json({ error: "Server error during password reset" });
  }
});

export default router;