import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook for real-time notification updates
 * Subscribes to new notifications for a specific customer
 */
export const useRealtimeNotifications = (customerid, onNewNotification) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!customerid) return;

    // Subscribe to INSERT events on notifications table
    const subscription = supabase
      .channel(`notifications:${customerid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `customerid=eq.${customerid}`,
        },
        (payload) => {

          if (onNewNotification) {
            onNewNotification(payload.new);
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
  }, [customerid, onNewNotification]);

  return { isSubscribed };
};
