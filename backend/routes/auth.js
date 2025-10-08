import express from "express";
import bcrypt from "bcrypt";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// 📝 Signup route
router.post("/signup", async (req, res) => {
  try {
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

    if (!companyName || !emailAddress || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new customer
    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          companyname: companyName,
          emailaddress: emailAddress,
          companyaddress: companyAddress,
          companynumber: companyNumber,
          password: hashedPassword,
          accountstatus: "Active",
          datecreated: new Date().toISOString(),
          userid: crypto.randomUUID() // or Supabase UUID if you have auth
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Signup successful!",
      user: data[0]
    });
  } catch (err) {
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
