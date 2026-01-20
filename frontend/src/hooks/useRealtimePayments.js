import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time payment updates
 * Subscribes to payment changes for admins or specific orders
 */
export const useRealtimePayments = (orderid = null, onPaymentUpdate) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const channelName = orderid ? `payments:${orderid}` : 'admin-payments';
    
    // Build filter if orderid is provided
    const config = {
      event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'payments',
    };
    
    if (orderid) {
      config.filter = `orderid=eq.${orderid}`;
    }

    // Subscribe to payment changes
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', config, (payload) => {
        console.log('Payment update received:', payload);
        if (onPaymentUpdate) {
          onPaymentUpdate(payload);
        }
      })
      .subscribe((status) => {
        console.log('Payments subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from payments');
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [orderid, onPaymentUpdate]);

  return { isSubscribed };
};
