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
          console.log('🔔 New notification received:', payload.new);
          
          if (onNewNotification) {
            onNewNotification(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from notifications');
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [customerid, onNewNotification]);

  return { isSubscribed };
};
