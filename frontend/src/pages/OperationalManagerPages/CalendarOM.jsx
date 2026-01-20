import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { useRealtimeOrdersAdmin } from '../../hooks/useRealtimeOrdersAdmin'

const CalendarOM = () => {
    const navigate = useNavigate();
    
    // State management for current date, events, and view mode
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'year'
    const [events, setEvents] = useState([]);
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Real-time order update handler
    const handleOrderUpdate = useCallback((payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refetch orders to update calendar events
            fetchOrdersWithDeadlines();
        } else if (payload.eventType === 'DELETE') {
            // Remove event from calendar
            setEvents(prev => 
                prev.filter(event => event.orderId !== payload.old.orderid)
            );
        }
    }, []);

    // Subscribe to real-time order updates
    const { isSubscribed } = useRealtimeOrdersAdmin(handleOrderUpdate);

    // Fetch orders with deadlines and quotas from backend
    useEffect(() => {
        fetchOrdersWithDeadlines();
        fetchQuotas();
    }, []);

    const fetchOrdersWithDeadlines = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://gatsis-hub.vercel.app/orders/all');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }

            // Filter orders that have deadlines and map to calendar events
            const deadlineEvents = data.orders
                .filter(order => order.deadline) // Only orders with deadline
                .map(order => {
                    const deadlineDate = new Date(order.deadline);
                    return {
                        type: 'deadline',
                        date: deadlineDate.getDate(),
                        month: deadlineDate.getMonth(),
                        year: deadlineDate.getFullYear(),
                        title: `Deadline: ${order.companyname || 'Order'}`,
                        orderId: order.orderid,
                        orderStatus: order.orderstatus,
                        companyName: order.companyname
                    };
                });

            setEvents(deadlineEvents);
            setError('');
        } catch (err) {

            setError('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuotas = async () => {
        try {
            const response = await fetch('https://gatsis-hub.vercel.app/quotas');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch quotas');
            }

            setQuotas(data.quotas || []);
        } catch (err) {

        }
    };

    // Array of month names for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']

    // Array of day names for calendar header
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Navigation handlers to move between periods based on view mode
    const previousPeriod = () => {
        if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
        } else if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        }
    };

    const nextPeriod = () => {
        if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
        } else if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        }
    };

    // Calculate calendar grid data
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // Get first day of month and total days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        // Create array of day objects for the calendar grid
        const days = []

        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push({ date: null, isCurrentMonth: false })
        }

        // Add all days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, isCurrentMonth: true })
        }

        // Add days from next month to complete the grid
        const remainingCells = 35 - days.length; // Ensure 5 rows minimum
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ date: i, isCurrentMonth: false })
        }

        return days
    };

    // Get events for a specific date
    const getEventsForDate = (date, month, year) => {
        return events.filter(event => 
            event.date === date && 
            event.month === month && 
            event.year === year
        );
    };

    // Get events for a specific month
    const getEventsForMonth = (month, year) => {
        return events.filter(event => 
            event.month === month && 
            event.year === year
        );
    };

    // Get quotas active on a specific date
    const getQuotasForDate = (date, month, year) => {
        const checkDate = new Date(year, month, date);
        return quotas.filter(quota => {
            if (!quota.startdate && !quota.enddate) return false;
            const start = quota.startdate ? new Date(quota.startdate) : new Date(0);
            const end = quota.enddate ? new Date(quota.enddate) : new Date(9999, 11, 31);
            return checkDate >= start && checkDate <= end;
        });
    };

    // Get quotas active during a month
    const getQuotasForMonth = (month, year) => {
        return quotas.filter(quota => {
            if (!quota.startdate && !quota.enddate) return false;
            const start = quota.startdate ? new Date(quota.startdate) : new Date(0);
            const end = quota.enddate ? new Date(quota.enddate) : new Date(9999, 11, 31);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return (start <= monthEnd && end >= monthStart);
        });
    };

    // Handle deadline click to navigate to order detail (OM doesn't have order detail page yet)
    const handleDeadlineClick = (orderId) => {
        // For now, navigate to orders page
        // TODO: Create OM order detail page
        navigate(`/orderdetailOM/${orderId}`);
    };

    // Handle month click in year view
    const handleMonthClick = (monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setViewMode('month');
    };

    // Render Monthly View
    const renderMonthView = () => {
        return (
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-7">
                    {/* Day of Week Headers */}
                    {dayNames.map((day, index) => (
                        <div
                            key={index}
                            className="bg-[#191716] text-white p-3 text-center font-semibold text-sm border-r border-[#1D2D5F] last:border-r-0"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Calendar Day Cells */}
                    {getDaysInMonth().map((day, index) => {
                        const dayEvents = day.isCurrentMonth ? getEventsForDate(
                            day.date, 
                            currentDate.getMonth(), 
                            currentDate.getFullYear()
                        ) : [];

                        const dayQuotas = day.isCurrentMonth ? getQuotasForDate(
                            day.date,
                            currentDate.getMonth(),
                            currentDate.getFullYear()
                        ) : [];

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] p-2 border border-gray-200 ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                                    }`}
                            >
                                {/* Date Number */}
                                {day.date && (
                                    <div className="font-semibold text-lg mb-1">{day.date}</div>
                                )}

                                {/* Quota Display */}
                                {dayQuotas.map((quota, idx) => (
                                    <div
                                        key={`quota-${idx}`}
                                        className="bg-green-100 border border-green-300 text-green-800 text-xs px-2 py-1 rounded mb-1"
                                        title={`Quota: ${quota.quotaname}\nTarget: ${quota.targetquota}\nStatus: ${quota.status}`}
                                    >
                                        <div className="font-semibold truncate">📊 {quota.quotaname}</div>
                                        <div className="text-[10px]">{quota.status}</div>
                                    </div>
                                ))}

                                {/* Event Display */}
                                {dayEvents.map((event, idx) => (
                                    <div
                                        key={`event-${idx}`}
                                        onClick={() => handleDeadlineClick(event.orderId)}
                                        className="bg-[#F71735] text-white text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:bg-[#2c3575] transition-colors"
                                        title={`${event.companyName} - ${event.orderStatus}\nClick to view order details`}
                                    >
                                        <div className="font-semibold truncate">{event.companyName}</div>
                                        <div className="text-[10px] opacity-90">{event.orderStatus}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Yearly View
    const renderYearView = () => {
        const year = currentDate.getFullYear();
        
        return (
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                    {monthNames.map((monthName, monthIndex) => {
                        const monthEvents = getEventsForMonth(monthIndex, year);
                        const firstDay = new Date(year, monthIndex, 1).getDay();
                        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

                        return (
                            <div 
                                key={monthIndex} 
                                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleMonthClick(monthIndex)}
                            >
                                {/* Month Name */}
                                <h3 className="text-lg font-bold text-center mb-3 text-[#191016]">
                                    {monthName}
                                </h3>

                                {/* Mini Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Day Headers */}
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <div key={i} className="text-xs text-gray-500 text-center font-semibold">
                                            {d}
                                        </div>
                                    ))}

                                    {/* Empty cells before first day */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="text-xs p-1"></div>
                                    ))}

                                    {/* Days of month */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const date = i + 1;
                                        const hasEvent = getEventsForDate(date, monthIndex, year).length > 0;

                                        return (
                                            <div 
                                                key={i} 
                                                className={`text-xs p-1 text-center rounded ${
                                                    hasEvent 
                                                        ? 'bg-[#F71735] text-white font-bold' 
                                                        : 'hover:bg-gray-100'
                                                }`}
                                            >
                                                {date}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Event Count Badge */}
                                {monthEvents.length > 0 && (
                                    <div className="mt-3 text-center">
                                        <span className="bg-[#F71735] text-white text-xs px-2 py-1 rounded-full">
                                            {monthEvents.length} {monthEvents.length === 1 ? 'deadline' : 'deadlines'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Day View
    const renderDayView = () => {
        const dayEvents = getEventsForDate(
            currentDate.getDate(), 
            currentDate.getMonth(), 
            currentDate.getFullYear()
        );

        const dayQuotas = getQuotasForDate(
            currentDate.getDate(),
            currentDate.getMonth(),
            currentDate.getFullYear()
        );

        return (
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-[#191016]">
                        {monthNames[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
                    </h2>

                    {/* Active Quotas Section */}
                    {dayQuotas.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">📊 Active Quotas</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {dayQuotas.map((quota, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-lg text-green-800">
                                                {quota.quotaname}
                                            </h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                quota.status === 'Active' ? 'bg-green-200 text-green-800' :
                                                quota.status === 'Completed' ? 'bg-blue-200 text-blue-800' :
                                                'bg-gray-200 text-gray-800'
                                            }`}>
                                                {quota.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <div>Target: <span className="font-semibold">{quota.targetquota}</span> units</div>
                                            <div>Finished: <span className="font-semibold">{quota.finishedquota || 0}</span> units</div>
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full" 
                                                        style={{ width: `${Math.min(100, (quota.finishedquota / quota.targetquota) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {quota.teams && quota.teams.length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Teams: {quota.teams.map(t => t.teamname).join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orders Section */}
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">📦 Orders Due</h3>
                    {dayEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">No orders due on this day</div>
                            <div className="text-gray-500 mt-2">Orders with deadlines will appear here</div>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {dayEvents.map((event, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleDeadlineClick(event.orderId)}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-[#35408E]"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg text-[#191716] truncate">
                                            {event.companyName}
                                        </h3>
                                        <span className="bg-[#ECBA0B] text-[#191716] text-xs px-2 py-1 rounded-full ml-2">
                                            {event.orderStatus}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Order ID: {event.orderId}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">
                                        Deadline: {monthNames[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex h-screen bg-gray-100">
            {/* Main Calendar Content Area */}
            <div className="flex-1 p-8">
                <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
                    {/* Calendar Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold">Calendar</h1>
                            {loading && <span className="text-sm text-gray-500">Loading deadlines...</span>}
                            {error && <span className="text-sm text-red-500">{error}</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Calendar view:</span>
                            {/* View mode toggle buttons */}
                            <button 
                                onClick={() => setViewMode('day')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                    viewMode === 'day' 
                                        ? 'bg-[#ECBA0B] text-[#191716] hover:text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Day
                            </button>
                            <button 
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                    viewMode === 'month' 
                                        ? 'bg-[#ECBA0B] text-[#191716] hover:text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Month
                            </button>
                            <button 
                                onClick={() => setViewMode('year')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                    viewMode === 'year' 
                                        ? 'bg-[#ECBA0B] text-[#191716] hover:text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Year
                            </button>
                        </div>
                    </div>

                    {/* Period Navigation */}
                    <div className="px-6 py-4 flex items-center justify-end border-b">
                        <button
                            onClick={previousPeriod}
                            className="p-2 hover:bg-gray-100 rounded"
                            aria-label={
                                viewMode === 'year' ? 'Previous year' : 
                                viewMode === 'day' ? 'Previous day' : 'Previous month'
                            }
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="mx-4 font-semibold min-w-[140px] text-center">
                            {viewMode === 'year' 
                                ? currentDate.getFullYear()
                                : viewMode === 'day'
                                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
                                : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                            }
                        </span>
                        <button
                            onClick={nextPeriod}
                            className="p-2 hover:bg-gray-100 rounded"
                            aria-label={
                                viewMode === 'year' ? 'Next year' : 
                                viewMode === 'day' ? 'Next day' : 'Next month'
                            }
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Content Based on View Mode */}
                    {viewMode === 'day' && renderDayView()}
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'year' && renderYearView()}
                </div>
            </div>
        </div>
    )
}

export default CalendarOM
