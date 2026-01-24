import React, { useState, useEffect, useCallback } from "react";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import { useRealtimeMessages } from "../../hooks/useRealtimeMessages";
import LoadingSpinner from "../../components/LoadingSpinner";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const employee = JSON.parse(localStorage.getItem('employee'));
    const fileInputRef = React.useRef(null);

    // Real-time message handler
    const handleNewMessage = useCallback((newMessage) => {
        // Refresh messages when new message arrives
        if (selectedCustomer) {
            fetchMessages(selectedCustomer.customerid);
        }
    }, [selectedCustomer]);

    // Subscribe to real-time updates for selected conversation
    const { isSubscribed } = useRealtimeMessages(
        selectedCustomer?.customerid,
        employee?.employeeid,
        handleNewMessage
    );

    // Fetch all customer conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://gatsis-hub.vercel.app/messages/conversations/admin');
            const data = await response.json();
            
            setConversations(data.conversations || []);
            
            // Auto-select first conversation if exists
            if (data.conversations && data.conversations.length > 0) {
                setSelectedCustomer(data.conversations[0]);
                fetchMessages(data.conversations[0].customerid);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (customerid) => {
        try {
            const response = await fetch(
                `https://gatsis-hub.vercel.app/messages/conversation/${customerid}/${employee.employeeid}`
            );
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {

        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        fetchMessages(customer.customerid);
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

    const handleSend = async () => {
        if ((newMessage.trim() === "" && !selectedFile) || !selectedCustomer) return;

        try {
            setSendingMessage(true);
            
            let fileData = null;
            let messageText = newMessage;

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
                    customerid: selectedCustomer.customerid,
                    employeeid: employee.employeeid,
                    senderType: 'admin', // Explicitly mark as admin message
                    message: messageText,
                    file: fileData,
                    fileName: selectedFile?.name
                })
            });

            if (response.ok) {
                setNewMessage("");
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Refresh messages
                fetchMessages(selectedCustomer.customerid);
            }
        } catch (error) {

        } finally {
            setSendingMessage(false);
        }
    };

    const formatTime = (timestamp) => {
        // Convert from UTC to UTC+8 (Philippine Time)
        const date = new Date(timestamp);
        const now = new Date();
        
        // Add 8 hours to convert UTC to Philippine Time
        const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
        const utc8Now = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        
        const diffInMinutes = Math.floor((utc8Now - utc8Date) / 60000);
        
        // Get start of today and yesterday in UTC+8
        const todayStart = new Date(utc8Now.getFullYear(), utc8Now.getMonth(), utc8Now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        
        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        
        // Check if message is from today
        if (utc8Date >= todayStart) return 'Today';
        
        // Check if message is from yesterday
        if (utc8Date >= yesterdayStart) return 'Yesterday';
        
        // For older messages, show the date
        return utc8Date.toLocaleDateString('en-US');
    };

    const formatMessageTime = (timestamp) => {
        // Convert from UTC to UTC+8 (Philippine Time)
        const date = new Date(timestamp);
        // Add 8 hours to convert UTC to Philippine Time
        const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
        
        return utc8Date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
        });
    };

    const fetchCustomerOrders = async (customerid) => {
        try {
            setLoadingOrders(true);
            
            // First, get the customer's userid from the customers table
            const customerResponse = await fetch(`https://gatsis-hub.vercel.app/customers/${customerid}`);
            
            if (!customerResponse.ok) {
                console.error('Failed to fetch customer');
                setCustomerOrders([]);
                setLoadingOrders(false);
                return;
            }
            
            const customer = await customerResponse.json();
            
            if (!customer || !customer.userid) {
                console.error('Customer userid not found', customer);
                setCustomerOrders([]);
                setLoadingOrders(false);
                return;
            }
            
            const userid = customer.userid;
            
            // Now fetch orders using the userid
            const ordersResponse = await fetch(`https://gatsis-hub.vercel.app/orders/user/${userid}`);
            
            if (!ordersResponse.ok) {
                console.error('Failed to fetch orders');
                setCustomerOrders([]);
                setLoadingOrders(false);
                return;
            }
            
            const data = await ordersResponse.json();
            
            // Sort orders by date (oldest first)
            const sortedOrders = (data.orders || []).sort((a, b) => 
                new Date(a.datecreated) - new Date(b.datecreated)
            );
            
            setCustomerOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            setCustomerOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleViewOrders = () => {
        if (selectedCustomer) {
            fetchCustomerOrders(selectedCustomer.customerid);
            setShowOrdersModal(true);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className="flex w-full bg-gray-100 h-screen">
            {/* People + Chat */}
            <div className="flex flex-1">
                {/* People List */}
                <div className="w-64 border-r bg-white flex flex-col">
                    <div className="p-4 border-b bg-[#191716] text-white">
                        <h3 className="font-semibold">Customer Messages</h3>
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {loading ? (
                            <li className="p-4 text-center text-gray-500">
                                <LoadingSpinner size="sm" text="" />
                            </li>
                        ) : conversations.length === 0 ? (
                            <li className="p-4 text-center text-gray-500">No conversations yet</li>
                        ) : (
                            conversations.map((conversation) => (
                                <li
                                    key={conversation.customerid}
                                    onClick={() => handleSelectCustomer(conversation)}
                                    className={`p-3 flex items-center gap-2 hover:bg-gray-100 cursor-pointer ${
                                        selectedCustomer?.customerid === conversation.customerid ? 'bg-gray-200' : ''
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#191716] text-white flex items-center justify-center font-semibold">
                                        {conversation.companyname?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{conversation.companyname}</p>
                                        <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatTime(conversation.lastMessageTime)}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Chat Window */}
                <div className="flex flex-col flex-1">
                    {selectedCustomer ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[#191716] text-white rounded-full flex items-center justify-center font-semibold">
                                        {selectedCustomer.companyname?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-bold">{selectedCustomer.companyname}</p>
                                        <p className="text-sm text-gray-500">Customer</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleViewOrders}
                                    className="bg-[#191716] hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Customer Orders
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            msg.sender === "admin" ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`p-3 rounded-lg max-w-xs ${
                                                msg.sender === "admin"
                                                    ? "bg-[#E6AF2E] text-black"
                                                    : "bg-[#191716] text-white"
                                            }`}
                                        >
                                            {/* Show message text only if it's not just a file indicator */}
                                            {!msg.text.startsWith('📎 ') && (
                                                <p>{msg.text}</p>
                                            )}
                                            
                                            {/* File attachment display */}
                                            {msg.hasFile && msg.file && (
                                                <div className={`${msg.text.startsWith('📎 ') ? '' : 'mt-2'} ${
                                                    msg.sender === 'admin' 
                                                        ? 'bg-yellow-300 border border-yellow-500' 
                                                        : 'bg-indigo-700 border border-indigo-600'
                                                } rounded-lg p-2`}>
                                                    <a 
                                                        href={msg.file} 
                                                        download={msg.text.startsWith('📎 ') ? msg.text.replace('📎 ', '') : 'attachment'}
                                                        className={`flex items-center gap-2 text-sm font-medium ${
                                                            msg.sender === 'admin' ? 'text-gray-800' : 'text-white'
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
                                            <span className="text-xs block mt-1 text-right opacity-75" title={msg.timestamp}>
                                                {formatMessageTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t bg-white">
                                {selectedFile && (
                                    <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
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
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-[#E6AF2E] text-white p-2 rounded-full hover:bg-yellow-600 cursor-pointer"
                                        title="Attach file"
                                    >
                                        <FaPlus />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type a message"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]"
                                        disabled={sendingMessage}
                                    />
                                    <button
                                        className="bg-[#E6AF2E] text-white p-2 rounded-full hover:bg-yellow-600 disabled:opacity-50"
                                        onClick={handleSend}
                                        disabled={sendingMessage}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Orders Modal */}
            {showOrdersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
                    <div className="bg-[#1ac2ff] border-[3px] border-black shadow-[12px_12px_0_#000000] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-white border-b-[3px] border-black px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-black text-xl md:text-2xl font-black">
                                    Orders - {selectedCustomer?.companyname}
                                </h2>
                                <button
                                    onClick={() => setShowOrdersModal(false)}
                                    className="text-black hover:text-gray-700 text-3xl font-black"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
                            {loadingOrders ? (
                                <div className="flex items-center justify-center h-64">
                                    <LoadingSpinner size="lg" text="Loading orders..." />
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-700 text-lg font-semibold">No orders found for this customer</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {customerOrders.map((order) => (
                                        <div
                                            key={order.orderid}
                                            className="border-[3px] border-black p-4 bg-gray-50 shadow-[3px_3px_0_#000000]"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-black text-base md:text-lg">
                                                            ORD-{order.orderid.slice(0, 8).toUpperCase()}
                                                        </h3>
                                                        <span className={`px-3 py-1 border-[2px] border-black text-xs font-black ${
                                                            order.orderstatus === 'Completed' 
                                                                ? 'bg-[#4ade80]'
                                                                : ['Verifying Payment', 'In Production', 'Waiting for Shipment', 'In Transit'].includes(order.orderstatus)
                                                                ? 'bg-[#ffd93d]'
                                                                : 'bg-[#1ac2ff]'
                                                        }`}>
                                                            {order.orderstatus}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                                                        <div>
                                                            <span className="text-gray-600 font-semibold">Date:</span>
                                                            <span className="ml-2 font-black">{formatDate(order.datecreated)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 font-semibold">Quantity:</span>
                                                            <span className="ml-2 font-black">{order.quantity} items</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 font-semibold">Total:</span>
                                                            <span className="ml-2 font-black text-green-700">
                                                                {order.totalprice 
                                                                    ? `₱${parseFloat(order.totalprice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` 
                                                                    : 'Pending'
                                                                }
                                                            </span>
                                                        </div>
                                                        {order.deadline && (
                                                            <div>
                                                                <span className="text-gray-600 font-semibold">Deadline:</span>
                                                                <span className="ml-2 font-black">{formatDate(order.deadline)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <a
                                                        href={`/orderdetail/${order.orderid}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#ffd93d] border-[3px] border-black shadow-[3px_3px_0_#000000] hover:shadow-[1.5px_1.5px_0_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] text-black font-black px-4 py-2 inline-block transition-all text-xs md:text-sm"
                                                    >
                                                        View Details
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t-[3px] border-black px-4 md:px-6 py-3 md:py-4 flex justify-end">
                            <button
                                onClick={() => setShowOrdersModal(false)}
                                className="bg-white border-[3px] border-black shadow-[3px_3px_0_#000000] hover:shadow-[1.5px_1.5px_0_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] text-black font-black px-4 md:px-6 py-2 transition-all text-sm md:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
