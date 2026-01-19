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
            quotaId: null,
            target: 0,
            reached: 0,
            percentage: 0,
            actualPercentage: 0,
            isExceeded: false,
            quotasCount: 0
        },
        weeklyQuota: {
            quotaId: null,
            target: 0,
            reached: 0,
            percentage: 0,
            actualPercentage: 0,
            isExceeded: false,
            quotasCount: 0
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
            const ordersResponse = await fetch('https://gatsis-hub.vercel.app/orders/all');
            const ordersData = await ordersResponse.json();

            console.log('Quotas Data:', quotasData);
            console.log('Orders Data:', ordersData);

            const activeQuotas = quotasData.quotas || [];
            const allOrders = ordersData.orders || [];
            
            console.log('Active Quotas:', activeQuotas);
            console.log('All Orders:', allOrders);
            
            // Calculate total orders and pending orders
            const totalOrders = allOrders.length;
            const pendingOrders = allOrders.filter(order => 
                order.orderstatus === 'For Evaluation' || order.orderstatus === 'In Production'
            ).length;

            // Helper functions for working days calculation
            const getRemainingWorkingDays = (startDate, endDate) => {
                let workingDays = 0;
                const current = new Date(startDate);
                const end = new Date(endDate);
                
                while (current <= end) {
                    // Exclude Sundays (0 = Sunday)
                    if (current.getDay() !== 0) {
                        workingDays++;
                    }
                    current.setDate(current.getDate() + 1);
                }
                
                return workingDays;
            };

            const getRemainingWeeks = (startDate, endDate) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return Math.ceil(diffDays / 7);
            };

            // Get today's date range (fix timezone issue)
            const today = new Date();
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Get week range
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            console.log('Today range:', todayStart, '-', todayEnd);
            console.log('Week range:', weekStart, '-', weekEnd);

            // Filter quotas that are active today and this week
            const todayQuotas = activeQuotas.filter(quota => {
                if (!quota.startdate || !quota.enddate) return false;
                const startDate = new Date(quota.startdate);
                const endDate = new Date(quota.enddate);
                
                // Fix timezone offset by resetting time components
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                
                const isActive = startDate <= todayEnd && endDate >= todayStart;
                console.log(`Quota ${quota.quotaid}: startDate=${startDate}, endDate=${endDate}, isActive=${isActive}`);
                return isActive;
            });

            const weeklyQuotas = activeQuotas.filter(quota => {
                if (!quota.startdate || !quota.enddate) return false;
                const startDate = new Date(quota.startdate);
                const endDate = new Date(quota.enddate);
                
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                
                return startDate <= weekEnd && endDate >= weekStart;
            });

            console.log('Today Quotas:', todayQuotas);
            console.log('Weekly Quotas:', weeklyQuotas);

            // Calculate overall progress from all active quotas
            const totalTarget = activeQuotas.reduce((sum, q) => sum + (q.targetquota || 0), 0);
            const totalFinished = activeQuotas.reduce((sum, q) => sum + (q.finishedquota || 0), 0);
            const overallPercentage = totalTarget > 0 ? Math.round((totalFinished / totalTarget) * 100) : 0;

            // Track processed orders to detect duplicates
            const processedOrderIds = new Set();

            // Calculate today's quota - aggregate all active quotas for today
            let todayTarget = 0;
            let todayProduction = 0;
            
            todayQuotas.forEach(quota => {
                const remainingDays = getRemainingWorkingDays(todayStart, new Date(quota.enddate));
                console.log(`Quota ${quota.quotaid}: Remaining working days = ${remainingDays}`);
                
                const dailyTarget = remainingDays > 0 
                    ? Math.ceil((quota.targetquota - quota.finishedquota) / remainingDays)
                    : 0;
                    
                todayTarget += dailyTarget;
                todayProduction += quota.finishedquota || 0;
                
                console.log(`Quota ${quota.quotaid}: Daily target = ${dailyTarget}, Production = ${quota.finishedquota}`);
                
                // Check for duplicate orders
                if (quota.assignedorders && Array.isArray(quota.assignedorders)) {
                    quota.assignedorders.forEach(orderId => {
                        if (processedOrderIds.has(orderId)) {
                            console.warn(`⚠️ Duplicate order detected: Order ${orderId} is in multiple quotas!`);
                        }
                        processedOrderIds.add(orderId);
                    });
                }
            });

            const todayPercentage = todayTarget > 0 ? Math.round((todayProduction / todayTarget) * 100) : 0;
            const todayPercentageCapped = Math.min(todayPercentage, 100);
            console.log(`Today Percentage: ${todayPercentage} % (Display: ${todayPercentageCapped} %)`);

            // Calculate weekly quota - aggregate all active quotas for this week
            let weeklyTarget = 0;
            let weeklyProduction = 0;
            
            weeklyQuotas.forEach(quota => {
                const remainingWeeks = getRemainingWeeks(todayStart, new Date(quota.enddate));
                console.log(`Quota ${quota.quotaid}: Remaining weeks = ${remainingWeeks}`);
                
                const weekTarget = remainingWeeks > 0 
                    ? Math.ceil((quota.targetquota - quota.finishedquota) / remainingWeeks)
                    : 0;
                    
                weeklyTarget += weekTarget;
                weeklyProduction += quota.finishedquota || 0;
                
                console.log(`Quota ${quota.quotaid}: Weekly target = ${weekTarget}, Production = ${quota.finishedquota}`);
            });

            const weeklyPercentage = weeklyTarget > 0 ? Math.round((weeklyProduction / weeklyTarget) * 100) : 0;
            const weeklyPercentageCapped = Math.min(weeklyPercentage, 100);
            console.log(`Weekly Percentage: ${weeklyPercentage} % (Display: ${weeklyPercentageCapped} %)`);

            const newData = {
                totalOrders,
                producedHangers: totalFinished,
                pendingOrders,
                todayQuota: {
                    quotaId: null,
                    target: todayTarget,
                    reached: todayProduction,
                    percentage: todayPercentageCapped,
                    actualPercentage: todayPercentage,
                    isExceeded: todayPercentage > 100,
                    quotasCount: todayQuotas.length
                },
                weeklyQuota: {
                    quotaId: null,
                    target: weeklyTarget,
                    reached: weeklyProduction,
                    percentage: weeklyPercentageCapped,
                    actualPercentage: weeklyPercentage,
                    isExceeded: weeklyPercentage > 100,
                    quotasCount: weeklyQuotas.length
                },
                finalQuota: {
                    percentage: overallPercentage,
                    dailyProgress: todayPercentageCapped,
                    weeklyProgress: weeklyPercentageCapped,
                    currentProgress: overallPercentage
                }
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
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-[#E6AF2E]">
            <div className="text-lg md:text-2xl text-[#191716] font-medium mb-2">{title}</div>
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
    const QuotaCard = ({ title, subtitle, percentage, reached, target, quotasCount, isExceeded, actualPercentage }) => {
        const remaining = Math.max(0, target - reached);
        const excess = Math.max(0, reached - target);
        
        return (
            <div className="bg-[#191716] rounded-xl shadow-lg p-6 md:p-8 text-white relative">
                <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
                <p className="text-blue-200 text-xs md:text-sm mb-4 md:mb-6">{subtitle}</p>

                {/* Circular progress indicator */}
                <div className="flex justify-center items-center mb-4 md:mb-6 relative">
                    <CircularProgress percentage={percentage} size={100} strokeWidth={10} />
                    <div className="absolute text-2xl md:text-3xl font-bold">{percentage}%</div>
                </div>

                {/* Progress statistics */}
                {quotasCount === 0 ? (
                    <div className="text-center">
                        <p className="text-blue-200 text-xs md:text-sm">No active quotas</p>
                    </div>
                ) : (
                    <div className="text-center space-y-1">
                        <p className="text-blue-200 text-xs md:text-sm">
                            Quota reached: <span className="font-bold text-white">{reached}</span> / {target}
                        </p>
                        {isExceeded ? (
                            <>
                                <p className="text-green-400 text-sm font-semibold">🎉 Quota Exceeded!</p>
                                <p className="text-green-300 text-xs">+{excess} units over target</p>
                                <p className="text-blue-200 text-xs">({actualPercentage}% of target)</p>
                            </>
                        ) : (
                            <p className="text-yellow-300 text-xs">{remaining} units remaining</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Scroll animations
    const titleAnim = useScrollAnimation({ threshold: 0.3 });
    const statsAnim = useScrollAnimation({ threshold: 0.2 });
    const quotaAnim = useScrollAnimation({ threshold: 0.2 });
    const dailyWeeklyAnim = useScrollAnimation({ threshold: 0.2 });

    console.log('Render - Loading:', loading, 'Error:', error);

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
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6AF2E] mx-auto mb-4'></div>
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
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
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
                    className="bg-[#191716] rounded-2xl shadow-2xl p-4 md:p-8 mb-4 md:mb-8 mt-4 md:mt-8"
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
                                <div className='w-full bg-[#E6AF2E] rounded-full h-2 md:h-3'>
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
                                    <div className='bg-[#DAC325] h-2 md:h-3 rounded-full' style={{ width: `${dashboardData.finalQuota.weeklyProgress}%` }}></div>
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
                        className="grid grid-cols-1 mt-4 md:mt-5 md:grid-cols-2 gap-4 md:gap-8"
                    >
                        <QuotaCard 
                            title="Today's Quota"
                            subtitle={dashboardData.todayQuota.quotasCount > 0 
                                ? `Auto-calculated from ${dashboardData.todayQuota.quotasCount} active ${dashboardData.todayQuota.quotasCount === 1 ? 'quota' : 'quotas'}`
                                : 'No active quotas for today'}
                            percentage={dashboardData.todayQuota.percentage}
                            reached={dashboardData.todayQuota.reached}
                            target={dashboardData.todayQuota.target}
                            quotasCount={dashboardData.todayQuota.quotasCount}
                            isExceeded={dashboardData.todayQuota.isExceeded}
                            actualPercentage={dashboardData.todayQuota.actualPercentage}
                        />
                        <QuotaCard 
                            title="Weekly Quota"
                            subtitle={dashboardData.weeklyQuota.quotasCount > 0 
                                ? `Auto-calculated from ${dashboardData.weeklyQuota.quotasCount} active ${dashboardData.weeklyQuota.quotasCount === 1 ? 'quota' : 'quotas'}`
                                : 'No active quotas for this week'}
                            percentage={dashboardData.weeklyQuota.percentage}
                            reached={dashboardData.weeklyQuota.reached}
                            target={dashboardData.weeklyQuota.target}
                            quotasCount={dashboardData.weeklyQuota.quotasCount}
                            isExceeded={dashboardData.weeklyQuota.isExceeded}
                            actualPercentage={dashboardData.weeklyQuota.actualPercentage}
                        />
                    </div>
            </div>
            )}
        </div>
    )
}

export default Dashboard