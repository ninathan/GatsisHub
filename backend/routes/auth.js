import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    console.log("=" .repeat(50));
    console.log("📥 SIGNUP REQUEST RECEIVED");
    console.log("=" .repeat(50));
    
    const { companyName, emailAddress, companyNumber, password, addresses } = req.body;

    console.log("📥 Request body:", { 
      companyName, 
      emailAddress, 
      companyNumber, 
      passwordLength: password?.length,
      addressesCount: addresses?.length 
    });

    // 1️⃣ Validate required fields
    if (!companyName || !emailAddress || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      console.log("❌ Invalid email format:", emailAddress);
      return res.status(400).json({ error: "Invalid email format." });
    }

    // 3️⃣ Validate password strength
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    console.log("✅ Validation passed");

    console.log("✅ Validation passed");

    // 4️⃣ Check if email already exists in customers table
    console.log("🔍 Checking if email exists in database...");
    
    const { data: existingUser, error: findError } = await supabase
      .from("customers")
      .select("emailaddress")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (findError) {
      console.error("❌ Error checking existing user:", findError);
      return res.status(500).json({ error: "Database error: " + findError.message });
    }

    if (existingUser) {
      console.log("❌ Email already exists in customers table:", emailAddress);
      return res.status(400).json({ error: "Email is already registered in our system." });
    }

    console.log("✅ Email not found in customers table, proceeding...");

    // 2️⃣ Hash the password before storing
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // 3️⃣ Create a Supabase Auth user
    console.log("👤 Creating Supabase Auth user...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAddress,
      password: password
    });

    let userId;

    if (authError) {
      console.error("❌ Supabase Auth Error:", authError);
      console.error("❌ Error message:", authError.message);
      console.error("❌ Error status:", authError.status);
      console.error("❌ Error code:", authError.code);
      
      // If auth user already exists, try to get their ID and add to customers table
      if (authError.code === 'user_already_exists' || authError.message.includes("already")) {
        console.log("⚠️ Auth user exists but not in customers table");
        console.log("🔄 Attempting to sign in to get user ID...");
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailAddress,
          password: password
        });
        
        if (signInError) {
          console.error("❌ Cannot sign in with provided password:", signInError.message);
          return res.status(400).json({ 
            error: "This email is already registered. If you forgot your password, please use the password reset feature.",
            code: "USER_EXISTS"
          });
        }
        
        userId = signInData.user?.id;
        console.log("✅ Retrieved existing Auth user ID:", userId);
        
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
          console.log("ℹ️ User already exists in customers table");
          return res.status(400).json({ 
            error: "Account already exists. Please log in instead.",
            code: "ACCOUNT_EXISTS"
          });
        }
        
        console.log("📝 Auth user exists but not in customers table - will add them now");
      } else {
        // Different error - return it
        return res.status(400).json({ 
          error: "Failed to create account: " + authError.message 
        });
      }
    } else {
      userId = authData.user?.id;
      console.log("✅ Supabase Auth user created:", userId);
      console.log("📧 Auth user email:", authData.user?.email);
    }

    if (!userId) {
      return res.status(500).json({ error: "User creation failed, no user ID returned." });
    }

    // 4️⃣ Insert into your 'customers' table
    console.log("📝 Attempting to insert customer:", { userId, emailAddress, companyName });
    
    const { data: customerData, error: dbError } = await supabase
      .from("customers")
      .insert([
        { 
          userid: userId,
          google_id: null,
          companyname: companyName,
          emailaddress: emailAddress,
          companynumber: companyNumber || null,
          password: hashedPassword,
          addresses: addresses || [],
          datecreated: new Date().toISOString(),
          accountstatus: 'Active',
          profilePicture: null
        }
      ])
      .select();

    if (dbError) {
      console.error("❌ DB Insert Error:", dbError);
      console.error("❌ Error details:", JSON.stringify(dbError, null, 2));
      return res.status(400).json({ error: dbError.message });
    }

    console.log("✅ Customer inserted successfully:", customerData[0]?.userid);

    // 5️⃣ Send confirmation email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        console.log("📧 Attempting to send confirmation email to:", emailAddress);
        
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
                  <h2 style="color: #35408E; margin-top: 0;">Hello ${companyName}!</h2>
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
                  <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
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
          console.error("❌ Failed to parse Resend response:", parseError);
        }
        
        if (emailResponse.ok) {
          console.log("✅ Confirmation email sent successfully. Email ID:", responseData?.id);
        } else {
          console.error("❌ Resend API error:", responseData);
        }
      } else {
        console.log("⚠️ RESEND_API_KEY not configured, skipping confirmation email");
      }
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError.message);
      // Don't fail the registration if email fails
    }

    // 6️⃣ Return success
    console.log("🎉 Signup completed successfully!");
    console.log("=" .repeat(50));
    
    res.status(201).json({
      message: "Signup successful!",
      customer: customerData[0]
    });
  } catch (err) {
    console.error("=" .repeat(50));
    console.error("💥 SIGNUP ERROR CAUGHT");
    console.error("=" .repeat(50));
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("=" .repeat(50));
    
    res.status(500).json({ 
      error: "Server error: " + err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 📝 Login route
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
    // Successful login
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
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});



router.post('/google', async (req, res) => {
  try {
    console.log("📥 Received Google Login Request");
    console.log("🔹 Request Body:", req.body);

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
    console.log("✅ Verified Google token:", email);

    // Check if customer already exists
    let { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('emailaddress', email)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    // If not found, create customer record (no Supabase Auth needed for Google OAuth)
    if (!customer) {
      console.log("🆕 Creating new Google user:", email);
      
      // Generate a unique user ID for the customer
      const userId = uuidv4();
      console.log("✅ Generated user ID:", userId);

      // Insert into customers table
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
          profilePicture: picture || null
        }])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        throw insertError;
      }

      console.log("✅ Customer record created");
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

        console.log("✅ Welcome email sent to:", email);
      } catch (emailError) {
        console.error("⚠️ Failed to send welcome email:", emailError);
        // Don't fail the signup if email fails
      }
    }

    // ✅ Return customer data
    res.status(200).json({
      success: true,
      user: customer,
    });

  } catch (error) {
    console.error("❌ Google login error:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(400).json({ error: error.message || "Google login failed" });
  }
});

