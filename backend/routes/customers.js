import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📝 PATCH /customers/:customerid - Update customer profile
router.patch("/:customerid", async (req, res) => {
  try {
    const { customerid } = req.params;
    const { addresses, companynumber, companyname, emailaddress, emailnotifications } = req.body;

    console.log("📝 Updating customer:", customerid);
    console.log("📥 Update data:", req.body);

    // Build update object with only provided fields
    const updateData = {};
    if (addresses !== undefined) updateData.addresses = addresses;
    if (companynumber !== undefined) updateData.companynumber = companynumber;
    if (companyname !== undefined) updateData.companyname = companyname;
    if (emailaddress !== undefined) updateData.emailaddress = emailaddress;
    if (emailnotifications !== undefined) updateData.emailnotifications = emailnotifications;

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
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Failed to update customer profile" });
  }
});

export default router;
