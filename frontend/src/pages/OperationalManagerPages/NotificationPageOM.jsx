import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, MessageCircle, CreditCard, XCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import { useRealtimeAdminNotifications } from '../../hooks/useRealtimeAdminNotifications';
import LoadingSpinner from '../../components/LoadingSpinner';

const NotificationPageOM = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'
    const [error, setError] = useState(null);

    // Real-time notification handler
    const handleNewNotification = useCallback((payload) => {
        if (payload.eventType === 'INSERT') {
            // New notification added
            fetchNotifications();
        } else if (payload.eventType === 'UPDATE') {
            // Notification updated (read status)
            setNotifications(prev =>
                prev.map(notif =>
                    notif.notificationid === payload.new.notificationid ? { ...notif, isread: payload.new.isread } : notif
                )
            );
        } else if (payload.eventType === 'DELETE') {
            // Notification deleted
            setNotifications(prev =>
                prev.filter(notif => notif.notificationid !== payload.old.notificationid)
            );
        }
    }, []);

    // Subscribe to real-time notifications
    const { isSubscribed } = useRealtimeAdminNotifications('operational_manager', handleNewNotification);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const unreadOnly = filter === 'unread' ? '?unreadOnly=true' : '';
            const response = await fetch(`https://gatsis-hub.vercel.app/admin-notifications/operational_manager${unreadOnly}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server error:', errorData);
                throw new Error(errorData.hint || errorData.details || 'Failed to fetch notifications');
            }
            
            const data = await response.json();
            setNotifications(data.notifications || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    // Mark notification as read
    const markAsRead = async (notificationid) => {
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/admin-notifications/${notificationid}/read`, {
                method: 'PATCH',
            });
            
            if (!response.ok) throw new Error('Failed to mark as read');
            
            setNotifications(prev =>
                prev.map(notif =>
                    notif.notificationid === notificationid ? { ...notif, isread: true } : notif
                )
            );
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/admin-notifications/read-all/operational_manager', {
                method: 'PATCH',
            });
            
            if (!response.ok) throw new Error('Failed to mark all as read');
            
            fetchNotifications();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationid) => {
        try {
            const response = await fetch(`https://gatsis-hub.vercel.app/admin-notifications/${notificationid}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) throw new Error('Failed to delete notification');
            
            setNotifications(prev => prev.filter(notif => notif.notificationid !== notificationid));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.isread) {
            markAsRead(notification.notificationid);
        }
        
        // Navigate to order detail
        if (notification.orderid) {
            navigate(`/orderdetailom/${notification.orderid}`);
        }
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment_submitted':
                return <CreditCard className="text-green-600" size={24} />;
            case 'message_received':
                return <MessageCircle className="text-blue-600" size={24} />;
            case 'order_cancelled':
                return <XCircle className="text-red-600" size={24} />;
            case 'order_created':
                return <ShoppingCart className="text-purple-600" size={24} />;
            default:
                return <Bell className="text-gray-600" size={24} />;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const unreadCount = notifications.filter(n => !n.isread).length;

    if (loading && notifications.length === 0) {
        return (
            <div className="flex w-full bg-gray-100">
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-96">
                        <LoadingSpinner size="lg" text="Loading notifications..." />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex w-full bg-gray-100">
            <main className="flex-1 p-3 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-[#191716]">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={fetchNotifications}
                        className="p-2 rounded-lg bg-white hover:bg-gray-50 border"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm ${
                                filter === 'all' ? 'bg-[#E6AF2E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm ${
                                filter === 'unread' ? 'bg-[#E6AF2E] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                    
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <CheckCheck size={18} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-lg">No notifications</p>
                            <p className="text-gray-400 text-sm mt-2">
                                {filter === 'unread' ? 'All caught up!' : 'You\'ll see updates about orders here'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.notificationid}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                        !notification.isread ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-sm md:text-base font-medium ${
                                                    !notification.isread ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isread && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            
                                            {/* Order info */}
                                            {notification.orders && (
                                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Order: {notification.orders.companyname || 'N/A'}</span>
                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                        {notification.orders.orderstatus}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <p className="text-xs text-gray-400 mt-2">{formatDate(notification.datecreated)}</p>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.notificationid);
                                            }}
                                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete notification"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationPageOM;