// 🔐 Change Password route
router.post("/change-password", async (req, res) => {
  try {
    const { userid, currentPassword, newPassword } = req.body;

    console.log("🔐 Change password request for user:", userid);

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
      console.error("❌ User not found:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("❌ Current password is incorrect");
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    console.log("🔐 Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("customers")
      .update({ password: hashedPassword })
      .eq("userid", userid);

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Also update in Supabase Auth
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      userid,
      { password: newPassword }
    );

    if (authUpdateError) {
      console.warn("⚠️ Could not update Supabase Auth password:", authUpdateError.message);
      // Continue anyway since the main password is updated
    }

    console.log("✅ Password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("❌ Change password error:", err.message);
    res.status(500).json({ error: "Server error while changing password" });
  }
});

// 🗑️ Delete Account route
router.delete("/delete-account", async (req, res) => {
  try {
    const { userid } = req.body;

    console.log("🗑️ Delete account request for user:", userid);

    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Delete user's designs first (foreign key constraint)
    const { error: designsError } = await supabase
      .from("designs")
      .delete()
      .eq("userid", userid);

    if (designsError) {
      console.error("❌ Error deleting designs:", designsError);
      // Continue anyway, might not have any designs
    }

    // Delete user's orders (if any)
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("userid", userid);

    if (ordersError) {
      console.error("❌ Error deleting orders:", ordersError);
      // Continue anyway, might not have any orders
    }

    // Delete customer record from database
    const { error: customerError } = await supabase
      .from("customers")
      .delete()
      .eq("userid", userid);

    if (customerError) {
      console.error("❌ Error deleting customer:", customerError);
      return res.status(500).json({ error: "Failed to delete account" });
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userid);

    if (authError) {
      console.warn("⚠️ Could not delete Supabase Auth user:", authError.message);
      // Continue anyway since the main customer record is deleted
    }

    console.log("✅ Account deleted successfully");
    res.status(200).json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error("❌ Delete account error:", err.message);
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
    console.error("❌ Get customer error:", err.message);
    res.status(500).json({ error: "Server error while fetching customer" });
  }
});

// 📧 Forgot Password - Send verification code
router.post("/forgot-password", async (req, res) => {
  try {
    const { emailAddress } = req.body;

    console.log("📧 Forgot password request for:", emailAddress);

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
      console.error("❌ Customer lookup error:", findError);
      return res.status(404).json({ error: "No account found with this email address" });
    }

    console.log("✅ Customer found:", customer.emailaddress);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    console.log("🔐 Generated code:", verificationCode, "expires at:", expiresAt);

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
      console.error("❌ Error storing verification code:", insertError);
      console.error("❌ Full error details:", JSON.stringify(insertError, null, 2));
      return res.status(500).json({ 
        error: "Database error. Please ensure password_reset_codes table exists.",
        details: insertError.message 
      });
    }

    console.log("✅ Verification code stored in database");

    // Send email using Resend API
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error("❌ RESEND_API_KEY not found in environment variables");
        return res.status(500).json({ error: "Email service not configured" });
      }

      console.log("📧 Attempting to send email to:", emailAddress);
      
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
        console.error("❌ Failed to parse Resend response:", parseError);
        throw new Error("Invalid response from email service");
      }
      
      if (!emailResponse.ok) {
        console.error("❌ Resend API error status:", emailResponse.status);
        console.error("❌ Resend API error response:", JSON.stringify(responseData, null, 2));
        throw new Error(`Resend API error: ${responseData.message || responseData.error || 'Unknown error'}`);
      }

      console.log("✅ Verification email sent successfully. Email ID:", responseData.id);
      return res.status(200).json({ 
        message: "Verification code sent to your email",
        email: emailAddress 
      });

    } catch (emailError) {
      console.error("❌ Email sending error:", emailError.message);
      console.error("❌ Full error:", emailError);
      res.status(500).json({ 
        error: "Failed to send verification email",
        details: emailError.message 
      });
    }

  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

// 🔐 Verify reset code
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { emailAddress, code } = req.body;

    console.log("🔐 Verifying code for:", emailAddress);

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

    console.log("✅ Code verified successfully");
    res.status(200).json({ 
      message: "Code verified successfully",
      email: emailAddress 
    });

  } catch (err) {
    console.error("❌ Verify code error:", err.message);
    res.status(500).json({ error: "Server error during code verification" });
  }
});

// 🔄 Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { emailAddress, newPassword } = req.body;

    console.log("🔄 Resetting password for:", emailAddress);

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
      console.error("❌ Error updating password:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Update Supabase Auth password if userid exists
    if (customer.userid) {
      try {
        await supabase.auth.admin.updateUserById(customer.userid, {
          password: newPassword
        });
      } catch (authError) {
        console.warn("⚠️ Could not update Supabase Auth password:", authError.message);
        // Continue anyway since the main password is updated
      }
    }

    console.log("✅ Password reset successfully");
    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

export default router;