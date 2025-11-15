// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import ordersRoutes from "./routes/orders.js";
import designsRoutes from "./routes/designs.js";
import feedbacksRoutes from "./routes/feedbacks.js";
import employeesRoutes from "./routes/employees.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";
import customersRoutes from "./routes/customers.js";
import teamsRoutes from "./routes/teams.js";
import paymentsRoutes from "./routes/payments.js";

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'payments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads/payments directory');
}

// Middleware
app.use(express.json({ limit: '50mb' })); // Increase limit for thumbnail images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gatsis-hub-client.vercel.app",
      "https://gatsishub.com",
      "http://gatsishub.com",
      "https://www.gatsishub.com",
      "http://www.gatsishub.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/designs", designsRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/employees", employeesRoutes);
app.use("/messages", messagesRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/customers", customersRoutes);
app.use("/teams", teamsRoutes);
app.use("/payments", paymentsRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ GatsisHub backend is running");
});

// Start server for local development
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
export default app;
