import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time order updates
 * Subscribes to order changes for a specific user
 */
export const useRealtimeOrders = (userid, onOrderUpdate) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!userid) return;

    // Subscribe to INSERT and UPDATE events on orders table
    const subscription = supabase
      .channel(`orders:${userid}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
          filter: `userid=eq.${userid}`,
        },
        (payload) => {
          console.log('📦 Order update received:', payload);
          
          if (onOrderUpdate) {
            onOrderUpdate(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Order subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from orders');
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [userid, onOrderUpdate]);

  return { isSubscribed };
};
