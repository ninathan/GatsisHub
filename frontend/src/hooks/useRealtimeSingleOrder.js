import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time updates on a single order
 * Subscribes to changes for a specific order ID
 */
export const useRealtimeSingleOrder = (orderid, onOrderUpdate) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!orderid) return;

    // Subscribe to UPDATE events on a specific order
    const subscription = supabase
      .channel(`order:${orderid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `orderid=eq.${orderid}`,
        },
        (payload) => {
          console.log('Single order update received:', payload);
          if (onOrderUpdate) {
            onOrderUpdate(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Single order subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from single order');
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [orderid, onOrderUpdate]);

  return { isSubscribed };
};
