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

    // Validate required fields
    if (!companyName || !contactPerson || !contactPhone || !hangerType || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate quantity minimum
    if (quantity < 100) {
      return res.status(400).json({ error: "Minimum quantity is 100 pieces" });
    }

    // Get productid from products table based on hangerType name
    let productid = null;
    if (hangerType) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('productid')
        .eq('productname', hangerType)
        .single();
      
      if (productError || !product) {
        return res.status(400).json({ error: `Invalid product: ${hangerType}` });
      }
      productid = product.productid;
    }

    // Validate materials exist in materials table
    if (materials && Object.keys(materials).length > 0) {
      for (const materialName of Object.keys(materials)) {
        const { data: material, error: matError } = await supabase
          .from('materials')
          .select('materialid')
          .eq('materialname', materialName)
          .single();
        
        if (matError || !material) {
          return res.status(400).json({ error: `Invalid material: ${materialName}` });
        }
      }
    }

    // Insert order into database
    const insertData = {
      userid: userid || null,
      companyname: companyName,
      contactperson: contactPerson,
      contactphone: contactPhone,
      hangertype: hangerType,
      productid: productid, // Add the foreign key
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

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([insertData])
      .select();

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    // Insert materials into order_materials junction table
    if (materials && Object.keys(materials).length > 0 && order && order[0]) {
      const orderid = order[0].orderid;
      
      // Get material IDs from material names and prepare entries
      const materialEntries = [];
      for (const [materialName, percentage] of Object.entries(materials)) {
        const { data: material, error: matError } = await supabase
          .from('materials')
          .select('materialid')
          .eq('materialname', materialName)
          .single();
        
        if (!matError && material) {
          materialEntries.push({
            orderid: orderid,
            materialid: material.materialid,
            percentage: parseFloat(percentage)
          });
        } else {
          console.error(`Material not found: ${materialName}`);
        }
      }
      
      // Insert all material associations
      if (materialEntries.length > 0) {
        const { error: matInsertError } = await supabase
          .from('order_materials')
          .insert(materialEntries);
        
        if (matInsertError) {
          console.error('Error inserting order materials:', matInsertError);
          // Rollback: delete the order if materials insert fails
          await supabase.from('orders').delete().eq('orderid', orderid);
          return res.status(400).json({ error: 'Failed to save order materials' });
        }
      }
    }

    // 📧 Send order confirmation email to customer
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        // Get customer email if userid exists
        let customerEmail = null;
        if (userid) {
          const { data: customer } = await supabase
            .from('customers')
            .select('emailaddress, companyname')
            .eq('userid', userid)
            .single();
          
          if (customer) {
            customerEmail = customer.emailaddress;
          }
        }

        // Send email if we have an email address
        if (customerEmail) {

          const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${order[0].orderid}`;
          
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'GatsisHub <noreply@gatsishub.com>',
              to: [customerEmail],
              subject: `Order Confirmation - ${orderNumber}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #35408E; margin-bottom: 10px;">Order Received!</h1>
                    <p style="font-size: 18px; color: #666;">Thank you for your order</p>
                  </div>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h2 style="color: #35408E; margin-top: 0;">Hello ${companyName}!</h2>
                    <p style="color: #333; line-height: 1.6;">
                      We've received your custom hanger order and our team is reviewing it now. 
                    </p>
                    <p style="color: #333; line-height: 1.6;">
                      <strong>Order Number:</strong> ${orderNumber}
                    </p>
                  </div>

                  <div style="background-color: #35408E; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0;">Order Details:</h3>
                    <p style="margin: 5px 0;"><strong>Hanger Type:</strong> ${hangerType}</p>
                    <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity} pieces</p>
                    <p style="margin: 5px 0;"><strong>Contact Person:</strong> ${contactPerson}</p>
                    <p style="margin: 5px 0;"><strong>Contact Phone:</strong> ${contactPhone}</p>
                    ${selectedColor ? `<p style="margin: 5px 0;"><strong>Color:</strong> ${selectedColor}</p>` : ''}
                    ${customText ? `<p style="margin: 5px 0;"><strong>Custom Text:</strong> "${customText}"</p>` : ''}
                  </div>

                  <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #DAC325; margin-bottom: 20px;">
                    <h3 style="color: #856404; margin-top: 0;">📋 What Happens Next?</h3>
                    <ul style="color: #856404; line-height: 1.8; margin: 10px 0;">
                      <li><strong>Order Verification:</strong> Our team will review your order specifications and requirements</li>
                      <li><strong>Quote & Timeline:</strong> We'll contact you with pricing, production timeline, and any clarifications needed</li>
                      <li><strong>Production:</strong> Once confirmed, we'll begin manufacturing your custom hangers</li>
                    </ul>
                  </div>

                  <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #35408E; margin-bottom: 20px;">
                    <h3 style="color: #35408E; margin-top: 0;">⏱️ Important Notes:</h3>
                    <ul style="color: #35408E; line-height: 1.8; margin: 10px 0; font-size: 14px;">
                      <li>Production time varies based on complexity and quantity</li>
                      <li>Custom designs may require additional review time</li>
                      <li>We'll keep you updated throughout the process via email and our messaging system</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders" 
                       style="background-color: #DAC325; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">
                      View Order Status
                    </a>
                    <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/messages" 
                       style="background-color: #35408E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Contact Support
                    </a>
                  </div>

                  <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                    <p>If you have any questions about your order, feel free to reach out to us through our messaging system or reply to this email.</p>
                    <p style="margin-top: 20px;">
                      Best regards,<br/>
                      <strong>The GatsisHub Team</strong><br/>
                      Premium Hanger Solutions
                    </p>
                  </div>
                </div>
              `
            })
          });

        } else {

        }
      } else {

      }
    } catch (emailError) {

      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: "Order created successfully!",
      order: order[0]
    });
  } catch (err) {

    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all orders for a user
router.get("/user/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    // Validate userid format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userid)) {

      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("userid", userid)
      .order("datecreated", { ascending: false });

    if (error) {

      throw error;
    }

    if (orders && orders.length > 0) {
    }

    // Fetch materials for each order from junction table
    const ordersWithMaterials = await Promise.all(orders.map(async (order) => {
      const { data: orderMaterials } = await supabase
        .from('order_materials')
        .select(`
          percentage,
          materials!inner(
            materialname
          )
        `)
        .eq('orderid', order.orderid);
      
      // Convert to the format expected by frontend: {"PP": 50, "ABS": 50}
      const materialsObj = {};
      if (orderMaterials) {
        orderMaterials.forEach(om => {
          materialsObj[om.materials.materialname] = om.percentage;
        });
      }
      
      return {
        ...order,
        materials: Object.keys(materialsObj).length > 0 ? materialsObj : order.materials // fallback to JSONB if no junction data
      };
    }));

    res.status(200).json({
      orders: ordersWithMaterials || []
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message || 'Failed to fetch orders',
      details: process.env.NODE_ENV !== 'production' ? err.toString() : undefined
    });
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

    // Fetch materials for each order from junction table
    const ordersWithMaterials = await Promise.all(orders.map(async (order) => {
      const { data: orderMaterials } = await supabase
        .from('order_materials')
        .select(`
          percentage,
          materials!inner(
            materialname
          )
        `)
        .eq('orderid', order.orderid);
      
      // Convert to the format expected by frontend: {"PP": 50, "ABS": 50}
      const materialsObj = {};
      if (orderMaterials) {
        orderMaterials.forEach(om => {
          materialsObj[om.materials.materialname] = om.percentage;
        });
      }
      
      return {
        ...order,
        materials: Object.keys(materialsObj).length > 0 ? materialsObj : order.materials // fallback to JSONB if no junction data
      };
    }));

    res.status(200).json({
      orders: ordersWithMaterials || []
    });
  } catch (err) {

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

    // Fetch materials from junction table
    const { data: orderMaterials } = await supabase
      .from('order_materials')
      .select(`
        percentage,
        materials!inner(
          materialname
        )
      `)
      .eq('orderid', orderid);
    
    // Convert to the format expected by frontend: {"PP": 50, "ABS": 50}
    const materialsObj = {};
    if (orderMaterials) {
      orderMaterials.forEach(om => {
        materialsObj[om.materials.materialname] = om.percentage;
      });
    }
    
    const orderWithMaterials = {
      ...order,
      materials: Object.keys(materialsObj).length > 0 ? materialsObj : order.materials // fallback to JSONB if no junction data
    };

    res.status(200).json({ order: orderWithMaterials });
  } catch (err) {

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

    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Delete/Cancel order
router.delete("/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { reason } = req.body;


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

    res.status(200).json({ 
      message: "Order cancelled successfully",
      orderid: orderid,
      reason: reason || 'No reason provided'
    });
  } catch (err) {

    res.status(500).json({ error: err.message });
  }
});

// 💰 Update order price (PATCH)
router.patch("/:orderid/price", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { price } = req.body;



    // Validate price
    if (price === undefined || price === null || isNaN(price)) {

      return res.status(400).json({ error: "Invalid price value" });
    }

    // Convert to number and ensure it's valid
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {

      return res.status(400).json({ error: "Price must be a valid number" });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({ totalprice: priceValue })
      .eq("orderid", orderid)
      .select();

    if (error) {

      throw error;
    }

    if (!order || order.length === 0) {

      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      message: "Order price updated",
      order: order[0]
    });
  } catch (err) {


    res.status(500).json({ error: err.message || "Failed to update price" });
  }
});

// � Update order deadline (PATCH)
router.patch("/:orderid/deadline", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { deadline } = req.body;


    // Validate deadline (should be a valid date string)
    if (!deadline) {

      return res.status(400).json({ error: "Deadline is required" });
    }

    // Check if deadline is a valid date
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {

      return res.status(400).json({ error: "Invalid deadline date format" });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({ deadline: deadline })
      .eq("orderid", orderid)
      .select();

    if (error) {

      throw error;
    }

    if (!order || order.length === 0) {

      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      message: "Order deadline updated",
      order: order[0]
    });
  } catch (err) {


    res.status(500).json({ error: err.message || "Failed to update deadline" });
  }
});

// �🔄 Update order status (PATCH)
router.patch("/:orderid/status", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { status } = req.body;


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

      throw error;
    }

    if (!order || order.length === 0) {

      return res.status(404).json({ error: "Order not found" });
    }

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

        // Send email if customer has email notifications enabled
        if (customerData.emailnotifications) {
          try {
            const resendApiKey = process.env.RESEND_API_KEY;
            
            if (resendApiKey) {

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

              } else {
                const errorData = await emailResponse.json();

              }
            } else {

            }
          } catch (emailErr) {

            // Don't fail the request if email sending fails
          }
        } else {

        }
      }
    } catch (notifErr) {

      // Don't fail the request if notification creation fails
    }

    res.status(200).json({
      message: "Order status updated",
      order: order[0]
    });
  } catch (err) {


    res.status(500).json({ error: err.message || "Failed to update status" });
  }
});

export default router;
