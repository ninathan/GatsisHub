import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /customers - Get all customers
router.get("/", async (req, res) => {
  try {
    const { status, limit } = req.query;

    console.log("📋 Fetching all customers...");

    let query = supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, google_id, profilePicture")
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
      console.error('❌ Error fetching customers:', error);
      throw error;
    }

    console.log(`✅ Fetched ${customers.length} customers`);

    res.status(200).json({ customers });
  } catch (err) {
    console.error("💥 Get Customers Error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// 🔍 GET /customers/:customerid - Get single customer
router.get("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    console.log("🔍 Fetching customer:", customerid);

    const { data: customer, error } = await supabase
      .from("customers")
      .select("customerid, userid, companyname, emailaddress, companynumber, addresses, datecreated, accountstatus, emailnotifications, google_id, profilePicture")
      .eq("customerid", customerid)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log("✅ Customer fetched successfully");
    res.status(200).json(customer);
  } catch (err) {
    console.error("💥 Get Customer Error:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// 📝 PATCH /customers/:customerid - Update customer profile
router.patch("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;
    const { addresses, companynumber, companyname, emailaddress, emailnotifications, accountstatus, password } = req.body;

    console.log("📝 Updating customer:", customerid);
    console.log("📥 Update data:", req.body);

    // Build update object with only provided fields
    const updateData = {};
    if (addresses !== undefined) updateData.addresses = addresses;
    if (companynumber !== undefined) updateData.companynumber = companynumber;
    if (companyname !== undefined) updateData.companyname = companyname;
    if (emailaddress !== undefined) updateData.emailaddress = emailaddress;
    if (emailnotifications !== undefined) updateData.emailnotifications = emailnotifications;
    if (accountstatus !== undefined) updateData.accountstatus = accountstatus;

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
      console.error("❌ Error updating customer:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Customer updated successfully");
    
    // Remove password from response
    const { password: _, ...customerData } = data;
    res.status(200).json(customerData);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Failed to update customer profile" });
  }
});

// 🗑️ DELETE /customers/:customerid - Delete customer account
router.delete("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;

    console.log("🗑️ Deleting customer:", customerid);

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("companyname, userid")
      .eq("customerid", customerid)
      .single();

    if (fetchError || !existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Delete customer's orders first (if any)
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("customerid", customerid);

    if (ordersError) {
      console.warn("⚠️ Error deleting customer orders:", ordersError);
      // Continue anyway
    }

    // Delete customer's designs (if any)
    const { error: designsError } = await supabase
      .from("designs")
      .delete()
      .eq("userid", existingCustomer.userid);

    if (designsError) {
      console.warn("⚠️ Error deleting customer designs:", designsError);
      // Continue anyway
    }

    // Delete customer
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("customerid", customerid);

    if (error) {
      console.error("❌ Error deleting customer:", error);
      throw error;
    }

    // Try to delete from Supabase Auth if userid exists
    if (existingCustomer.userid) {
      try {
        await supabase.auth.admin.deleteUser(existingCustomer.userid);
      } catch (authError) {
        console.warn("⚠️ Could not delete auth user:", authError);
        // Continue anyway since customer is deleted from database
      }
    }

    console.log(`✅ Customer deleted successfully: ${customerid} (${existingCustomer.companyname})`);

    res.status(200).json({
      message: "Customer deleted successfully",
      deletedCustomer: {
        customerid,
        companyname: existingCustomer.companyname
      }
    });
  } catch (err) {
    console.error("💥 Delete Customer Error:", err);
    res.status(500).json({ error: err.message || "Failed to delete customer" });
  }
});

export default router;
