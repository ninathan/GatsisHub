import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import emailTemplates from '../utils/emailTemplates.js';

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
      .select("emailaddress, is_archived")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (existingUser && !existingUser.is_archived) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry (reduced from 15)

    // Hash the verification code before storing
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    // Store HASHED verification code
    const { error: insertError } = await supabase
      .from("signup_verification_codes")
      .insert([{
        email: emailAddress,
        code: hashedCode,
        expires_at: expiresAt.toISOString(),
        used: false,
        attempts: 0
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
          subject: 'Verify Your Email - GatsisHub',
          html: emailTemplates.verification(`${firstName} ${lastName}`, verificationCode)
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

    // Find all valid codes for this email
    const { data: verificationRecords, error: findError } = await supabase
      .from("signup_verification_codes")
      .select("*")
      .eq("email", emailAddress)
      .eq("used", false)
      .order('created_at', { ascending: false });

    if (findError || !verificationRecords || verificationRecords.length === 0) {
      return res.status(400).json({ error: "No valid verification code found. Please request a new one." });
    }

    // Check each record to find matching hashed code
    let validRecord = null;
    for (const record of verificationRecords) {
      // Check rate limiting
      if (record.attempts >= 5) {
        continue; // Skip records that have too many attempts
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (now > expiresAt) {
        continue; // Skip expired codes
      }

      // Compare hashed code
      const isMatch = await bcrypt.compare(code, record.code);
      if (isMatch) {
        validRecord = record;
        break;
      } else {
        // Increment failed attempts
        await supabase
          .from("signup_verification_codes")
          .update({ attempts: record.attempts + 1 })
          .eq("id", record.id);
      }
    }

    if (!validRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please check your code or request a new one." });
    }

    // Mark code as used
    await supabase
      .from("signup_verification_codes")
      .update({ used: true })
      .eq("id", validRecord.id);

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

    // Check if this user was previously archived
    const { data: archivedCustomer, error: checkArchivedError } = await supabase
      .from("customers")
      .select("*")
      .eq("userid", userId)
      .eq("is_archived", true)
      .maybeSingle();

    if (archivedCustomer) {
      // Restore the archived account
      const { error: restoreError } = await supabase
        .from("customers")
        .update({
          is_archived: false,
          archived_at: null,
          companyname: `${firstName} ${lastName}`,
          password: hashedPassword,
          companynumber: companyNumber || null,
          addresses: addresses || [],
          accountstatus: 'Active',
          emailnotifications: true,
          gender: gender,
          dateofbirth: dateOfBirth,
          datecreated: new Date().toISOString()
        })
        .eq("userid", userId);

      if (restoreError) {
        return res.status(500).json({ error: "Failed to restore account: " + restoreError.message });
      }

      // Fetch restored data
      const { data: restoredData } = await supabase
        .from("customers")
        .select("*")
        .eq("userid", userId)
        .single();

      return res.status(201).json({
        message: "Account restored successfully!",
        customer: restoredData
      });
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
        const loginUrl = `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login`;
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'GatsisHub <noreply@gatsishub.com>',
            to: [emailAddress],
            subject: 'Welcome to GatsisHub! 🎉',
            html: emailTemplates.welcome(`${firstName} ${lastName}`, emailAddress, loginUrl)
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
      .select("emailaddress, userid, is_archived")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (findError) {

      return res.status(500).json({ error: "Database error: " + findError.message });
    }

    if (existingUser && !existingUser.is_archived) {

      return res.status(400).json({ error: "Email is already registered in our system." });
    }

    // If user was archived, restore their account
    if (existingUser && existingUser.is_archived) {

      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: restoreError } = await supabase
        .from("customers")
        .update({
          is_archived: false,
          archived_at: null,
          companyname: `${firstName} ${lastName}`,
          password: hashedPassword,
          companynumber: companyNumber || null,
          addresses: addresses || [],
          accountstatus: 'Active',
          emailnotifications: true,
          gender: gender,
          dateofbirth: dateOfBirth,
          datecreated: new Date().toISOString()
        })
        .eq("userid", existingUser.userid);

      if (restoreError) {

        return res.status(500).json({ error: "Failed to restore account: " + restoreError.message });
      }

      // Fetch the restored customer data
      const { data: restoredCustomer, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("userid", existingUser.userid)
        .single();

      if (fetchError) {
        return res.status(500).json({ error: "Failed to fetch restored account" });
      }

      // Send welcome back email
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
              subject: 'Welcome Back to GatsisHub! 🎉',
              html: emailTemplates.welcome(`${firstName} ${lastName}`, emailAddress, `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login`)
            })
          });
        }
      } catch (emailError) {
        // Don't fail if email fails
      }

      return res.status(201).json({
        message: "Account restored successfully!",
        customer: restoredCustomer
      });
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
            html: emailTemplates.welcome(`${firstName} ${lastName}`, emailAddress, `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login`)
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

    // Find user by email (excluding archived)
    const { data: user, error: userError } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", emailAddress)
      .eq('is_archived', false)
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

    // Check if user logged in recently (within 20 minutes)
    const lastLogin = user.last_successful_login;
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const recentlyLoggedIn = lastLogin && new Date(lastLogin) > twentyMinutesAgo;

    // If 2FA is disabled OR user logged in recently, log in directly
    if (!twoFactorEnabled || recentlyLoggedIn) {
      // Update last login timestamp
      await supabase
        .from("customers")
        .update({ last_successful_login: new Date().toISOString() })
        .eq("userid", user.userid);

      return res.status(200).json({
        message: "Login successful!",
        requiresVerification: false,
        user: {
          userid: user.userid,
          customerid: user.customerid,
          companyname: user.companyname,
          emailaddress: user.emailaddress,
          companynumber: user.companynumber,
          country: user.country || 'Philippines',
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
          html: emailTemplates.loginVerification(user.companyname || 'there', verificationCode, ipAddress, new Date().toLocaleString())
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

    // Get user data (excluding archived)
    const { data: user, error: userError } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", emailAddress)
      .eq('is_archived', false)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last successful login timestamp
    await supabase
      .from("customers")
      .update({ last_successful_login: new Date().toISOString() })
      .eq("userid", user.userid);

    // Successful login - return user data
    res.status(200).json({
      message: "Login successful!",
      user: {
        userid: user.userid,
        customerid: user.customerid,
        companyname: user.companyname,
        emailaddress: user.emailaddress,
        companynumber: user.companynumber,
        country: user.country || 'Philippines',
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

    // Check if customer already exists (including archived)
    let { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('emailaddress', email)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    // If customer was archived, restore it
    if (customer && customer.is_archived) {

      const { error: restoreError } = await supabase
        .from('customers')
        .update({
          is_archived: false,
          archived_at: null,
          companyname: name || customer.companyname,
          profilePicture: picture || customer.profilePicture,
          accountstatus: 'Active',
          datecreated: new Date().toISOString()
        })
        .eq('userid', customer.userid);

      if (restoreError) {
        throw restoreError;
      }

      // Fetch updated customer
      const { data: restoredCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('userid', customer.userid)
        .single();

      customer = restoredCustomer;

      return res.status(200).json({
        success: true,
        user: customer,
      });
    }

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
            html: emailTemplates.googleWelcome(name, email, `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/login`)
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

// 🗑️ Archive Account route (soft delete)
router.delete("/delete-account", async (req, res) => {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Archive customer account instead of deleting
    const { error: customerError } = await supabase
      .from("customers")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("userid", userid);

    if (customerError) {

      return res.status(500).json({ error: "Failed to archive account" });
    }

    res.status(200).json({ message: "Account archived successfully" });

  } catch (err) {

    res.status(500).json({ error: "Server error while archiving account" });
  }
});

// 🔍 Get customer by userid (excluding archived)
router.get("/customer/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress")
      .eq("userid", userid)
      .eq('is_archived', false)
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry (reduced from 15)

    // Hash the verification code before storing
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    // Store HASHED verification code in database
    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert([{
        email: emailAddress,
        code: hashedCode,
        expires_at: expiresAt.toISOString(),
        used: false,
        attempts: 0
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
          html: emailTemplates.passwordReset(customer.companyname || 'there', verificationCode)
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

    // Find all valid codes for this email
    const { data: resetCodes, error: findError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", emailAddress)
      .eq("used", false)
      .order('created_at', { ascending: false });

    if (findError || !resetCodes || resetCodes.length === 0) {
      return res.status(400).json({ error: "No valid verification code found. Please request a new one." });
    }

    // Check each record to find matching hashed code
    let validCode = null;
    for (const record of resetCodes) {
      // Check rate limiting
      if (record.attempts >= 5) {
        continue; // Skip records that have too many attempts
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (now > expiresAt) {
        continue; // Skip expired codes
      }

      // Compare hashed code
      const isMatch = await bcrypt.compare(code, record.code);
      if (isMatch) {
        validCode = record;
        break;
      } else {
        // Increment failed attempts
        await supabase
          .from("password_reset_codes")
          .update({ attempts: record.attempts + 1 })
          .eq("id", record.id);
      }
    }

    if (!validCode) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please check your code or request a new one." });
    }

    // Mark code as used
    await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("id", validCode.id);

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