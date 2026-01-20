import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /customers - Get all customers (excluding archived)
router.get("/", async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, two_factor_enabled, google_id, profilePicture, gender, dateofbirth")
      .eq('is_archived', false)
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

// 🔍 GET /customers/:customerid - Get single customer (excluding archived)
router.get("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, two_factor_enabled, google_id, profilePicture, gender, dateofbirth")
      .eq("customerid", customerid)
      .eq('is_archived', false)
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

// 🗑️ Archive customer account (soft delete)
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

    // Archive customer instead of deleting
    const { error } = await supabase
      .from("customers")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("customerid", customerid);

    if (error) {

      throw error;
    }

    res.status(200).json({
      message: "Customer archived successfully",
      archivedCustomer: {
        customerid,
        companyname: existingCustomer.companyname
      }
    });
  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to archive customer" });
  }
});

export default router;
