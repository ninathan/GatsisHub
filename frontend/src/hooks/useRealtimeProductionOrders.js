import { useEffect, useState } from 'react';
import supabase from '../../supabaseClient';

/**
 * Custom hook to subscribe to real-time updates for production employee orders
 * @param {string} employeeId - The employee ID to filter orders by team assignment
 * @param {function} onUpdate - Callback function to handle order updates
 * @returns {object} - { isSubscribed: boolean }
 */
export function useRealtimeProductionOrders(employeeId, onUpdate) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!employeeId || !onUpdate) return;

    // Subscribe to orders table changes
    const channel = supabase
      .channel(`production-orders:${employeeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // Call the update handler with the payload
          onUpdate(payload);
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
  }, [employeeId, onUpdate]);

  return { isSubscribed };
}
