import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// 📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

    // 1️⃣ Validate required fields
    if (!companyName || !emailAddress || !password) {
      return res.status(400).json({ error: "Missing required fields" });
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

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("emailaddress", emailAddress)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, data.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    res.json({
      message: "Login successful!",
      user: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
