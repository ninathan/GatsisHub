import express from "express";
import supabase from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import emailTemplates from "../utils/emailTemplates.js";

const router = express.Router();

// Helper function to create order log
async function createOrderLog(orderid, employeeid, employeename, action, fieldChanged, oldValue, newValue, description) {
  try {
    await supabase
      .from("order_logs")
      .insert([{
        orderid,
        employeeid: employeeid || null,
        employeename: employeename || null,
        action,
        field_changed: fieldChanged || null,
        old_value: oldValue ? String(oldValue) : null,
        new_value: newValue ? String(newValue) : null,
        description: description || null
      }]);
  } catch (error) {
    console.error("Failed to create order log:", error);
    // Don't throw - logging failure shouldn't stop the operation
  }
}

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
      threeDDesignData, // Complete 3D design JSON string
      totalprice // Add total price
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
      totalprice: totalprice || null, // Store calculated price
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
          
          // Build order details object
          const orderDetails = {
            'Hanger Type': hangerType,
            'Quantity': `${quantity} pieces`,
            'Contact Person': contactPerson,
            'Contact Phone': contactPhone
          };
          
          if (selectedColor) orderDetails['Color'] = selectedColor;
          if (customText) orderDetails['Custom Text'] = `"${customText}"`;
          
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
              html: emailTemplates.orderConfirmation(companyName, orderNumber, orderDetails)
            })
          });
        } else {

        }
      } else {

      }
    } catch (emailError) {

      // Don't fail the order creation if email fails
    }

    // Create admin notification for new order
    try {
      await supabase.from("admin_notifications").insert([{
        orderid: order[0].orderid,
        customerid: userid || null,
        title: 'New Order Created',
        message: `New order for ${quantity} ${hangerType} hangers has been placed by ${companyName}.`,
        type: 'order_created',
        targetrole: 'sales_admin'
      }]);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the request if notification creation fails
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

// 📋 Get user orders WITH payments and materials (optimized with pagination)
router.get("/user/:userid/full", async (req, res) => {
  console.log('📋 Full orders endpoint called for userid:', req.params.userid);
  console.log('Query params:', req.query);
  
  const startTime = Date.now();
  
  try {
    const { userid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate userid format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userid)) {
      console.error('Invalid userid format:', userid);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Fetch orders with count in parallel
    const { data: orders, error: ordersError, count } = await supabase
      .from("orders")
      .select("*", { count: 'exact' })
      .eq("userid", userid)
      .order("datecreated", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      throw ordersError;
    }

    console.log('Fetched orders:', orders?.length, 'Total count:', count);

    // If no orders, return early
    if (!orders || orders.length === 0) {
      console.log('Query completed in', Date.now() - startTime, 'ms');
      return res.status(200).json({
        orders: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalOrders: 0,
          ordersPerPage: limit
        }
      });
    }

    // Batch fetch materials AND payments in parallel
    const orderIds = orders.map(o => o.orderid);
    
    const [materialsResult, paymentsResult] = await Promise.all([
      supabase
        .from('order_materials')
        .select('orderid, percentage, materials!inner(materialname)')
        .in('orderid', orderIds),
      supabase
        .from('payments')
        .select('*')
        .in('orderid', orderIds)
        .order('datesubmitted', { ascending: false })
    ]);
    
    const { data: allOrderMaterials, error: materialsError } = materialsResult;
    const { data: allPayments, error: paymentsError } = paymentsResult;
    
    if (materialsError) {
      console.error('Materials fetch error:', materialsError);
    }
    
    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
    }

    // Group materials by orderid
    const materialsMap = {};
    if (allOrderMaterials) {
      allOrderMaterials.forEach(om => {
        if (!materialsMap[om.orderid]) {
          materialsMap[om.orderid] = {};
        }
        materialsMap[om.orderid][om.materials.materialname] = om.percentage;
      });
    }

    // Group payments by orderid (get first one for each order)
    const paymentsMap = {};
    if (allPayments) {
      allPayments.forEach(payment => {
        if (!paymentsMap[payment.orderid]) {
          paymentsMap[payment.orderid] = payment;
        }
      });
    }

    // Combine orders with materials and extract payment
    const ordersWithMaterialsAndPayments = orders.map(order => {
      return {
        ...order,
        materials: materialsMap[order.orderid] || order.materials,
        payment: paymentsMap[order.orderid] || null
      };
    });

    console.log('Sending response with', ordersWithMaterialsAndPayments.length, 'orders');
    console.log('Query completed in', Date.now() - startTime, 'ms');

    res.status(200).json({
      orders: ordersWithMaterialsAndPayments || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalOrders: count,
        ordersPerPage: limit
      }
    });
  } catch (err) {
    console.error('Error in /user/:userid/full endpoint:', err);
    console.error('Query failed in', Date.now() - startTime, 'ms');
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

    // Prevent caching to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
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

    // Update order status to "Cancelled" instead of deleting
    const { data: cancelledOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        orderstatus: 'Cancelled'
      })
      .eq("orderid", orderid)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to cancel order:', updateError);
      throw updateError;
    }

    // Create admin notification for order cancellation
    try {
      await supabase.from("admin_notifications").insert([{
        orderid: orderid,
        customerid: existingOrder.userid || null,
        title: 'Order Cancelled',
        message: `Order ${orderid.slice(0, 8).toUpperCase()} has been cancelled by the customer. Reason: ${reason || 'Not specified'}`,
        type: 'order_cancelled',
        targetrole: 'both' // Both Sales Admin and OM should see
      }]);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(200).json({ 
      message: "Order cancelled successfully",
      order: cancelledOrder,
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
    const { price, employeeid, employeename } = req.body;



    // Validate price
    if (price === undefined || price === null || isNaN(price)) {

      return res.status(400).json({ error: "Invalid price value" });
    }

    // Convert to number and ensure it's valid
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {

      return res.status(400).json({ error: "Price must be a valid number" });
    }

    // Get old price before updating
    const { data: oldOrder } = await supabase
      .from("orders")
      .select("totalprice")
      .eq("orderid", orderid)
      .single();

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

    // Log the price change
    await createOrderLog(
      orderid,
      employeeid,
      employeename,
      'Price Updated',
      'totalprice',
      oldOrder?.totalprice,
      priceValue,
      `Price changed from ₱${oldOrder?.totalprice || 0} to ₱${priceValue}`
    );

    res.status(200).json({
      message: "Order price updated",
      order: order[0]
    });
  } catch (err) {


    res.status(500).json({ error: err.message || "Failed to update price" });
  }
});

