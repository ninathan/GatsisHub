import React, { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingCart, Package, CalendarDays, MessageSquare, TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { div } from 'framer-motion/client';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {

    //state for dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        ongoingOrders: 0,
        completedOrders: 0,
        yearlyProfit: 0,
        monthlyProfit: 0,
        pendingOrdersList: [],
        ongoingOrdersList: [],
        monthlyData: []
    })
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all orders
            const ordersResponse = await fetch('https://gatsis-hub.vercel.app/orders/all');
            const ordersData = await ordersResponse.json();

            console.log('Orders Data:', ordersData);

            const allOrders = ordersData.orders || [];
            
            console.log('All Orders:', allOrders);
            
            // Get current year range
            const currentYear = new Date().getFullYear();
            const yearStart = new Date(currentYear, 0, 1); // Jan 1
            const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59); // Dec 31
            
            // Calculate total orders
            const totalOrders = allOrders.length;
            
            // Pending orders: For Evaluation, Contract Signing, Waiting for Payment
            const pendingStatuses = ['For Evaluation', 'Contract Signing', 'Waiting for Payment'];
            const pendingOrdersList = allOrders.filter(order => 
                pendingStatuses.includes(order.orderstatus)
            );
            const pendingOrders = pendingOrdersList.length;
            
            // Ongoing orders: In Production, Waiting for Shipment, In Transit
            const ongoingStatuses = ['Paid', 'In Production', 'Waiting for Shipment', 'In Transit'];
            const ongoingOrdersList = allOrders.filter(order => 
                ongoingStatuses.includes(order.orderstatus)
            );
            const ongoingOrders = ongoingOrdersList.length;
            
            // Completed orders (all completed orders, not filtered by year initially for debugging)
            const completedOrdersAll = allOrders.filter(order => order.orderstatus === 'Completed');
            
            console.log('All Completed Orders:', completedOrdersAll);
            console.log('Completed Orders Count:', completedOrdersAll.length);
            
            // Log first few completed orders to check data
            if (completedOrdersAll.length > 0) {
                console.log('Sample Completed Order:', completedOrdersAll[0]);
                console.log('Order Date:', completedOrdersAll[0].datecreated);
                console.log('Total Price:', completedOrdersAll[0].totalprice);
            }
            
            // Completed orders for the current year (using datecreated)
            const completedOrdersThisYear = completedOrdersAll.filter(order => {
                const orderDate = new Date(order.datecreated);
                const orderYear = orderDate.getFullYear();
                console.log(`Order ${order.orderid}: Year=${orderYear}, currentYear=${currentYear}`);
                return orderYear === currentYear;
            });
            
            console.log('Completed Orders This Year:', completedOrdersThisYear.length);
            
            const completedOrders = completedOrdersThisYear.length;
            
            // Calculate yearly profit from completed orders
            const yearlyProfit = completedOrdersThisYear.reduce((sum, order) => {
                const price = parseFloat(order.totalprice) || 0;
                console.log(`Adding order ${order.orderid}: price=${price}`);
                return sum + price;
            }, 0);
            
            console.log('Yearly Profit Total:', yearlyProfit);
            console.log('Yearly Profit Total:', yearlyProfit);
            
            // Calculate monthly profit (current month)
            const currentMonth = new Date().getMonth();
            const monthStart = new Date(currentYear, currentMonth, 1);
            const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
            
            console.log('Current Month:', currentMonth, 'Month Range:', monthStart, 'to', monthEnd);
            
            const completedOrdersThisMonth = completedOrdersAll.filter(order => {
                const orderDate = new Date(order.datecreated);
                const isInMonth = orderDate >= monthStart && orderDate <= monthEnd;
                console.log(`Order ${order.orderid}: date=${orderDate}, isInMonth=${isInMonth}`);
                return isInMonth;
            });
            
            console.log('Completed Orders This Month:', completedOrdersThisMonth.length);
            
            const monthlyProfit = completedOrdersThisMonth.reduce((sum, order) => {
                const price = parseFloat(order.totalprice) || 0;
                return sum + price;
            }, 0);
            
            console.log('Monthly Profit Total:', monthlyProfit);
            
            // Calculate monthly data for the year (for visualization)
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const mStart = new Date(currentYear, month, 1);
                const mEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);
                
                const monthOrders = completedOrdersAll.filter(order => {
                    const orderDate = new Date(order.datecreated);
                    return orderDate >= mStart && orderDate <= mEnd;
                });
                
                const monthProfit = monthOrders.reduce((sum, order) => {
                    const price = parseFloat(order.totalprice) || 0;
                    return sum + price;
                }, 0);
                
                monthlyData.push({
                    month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
                    profit: monthProfit,
                    orders: monthOrders.length
                });
            }
            
            console.log('Monthly Data:', monthlyData);

            const newData = {
                totalOrders,
                pendingOrders,
                ongoingOrders,
                completedOrders,
                yearlyProfit,
                monthlyProfit,
                pendingOrdersList: pendingOrdersList.slice(0, 5), // Top 5 for display
                ongoingOrdersList: ongoingOrdersList.slice(0, 5), // Top 5 for display
                monthlyData
            };

            console.log('Setting Dashboard Data:', newData);
            setDashboardData(newData);

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
            console.log('Loading set to false');
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    // Helper function to get status badge color
    const getStatusBadge = (status) => {
        const statusColors = {
            'For Evaluation': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'Contract Signing': 'bg-blue-100 text-blue-700 border-blue-300',
            'Waiting for Payment': 'bg-purple-100 text-purple-700 border-purple-300',
            'Paid': 'bg-green-100 text-green-700 border-green-300',
            'In Production': 'bg-indigo-100 text-indigo-700 border-indigo-300',
            'Waiting for Shipment': 'bg-cyan-100 text-cyan-700 border-cyan-300',
            'In Transit': 'bg-teal-100 text-teal-700 border-teal-300',
            'Completed': 'bg-green-200 text-green-800 border-green-400'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    // Stat card component for reusable metric displays
    const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
        const colorClasses = {
            blue: 'border-blue-500 bg-blue-50',
            green: 'border-green-500 bg-green-50',
            yellow: 'border-yellow-500 bg-yellow-50',
            purple: 'border-purple-500 bg-purple-50'
        };
        
        return (
            <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 ${colorClasses[color]}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lg md:text-xl text-[#191716] font-medium">{title}</div>
                    {Icon && <Icon className="text-gray-400" size={24} />}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{value}</div>
                {subtitle && <div className="text-xs md:text-sm text-gray-500">{subtitle}</div>}
            </div>
        );
    };

    // Order card component for displaying order lists
    const OrderCard = ({ title, orders, icon: Icon, emptyMessage }) => (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex items-center mb-4">
                {Icon && <Icon className="mr-2 text-[#E6AF2E]" size={24} />}
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
            </div>
            {orders.length === 0 ? (
                <p className="text-gray-500 text-sm">{emptyMessage}</p>
            ) : (
                <div className="space-y-3">
                    {orders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">Order #{order.ordernumber || order.orderid}</p>
                                <p className="text-sm text-gray-600">{order.companyname || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getStatusBadge(order.orderstatus)}`}>
                                    {order.orderstatus}
                                </span>
                                {order.totalprice && (
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                        {formatCurrency(parseFloat(order.totalprice))}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Scroll animations
    const titleAnim = useScrollAnimation({ threshold: 0.3 });
    const statsAnim = useScrollAnimation({ threshold: 0.2 });
    const profitAnim = useScrollAnimation({ threshold: 0.2 });
    const ordersAnim = useScrollAnimation({ threshold: 0.2 });

    console.log('Render - Loading:', loading, 'Error:', error);

    return (
        <div className='flex-1 flex flex-col bg-gray-100'>

            {/* Header */}
            <div className='bg-white shadow-sm border-b top-0 z-10'>
                <div 
                    ref={titleAnim.ref}
                    className={`px-4 md:px-8 py-4 md:py-6 ${
                        titleAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                    }`}
                >
                    <h1 className='text-2xl md:text-4xl font-bold text-gray-900'>Dashboard</h1>
                    <p className='text-gray-600 mt-1 text-sm md:text-base'>Welcome back! Here's your business overview</p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className='flex-1 flex items-center justify-center p-8'>
                    <div className='text-center'>
                        <LoadingSpinner size="lg" />
                        <p className='text-gray-600 mt-4'>Loading dashboard data...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className='flex-1 flex items-center justify-center p-8'>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6 max-w-md'>
                        <p className='text-red-800 font-semibold mb-2'>Error Loading Dashboard</p>
                        <p className='text-red-600 text-sm mb-4'>{error}</p>
                        <button 
                            onClick={fetchDashboardData}
                            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm'
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Dashboard content */}
            {!loading && !error && (
            <div className='p-4 md:p-8'>
                {/* Top Statistics card */}
                <div 
                    ref={statsAnim.ref}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
                >
                    <StatCard
                        title="Total Orders"
                        value={dashboardData.totalOrders}
                        subtitle="All time"
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatCard
                        title="Pending Orders"
                        value={dashboardData.pendingOrders}
                        subtitle="Awaiting action"
                        icon={Clock}
                        color="yellow"
                    />
                    <StatCard
                        title="On-Going Orders"
                        value={dashboardData.ongoingOrders}
                        subtitle="In progress"
                        icon={Package}
                        color="purple"
                    />
                    <StatCard
                        title="Completed Orders"
                        value={dashboardData.completedOrders}
                        subtitle={`This year (${new Date().getFullYear()})`}
                        icon={CheckCircle}
                        color="green"
                    />
                </div>

                {/* Profit Overview Section */}
                <div 
                    ref={profitAnim.ref}
                    className="bg-gradient-to-br from-[#191716] to-[#2d2a28] rounded-2xl shadow-2xl p-6 md:p-8 mb-6 md:mb-8 mt-6 md:mt-8"
                >
                    <div className="flex items-center mb-6">
                        <DollarSign className="mr-3 text-[#E6AF2E]" size={32} />
                        <h2 className='text-2xl md:text-3xl font-bold text-white'>Profit Overview</h2>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'>
                        {/* Yearly Profit */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <p className="text-blue-200 text-sm md:text-base mb-2">Yearly Profit ({new Date().getFullYear()})</p>
                            <p className="text-3xl md:text-5xl font-bold text-[#E6AF2E] mb-2">
                                {formatCurrency(dashboardData.yearlyProfit)}
                            </p>
                            <p className="text-blue-200 text-xs md:text-sm">
                                From {dashboardData.completedOrders} completed orders
                            </p>
                        </div>

                        {/* Monthly Profit */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <p className="text-blue-200 text-sm md:text-base mb-2">
                                This Month ({new Date().toLocaleString('default', { month: 'long' })})
                            </p>
                            <p className="text-3xl md:text-5xl font-bold text-white mb-2">
                                {formatCurrency(dashboardData.monthlyProfit)}
                            </p>
                            <p className="text-blue-200 text-xs md:text-sm">
                                {dashboardData.yearlyProfit > 0 
                                    ? `${((dashboardData.monthlyProfit / dashboardData.yearlyProfit) * 100).toFixed(1)}% of yearly profit`
                                    : 'No profit recorded yet'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Monthly Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {dashboardData.monthlyData.map((month, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-blue-200 text-xs font-semibold mb-1">{month.month}</p>
                                    <p className="text-white text-sm font-bold truncate" title={formatCurrency(month.profit)}>
                                        {month.profit > 0 ? formatCurrency(month.profit) : '₱0.00'}
                                    </p>
                                    <p className="text-blue-300 text-xs">{month.orders} orders</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div 
                    ref={ordersAnim.ref}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
                >
                    <OrderCard 
                        title="Pending Orders"
                        orders={dashboardData.pendingOrdersList}
                        icon={Clock}
                        emptyMessage="No pending orders at the moment"
                    />
                    <OrderCard 
                        title="On-Going Orders"
                        orders={dashboardData.ongoingOrdersList}
                        icon={Package}
                        emptyMessage="No ongoing orders at the moment"
                    />
                </div>
            </div>
            )}
        </div>
    )
}

export default Dashboard