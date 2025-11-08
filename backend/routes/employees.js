import express from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../supabaseClient.js';

const router = express.Router();

// � Get all employees (optionally filter by role and status)
router.get("/", async (req, res) => {
  try {
    const { role, status } = req.query;

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

    const { data: employees, error } = await query;

    if (error) {
      console.error('❌ Error fetching employees:', error);
      throw error;
    }

    console.log(`✅ Fetched ${employees.length} employees${role ? ` with role: ${role}` : ''}${status ? ` with status: ${status}` : ''}`);

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

    console.log(`✅ Employee logged in successfully: ${email} (${employee.role})`);

    // Return employee data (excluding password)
    const { password: _, ...employeeData } = employee;

    res.status(200).json({
      message: "Login successful",
      employee: employeeData
    });

  } catch (err) {
    console.error("💥 Employee Login Error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// 📊 Get employee profile (authenticated)
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
