import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

/**
 * Custom hook to subscribe to real-time admin notifications
 * @param {string} role - The role to filter notifications ('sales_admin' or 'operational_manager')
 * @param {function} onNewNotification - Callback function when a new notification arrives
 * @returns {object} - { isSubscribed: boolean }
 */
export function useRealtimeAdminNotifications(role, onNewNotification) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!role || !onNewNotification) return;

    // Subscribe to admin_notifications table changes
    const channel = supabase
      .channel(`admin-notifications:${role}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          // Filter by targetrole (either matches role or is 'both')
          if (payload.new && (payload.new.targetrole === role || payload.new.targetrole === 'both')) {
            onNewNotification(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [role, onNewNotification]);

  return { isSubscribed };
}
