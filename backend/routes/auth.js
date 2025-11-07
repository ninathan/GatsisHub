import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    console.log("=" .repeat(50));
    console.log("📥 SIGNUP REQUEST RECEIVED");
    console.log("=" .repeat(50));
    
    const { companyName, emailAddress, companyNumber, password } = req.body;

    console.log("📥 Request body:", { 
      companyName, 
      emailAddress, 
      companyNumber, 
      passwordLength: password?.length 
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
          addresses: [],
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

    // 5️⃣ Return success
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

    // If not found, create a Supabase Auth user and insert into customers
    if (!customer) {
      // 1️⃣ Create Auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: crypto.randomUUID(), // random password
      });
      if (authError) throw authError;

      // 2️⃣ Insert into customers table using Supabase Auth UUID
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([{
          userid: authUser.id,
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

      if (insertError) throw insertError;

      customer = newCustomer;
    }

    // ✅ Return customer data
    res.status(200).json({
      success: true,
      user: customer,
    });

  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(400).json({ error: "Google login failed" });
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

export default router;