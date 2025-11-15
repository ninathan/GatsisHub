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

// ✏️ Update employee details
router.patch("/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;
    const { employeename, email, password, contactdetails, shifthours, assigneddepartment, accountstatus, role } = req.body;

    console.log(`✏️ Updating employee: ${employeeid}`);

    // Build update object with only provided fields
    const updateData = {};
    if (employeename !== undefined) updateData.employeename = employeename;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (contactdetails !== undefined) updateData.contactdetails = contactdetails;
    if (shifthours !== undefined) updateData.shifthours = shifthours;
    if (assigneddepartment !== undefined) updateData.assigneddepartment = assigneddepartment;
    if (accountstatus !== undefined) updateData.accountstatus = accountstatus;
    if (role !== undefined) updateData.role = role;
    
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
      console.error(`❌ Error updating employee:`, error);
      throw error;
    }

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log(`✅ Employee updated successfully: ${employeeid}`);

    // Return employee data (excluding password)
    const { password: _, ...employeeData } = employee;

    res.status(200).json({
      message: "Employee updated successfully",
      employee: employeeData
    });
  } catch (err) {
    console.error("💥 Update Employee Error:", err);
    res.status(500).json({ error: err.message || "Failed to update employee" });
  }
});

// 🗑️ Delete employee
router.delete("/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;

    console.log(`🗑️ Deleting employee: ${employeeid}`);

    // Check if employee exists
    const { data: existingEmployee, error: fetchError } = await supabase
      .from("employees")
      .select("employeename, role")
      .eq("employeeid", employeeid)
      .single();

    if (fetchError || !existingEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Delete employee
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("employeeid", employeeid);

    if (error) {
      console.error(`❌ Error deleting employee:`, error);
      throw error;
    }

    console.log(`✅ Employee deleted successfully: ${employeeid} (${existingEmployee.employeename})`);

    res.status(200).json({
      message: "Employee deleted successfully",
      deletedEmployee: {
        employeeid,
        employeename: existingEmployee.employeename,
        role: existingEmployee.role
      }
    });
  } catch (err) {
    console.error("💥 Delete Employee Error:", err);
    res.status(500).json({ error: err.message || "Failed to delete employee" });
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

    console.log(`➕ Creating new employee: ${email}`);

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
      console.error(`❌ Error creating employee:`, createError);
      throw createError;
    }

    console.log(`✅ Employee created successfully: ${newEmployee.employeeid} (${newEmployee.employeename})`);

    // Return employee data (excluding password)
    const { password: _, ...employeeData } = newEmployee;

    res.status(201).json({
      message: "Employee created successfully",
      employee: employeeData
    });
  } catch (err) {
    console.error("💥 Create Employee Error:", err);
    res.status(500).json({ error: err.message || "Failed to create employee" });
  }
});

export default router;
