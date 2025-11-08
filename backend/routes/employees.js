import express from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../supabaseClient.js';

const router = express.Router();

// � Get all employees (optionally filter by role and status)
router.get("/", async (req, res) => {
  try {
    const { role, status, ispresent, limit } = req.query;

    let query = supabase
      .from("employees")
      .select("employeeid, employeename, email, assigneddepartment, role, accountstatus, contactdetails, shifthours, ispresent")
      .order('employeename', { ascending: true });

    // Apply filters if provided
    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('accountstatus', status);
    }
    if (ispresent !== undefined) {
      // Convert string 'true'/'false' to boolean
      const isPresent = ispresent === 'true' || ispresent === true;
      query = query.eq('ispresent', isPresent);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: employees, error } = await query;

    if (error) {
      console.error('❌ Error fetching employees:', error);
      throw error;
    }

    console.log(`✅ Fetched ${employees.length} employees${role ? ` with role: ${role}` : ''}${status ? ` with status: ${status}` : ''}${ispresent !== undefined ? ` ispresent: ${ispresent}` : ''}`);

    res.status(200).json({ employees });
  } catch (err) {
    console.error("💥 Get Employees Error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// �🔐 Employee Login (Sales Admin, Operational Manager, etc.)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Employee login attempt: ${email}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find employee by email
    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !employee) {
      console.error(`❌ Employee not found: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check account status
    if (employee.accountstatus !== 'Active') {
      console.error(`❌ Account inactive: ${email}`);
      return res.status(403).json({ error: "Account is inactive. Please contact administrator." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    
    if (!isPasswordValid) {
      console.error(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Set ispresent to true when employee logs in
    const { error: updateError } = await supabase
      .from("employees")
      .update({ ispresent: true })
      .eq("employeeid", employee.employeeid);

    if (updateError) {
      console.error(`⚠️ Failed to update presence for ${email}:`, updateError);
      // Don't fail login if presence update fails, just log it
    }

    console.log(`✅ Employee logged in successfully: ${email} (${employee.role}) - Presence set to true`);

    // Return employee data (excluding password, with updated ispresent)
    const { password: _, ...employeeData } = employee;
    employeeData.ispresent = true; // Ensure the returned data reflects the update

    res.status(200).json({
      message: "Login successful",
      employee: employeeData
    });

  } catch (err) {
    console.error("💥 Employee Login Error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// � Employee Logout
router.post("/logout", async (req, res) => {
  try {
    const { employeeid } = req.body;

    console.log(`🚪 Employee logout attempt: ${employeeid}`);

    // Validate input
    if (!employeeid) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    // Set ispresent to false when employee logs out
    const { error } = await supabase
      .from("employees")
      .update({ ispresent: false })
      .eq("employeeid", employeeid);

    if (error) {
      console.error(`❌ Failed to update presence for employee ${employeeid}:`, error);
      return res.status(500).json({ error: "Failed to update presence status" });
    }

    console.log(`✅ Employee logged out successfully: ${employeeid} - Presence set to false`);

    res.status(200).json({ 
      message: "Logout successful",
      ispresent: false 
    });

  } catch (err) {
    console.error("💥 Employee Logout Error:", err);
    res.status(500).json({ error: "Logout failed. Please try again." });
  }
});

// �📊 Get employee profile (authenticated)
router.get("/profile/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;

    const { data: employee, error } = await supabase
      .from("employees")
      .select("employeeid, employeename, email, assigneddepartment, role, accountstatus, contactdetails, shifthours, ispresent")
      .eq("employeeid", employeeid)
      .single();

    if (error || !employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ employee });
  } catch (err) {
    console.error("💥 Get Profile Error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 🔑 Change employee password
router.post("/change-password", async (req, res) => {
  try {
    const { employeeid, currentPassword, newPassword } = req.body;

    // Validate input
    if (!employeeid || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get current employee
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("password")
      .eq("employeeid", employeeid)
      .single();

    if (fetchError || !employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, employee.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("employees")
      .update({ password: hashedPassword })
      .eq("employeeid", employeeid);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Password changed for employee ID: ${employeeid}`);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("💥 Change Password Error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
