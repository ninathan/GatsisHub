import React, { useState } from "react";
import { FaPaperPlane, FaPlus } from "react-icons/fa";

const Messages = () => {
    const [messages, setMessages] = useState([
        {
            sender: "admin",
            text: "Good Evening!, we had received your order details, and have already evaluated the price. Kindly check the attached file for the evaluated price of your order. Let us know if you want to continue with your order. Thank you!",
            time: "8:30pm",
        },
        {
            sender: "customer",
            text: "Hi, I have read the contract details and I'm happy to continue with my order!",
            time: "9:30pm",
        },
        {
            sender: "admin",
            text: "Great! we will update you once your order is ready for shipment.",
            time: "9:30pm",
        },
    ]);

    const [newMessage, setNewMessage] = useState("");

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        setMessages([
            ...messages,
            { sender: "admin", text: newMessage, time: "now" },
        ]);
        setNewMessage("");
    };

    return (
        <div className="flex w-full bg-gray-100">
            {/* People + Chat */}
            <div className="flex flex-1">
                {/* People List */}
                <div className="w-64 border-r bg-white">
                    <div className="flex gap-2 p-2 border-b">
                        <button className="bg-yellow-400 px-2 py-1 rounded text-sm">
                            Customer
                        </button>
                        <button className="bg-gray-200 px-2 py-1 rounded text-sm">
                            Employee
                        </button>
                    </div>
                    <ul>
                        <li className="p-3 flex items-center gap-2 hover:bg-gray-100 cursor-pointer bg-gray-200">
                            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                            <div>
                                <p className="font-semibold">Juan Corporations</p>
                                <p className="text-xs text-gray-500">Lorem ipsum…</p>
                            </div>
                        </li>
                        <li className="p-3 flex items-center gap-2 hover:bg-gray-100 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                            <div>
                                <p className="font-semibold">ABC’s Internationals</p>
                                <p className="text-xs text-gray-500">Lorem ipsum…</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Chat Window */}
                <div className="flex flex-col flex-1">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                        <div>
                            <p className="font-bold">Juan Corporations</p>
                            <p className="text-sm text-gray-500">Customer</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`p-3 rounded-lg max-w-xs ${msg.sender === "admin"
                                            ? "bg-yellow-400 text-black"
                                            : "bg-[#35408E] text-white"
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="text-xs block mt-1 text-right">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t flex items-center gap-2">
                        <button className="bg-[#35408E] text-white p-2 rounded-full">
                            <FaPlus />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
                        />
                        <button
                            className="bg-[#35408E] text-white p-2 rounded-full"
                            onClick={handleSend}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
