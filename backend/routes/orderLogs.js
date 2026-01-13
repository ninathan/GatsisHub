import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// 📋 GET /order-logs/:orderid - Get all logs for a specific order
router.get("/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;

    const { data: logs, error } = await supabase
      .from("order_logs")
      .select("*")
      .eq("orderid", orderid)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching order logs:", error);
      throw error;
    }

    res.status(200).json({ logs: logs || [] });
  } catch (err) {
    console.error("Failed to fetch order logs:", err);
    res.status(500).json({ error: "Failed to fetch order logs" });
  }
});

// 📋 GET /order-logs - Get all logs (optionally filter by date range)
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = supabase
      .from("order_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (startDate) {
      query = query.gte("timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("timestamp", endDate);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("Error fetching order logs:", error);
      throw error;
    }

    res.status(200).json({ logs: logs || [] });
  } catch (err) {
    console.error("Failed to fetch order logs:", err);
    res.status(500).json({ error: "Failed to fetch order logs" });
  }
});

// ➕ POST /order-logs - Create a new log entry
router.post("/", async (req, res) => {
  try {
    const {
      orderid,
      employeeid,
      employeename,
      action,
      field_changed,
      old_value,
      new_value,
      description
    } = req.body;

    // Validate required fields
    if (!orderid || !action) {
      return res.status(400).json({ error: "Order ID and action are required" });
    }

    const { data: log, error } = await supabase
      .from("order_logs")
      .insert([{
        orderid,
        employeeid: employeeid || null,
        employeename: employeename || null,
        action,
        field_changed: field_changed || null,
        old_value: old_value || null,
        new_value: new_value || null,
        description: description || null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating order log:", error);
      throw error;
    }

    res.status(201).json({
      message: "Log entry created successfully",
      log
    });
  } catch (err) {
    console.error("Failed to create order log:", err);
    res.status(500).json({ error: "Failed to create order log" });
  }
});

export default router;
