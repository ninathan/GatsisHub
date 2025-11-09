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
      orderInstructions,
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
      orderinstructions: orderInstructions || null,
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

// 💰 Update order price (PATCH)
router.patch("/:orderid/price", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { price } = req.body;

    console.log(`💰 Updating price for order ${orderid}: ${price}`);
    console.log(`📊 Request body:`, req.body);
    console.log(`📊 Price type:`, typeof price);

    // Validate price
    if (price === undefined || price === null || isNaN(price)) {
      console.error(`❌ Invalid price value: ${price}`);
      return res.status(400).json({ error: "Invalid price value" });
    }

    // Convert to number and ensure it's valid
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      console.error(`❌ Price is not a valid number: ${price}`);
      return res.status(400).json({ error: "Price must be a valid number" });
    }

    console.log(`💵 Converted price value: ${priceValue}`);

    const { data: order, error } = await supabase
      .from("orders")
      .update({ totalprice: priceValue })
      .eq("orderid", orderid)
      .select();

    if (error) {
      console.error(`❌ Supabase error:`, error);
      throw error;
    }

    if (!order || order.length === 0) {
      console.error(`❌ Order not found: ${orderid}`);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`✅ Price updated successfully for order ${orderid}`);

    res.status(200).json({
      message: "Order price updated",
      order: order[0]
    });
  } catch (err) {
    console.error("💥 Update Price Error:", err);
    console.error("💥 Error details:", err.message, err.stack);
    res.status(500).json({ error: err.message || "Failed to update price" });
  }
});

// � Update order deadline (PATCH)
router.patch("/:orderid/deadline", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { deadline } = req.body;

    console.log(`📅 Updating deadline for order ${orderid}: ${deadline}`);
    console.log(`📊 Request body:`, req.body);

    // Validate deadline (should be a valid date string)
    if (!deadline) {
      console.error(`❌ Deadline is required`);
      return res.status(400).json({ error: "Deadline is required" });
    }

    // Check if deadline is a valid date
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      console.error(`❌ Invalid deadline date: ${deadline}`);
      return res.status(400).json({ error: "Invalid deadline date format" });
    }

    console.log(`📆 Parsed deadline date: ${deadlineDate.toISOString()}`);

    const { data: order, error } = await supabase
      .from("orders")
      .update({ deadline: deadline })
      .eq("orderid", orderid)
      .select();

    if (error) {
      console.error(`❌ Supabase error:`, error);
      throw error;
    }

    if (!order || order.length === 0) {
      console.error(`❌ Order not found: ${orderid}`);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`✅ Deadline updated successfully for order ${orderid}`);

    res.status(200).json({
      message: "Order deadline updated",
      order: order[0]
    });
  } catch (err) {
    console.error("💥 Update Deadline Error:", err);
    console.error("💥 Error details:", err.message, err.stack);
    res.status(500).json({ error: err.message || "Failed to update deadline" });
  }
});

