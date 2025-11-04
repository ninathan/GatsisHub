import express from "express";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// 📝 Create new order
router.post("/create", async (req, res) => {
  try {
    const {
      userid,
      companyName,
      contactPerson,
      contactPhone,
      hangerType,
      materialType,
      quantity,
      materials,
      designOption,
      customDesignUrl,
      selectedColor,
      customText,
      textPosition,
      textSize,
      customLogo,
      logoPosition,
      logoSize,
      deliveryNotes
    } = req.body;

    // Validate required fields
    if (!companyName || !contactPerson || !contactPhone || !hangerType || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate quantity minimum
    if (quantity < 100) {
      return res.status(400).json({ error: "Minimum quantity is 100 pieces" });
    }

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([
        {
          userid: userid || null,
          companyname: companyName,
          contactperson: contactPerson,
          contactphone: contactPhone,
          hangertype: hangerType,
          materialtype: materialType || null,
          quantity: quantity,
          materials: materials || {},
          designoption: designOption || 'default',
          customdesignurl: customDesignUrl || null,
          selectedcolor: selectedColor || null,
          customtext: customText || null,
          textposition: textPosition || null,
          textsize: textSize || null,
          customlogo: customLogo || null,
          logoposition: logoPosition || null,
          logosize: logoSize || null,
          deliverynotes: deliveryNotes || null,
          orderstatus: 'Pending',
          datecreated: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    res.status(201).json({
      message: "Order created successfully!",
      order: order[0]
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all orders for a user
router.get("/user/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("userid", userid)
      .order("datecreated", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      orders: orders || []
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all orders (admin)
router.get("/all", async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("datecreated", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      orders: orders || []
    });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get single order by ID
router.get("/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("orderid", orderid)
      .single();

    if (error) throw error;

    res.status(200).json({ order });
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Update order status
router.put("/:orderid/status", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from("orders")
      .update({ orderstatus: status })
      .eq("orderid", orderid)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Order status updated",
      order: order[0]
    });
  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
