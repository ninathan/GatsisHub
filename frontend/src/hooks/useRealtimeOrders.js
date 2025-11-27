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

          if (onOrderUpdate) {
            onOrderUpdate(payload);
          }
        }
      )
      .subscribe((status) => {

        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {

      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [userid, onOrderUpdate]);

  return { isSubscribed };
};
