import React, { useState, useEffect, useCallback } from 'react';
import { Send, Plus, MoreVertical, Bell, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import LoadingSpinner from '../../components/LoadingSpinner';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
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
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:relative w-80 md:w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full z-50
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Tabs */}
                <div className="flex border-b shadow-sm">
                    <button
                        onClick={() => setActiveTab('Messages')}
                        className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold transition-all duration-200 ${activeTab === 'Messages'
                                ? 'bg-[#ECBA0B] text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('Notifications')}
                        className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold relative transition-all duration-200 ${activeTab === 'Notifications'
                                ? 'bg-[#ECBA0B] text-black'
                                : 'bg-[#35408E] text-white hover:bg-indigo-800'
                            }`}
                    >
                        Notifications
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {activeTab === 'Messages' ? (
                        // Messages List
                        <>
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    <LoadingSpinner size="sm" text="" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No messages yet</div>
                            ) : (
                                conversations.map((contact, index) => (
                                    <button
                                        key={contact.employeeid}
                                        onClick={() => {
                                            setSelectedContact(contact);
                                            fetchMessages(contact.employeeid);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full p-3 md:p-4 flex items-center gap-2 md:gap-3 border-b hover:bg-gray-50 transition-all duration-200 ${
                                            selectedContact?.employeeid === contact.employeeid ? 'bg-gray-100 border-l-4 border-[#DC3545]' : ''
                                        }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white rounded-full flex items-center justify-center text-lg md:text-xl font-semibold shadow-md flex-shrink-0">
                                            {contact.employeename?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-semibold text-sm md:text-base truncate">{contact.employeename}</div>
                                            <div className="text-xs text-gray-500 truncate">{contact.role}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <div className="text-xs text-gray-400">
                                                {formatTime(contact.lastMessageTime)}
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
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
                                notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 md:p-4 border-b hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                            !notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-gray-300 rounded flex items-center justify-center bg-white flex-shrink-0 overflow-hidden shadow-sm">
                                                {notification.thumbnailType === 'image' && notification.thumbnail ? (
                                                    // Show 3D hanger preview image
                                                    <img 
                                                        src={notification.thumbnail} 
                                                        alt="Hanger preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : notification.thumbnailType === 'color' && notification.thumbnail ? (
                                                    // Show colored box with hanger icon (fallback)
                                                    <div 
                                                        className="w-full h-full flex items-center justify-center text-white text-lg md:text-xl"
                                                        style={{ backgroundColor: notification.thumbnail }}
                                                    >
                                                        🪝
                                                    </div>
                                                ) : notification.hangerColor ? (
                                                    // Fallback to hanger color
                                                    <div 
                                                        className="w-full h-full flex items-center justify-center text-white text-lg md:text-xl"
                                                        style={{ backgroundColor: notification.hangerColor }}
                                                    >
                                                        🪝
                                                    </div>
                                                ) : (
                                                    // Final fallback to notification type icon
                                                    <div className="text-xl md:text-2xl">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-xs md:text-sm mb-1 truncate">{notification.title}</h4>
                                                <p className="text-xs md:text-sm text-gray-700 mb-1 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mb-1 truncate">
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#007BFF] to-[#0056b3] text-white py-3 md:py-4 px-4 md:px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg md:text-xl font-semibold">Messages</h2>
                        {selectedContact && (
                            <div className="hidden sm:flex items-center gap-2 ml-auto">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-200">Online</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Container */}
                {selectedContact ? (
                    <>
                        <div className="flex-1 bg-white p-3 md:p-4 lg:p-6 overflow-y-auto">
                            {/* Contact Info Header */}
                            <div className="flex flex-col items-center mb-6 md:mb-8 animate-fadeIn">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white rounded-full flex items-center justify-center text-2xl md:text-3xl mb-2 font-semibold shadow-lg">
                                    {selectedContact.employeename?.charAt(0) || 'A'}
                                </div>
                                <h3 className="font-semibold text-base md:text-lg">{selectedContact.employeename}</h3>
                                <p className="text-xs md:text-sm text-gray-500">{selectedContact.role}</p>
                            </div>

                            {/* Messages */}
                            <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
                                {messages.map((msg, index) => (
                                    <div
                                        key={msg.messageid}
                                        className={`flex gap-2 md:gap-3 animate-slideIn ${
                                            msg.sender === 'customer' ? 'justify-end' : 'justify-start'
                                        }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {msg.sender === 'admin' && (
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white rounded-full flex items-center justify-center flex-shrink-0 text-base md:text-xl font-semibold shadow-md">
                                                {msg.senderName?.charAt(0) || 'A'}
                                            </div>
                                        )}

                                        <div className={`flex flex-col max-w-[85%] sm:max-w-md ${
                                            msg.sender === 'customer' ? 'items-end' : 'items-start'
                                        }`}>
                                            <div
                                                className={`rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-sm hover:shadow-md transition-shadow ${
                                                    msg.sender === 'customer'
                                                        ? 'bg-[#F5F5F5] text-[#333333] border border-gray-300'
                                                        : 'bg-[#007BFF] text-white'
                                                }`}
                                            >
                                                {/* Show message text only if it's not just a file indicator */}
                                                {!msg.text.startsWith('📎 ') && (
                                                    <p className="text-xs md:text-sm leading-relaxed break-words">{msg.text}</p>
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
                                                            className={`flex items-center gap-2 text-xs md:text-sm font-medium ${
                                                                msg.sender === 'customer' ? 'text-gray-800' : 'text-white'
                                                            }`}
                                                        >
                                                            <span className="text-base md:text-lg">📎</span>
                                                            <span className="flex-1 truncate">
                                                                {msg.text.startsWith('📎 ') ? msg.text.replace('📎 ', '') : 'Download File'}
                                                            </span>
                                                            <span className="text-xs opacity-75">↓</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1 px-1" title={msg.timestamp}>
                                                {formatMessageTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t px-3 md:px-4 lg:px-6 py-3 md:py-4 shadow-lg">
                            {selectedFile && (
                                <div className="mb-2 max-w-4xl mx-auto px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between animate-slideIn">
                                    <span className="text-xs md:text-sm text-blue-700 truncate flex-1">
                                        📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </span>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="text-red-500 hover:text-red-700 text-sm font-semibold ml-2 flex-shrink-0"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 md:gap-3 max-w-4xl mx-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-9 h-9 md:w-10 md:h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white hover:bg-indigo-800 transition-all duration-200 hover:scale-110 shadow-md flex-shrink-0"
                                    title="Attach file"
                                >
                                    <Plus size={18} className="md:w-5 md:h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-full px-4 md:px-5 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base transition-all"
                                    disabled={sendingMessage}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage}
                                    className="w-9 h-9 md:w-10 md:h-10 bg-[#007BFF] rounded-full flex items-center justify-center text-white hover:bg-[#0056b3] transition-all duration-200 hover:scale-110 disabled:opacity-50 shadow-md flex-shrink-0"
                                >
                                    <Send size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-white">
                        <div className="text-center animate-fadeIn">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={40} className="text-gray-400 md:w-12 md:h-12" />
                            </div>
                            <p className="text-gray-500 text-sm md:text-base">Select a conversation to start messaging</p>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden mt-4 px-4 py-2 bg-[#35408E] text-white rounded-lg hover:bg-indigo-800 transition-colors"
                            >
                                View Messages
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
