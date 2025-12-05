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
      let thumbnailType = 'icon'; // 'image', 'color', or 'icon'
      
      if (notif.orders?.threeddesigndata) {
        try {
          designData = typeof notif.orders.threeddesigndata === 'string' 
            ? JSON.parse(notif.orders.threeddesigndata)
            : notif.orders.threeddesigndata;
          
          // Priority 1: Use rendered 3D hanger thumbnail (base64 image)
          if (designData.thumbnail) {
            thumbnail = designData.thumbnail;
            thumbnailType = 'image';
          }
          // Priority 2: Use hanger color as fallback
          else if (designData.color || notif.orders?.selectedcolor) {
            thumbnail = designData.color || notif.orders?.selectedcolor;
            thumbnailType = 'color';
          }
        } catch (e) {

        }
      }
      // Fallback to selectedcolor if no design data
      else if (notif.orders?.selectedcolor) {
        thumbnail = notif.orders?.selectedcolor;
        thumbnailType = 'color';
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
        thumbnail: thumbnail, // Logo preview or color
        thumbnailType: thumbnailType, // Type of thumbnail
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

    res.status(500).json({ error: err.message });
  }
});

export default router;
