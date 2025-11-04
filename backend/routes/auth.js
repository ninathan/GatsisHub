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
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

    console.log("🔹 Signup attempt for:", emailAddress);

    // 1️⃣ Validate required fields
    if (!companyName || !emailAddress || !password) {
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
      console.error("Error checking existing user:", findError);
      throw findError;
    }

    if (existingUser) {
      console.log("❌ Email already exists in customers table:", emailAddress);
      return res.status(400).json({ error: "Email is already registered." });
    }

    // 2️⃣ Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create a Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAddress,
      password: password
    });

    if (authError) {
      console.error("❌ Supabase Auth Error:", authError);
      // If auth user already exists, check if it's in our customers table
      if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
        console.log("⚠️ Auth user exists but not in customers table - this shouldn't happen");
      }
      return res.status(400).json({ error: authError.message });
    }

    console.log("✅ Supabase Auth user created:", authData.user?.id);

    const userId = authData.user?.id;
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
          companyaddress: companyAddress || null,
          companynumber: companyNumber || null,
          password: hashedPassword,
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
    res.status(201).json({
      message: "Signup successful!",
      customer: customerData[0]
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: err.message });
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
        companyname: user.companyname,
        emailaddress: user.emailaddress,
        companyaddress: user.companyaddress,
        companynumber: user.companynumber,
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
          companyaddress: null,
          companynumber: null,
          password: null,
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

export default router;