import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get all admin notifications (for Sales Admin or Operational Manager)
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params; // 'sales_admin' or 'operational_manager'
    const { unreadOnly } = req.query;

    let query = supabase
      .from('admin_notifications')
      .select(`
        notificationid,
        title,
        message,
        type,
        isread,
        datecreated,
        targetrole,
        orderid,
        customerid,
        orders (
          orderid,
          companyname,
          contactperson,
          orderstatus,
          totalprice,
          quantity
        ),
        customers (
          customerid,
          firstname,
          lastname,
          email
        )
      `)
      .or(`targetrole.eq.${role},targetrole.eq.both`)
      .order('datecreated', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('isread', false);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    res.json({ 
      success: true, 
      notifications: notifications || [],
      count: notifications?.length || 0
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications',
      details: error.message 
    });
  }
});

// Mark notification as read
router.patch('/:notificationid/read', async (req, res) => {
  try {
    const { notificationid } = req.params;

    const { data, error } = await supabase
      .from('admin_notifications')
      .update({ isread: true })
      .eq('notificationid', notificationid)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      notification: data,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read',
      details: error.message 
    });
  }
});

// Mark all notifications as read for a role
router.patch('/read-all/:role', async (req, res) => {
  try {
    const { role } = req.params;

    const { data, error } = await supabase
      .from('admin_notifications')
      .update({ isread: true })
      .or(`targetrole.eq.${role},targetrole.eq.both`)
      .eq('isread', false)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      count: data?.length || 0,
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark all notifications as read',
      details: error.message 
    });
  }
});

// Create a new admin notification (used by other routes)
router.post('/', async (req, res) => {
  try {
    const { 
      orderid, 
      customerid, 
      title, 
      message, 
      type, 
      targetrole 
    } = req.body;

    if (!title || !message || !type || !targetrole) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, message, type, targetrole' 
      });
    }

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([{
        orderid,
        customerid,
        title,
        message,
        type,
        targetrole
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      notification: data,
      message: 'Notification created successfully' 
    });
  } catch (error) {
    console.error('Error creating admin notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create notification',
      details: error.message 
    });
  }
});

// Delete a notification
router.delete('/:notificationid', async (req, res) => {
  try {
    const { notificationid } = req.params;

    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('notificationid', notificationid);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete notification',
      details: error.message 
    });
  }
});

export default router;
