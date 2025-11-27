import React, { useState } from 'react';
import { Send, Plus, MoreVertical } from 'lucide-react';

const MessagesPage = () => {
    const [selectedContact, setSelectedContact] = useState('Jane Delacruz');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('Messages');

    const contacts = [
        {
            id: 1,
            name: 'Jane Delacruz',
            role: 'Sales Admin',
            lastMessage: '9m',
            avatar: '👤'
        }
    ];

    const notifications = [
        {
            id: 1,
            title: 'Order Validated',
            message: 'Your order has been validated',
            orderId: 'ORD-20250529-8743',
            timestamp: 'Tap to view it',
            icon: '🪝'
        }
    ];

    const messages = [
        {
            id: 1,
            sender: 'Jane Dela Cruz',
            role: 'Administrator',
            text: 'Good Evening!, we had receive your order kindly, and have already evaluated it and have attached the file kindly check the attached file for the details and please continue with you order. Thank you!',
            time: '8:30pm',
            isOwn: false,
            type: 'text'
        },
        {
            id: 2,
            sender: 'Jane Dela Cruz',
            role: 'Administrator',
            text: 'Contract.pdf',
            time: '8:30pm',
            isOwn: false,
            type: 'file'
        },
        {
            id: 3,
            sender: 'You',
            text: 'Hi, I have read the contract details and I\'m happy to continue with my order!',
            time: '9:30pm',
            isOwn: true,
            type: 'text'
        },
        {
            id: 4,
            sender: 'Jane Dela Cruz',
            role: 'Administrator',
            text: 'Great! we will update you once your order is ready for shipment.',
            time: '9:34pm',
            isOwn: false,
            type: 'text'
        }
    ];

    const handleSendMessage = () => {
        if (message.trim()) {
            // Handle send message logic here

            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
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
                        className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'Notifications'
                                ? 'bg-[#ECBA0B] text-black'
                                : 'bg-[#35408E] text-white hover:bg-indigo-800'
                            }`}
                    >
                        Notifications
                    </button>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'Messages' ? (
                        // Messages List
                        <>
                            {contacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact.name)}
                                    className={`w-full p-4 flex items-center gap-3 border-b hover:bg-gray-50 ${selectedContact === contact.name ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                                        {contact.avatar}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-sm">{contact.name}</div>
                                        <div className="text-xs text-gray-500">{contact.role}</div>
                                    </div>
                                    <div className="text-xs text-gray-400">{contact.lastMessage}</div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </button>
                            ))}
                        </>
                    ) : (
                        // Notifications List
                        <>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center text-2xl bg-white flex-shrink-0">
                                            {notification.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                                            <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mb-1">{notification.orderId}</p>
                                            <p className="text-xs text-blue-600">{notification.timestamp}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                <div className="flex-1 bg-white p-6 overflow-y-auto">
                    {/* Contact Info Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl mb-2">
                            👤
                        </div>
                        <h3 className="font-semibold text-lg">Jane Dela Cruz</h3>
                        <p className="text-sm text-gray-500">Administrator</p>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                {!msg.isOwn && (
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                                        👤
                                    </div>
                                )}

                                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                                    {msg.type === 'file' ? (
                                        <button className="bg-[#35408E] text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors font-medium text-sm">
                                            {msg.text}
                                        </button>
                                    ) : (
                                        <div
                                            className={`rounded-2xl px-5 py-3 max-w-md ${msg.isOwn
                                                    ? 'bg-[#ECBA0B] text-black'
                                                    : 'bg-[#35408E] text-white'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t px-6 py-4">
                    <div className="flex items-center gap-3 max-w-4xl mx-auto">
                        <button className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white hover:bg-indigo-800 transition-colors">
                            <Plus size={20} />
                        </button>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="w-10 h-10 bg-[#35408E] rounded-full flex items-center justify-center text-white hover:bg-indigo-800 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;