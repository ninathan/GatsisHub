import React, { useState, useEffect, useCallback } from "react";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import { useRealtimeMessages } from "../../hooks/useRealtimeMessages";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
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
            console.error('Error fetching conversations:', error);
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
            console.error('Error fetching messages:', error);
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
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
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

    return (
        <div className="flex w-full bg-gray-100 h-screen">
            {/* People + Chat */}
            <div className="flex flex-1">
                {/* People List */}
                <div className="w-64 border-r bg-white flex flex-col">
                    <div className="p-4 border-b bg-[#35408E] text-white">
                        <h3 className="font-semibold">Customer Messages</h3>
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {loading ? (
                            <li className="p-4 text-center text-gray-500">Loading...</li>
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
                                    <div className="w-8 h-8 rounded-full bg-[#35408E] text-white flex items-center justify-center font-semibold">
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
                            <div className="p-4 border-b flex items-center gap-2 bg-white">
                                <div className="w-10 h-10 bg-[#35408E] text-white rounded-full flex items-center justify-center font-semibold">
                                    {selectedCustomer.companyname?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold">{selectedCustomer.companyname}</p>
                                    <p className="text-sm text-gray-500">Customer</p>
                                </div>
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
                                                    ? "bg-yellow-400 text-black"
                                                    : "bg-[#35408E] text-white"
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
                                        className="bg-[#35408E] text-white p-2 rounded-full hover:bg-indigo-800"
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
                                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        disabled={sendingMessage}
                                    />
                                    <button
                                        className="bg-[#35408E] text-white p-2 rounded-full hover:bg-indigo-800 disabled:opacity-50"
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
        </div>
    );
};

export default Messages;
