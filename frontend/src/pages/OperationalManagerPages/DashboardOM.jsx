import React, { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingCart, Package, CalendarDays, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { div } from 'framer-motion/client';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const DashboardOM = () => {

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
            quotasCount: 0
        },
        weeklyQuota: {
            quotaId: null,
            target: 0,
            reached: 0,
            percentage: 0,
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
    const [saving, setSaving] = useState(false);

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

            const activeQuotas = quotasData.quotas || [];
            const allOrders = ordersData.orders || [];
            
            // Calculate total orders and pending orders
            const totalOrders = allOrders.length;
            const pendingOrders = allOrders.filter(order => 
                order.orderstatus === 'For Evaluation' || order.orderstatus === 'In Production'
            ).length;

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

            // Helper function to calculate remaining working days (excluding Sundays)
            const getRemainingWorkingDays = (startDate, endDate, fromDate = today) => {
                const start = new Date(Math.max(fromDate, new Date(startDate)));
                const end = new Date(endDate);
                let workingDays = 0;
                
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    if (d.getDay() !== 0) { // Exclude Sundays
                        workingDays++;
                    }
                }
                return workingDays;
            };

            // Helper function to calculate remaining weeks
            const getRemainingWeeks = (startDate, endDate, fromDate = today) => {
                const start = new Date(Math.max(fromDate, new Date(startDate)));
                const end = new Date(endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return Math.max(1, Math.ceil(days / 7));
            };

            // Calculate aggregated daily and weekly targets from ALL active quotas
            let totalDailyTarget = 0;
            let totalDailyProduction = 0;
            let totalWeeklyTarget = 0;
            let totalWeeklyProduction = 0;
            let quotasWithDailyTargets = [];
            let quotasWithWeeklyTargets = [];

            activeQuotas.forEach(quota => {
                if (!quota.startdate || !quota.enddate) return;

                const startDate = new Date(quota.startdate);
                const endDate = new Date(quota.enddate);
                
                // Check if quota is currently active (today is within the period)
                if (today >= startDate && today <= endDate) {
                    const remaining = (quota.targetquota || 0) - (quota.finishedquota || 0);
                    
                    // Calculate daily target based on remaining work and remaining days
                    const remainingDays = getRemainingWorkingDays(startDate, endDate, today);
                    if (remainingDays > 0 && remaining > 0) {
                        const dailyTarget = Math.ceil(remaining / remainingDays);
                        totalDailyTarget += dailyTarget;
                        totalDailyProduction += (quota.daily_production || 0);
                        quotasWithDailyTargets.push({
                            name: quota.quotaname,
                            daily: dailyTarget,
                            remaining: remaining,
                            remainingDays: remainingDays
                        });
                    }
                    
                    // Calculate weekly target based on remaining work and remaining weeks
                    const remainingWeeks = getRemainingWeeks(startDate, endDate, today);
                    if (remainingWeeks > 0 && remaining > 0) {
                        const weeklyTarget = Math.ceil(remaining / remainingWeeks);
                        totalWeeklyTarget += weeklyTarget;
                        totalWeeklyProduction += (quota.weekly_production || 0);
                        quotasWithWeeklyTargets.push({
                            name: quota.quotaname,
                            weekly: weeklyTarget,
                            remaining: remaining,
                            remainingWeeks: remainingWeeks
                        });
                    }
                }
            });

            // Calculate overall progress from all active quotas
            const totalTarget = activeQuotas.reduce((sum, q) => sum + (q.targetquota || 0), 0);
            const totalFinished = activeQuotas.reduce((sum, q) => sum + (q.finishedquota || 0), 0);
            const overallPercentage = totalTarget > 0 ? Math.round((totalFinished / totalTarget) * 100) : 0;

            // Calculate today's and weekly percentages
            const todayPercentage = totalDailyTarget > 0 ? Math.round((totalDailyProduction / totalDailyTarget) * 100) : 0;
            const weeklyPercentage = totalWeeklyTarget > 0 ? Math.round((totalWeeklyProduction / totalWeeklyTarget) * 100) : 0;

            const newData = {
                totalOrders,
                producedHangers: totalFinished,
                pendingOrders,
                todayQuota: {
                    quotaId: null, // Multiple quotas, no single ID
                    target: totalDailyTarget,
                    reached: totalDailyProduction,
                    percentage: todayPercentage,
                    quotasCount: quotasWithDailyTargets.length
                },
                weeklyQuota: {
                    quotaId: null, // Multiple quotas, no single ID
                    target: totalWeeklyTarget,
                    reached: totalWeeklyProduction,
                    percentage: weeklyPercentage,
                    quotasCount: quotasWithWeeklyTargets.length
                },
                finalQuota: {
                    percentage: overallPercentage,
                    dailyProgress: todayPercentage,
                    weeklyProgress: weeklyPercentage,
                    currentProgress: overallPercentage
                }
            };

            setDashboardData(newData);

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
    const StatCard = ({ title, value, subtitle }) => (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-[#E6AF2E]">
            <div className="text-lg md:text-2xl text-[#191716] font-medium mb-2">{title}</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{value}</div>
            {subtitle && <div className="text-xs md:text-sm text-gray-500">{subtitle}</div>}
        </div>
    );

    // Quota card component for displaying progress metrics
    const QuotaCard = ({ title, subtitle, percentage, reached, target, quotasCount }) => {
        const remaining = Math.max(0, target - reached);
        
        return (
            <div className="bg-[#191716] rounded-xl shadow-lg p-6 md:p-8 text-white relative">
                {/* Quota count badge */}
                {quotasCount > 0 && (
                    <div className="absolute top-4 right-4 bg-[#E6AF2E] text-[#191716] px-3 py-1 rounded-full text-xs font-bold">
                        {quotasCount} {quotasCount === 1 ? 'Quota' : 'Quotas'}
                    </div>
                )}
                
                <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
                <p className="text-blue-200 text-xs md:text-sm mb-4 md:mb-6">{subtitle}</p>

                {/* Circular progress indicator */}
                <div className="flex justify-center items-center mb-4 md:mb-6 relative">
                    <CircularProgress percentage={percentage} size={100} strokeWidth={10} />
                    <div className="absolute text-2xl md:text-3xl font-bold">{percentage}%</div>
                </div>

                {/* Progress statistics */}
                {reached !== undefined && target !== undefined && (
                    <div className="text-center space-y-2">
                        <p className="text-blue-200 text-xs md:text-sm">
                            Quota reached: <span className="font-bold text-white">{reached}</span> / {target}
                        </p>
                        <div className="pt-2 border-t border-white/20">
                            <p className="text-xs md:text-sm text-[#E6AF2E] font-semibold">
                                Remaining: <span className="text-lg md:text-xl font-bold">{remaining}</span> units
                            </p>
                            {remaining > 0 && (
                                <p className="text-xs text-blue-200 mt-1">
                                    {remaining} more {remaining === 1 ? 'unit' : 'units'} needed to reach quota
                                </p>
                            )}
                            {remaining === 0 && target > 0 && (
                                <p className="text-xs text-green-400 mt-1 font-semibold">
                                    ✓ Quota reached!
                                </p>
                            )}
                            {target === 0 && (
                                <p className="text-xs text-gray-400 mt-1">
                                    No active quotas for this period
                                </p>
                            )}
                        </div>
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
                    <p className='text-gray-600 mt-1 text-sm md:text-base'>Welcome back! Here's your operational overview</p>
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
                        />
                    </div>
            </div>
            )}
        </div>
    )
}

export default DashboardOM
