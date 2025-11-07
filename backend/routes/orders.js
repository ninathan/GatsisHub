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
      textColor,
      textPosition,
      textSize,
      customLogo,
      logoPosition,
      logoSize,
      deliveryNotes,
      deliveryAddress, // Add delivery address field
      threeDDesignData // Complete 3D design JSON string
    } = req.body;

    console.log('📦 Received order data');
    console.log('📍 Delivery Address from request:', deliveryAddress);
    console.log('📍 Full request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!companyName || !contactPerson || !contactPhone || !hangerType || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate quantity minimum
    if (quantity < 100) {
      return res.status(400).json({ error: "Minimum quantity is 100 pieces" });
    }

    // Insert order into database
    const insertData = {
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
      textcolor: textColor || '#000000',
      textposition: textPosition || null,
      textsize: textSize || null,
      customlogo: customLogo || null,
      logoposition: logoPosition || null,
      logosize: logoSize || null,
      deliverynotes: deliveryNotes || null,
      deliveryaddress: deliveryAddress || null, // Store delivery address
      threeddesigndata: threeDDesignData || null, // Store complete 3D design
      orderstatus: 'For Evaluation',
      datecreated: new Date().toISOString()
    };

    console.log('💾 About to insert into database:');
    console.log('📍 deliveryaddress value:', insertData.deliveryaddress);
    console.log('📦 Full insert data:', JSON.stringify(insertData, null, 2));

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([insertData])
      .select();

    if (insertError) {
      console.error("❌ DB Insert Error:", insertError);
      console.error("❌ Error details:", JSON.stringify(insertError, null, 2));
      return res.status(400).json({ error: insertError.message });
    }

    console.log('✅ Order created successfully');
    console.log('📍 Returned order data:', JSON.stringify(order[0], null, 2));
    console.log('📍 Saved delivery address:', order[0].deliveryaddress);

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

    console.log('🔍 Fetching orders for user:', userid);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("userid", userid)
      .order("datecreated", { ascending: false });

    if (error) throw error;

    console.log('✅ Found', orders?.length || 0, 'orders');
    if (orders && orders.length > 0) {
      console.log('📍 First order deliveryaddress:', orders[0].deliveryaddress);
      console.log('📦 First order sample:', JSON.stringify({
        orderid: orders[0].orderid,
        companyname: orders[0].companyname,
        deliveryaddress: orders[0].deliveryaddress,
        datecreated: orders[0].datecreated
      }, null, 2));
    }

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

// 🗑️ Delete/Cancel order
router.delete("/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { reason } = req.body;

    console.log(`🗑️ Cancelling order: ${orderid}`);
    console.log(`📝 Cancellation reason: ${reason || 'No reason provided'}`);

    // Verify order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("orderid", orderid)
      .single();

    if (fetchError || !existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order can be cancelled (only For Evaluation or Waiting for Payment)
    const cancellableStatuses = ['For Evaluation', 'Waiting for Payment'];
    if (!cancellableStatuses.includes(existingOrder.orderstatus)) {
      return res.status(400).json({ 
        error: "Order cannot be cancelled at this stage",
        currentStatus: existingOrder.orderstatus 
      });
    }

    // Delete the order
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("orderid", orderid);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Order ${orderid} cancelled successfully`);

    res.status(200).json({ 
      message: "Order cancelled successfully",
      orderid: orderid,
      reason: reason || 'No reason provided'
    });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
