import React, { useState, useEffect, useCallback } from 'react';
import { Send, Plus, MoreVertical, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';

const MessagesPage = () => {
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('Messages');
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    
    // Customer data is stored as 'user' in localStorage
    const customer = JSON.parse(localStorage.getItem('user'));
    const customerid = customer?.customerid;

    // Real-time message handler
    const handleNewMessage = useCallback((newMessage) => {
        // Fetch messages to get formatted version
        if (selectedContact) {
            fetchMessages(selectedContact.employeeid);
        }
    }, [selectedContact]);

    // Real-time notification handler
    const handleNewNotification = useCallback((newNotification) => {
        // Refresh notifications to get formatted version
        fetchNotifications();
    }, []);

    // Subscribe to real-time updates
    const { isSubscribed: isMessagesSubscribed } = useRealtimeMessages(
        customerid,
        selectedContact?.employeeid,
        handleNewMessage
    );

    const { isSubscribed: isNotificationsSubscribed } = useRealtimeNotifications(
        customerid,
        handleNewNotification
    );

    useEffect(() => {
        if (customerid) {
            fetchConversations();
            fetchNotifications();
        }
    }, [customerid]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://gatsis-hub.vercel.app/messages/conversations/customer/${customerid}`
            );
            const data = await response.json();
            
            setConversations(data.conversations || []);
            
            // Auto-select first conversation (usually Sales Admin)
            if (data.conversations && data.conversations.length > 0) {
                const firstConvo = data.conversations[0];
                setSelectedContact(firstConvo);
                fetchMessages(firstConvo.employeeid);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (employeeid) => {
        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/messages/conversation/${customerid}/${employeeid}`
            );
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/notifications/customer/${customerid}`
            );
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSendMessage = async () => {
        if ((message.trim() === '' && !selectedFile) || !selectedContact) return;

        try {
            setSendingMessage(true);
            
            let fileData = null;
            let messageText = message;

            // If file is selected, convert to base64
            if (selectedFile) {
                fileData = await convertFileToBase64(selectedFile);
                if (!messageText.trim()) {
                    messageText = `📎 ${selectedFile.name}`;
                }
            }

            const response = await fetch('https://gatsis-hub.vercel.app/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerid: customerid,
                    employeeid: selectedContact.employeeid, // Include employeeid to identify conversation
                    senderType: 'customer', // Explicitly mark as customer message
                    message: messageText,
                    file: fileData,
                    fileName: selectedFile?.name
                })
            });

            if (response.ok) {
                setMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Refresh messages
                fetchMessages(selectedContact.employeeid);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            await fetch(
                `https://gatsis-hub.vercel.app/notifications/${notification.id}/read`,
                { method: 'PATCH' }
            );
            
            navigate(`/orders/`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        
        // Get start of today and yesterday
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        
        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        
        // Check if message is from today
        if (date >= todayStart) return 'Today';
        
        // Check if message is from yesterday
        if (date >= yesterdayStart) return 'Yesterday';
        
        // For older messages, show the date
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'order_update': '🪝',
            'order_validated': '✅',
            'order_shipped': '🚚',
            'order_completed': '🎉',
            'order_cancelled': '❌'
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('Messages')}
                        className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'Messages'
                                ? 'bg-[#ECBA0B] text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('Notifications')}
                        className={`flex-1 py-3 text-sm font-semibold relative ${activeTab === 'Notifications'
                                ? 'bg-[#ECBA0B] text-black'
                                : 'bg-[#35408E] text-white hover:bg-indigo-800'
                            }`}
                    >
                        Notifications
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'Messages' ? (
                        // Messages List
                        <>
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No messages yet</div>
                            ) : (
                                conversations.map((contact) => (
                                    <button
                                        key={contact.employeeid}
                                        onClick={() => {
                                            setSelectedContact(contact);
                                            fetchMessages(contact.employeeid);
                                        }}
                                        className={`w-full p-4 flex items-center gap-3 border-b hover:bg-gray-50 ${
                                            selectedContact?.employeeid === contact.employeeid ? 'bg-gray-100' : ''
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-[#35408E] text-white rounded-full flex items-center justify-center text-xl font-semibold">
                                            {contact.employeename?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold text-sm">{contact.employeename}</div>
                                            <div className="text-xs text-gray-500">{contact.role}</div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatTime(contact.lastMessageTime)}
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={16} />
                                        </button>
                                    </button>
                                ))
                            )}
                        </>
                    ) : (
                        // Notifications List
                        <>
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                            !notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center bg-white flex-shrink-0 overflow-hidden">
                                                {notification.thumbnailType === 'logo' && notification.thumbnail ? (
                                                    // Show logo image
                                                    <img 
                                                        src={notification.thumbnail} 
                                                        alt="Order logo"
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                ) : notification.thumbnailType === 'color' && notification.thumbnail ? (
                                                    // Show colored box with hanger icon
                                                    <div 
                                                        className="w-full h-full flex items-center justify-center text-white text-xl"
                                                        style={{ backgroundColor: notification.thumbnail }}
                                                    >
                                                        🪝
                                                    </div>
                                                ) : notification.hangerColor ? (
                                                    // Fallback to hanger color
                                                    <div 
                                                        className="w-full h-full flex items-center justify-center text-white text-xl"
                                                        style={{ backgroundColor: notification.hangerColor }}
                                                    >
                                                        🪝
                                                    </div>
                                                ) : (
                                                    // Final fallback to notification type icon
                                                    <div className="text-2xl">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                                                <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Order: {notification.orderId?.substring(0, 18)}...
                                                </p>
                                                <p className="text-xs text-blue-600">{notification.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-[#35408E] text-white py-4 px-6 rounded-t-3xl">
                    <h2 className="text-xl font-semibold">Messages</h2>
                </div>

                {/* Messages Container */}
                {selectedContact ? (
                    <>
                        <div className="flex-1 bg-white p-6 overflow-y-auto">
                            {/* Contact Info Header */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-[#35408E] text-white rounded-full flex items-center justify-center text-3xl mb-2 font-semibold">
                                    {selectedContact.employeename?.charAt(0) || 'A'}
                                </div>
                                <h3 className="font-semibold text-lg">{selectedContact.employeename}</h3>
                                <p className="text-sm text-gray-500">{selectedContact.role}</p>
                            </div>

                            {/* Messages */}
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.messageid}
                                        className={`flex gap-3 ${
                                            msg.sender === 'customer' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {msg.sender === 'admin' && (
                                            <div className="w-10 h-10 bg-[#35408E] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                                                {msg.senderName?.charAt(0) || 'A'}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${
                                            msg.sender === 'customer' ? 'items-end' : 'items-start'
                                        }`}>
                                            <div
                                                className={`rounded-2xl px-5 py-3 max-w-md ${
                                                    msg.sender === 'customer'
                                                        ? 'bg-[#ECBA0B] text-black'
                                                        : 'bg-[#35408E] text-white'
                                                }`}
                                            >
                                                {/* Show message text only if it's not just a file indicator */}
                                                {!msg.text.startsWith('📎 ') && (
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                )}
                                                
                                                {/* File attachment display */}
                                                {msg.hasFile && msg.file && (
                                                    <div className={`${msg.text.startsWith('📎 ') ? '' : 'mt-2'} ${
                                                        msg.sender === 'customer' 
                                                            ? 'bg-yellow-100 border border-yellow-300' 
                                                            : 'bg-indigo-700 border border-indigo-600'
                                                    } rounded-lg p-2`}>
                                                        <a 
                                                            href={msg.file} 
                                                            download={msg.text.startsWith('📎 ') ? msg.text.replace('📎 ', '') : 'attachment'}
                                                            className={`flex items-center gap-2 text-sm font-medium ${
                                                                msg.sender === 'customer' ? 'text-gray-800' : 'text-white'
                                                            }`}
                                                        >
                                                            <span className="text-lg">📎</span>
                                                            <span className="flex-1">
                                                                {msg.text.startsWith('📎 ') ? msg.text.replace('📎 ', '') : 'Download File'}
                                                            </span>
                                                            <span className="text-xs opacity-75">↓</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t px-6 py-4">
                            {selectedFile && (
                                <div className="mb-2 max-w-4xl mx-auto px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
                                    <span className="text-sm text-blue-700">
                                        📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </span>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 max-w-4xl mx-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white hover:bg-indigo-800 transition-colors"
                                    title="Attach file"
                                >
                                    <Plus size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={sendingMessage}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage}
                                    className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white hover:bg-indigo-800 transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-white">
                        <p className="text-gray-500">No conversation selected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
