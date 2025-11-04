// server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import ordersRoutes from "./routes/orders.js";

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gatsis-hub-client.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ GatsisHub backend is running");
});

// Export the app for Vercel
export default app;
