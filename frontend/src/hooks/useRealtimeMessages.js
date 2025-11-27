import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time message updates
 * Subscribes to new messages for a specific conversation
 */
export const useRealtimeMessages = (customerid, employeeid, onNewMessage) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!customerid || !employeeid) return;

    // Subscribe to INSERT events on messages table
    const subscription = supabase
      .channel(`messages:${customerid}:${employeeid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `customerid=eq.${customerid}`,
        },
        (payload) => {

          // Only process messages for this conversation
          if (payload.new.employeeid === employeeid) {
            if (onNewMessage) {
              onNewMessage(payload.new);
            }
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
  }, [customerid, employeeid, onNewMessage]);

  return { isSubscribed };
};
