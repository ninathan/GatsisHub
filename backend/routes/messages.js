import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get all conversations for a customer (customer view)
router.get('/conversations/customer/:customerid', async (req, res) => {
  try {
    const { customerid } = req.params;

    // Get all unique employees this customer has messaged with
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        employeeid,
        employees (
          employeeid,
          employeename,
          role
        )
      `)
      .eq('customerid', customerid)
      .order('timesent', { ascending: false });

    if (error) throw error;

    // Get unique employees with last message time
    const uniqueConversations = [];
    const seenEmployees = new Set();

    for (const msg of conversations) {
      if (msg.employees && !seenEmployees.has(msg.employeeid)) {
        seenEmployees.add(msg.employeeid);
        
        // Get last message for this conversation
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('message, timesent')
          .eq('customerid', customerid)
          .eq('employeeid', msg.employeeid)
          .order('timesent', { ascending: false })
          .limit(1)
          .single();

        uniqueConversations.push({
          employeeid: msg.employees.employeeid,
          employeename: msg.employees.employeename,
          role: msg.employees.role,
          lastMessage: lastMsg?.message?.substring(0, 50) || '',
          lastMessageTime: lastMsg?.timesent
        });
      }
    }

    res.json({ conversations: uniqueConversations });
  } catch (err) {
    console.error('❌ Get customer conversations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for sales admin (admin view - all customers)
router.get('/conversations/admin', async (req, res) => {
  try {
    // Get all unique customers who have sent messages
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        customerid,
        customers (
          customerid,
          companyname,
          emailaddress
        )
      `)
      .order('timesent', { ascending: false });

    if (error) throw error;

    // Get unique customers with last message time
    const uniqueConversations = [];
    const seenCustomers = new Set();

    for (const msg of conversations) {
      if (msg.customers && !seenCustomers.has(msg.customerid)) {
        seenCustomers.add(msg.customerid);
        
        // Get last message for this customer
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('message, timesent')
          .eq('customerid', msg.customerid)
          .order('timesent', { ascending: false })
          .limit(1)
          .single();

        uniqueConversations.push({
          customerid: msg.customers.customerid,
          companyname: msg.customers.companyname,
          emailaddress: msg.customers.emailaddress,
          lastMessage: lastMsg?.message?.substring(0, 50) || '',
          lastMessageTime: lastMsg?.timesent
        });
      }
    }

    res.json({ conversations: uniqueConversations });
  } catch (err) {
    console.error('❌ Get admin conversations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get messages between customer and employee
router.get('/conversation/:customerid/:employeeid', async (req, res) => {
  try {
    const { customerid, employeeid } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        messageid,
        message,
        timesent,
        file,
        customerid,
        employeeid,
        sender_type,
        customers (
          companyname
        ),
        employees (
          employeename,
          role
        )
      `)
      .eq('customerid', customerid)
      .eq('employeeid', employeeid)
      .order('timesent', { ascending: true });

    if (error) throw error;

    // Format messages for frontend
    const formattedMessages = messages.map(msg => {
      // Convert file buffer to base64 if present
      let fileBase64 = null;
      if (msg.file) {
        fileBase64 = `data:application/octet-stream;base64,${Buffer.from(msg.file).toString('base64')}`;
      }

      return {
        messageid: msg.messageid,
        text: msg.message,
        time: new Date(msg.timesent).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        timestamp: msg.timesent,
        sender: msg.sender_type || (msg.employeeid ? 'admin' : 'customer'), // Use sender_type if available
        senderName: msg.sender_type === 'admin' ? msg.employees?.employeename : msg.customers?.companyname,
        senderRole: msg.employees?.role || 'Customer',
        hasFile: !!msg.file,
        file: fileBase64
      };
    });

    res.json({ messages: formattedMessages });
  } catch (err) {
    console.error('❌ Get conversation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { customerid, employeeid, message, file, fileName, senderType } = req.body;

    console.log('📨 Sending message:', { customerid, employeeid, senderType, hasFile: !!file });

    if (!customerid || !message) {
      return res.status(400).json({ error: 'Customer ID and message are required' });
    }

    // Convert base64 to buffer if file is present
    let fileBuffer = null;
    if (file) {
      try {
        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Data = file.includes(',') ? file.split(',')[1] : file;
        fileBuffer = Buffer.from(base64Data, 'base64');
      } catch (fileError) {
        console.error('❌ File conversion error:', fileError.message);
        // Continue without file if conversion fails
        fileBuffer = null;
      }
    }

    // NEW LOGIC: Store a sender_type field to identify who sent it
    // employeeid is ALWAYS stored (identifies the conversation)
    // senderType determines if it was sent by customer or admin
    const insertData = {
      customerid,
      employeeid: employeeid, // Required to identify conversation
      message,
      sender_type: senderType || 'customer', // Explicitly track who sent it
      timesent: new Date().toISOString()
    };

    // Only add file if it exists
    if (fileBuffer) {
      insertData.file = fileBuffer;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Message sent successfully');

    res.status(201).json({ 
      message: 'Message sent successfully',
      data 
    });
  } catch (err) {
    console.error('❌ Send message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:messageid', async (req, res) => {
  try {
    const { messageid } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('messageid', messageid);

    if (error) throw error;

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('❌ Delete message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
