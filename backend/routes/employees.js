import express from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../supabaseClient.js';

const router = express.Router();

// 📋 Get all employees (excluding archived, optionally filter by role and status)
router.get("/", async (req, res) => {
  try {
    const { role, status, ispresent, limit } = req.query;

    let query = supabase
      .from("employees")
      .select("employeeid, employeename, email, assigneddepartment, role, accountstatus, contactdetails, shifthours, ispresent")
      .eq('is_archived', false)
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

      throw error;
    }

    res.status(200).json({ employees });
  } catch (err) {

    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// �🔐 Employee Login (Sales Admin, Operational Manager, etc.)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find employee by email (excluding archived)
    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq('is_archived', false)
      .single();

    if (error || !employee) {

      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check account status
    if (employee.accountstatus !== 'Active') {

      return res.status(403).json({ error: "Account is inactive. Please contact administrator." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    
    if (!isPasswordValid) {

      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Set ispresent to true when employee logs in
    const { error: updateError } = await supabase
      .from("employees")
      .update({ ispresent: true })
      .eq("employeeid", employee.employeeid);

    if (updateError) {

      // Don't fail login if presence update fails, just log it
    }

    // Return employee data (excluding password, with updated ispresent)
    const { password: _, ...employeeData } = employee;
    employeeData.ispresent = true; // Ensure the returned data reflects the update

    res.status(200).json({
      message: "Login successful",
      employee: employeeData
    });

  } catch (err) {

    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// � Employee Logout
router.post("/logout", async (req, res) => {
  try {
    const { employeeid } = req.body;

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

      return res.status(500).json({ error: "Failed to update presence status" });
    }

    res.status(200).json({ 
      message: "Logout successful",
      ispresent: false 
    });

  } catch (err) {

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
      .eq('is_archived', false)
      .single();

    if (error || !employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ employee });
  } catch (err) {

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

    // Get current employee (excluding archived)
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("password")
      .eq("employeeid", employeeid)
      .eq('is_archived', false)
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

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {

    res.status(500).json({ error: "Failed to change password" });
  }
});

// ✏️ Update employee details
router.patch("/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;
    const { employeename, email, password, contactdetails, shifthours, assigneddepartment, accountstatus, role, ispresent } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (employeename !== undefined) updateData.employeename = employeename;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (contactdetails !== undefined) updateData.contactdetails = contactdetails;
    if (shifthours !== undefined) updateData.shifthours = shifthours;
    if (assigneddepartment !== undefined) updateData.assigneddepartment = assigneddepartment;
    if (accountstatus !== undefined) updateData.accountstatus = accountstatus;
    if (role !== undefined) updateData.role = role;
    if (ispresent !== undefined) updateData.ispresent = ispresent;
    
    // Hash password if provided
    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Update employee
    const { data: employee, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("employeeid", employeeid)
      .select()
      .single();

    if (error) {

      throw error;
    }

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Return employee data (excluding password)
    const { password: _, ...employeeData } = employee;

    res.status(200).json({
      message: "Employee updated successfully",
      employee: employeeData
    });
  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to update employee" });
  }
});

// 🗑️ Archive employee (soft delete)
router.delete("/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;

    // Check if employee exists
    const { data: existingEmployee, error: fetchError } = await supabase
      .from("employees")
      .select("employeename, role")
      .eq("employeeid", employeeid)
      .single();

    if (fetchError || !existingEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Archive employee instead of deleting
    const { error } = await supabase
      .from("employees")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("employeeid", employeeid);

    if (error) {

      throw error;
    }

    res.status(200).json({
      message: "Employee archived successfully",
      archivedEmployee: {
        employeeid,
        employeename: existingEmployee.employeename,
        role: existingEmployee.role
      }
    });
  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to archive employee" });
  }
});

// ➕ Create new employee
router.post("/create", async (req, res) => {
  try {
    const { 
      employeename, 
      email, 
      password, 
      assigneddepartment, 
      role, 
      accountstatus, 
      contactdetails, 
      shifthours 
    } = req.body;

    // Validate required fields
    if (!employeename || !email || !password || !assigneddepartment || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if email already exists
    const { data: existingEmployee, error: checkError } = await supabase
      .from("employees")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingEmployee) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const { data: newEmployee, error: createError } = await supabase
      .from("employees")
      .insert([{
        employeename,
        email: email.toLowerCase(),
        password: hashedPassword,
        assigneddepartment,
        role,
        accountstatus: accountstatus || 'Active',
        contactdetails: contactdetails || null,
        shifthours: shifthours || null,
        ispresent: false
      }])
      .select()
      .single();

    if (createError) {

      throw createError;
    }

    // Return employee data (excluding password)
    const { password: _, ...employeeData } = newEmployee;

    res.status(201).json({
      message: "Employee created successfully",
      employee: employeeData
    });
  } catch (err) {

    res.status(500).json({ error: err.message || "Failed to create employee" });
  }
});

// 📋 GET /employees/archived - Get all archived employees
router.get("/archived", async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from("employees")
      .select("employeeid, employeename, email, assigneddepartment, role, contactdetails, archived_at")
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({ employees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch archived employees" });
  }
});

// 🔄 POST /employees/:employeeid/restore - Restore archived employee
router.post("/:employeeid/restore", async (req, res) => {
  try {
    const { employeeid } = req.params;

    // Check if employee exists and is archived
    const { data: existingEmployee, error: fetchError } = await supabase
      .from("employees")
      .select("employeename, is_archived")
      .eq("employeeid", employeeid)
      .single();

    if (fetchError || !existingEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!existingEmployee.is_archived) {
      return res.status(400).json({ error: "Employee is not archived" });
    }

    // Restore employee
    const { error } = await supabase
      .from("employees")
      .update({
        is_archived: false,
        archived_at: null,
        accountstatus: 'Active',
        ispresent: false
      })
      .eq("employeeid", employeeid);

    if (error) {
      throw error;
    }

    res.status(200).json({
      message: "Employee restored successfully",
      restoredEmployee: {
        employeeid,
        employeename: existingEmployee.employeename
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to restore employee" });
  }
});

export default router;
