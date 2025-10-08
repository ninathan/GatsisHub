// backend/server.js
import express from "express";
import supabase from "./supabaseClient.js";
import cors from "cors";
import bcrypt from "bcryptjs"; // ✅ for password hashing
import { v4 as uuidv4 } from "uuid"; // ✅ for unique userid

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gatsis-hub-client.vercel.app",
      "https://gatsis-hub.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// ✅ Test route
app.get("/test-users", async (req, res) => {
  const { data, error } = await supabase.from("customers").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Signup route
app.post("/auth/signup", async (req, res) => {
  try {
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

    // Basic validation
    if (!companyName || !emailAddress || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Generate unique user ID and timestamp
    const userid = uuidv4();
    const datetime = new Date().toISOString();
    const activestatus = true;

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert into Supabase
    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          userid,
          companyname: companyName,
          emailaddress: emailAddress,
          companyaddress: companyAddress,
          companynumber: companyNumber,
          password: hashedPassword,
          datetime,
          activestatus
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Signup successful!",
      user: { userid, companyName, emailAddress, datetime, activestatus }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Default route for health check
app.get("/", (req, res) => {
  res.send("✅ GatsisHub backend is running");
});

// ✅ Export app for Vercel
export default app;
