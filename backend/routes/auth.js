import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// 📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

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

    // 4️⃣ Check if email already exists
    const { data: existingUser, error: findError } = await supabase
      .from("customers")
      .select("emailaddress")
      .eq("emailaddress", emailAddress)
      .maybeSingle();

    if (findError) throw findError;

    if (existingUser) {
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
      console.error("Auth Error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res.status(500).json({ error: "User creation failed, no user ID returned." });
    }

    // 4️⃣ Insert into your 'customers' table
    const { data: customerData, error: dbError } = await supabase
      .from("customers")
      .insert([
        { 
          userid: userId,
          companyname: companyName,
          emailaddress: emailAddress,
          companyaddress: companyAddress || null,
          companynumber: companyNumber || null,
          password: hashedPassword,
          datecreated: new Date().toISOString(),
          accountstatus: 'Active'
        }
      ])
      .select();

    if (dbError) {
      console.error("DB Insert Error:", dbError);
      return res.status(400).json({ error: dbError.message });
    }

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
      .single();

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
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // ✅ Check if customer already exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    let customer = existingCustomer;

    // ✅ If not found, insert new customer with safe defaults
    if (!existingCustomer) {
      const { data: newCustomer, error: insertError } = await supabase
        .from("customers")
        .insert([
          {
            userid: sub, // Use Google 'sub' as unique ID
            companyname: name || "Google User",
            emailaddress: email,
            companyaddress: "Imported from Google",
            companynumber: "N/A",
            password: null, // No password since it's Google sign-in
            datecreated: new Date().toISOString(),
            accountstatus: "Active",
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      customer = newCustomer;
    }

    // ✅ Return customer data to frontend
    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(400).json({ success: false, message: "Invalid Google token" });
  }
});

export default router;