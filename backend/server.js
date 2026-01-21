// server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import ordersRoutes from "./routes/orders.js";
import designsRoutes from "./routes/designs.js";
import feedbacksRoutes from "./routes/feedbacks.js";
import employeesRoutes from "./routes/employees.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";
import adminNotificationsRoutes from "./routes/adminNotifications.js";
import customersRoutes from "./routes/customers.js";
import teamsRoutes from "./routes/teams.js";
import paymentsRoutes from "./routes/payments.js";
import quotasRoutes from "./routes/quotas.js";
import productsRoutes from "./routes/products.js";
import materialsRoutes from "./routes/materials.js";
import orderLogsRoutes from "./routes/orderLogs.js";
import submissionsRoutes from "./routes/submissions.js";

const app = express();

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

// Routes
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/designs", designsRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/employees", employeesRoutes);
app.use("/messages", messagesRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/admin-notifications", adminNotificationsRoutes);
app.use("/customers", customersRoutes);
app.use("/teams", teamsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/quotas", quotasRoutes);
app.use("/products", productsRoutes);
app.use("/materials", materialsRoutes);
app.use("/order-logs", orderLogsRoutes);
app.use("/submissions", submissionsRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ GatsisHub backend is running");
});

// Start server for local development
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {

  });
}

// Export the app for Vercel
export default app;
