// feedbacks.js
import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// GET all feedbacks with customer information
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select(`
        feedbackid,
        orderid,
        message,
        rating,
        created_at,
        customers (
          companyname,
          emailaddress
        )
      `)
      .order("feedbackid", { ascending: false });

    if (error) {
      console.error("Error fetching feedbacks:", error);
      return res.status(500).json({ error: "Failed to fetch feedbacks" });
    }

    res.status(200).json({ feedbacks: data });
  } catch (error) {
    console.error("Error in GET /feedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST a new feedback
router.post("/", async (req, res) => {
  try {
    const { customerid, orderid, message, rating } = req.body;

    // Validate required fields
    if (!customerid || !message || message.trim() === "") {
      return res.status(400).json({ error: "Customer ID and message are required" });
    }

    // Validate rating (1-5)
    const validRating = rating && rating >= 1 && rating <= 5 ? rating : 5;

    // If orderid is provided, verify it belongs to the customer
    if (orderid) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("userid")
        .eq("customerid", customerid)
        .single();

      if (customerError || !customerData) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("orderid")
        .eq("orderid", orderid)
        .eq("userid", customerData.userid)
        .single();

      if (orderError || !orderData) {
        return res.status(403).json({ error: "Order does not belong to this customer" });
      }
    }

    // Insert the feedback
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          customerid,
          orderid: orderid || null,
          message: message.trim(),
          rating: validRating
        }
      ])
      .select();

    if (error) {
      console.error("Error creating feedback:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: "Failed to create feedback",
        details: error.message 
      });
    }

    res.status(201).json({ 
      message: "Feedback submitted successfully",
      feedback: data[0]
    });
  } catch (error) {
    console.error("Error in POST /feedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET feedbacks for a specific customer
router.get("/customer/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    const { data, error } = await supabase
      .from("feedback")
      .select(`
        feedbackid,
        orderid,
        message,
        orders (
          orderstatus,
          hangertype
        )
      `)
      .eq("customerid", customerid)
      .order("feedbackid", { ascending: false });

    if (error) {
      console.error("Error fetching customer feedbacks:", error);
      return res.status(500).json({ error: "Failed to fetch customer feedbacks" });
    }

    res.status(200).json({ feedbacks: data });
  } catch (error) {
    console.error("Error in GET /feedbacks/customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
