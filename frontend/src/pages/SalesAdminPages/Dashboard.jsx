import React, { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingCart, Package, CalendarDays, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { div } from 'framer-motion/client';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const Dashboard = () => {

    //state for dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalOrders: 0,
        producedHangers: 0,
        pendingOrders: 0,
        todayQuota: {
            target: 0,
            reached: 0,
            percentage: 0
        },
        weeklyQuota: {
            target: 0,
            reached: 0,
            percentage: 0
        },
        finalQuota: {
            percentage: 0,
            dailyProgress: 0,
            weeklyProgress: 0,
            currentProgress: 0
        }
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
            
            // Fetch all active quotas
            const quotasResponse = await fetch('https://gatsis-hub.vercel.app/quotas?status=Active');
            const quotasData = await quotasResponse.json();
            
            // Fetch all orders
            const ordersResponse = await fetch('https://gatsis-hub.vercel.app/orders');
            const ordersData = await ordersResponse.json();

            const activeQuotas = quotasData.quotas || [];
            const allOrders = ordersData.orders || [];
            
            // Calculate total orders and pending orders
            const totalOrders = allOrders.length;
            const pendingOrders = allOrders.filter(order => 
                order.status === 'Pending' || order.status === 'Processing'
            ).length;

            // Find today's quota (most recent active quota)
            const today = new Date();
            const todayQuota = activeQuotas.find(quota => {
                if (!quota.startdate) return false;
                const startDate = new Date(quota.startdate);
                const endDate = quota.enddate ? new Date(quota.enddate) : null;
                
                // Check if today is within the quota period
                if (endDate) {
                    return startDate <= today && today <= endDate;
                }
                return startDate <= today;
            });

            // Find weekly quota
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay()); // Start of week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // End of week
            
            const weeklyQuota = activeQuotas.find(quota => {
                if (!quota.startdate) return false;
                const startDate = new Date(quota.startdate);
                const endDate = quota.enddate ? new Date(quota.enddate) : null;
                
                if (endDate) {
                    return startDate <= weekEnd && endDate >= weekStart;
                }
                return false;
            });

            // Calculate overall progress from all active quotas
            const totalTarget = activeQuotas.reduce((sum, q) => sum + (q.targetquota || 0), 0);
            const totalFinished = activeQuotas.reduce((sum, q) => sum + (q.finishedquota || 0), 0);
            const overallPercentage = totalTarget > 0 ? Math.round((totalFinished / totalTarget) * 100) : 0;

            // Calculate today's quota progress
            const todayTarget = todayQuota?.targetquota || 0;
            const todayFinished = todayQuota?.finishedquota || 0;
            const todayPercentage = todayTarget > 0 ? Math.round((todayFinished / todayTarget) * 100) : 0;

            // Calculate weekly quota progress
            const weeklyTarget = weeklyQuota?.targetquota || 0;
            const weeklyFinished = weeklyQuota?.finishedquota || 0;
            const weeklyPercentage = weeklyTarget > 0 ? Math.round((weeklyFinished / weeklyTarget) * 100) : 0;

            setDashboardData({
                totalOrders,
                producedHangers: totalFinished,
                pendingOrders,
                todayQuota: {
                    target: todayTarget,
                    reached: todayFinished,
                    percentage: todayPercentage
                },
                weeklyQuota: {
                    target: weeklyTarget,
                    reached: weeklyFinished,
                    percentage: weeklyPercentage
                },
                finalQuota: {
                    percentage: overallPercentage,
                    dailyProgress: todayPercentage,
                    weeklyProgress: weeklyPercentage,
                    currentProgress: overallPercentage
                }
            });

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const CircularProgress = ({ percentage, size = 120, strokeWidth = 12 }) => {
        const radius = (size - strokeWidth) / 2
        const circumference = radius * 2 * Math.PI
        const offset = circumference - (percentage / 100) * circumference

        return (
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#3b4d7a"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#fbbf24"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
        );
    };

    // Stat card component for reusable metric displays
    const StatCard = ({ title, value, subtitle, trend }) => (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-blue-600">
            <div className="text-lg md:text-2xl text-gray-600 font-medium mb-2">{title}</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{value}</div>
            {subtitle && <div className="text-xs md:text-sm text-gray-500">{subtitle}</div>}
            {trend && (
                <div className={`flex items-center mt-2 text-xs md:text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? <TrendingUp size={14} className="mr-1 md:w-4 md:h-4" /> : <TrendingDown size={14} className="mr-1 md:w-4 md:h-4" />}
                    <span>{Math.abs(trend)}% vs last period</span>
                </div>
            )}
        </div>
    );

    // Quota card component for displaying progress metrics
    const QuotaCard = ({ title, subtitle, percentage, reached, target }) => (
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl shadow-lg p-6 md:p-8 text-white">
            <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
            <p className="text-blue-200 text-xs md:text-sm mb-4 md:mb-6">{subtitle}</p>

            {/* Circular progress indicator */}
            <div className="flex justify-center items-center mb-4 md:mb-6 relative">
                <CircularProgress percentage={percentage} size={100} strokeWidth={10} />
                <div className="absolute text-2xl md:text-3xl font-bold">{percentage}%</div>
            </div>

            {/* Progress statistics */}
            {reached !== undefined && target !== undefined && (
                <div className="text-center">
                    <p className="text-blue-200 text-xs md:text-sm">
                        Quota reached: <span className="font-bold text-white">{reached}</span> / {target}
                    </p>
                </div>
            )}
        </div>
    );

    // Scroll animations
    const titleAnim = useScrollAnimation({ threshold: 0.3 });
    const statsAnim = useScrollAnimation({ threshold: 0.2 });
    const quotaAnim = useScrollAnimation({ threshold: 0.2 });
    const dailyWeeklyAnim = useScrollAnimation({ threshold: 0.2 });

    return (
        <div className='flex-1 flex flex-col min-h-screen bg-gray-100'>

            {/* Header */}
            <div className='bg-white shadow-sm border-b top-0 z-10'>
                <div 
                    ref={titleAnim.ref}
                    className={`px-4 md:px-8 py-4 md:py-6 ${
                        titleAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                    }`}
                >
                    <h1 className='text-2xl md:text-4xl font-bold text-gray-900'>Dashboard</h1>
                    {/* <p>Welcome back, {User.name}! Here's your business overview </p> */}
                    <p className='text-gray-600 mt-1 text-sm md:text-base'>Welcome back user! Here's your business overview</p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className='flex-1 flex items-center justify-center p-8'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading dashboard data...</p>
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
                    className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 ${
                        statsAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                    }`}
                >
                    <StatCard
                        title="Total Orders"
                        value={dashboardData.totalOrders}
                        subtitle="As of today"
                    />
                    <StatCard
                        title="Total Produced Hangers"
                        value={dashboardData.producedHangers}
                        subtitle="Across all quotas"
                    />
                    <StatCard
                        title="Pending Orders"
                        value={dashboardData.pendingOrders}
                        subtitle="To be fulfilled"
                    />
                </div>

                {/* Main Quota Overview card */}
                <div 
                    ref={quotaAnim.ref}
                    className={`bg-gradient-to-br from-[#35408E] to-blue-900 rounded-2xl shadow-2xl p-4 md:p-8 mb-4 md:mb-8 mt-4 md:mt-8 ${
                        quotaAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                    }`}
                >
                    <h2 className='text-xl md:text-3xl font-bold text-white mb-4'>Final Quota Overview</h2>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8'>
                        {/* Large circle progress indicator */}
                        <div className='flex flex-col items-center justify-center'>
                            <div className='relative mb-4'>
                                <CircularProgress percentage={dashboardData.finalQuota.percentage} size={160} strokeWidth={14} />
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <span className='text-3xl md:text-5xl font-bold text-white'>
                                        {dashboardData.finalQuota.percentage}%
                                    </span>
                                </div>
                            </div>
                            <p className='text-center text-white text-sm md:text-base'>Overall Progress</p>
                        </div>

                        {/* Progress breakdown bars */}
                        <div className='flex flex-col justify-center space-y-4 md:space-y-6'>
                            {/* first bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-xs md:text-sm font-medium'>End Quota to be reached</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-2 md:h-3'>
                                    <div className='bg-[#EC6666] h-2 md:h-3 rounded-full' style={{ width: '100%' }}></div>
                                </div>

                            </div>
                            {/* second bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-xs md:text-sm font-medium'>Today's Quota</span>
                                    <span className='text-xs md:text-sm'>{dashboardData.finalQuota.dailyProgress}%</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-2 md:h-3'>
                                    <div className='bg-[#DAC325] h-2 md:h-3 rounded-full' style={{ width: `${dashboardData.finalQuota.dailyProgress}%` }}></div>
                                </div>
                            </div>

                            {/* third bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-xs md:text-sm font-medium'>Weekly Quota</span>
                                    <span className='text-xs md:text-sm'>{dashboardData.finalQuota.weeklyProgress}%</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-2 md:h-3'>
                                    <div className='bg-blue-400 h-2 md:h-3 rounded-full' style={{ width: `${dashboardData.finalQuota.weeklyProgress}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-white mb-2">
                                    <span className="text-xs md:text-sm font-medium">Current Quota</span>
                                    <span className="text-xs md:text-sm">{dashboardData.finalQuota.currentProgress}%</span>
                                </div>
                                <div className="w-full bg-blue-800 rounded-full h-2 md:h-3">
                                    <div className="bg-blue-400 h-2 md:h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${dashboardData.finalQuota.currentProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                    {/* bottom quota cards row */}
                    <div 
                        ref={dailyWeeklyAnim.ref}
                        className={`grid grid-cols-1 mt-4 md:mt-5 md:grid-cols-2 gap-4 md:gap-8 ${
                            dailyWeeklyAnim.isVisible ? 'scroll-slide-up' : 'scroll-hidden'
                        }`}
                    >
                        <QuotaCard 
                            title="Today's Quota"
                            subtitle={`End Quota to be reached by the end of the day: ${dashboardData.todayQuota.target}`}
                            percentage={dashboardData.todayQuota.percentage}
                            reached={dashboardData.todayQuota.reached}
                            target={dashboardData.todayQuota.target}
                        />
                        <QuotaCard 
                            title="Weekly Quota"
                            subtitle={`End Quota to be reached by the end of the week: ${dashboardData.weeklyQuota.target}`}
                            percentage={dashboardData.weeklyQuota.percentage}
                            reached={dashboardData.weeklyQuota.reached}
                            target={dashboardData.weeklyQuota.target}
                        />
                    </div>
            </div>
            )}
        </div>
    )
}

export default Dashboard