// backend/server.js
import express from "express";
import supabase from "./supabaseClient.js";

const app = express();
app.use(express.json());

// Test route
app.get("/test-users", async (req, res) => {
  const { data, error } = await supabase.from("customers").select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
