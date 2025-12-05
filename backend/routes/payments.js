import express from "express";
import supabase from "../supabaseClient.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for memory storage (Vercel compatible)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed'));
    }
  }
});

// 📤 POST /payments/submit - Submit payment proof
router.post("/submit", upload.single('proofOfPayment'), async (req, res) => {
  try {



    const { paymentMethod, orderid, customerid, amountPaid, transactionReference, notes } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ error: "Payment proof file is required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    // Upload file to Supabase Storage
    const fileExt = path.extname(req.file.originalname);
    const fileName = `payment-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    const filePath = `payments/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {

      return res.status(500).json({ error: "Failed to upload file: " + uploadError.message });
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    // Insert payment record into database
    const paymentData = {
      orderid: orderid || null,
      customerid: customerid ? parseInt(customerid) : null,
      paymentmethod: paymentMethod,
      proofofpayment: publicUrl,
      paymentstatus: 'Pending Verification',
      amountpaid: amountPaid ? parseFloat(amountPaid) : null,
      transactionreference: transactionReference || null,
      notes: notes || null,
      datesubmitted: new Date().toISOString()
    };

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (insertError) {

      return res.status(400).json({ error: insertError.message });
    }

    // Update order status if orderid is provided
    if (orderid) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          orderstatus: 'Payment Submitted',
          updatedat: new Date().toISOString()
        })
        .eq("orderid", orderid);

      if (updateError) {

      } else {

      }
    }

    res.status(201).json({
      message: "Payment proof submitted successfully",
      payment: payment
    });

  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to submit payment proof" });
  }
});

// 📋 GET /payments - Get all payments (admin)
router.get("/", async (req, res) => {
  try {
    const { status, orderid, customerid } = req.query;

    let query = supabase
      .from("payments")
      .select(`
        *,
        orders:orderid (
          orderid,
          companyname,
          orderstatus,
          quantity
        ),
        customers:customerid (
          customerid,
          companyname,
          emailaddress
        )
      `)
      .order('datesubmitted', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('paymentstatus', status);
    }
    if (orderid) {
      query = query.eq('orderid', orderid);
    }
    if (customerid) {
      query = query.eq('customerid', customerid);
    }

    const { data: payments, error } = await query;

    if (error) {

      throw error;
    }

    res.status(200).json({ payments });

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// 🔍 GET /payments/order/:orderid - Get payment by order ID
router.get("/order/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;

    const { data: payment, error } = await supabase
      .from("payments")
      .select(`
        *,
        customers:customerid (
          customerid,
          companyname,
          emailaddress
        )
      `)
      .eq("orderid", orderid)
      .order('datesubmitted', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No payment found for this order
        return res.status(404).json({ error: "No payment found for this order" });
      }

      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(payment);

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// 🔍 GET /payments/:paymentid - Get single payment
router.get("/:paymentid", async (req, res) => {
  try {
    const { paymentid } = req.params;

    const { data: payment, error } = await supabase
      .from("payments")
      .select(`
        *,
        orders:orderid (
          orderid,
          companyname,
          orderstatus,
          quantity,
          hangertype
        ),
        customers:customerid (
          customerid,
          companyname,
          emailaddress,
          companynumber
        )
      `)
      .eq("paymentid", paymentid)
      .single();

    if (error || !payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(payment);

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// ✅ PATCH /payments/:paymentid/verify - Verify payment (admin)
router.patch("/:paymentid/verify", async (req, res) => {
  try {
    const { paymentid } = req.params;
    const { status, verifiedby, notes } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'Verified' or 'Rejected'" });
    }

    const updateData = {
      paymentstatus: status,
      dateverified: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    if (verifiedby) {
      updateData.verifiedby = parseInt(verifiedby);
    }

    if (notes) {
      updateData.notes = notes;
    }

    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("paymentid", paymentid)
      .select()
      .single();

    if (updateError) {

      return res.status(400).json({ error: updateError.message });
    }

    // Update order status based on payment status
    if (payment.orderid) {
      let newOrderStatus;
      if (status === 'Verified') {
        newOrderStatus = 'In Production';
      } else if (status === 'Rejected') {
        newOrderStatus = 'Waiting for Payment';
      }

      if (newOrderStatus) {
        const { error: orderError } = await supabase
          .from("orders")
          .update({ 
            orderstatus: newOrderStatus,
            updatedat: new Date().toISOString()
          })
          .eq("orderid", payment.orderid);

        if (orderError) {

        } else {

        }
      }
    }

    res.status(200).json(payment);

  } catch (err) {

    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// ❌ DELETE /payments/:paymentid - Delete/reject payment (admin)
router.delete("/:paymentid", async (req, res) => {
  try {
    const { paymentid } = req.params;

    // First get the payment to retrieve the orderid
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("orderid")
      .eq("paymentid", paymentid)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Delete the payment record
    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("paymentid", paymentid);

    if (deleteError) {

      return res.status(400).json({ error: deleteError.message });
    }

    // Update order status back to "Waiting for Payment"
    if (payment.orderid) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ 
          orderstatus: 'Waiting for Payment',
          updatedat: new Date().toISOString()
        })
        .eq("orderid", payment.orderid);

      if (orderError) {

      } else {

      }
    }

    res.status(200).json({ message: "Payment rejected. Customer can resubmit." });

  } catch (err) {

    res.status(500).json({ error: "Failed to delete payment" });
  }
});

export default router;
