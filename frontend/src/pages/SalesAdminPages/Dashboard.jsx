import React, { useState } from 'react'
import { LayoutDashboard, ShoppingCart, Package, CalendarDays, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { div } from 'framer-motion/client';

const Dashboard = () => {

    //state for dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalOrders: 157,
        producedHangers: 973,
        pendingOrders: 1,
        todayQuota: {
            target: 13,
            reached: 10,
            percentage: 76
        },
        weeklyQuota: {
            target: 78,
            reached: 59,
            percentage: 76
        },
        finalQuota: {
            percentage: 76,
            dailyProgress: 65,
            weeklyProgress: 82,
            currentProgress: 76
        }
    })

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
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
            <div className="text-2xl text-gray-600 font-medium mb-2">{title}</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
            {trend && (
                <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                    <span>{Math.abs(trend)}% vs last period</span>
                </div>
            )}
        </div>
    );

    // Quota card component for displaying progress metrics
    const QuotaCard = ({ title, subtitle, percentage, reached, target }) => (
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-blue-200 text-sm mb-6">{subtitle}</p>

            {/* Circular progress indicator */}
            <div className="flex justify-center items-center mb-6 relative">
                <CircularProgress percentage={percentage} />
                <div className="absolute text-3xl font-bold">{percentage}%</div>
            </div>

            {/* Progress statistics */}
            {reached !== undefined && target !== undefined && (
                <div className="text-center">
                    <p className="text-blue-200 text-sm">
                        Quota reached: <span className="font-bold text-white">{reached}</span> / {target}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className='flex-1 flex flex-col min-h-screen bg-gray-100'>

            {/* Header */}
            <div className='bg-white shadow-sm border-b top-0 z-10'>
                <div className='px-8 py-6'>
                    <h1 className='text-4xl font-bold text-gray-900'>Dashboard</h1>
                    {/* <p>Welcome back, {User.name}! Here's your business overview </p> */}
                    <p className='text-gray-600 mt-1'>Welcome back user! Here's your business overview</p>
                </div>
            </div>

            {/* Dashboard content */}
            <div className='p-8'>
                {/* Top Statistics card */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    <StatCard
                        title="Total Orders"
                        value={dashboardData.totalOrders}
                        subtitle="As of today"
                        trend={5}
                    />
                    <StatCard
                        title="Produced Hangers for Order #1"
                        value={dashboardData.producedHangers}
                        subtitle="Order #1 in Progress"
                        trend={8.3}
                    />
                    <StatCard
                        title="Pending Orders"
                        value={dashboardData.pendingOrders}
                        subtitle="To be fulfilled"
                        trend={-2.5}
                    />
                </div>

                {/* Main Quota Overview card */}
                <div className='bg-gradient-to-br from-[#35408E] to-blue-900 rounded-2xl shadow-2xl p-8 mb-8 mt-8'>
                    <h2 className='text-3xl font-bold text-white mb-4'>Final Quota Overview</h2>

                    <div className='grid grid-cols-1 lg:grid-col-2 gap-8'>
                        {/* Large circle progress indicator */}
                        <div className='flex flex-col items-center justify-center'>
                            <div className='relative mb-4'>
                                <CircularProgress percentage={dashboardData.finalQuota.percentage} size={200} strokeWidth={16} />
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <span className='text-5xl font-bold text-white'>
                                        {dashboardData.finalQuota.percentage}%
                                    </span>
                                </div>
                            </div>
                            <p className='text-center text-white'>Overall Progress</p>
                        </div>

                        {/* Progress breakdown bars */}
                        <div className='flex flex-col justify-center space-y-6'>
                            {/* first bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-sm font-medium'>End Quota to be reached</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-3'>
                                    <div className='bg-[#EC6666] h-3 rounded-full' style={{ width: '100%' }}></div>
                                </div>

                            </div>
                            {/* second bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-sm font-medium'>Today's Quota</span>
                                    <span className='text-sm'>{dashboardData.finalQuota.dailyProgress}%</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-3'>
                                    <div className='bg-[#DAC325] h-3 rounded-full' style={{ width: `${dashboardData.finalQuota.dailyProgress}%` }}></div>
                                </div>
                            </div>

                            {/* third bar */}
                            <div>
                                <div className='flex justify-between text-white mb-2'>
                                    <span className='text-sm font-medium'>Weekly Quota</span>
                                    <span className='text-sm'>{dashboardData.finalQuota.weeklyProgress}%</span>
                                </div>
                                <div className='w-full bg-blue-800 rounded-full h-3'>
                                    <div className='bg-blue-400 h-3 rounded-full' style={{ width: `${dashboardData.finalQuota.weeklyProgress}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-white mb-2">
                                    <span className="text-sm font-medium">Current Quota</span>
                                    <span className="text-sm">{dashboardData.finalQuota.currentProgress}%</span>
                                </div>
                                <div className="w-full bg-blue-800 rounded-full h-3">
                                    <div className="bg-blue-400 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${dashboardData.finalQuota.currentProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                    {/* bottom quota cards row */}
                    <div className='grid grid-cols-1 mt-5 md:grid-cols-2 gap-8'>
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
        </div>
    )
}

export default Dashboard