// �🔄 Update order status (PATCH)
router.patch("/:orderid/status", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating status for order ${orderid}: ${status}`);
    console.log(`📊 Request body:`, req.body);

    // Validate status
    const validStatuses = [
      'For Evaluation',
      'Waiting for Payment',
      'Approved',
      'In Production',
      'Waiting for Shipment',
      'In Transit',
      'Completed',
      'Cancelled'
    ];

    if (!status || !validStatuses.includes(status)) {
      console.error(`❌ Invalid order status: ${status}`);
      return res.status(400).json({ 
        error: "Invalid order status",
        validStatuses: validStatuses 
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({ orderstatus: status })
      .eq("orderid", orderid)
      .select();

    if (error) {
      console.error(`❌ Supabase error:`, error);
      throw error;
    }

    if (!order || order.length === 0) {
      console.error(`❌ Order not found: ${orderid}`);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`✅ Status updated successfully for order ${orderid}`);

    // Create notification and send email for customer about order status change
    try {
      // Get customer data including email and preferences
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("customerid, companyname, emailaddress, emailnotifications")
        .eq("userid", order[0].userid)
        .single();

      if (!customerError && customerData) {
        const notificationTitles = {
          'For Evaluation': 'Order Received',
          'Waiting for Payment': 'Payment Required',
          'Approved': 'Order Approved',
          'In Production': 'Order In Production',
          'Waiting for Shipment': 'Ready for Shipment',
          'In Transit': 'Order Shipped',
          'Completed': 'Order Completed',
          'Cancelled': 'Order Cancelled'
        };

        const notificationMessages = {
          'For Evaluation': 'Your order is being reviewed by our team.',
          'Waiting for Payment': 'Your order has been validated. Please proceed with payment.',
          'Approved': 'Your order has been approved and will move to production soon.',
          'In Production': 'Your order is currently being produced.',
          'Waiting for Shipment': 'Your order is ready and waiting for shipment.',
          'In Transit': 'Your order has been shipped and is on its way!',
          'Completed': 'Your order has been completed successfully. Thank you!',
          'Cancelled': 'Your order has been cancelled.'
        };

        // Create in-app notification
        await supabase
          .from('notifications')
          .insert([
            {
              customerid: customerData.customerid,
              orderid: orderid,
              title: notificationTitles[status] || 'Order Status Updated',
              message: notificationMessages[status] || `Your order status has been updated to ${status}.`,
              type: 'order_update',
              isread: false,
              datecreated: new Date().toISOString()
            }
          ]);

        console.log(`✅ In-app notification created for order ${orderid}`);

        // Send email if customer has email notifications enabled
        if (customerData.emailnotifications) {
          try {
            const resendApiKey = process.env.RESEND_API_KEY;
            
            if (resendApiKey) {
              console.log(`📧 Sending email notification to: ${customerData.emailaddress}`);

              const orderNumber = orderid.slice(0, 8).toUpperCase();
              const emailSubject = notificationTitles[status] || 'Order Status Update';
              const emailMessage = notificationMessages[status] || `Your order status has been updated to ${status}.`;

              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'GatsisHub <noreply@gatsishub.com>',
                  to: [customerData.emailaddress],
                  subject: `${emailSubject} - Order #${orderNumber}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <div style="background-color: #35408E; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">GatsisHub</h1>
                      </div>
                      <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #35408E; margin-top: 0;">${emailSubject}</h2>
                        <p style="font-size: 16px; color: #333;">Hello ${customerData.companyname},</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">${emailMessage}</p>
                        
                        <div style="background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #35408E; border-radius: 4px;">
                          <p style="margin: 0; color: #666; font-size: 14px;"><strong>Order Number:</strong> ORD-${orderNumber}</p>
                          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;"><strong>Status:</strong> ${status}</p>
                        </div>

                        <p style="font-size: 14px; color: #666; line-height: 1.6;">
                          You can view your order details and track its progress by logging into your account.
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                          <a href="https://gatsishub.com/orders" style="background-color: #35408E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            View Order
                          </a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                          You're receiving this email because you have order notifications enabled.<br>
                          You can manage your notification preferences in your account settings.
                        </p>
                      </div>
                    </div>
                  `
                })
              });

              if (emailResponse.ok) {
                const emailData = await emailResponse.json();
                console.log(`✅ Email sent successfully. Email ID: ${emailData.id}`);
              } else {
                const errorData = await emailResponse.json();
                console.error(`⚠️ Failed to send email:`, errorData);
              }
            } else {
              console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
            }
          } catch (emailErr) {
            console.error('⚠️ Error sending email notification:', emailErr.message);
            // Don't fail the request if email sending fails
          }
        } else {
          console.log(`ℹ️ Email notifications disabled for customer ${customerData.customerid}`);
        }
      }
    } catch (notifErr) {
      console.warn('⚠️ Failed to create notification:', notifErr.message);
      // Don't fail the request if notification creation fails
    }

    res.status(200).json({
      message: "Order status updated",
      order: order[0]
    });
  } catch (err) {
    console.error("💥 Update Status Error:", err);
    console.error("💥 Error details:", err.message, err.stack);
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
});

export default router;
