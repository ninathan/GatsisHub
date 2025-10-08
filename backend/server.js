// backend/server.js
import express from "express";
import supabase from "./supabaseClient.js";
import cors from "cors";

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

    if (!companyName || !emailAddress || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert into Supabase table
    const { data, error } = await supabase
      .from("customers")
      .insert([{ companyname: companyName, email: emailAddress, companyaddress: companyAddress, companynumber: companyNumber, password }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "Signup successful!", user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Default route for health check
app.get("/", (req, res) => {
  res.send("✅ GatsisHub backend is running");
});

// ✅ Export app for Vercel
export default app;
