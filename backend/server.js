// backend/server.js
import express from "express";
import supabase from "./supabaseClient.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gatsis-hub-client.vercel.app",
      "https://gatsis-hub.vercel.app",
      "http://localhost:5000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
)

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
