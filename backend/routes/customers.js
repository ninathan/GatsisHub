import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /customers - Get all customers
router.get("/", async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, two_factor_enabled, google_id, profilePicture, gender, dateofbirth")
      .order('datecreated', { ascending: false });

    // Apply filters if provided
    if (status) {
      query = query.eq('accountstatus', status);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: customers, error } = await query;

    if (error) {

      throw error;
    }

    res.status(200).json({ customers });
  } catch (err) {

    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// 🔍 GET /customers/:customerid - Get single customer
router.get("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, two_factor_enabled, google_id, profilePicture, gender, dateofbirth")
      .eq("customerid", customerid)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (err) {

    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// 📝 PATCH /customers/:customerid - Update customer profile
router.patch("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;
    const { addresses, companynumber, companyname, emailaddress, emailnotifications, two_factor_enabled, accountstatus, password, gender, dateofbirth } = req.body;


    // Build update object with only provided fields
    const updateData = {};
    if (addresses !== undefined) updateData.addresses = addresses;
    if (companynumber !== undefined) updateData.companynumber = companynumber;
    if (companyname !== undefined) updateData.companyname = companyname;
    if (emailaddress !== undefined) updateData.emailaddress = emailaddress;
    if (emailnotifications !== undefined) updateData.emailnotifications = emailnotifications;
    if (two_factor_enabled !== undefined) updateData.two_factor_enabled = two_factor_enabled;
    if (accountstatus !== undefined) updateData.accountstatus = accountstatus;
    if (gender !== undefined) updateData.gender = gender;
    if (dateofbirth !== undefined) updateData.dateofbirth = dateofbirth;

    // Hash password if provided
    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update customer in database
    const { data, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("customerid", customerid)
      .select()
      .single();

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    // Remove password from response
    const { password: _, ...customerData } = data;
    res.status(200).json(customerData);
  } catch (err) {

    res.status(500).json({ error: "Failed to update customer profile" });
  }
});

// 🗑️ DELETE /customers/:customerid - Delete customer account
router.delete("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("companyname, userid")
      .eq("customerid", customerid)
      .single();

    if (fetchError || !existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Delete customer's messages first (if any)
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("customerid", customerid);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      // Continue anyway
    }

    // Delete customer's notifications (if any)
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("customerid", customerid);

    if (notificationsError) {
      console.error("Error deleting notifications:", notificationsError);
      // Continue anyway
    }

    // Delete customer's orders (if any)
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("customerid", customerid);

    if (ordersError) {
      console.error("Error deleting orders:", ordersError);
      // Continue anyway
    }

    // Delete customer's designs (if any)
    const { error: designsError } = await supabase
      .from("designs")
      .delete()
      .eq("userid", existingCustomer.userid);

    if (designsError) {
      console.error("Error deleting designs:", designsError);
      // Continue anyway
    }

    // Delete customer
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("customerid", customerid);

    if (error) {

      throw error;
    }

    // Try to delete from Supabase Auth if userid exists
    if (existingCustomer.userid) {
      try {
        await supabase.auth.admin.deleteUser(existingCustomer.userid);
      } catch (authError) {

        // Continue anyway since customer is deleted from database
      }
    }

    res.status(200).json({
      message: "Customer deleted successfully",
      deletedCustomer: {
        customerid,
        companyname: existingCustomer.companyname
      }
    });
  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to delete customer" });
  }
});

export default router;
