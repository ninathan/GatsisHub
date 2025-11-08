import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Get all notifications for a customer
router.get('/customer/:customerid', async (req, res) => {
  try {
    const { customerid } = req.params;
    const { unreadOnly } = req.query;

    let query = supabase
      .from('notifications')
      .select(`
        notificationid,
        title,
        message,
        type,
        isread,
        datecreated,
        orderid,
        orders (
          orderid,
          companyname,
          orderstatus,
          hangertype,
          selectedcolor,
          threeddesigndata
        )
      `)
      .eq('customerid', customerid)
      .order('datecreated', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('isread', false);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    // Format notifications
    const formattedNotifications = notifications.map(notif => {
      // Extract design data for thumbnail
      let designData = null;
      let thumbnail = null;
      
      if (notif.orders?.threeddesigndata) {
        try {
          designData = typeof notif.orders.threeddesigndata === 'string' 
            ? JSON.parse(notif.orders.threeddesigndata)
            : notif.orders.threeddesigndata;
          
          // Get logo preview as thumbnail if available
          thumbnail = designData.logoPreview || null;
        } catch (e) {
          console.error('Error parsing design data:', e);
        }
      }

      return {
        id: notif.notificationid,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        isRead: notif.isread,
        orderId: notif.orderid,
        orderStatus: notif.orders?.orderstatus,
        companyName: notif.orders?.companyname,
        hangerType: notif.orders?.hangertype,
        hangerColor: notif.orders?.selectedcolor,
        thumbnail: thumbnail, // Logo preview from design data
        timestamp: new Date(notif.datecreated).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        rawDate: notif.datecreated
      };
    });

    res.json({ 
      notifications: formattedNotifications,
      unreadCount: formattedNotifications.filter(n => !n.isRead).length
    });
  } catch (err) {
    console.error('❌ Get notifications error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a notification (called when order status changes)
router.post('/create', async (req, res) => {
  try {
    const { customerid, orderid, title, message, type } = req.body;

    if (!customerid || !orderid || !title || !message) {
      return res.status(400).json({ 
        error: 'Customer ID, Order ID, title, and message are required' 
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          customerid,
          orderid,
          title,
          message,
          type: type || 'order_update',
          isread: false,
          datecreated: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Notification created successfully',
      notification: data 
    });
  } catch (err) {
    console.error('❌ Create notification error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.patch('/:notificationid/read', async (req, res) => {
  try {
    const { notificationid } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('notificationid', notificationid)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Notification marked as read',
      notification: data 
    });
  } catch (err) {
    console.error('❌ Mark notification as read error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read for a customer
router.patch('/customer/:customerid/read-all', async (req, res) => {
  try {
    const { customerid } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ isread: true })
      .eq('customerid', customerid)
      .eq('isread', false);

    if (error) throw error;

    res.json({ 
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('❌ Mark all notifications as read error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification
router.delete('/:notificationid', async (req, res) => {
  try {
    const { notificationid } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notificationid', notificationid);

    if (error) throw error;

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('❌ Delete notification error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get unread notification count
router.get('/customer/:customerid/unread-count', async (req, res) => {
  try {
    const { customerid } = req.params;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('customerid', customerid)
      .eq('isread', false);

    if (error) throw error;

    res.json({ unreadCount: count || 0 });
  } catch (err) {
    console.error('❌ Get unread count error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