// � Update order price breakdown (PATCH)
router.patch("/:orderid/price-breakdown", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { priceBreakdown, totalPrice, employeeid, employeename } = req.body;

    // Validate breakdown
    if (!priceBreakdown || typeof priceBreakdown !== 'object') {
      return res.status(400).json({ error: "Invalid price breakdown" });
    }

    // Validate required fields
    if (!priceBreakdown.materialCost || !priceBreakdown.deliveryFee) {
      return res.status(400).json({ error: "Material cost and delivery fee are required" });
    }

    // Get old data before updating
    const { data: oldOrder } = await supabase
      .from("orders")
      .select("totalprice, price_breakdown")
      .eq("orderid", orderid)
      .single();

    // Update order with breakdown and total price
    const { data: order, error } = await supabase
      .from("orders")
      .update({ 
        price_breakdown: JSON.stringify(priceBreakdown),
        totalprice: totalPrice
      })
      .eq("orderid", orderid)
      .select();

    if (error) {
      throw error;
    }

    if (!order || order.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Log the breakdown creation/update
    await createOrderLog(
      orderid,
      employeeid,
      employeename,
      'Price Breakdown Updated',
      'price_breakdown',
      oldOrder?.price_breakdown ? 'Existing breakdown' : null,
      'New breakdown',
      `Final price set to ₱${totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (Material: ₱${priceBreakdown.materialCost}, Delivery: ₱${priceBreakdown.deliveryFee}, VAT: ${priceBreakdown.vatRate}%)`
    );

    res.status(200).json({
      message: "Price breakdown saved successfully",
      order: order[0]
    });
  } catch (err) {
    console.error('Error updating price breakdown:', err);
    res.status(500).json({ error: err.message || "Failed to save price breakdown" });
  }
});

// �📅 Update order deadline (PATCH)
router.patch("/:orderid/deadline", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { deadline, employeeid, employeename } = req.body;


    // Validate deadline (should be a valid date string)
    if (!deadline) {

      return res.status(400).json({ error: "Deadline is required" });
    }

    // Check if deadline is a valid date
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {

      return res.status(400).json({ error: "Invalid deadline date format" });
    }

    // Get old deadline before updating
    const { data: oldOrder } = await supabase
      .from("orders")
      .select("deadline")
      .eq("orderid", orderid)
      .single();

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

    // Log the deadline change
    await createOrderLog(
      orderid,
      employeeid,
      employeename,
      'Deadline Updated',
      'deadline',
      oldOrder?.deadline,
      deadline,
      `Deadline changed from ${oldOrder?.deadline ? new Date(oldOrder.deadline).toLocaleDateString() : 'Not set'} to ${new Date(deadline).toLocaleDateString()}`
    );

    res.status(200).json({
      message: "Order deadline updated",
      order: order[0]
    });
  } catch (err) {


    res.status(500).json({ error: err.message || "Failed to update deadline" });
  }
});

// 📋🔄 Update order status (PATCH)
router.patch("/:orderid/status", async (req, res) => {
  try {
    const { orderid } = req.params;
    const { status, employeeid, employeename } = req.body;


    // Validate status
    const validStatuses = [
      'For Evaluation',
      'Waiting for Payment',
      'Verifying Payment',
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

    // Get old status before updating
    const { data: oldOrder } = await supabase
      .from("orders")
      .select("orderstatus")
      .eq("orderid", orderid)
      .single();

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

    // Log the status change
    await createOrderLog(
      orderid,
      employeeid,
      employeename,
      'Status Updated',
      'orderstatus',
      oldOrder?.orderstatus,
      status,
      `Status changed from "${oldOrder?.orderstatus || 'Unknown'}" to "${status}"`
    );

    // Notify OM for important status changes
    const omNotificationStatuses = ['In Production', 'Quality Check', 'Ready for Pickup', 'Completed'];
    if (omNotificationStatuses.includes(status)) {
      try {
        await supabase.from("admin_notifications").insert([{
          orderid: orderid,
          customerid: order[0].userid || null,
          title: 'Order Status Updated',
          message: `Order ${orderid.slice(0, 8).toUpperCase()} status changed to "${status}" by ${employeename || 'system'}.`,
          type: 'order_updated',
          targetrole: 'operational_manager'
        }]);
      } catch (notifError) {
        console.error('Failed to create OM notification:', notifError);
      }
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
                  html: emailTemplates.orderStatusUpdate(customerData.companyname, orderNumber, status, emailSubject, emailMessage)
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
