import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time order updates for Admin users
 * Subscribes to ALL order changes (not filtered by userid)
 * Use this for admin dashboards that need to see all orders
 */
export const useRealtimeOrdersAdmin = (onOrderUpdate) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Subscribe to INSERT, UPDATE, DELETE events on orders table
    const subscription = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order update received:', payload);
          if (onOrderUpdate) {
            onOrderUpdate(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin orders subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from admin orders');
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [onOrderUpdate]);

  return { isSubscribed };
};
