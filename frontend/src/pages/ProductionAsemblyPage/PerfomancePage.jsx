import React, { useState } from 'react';
import { Users, Package, TrendingUp, Award, AlertCircle } from 'lucide-react';

const PerformancePage = () => {
    const [selectedTeam, setSelectedTeam] = useState('All');
    
    // Hard-coded team performance data
    const teams = [
        {
            teamId: "team-001",
            teamName: "Assembly Line A",
            teamLeader: "Juan Dela Cruz",
            memberCount: 8,
            assignedOrders: [
                {
                    orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    productName: "Custom Motorcycle Frame - Sport Edition",
                    targetQuota: 100,
                    completedUnits: 85,
                    deadline: "2026-01-25T00:00:00Z",
                    status: "On Track",
                    notes: "Priority order - customer requested early delivery"
                },
                {
                    orderId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                    productName: "Standard Motorcycle Frame - Classic",
                    targetQuota: 150,
                    completedUnits: 120,
                    deadline: "2026-02-01T00:00:00Z",
                    status: "On Track",
                    notes: null
                },
                {
                    orderId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
                    productName: "Heavy Duty Frame - Touring",
                    targetQuota: 75,
                    completedUnits: 45,
                    deadline: "2026-01-30T00:00:00Z",
                    status: "At Risk",
                    notes: "Material delay - supplier issue resolved"
                }
            ]
        },
        {
            teamId: "team-002",
            teamName: "Assembly Line B",
            teamLeader: "Maria Santos",
            memberCount: 10,
            assignedOrders: [
                {
                    orderId: "d4e5f6a7-b8c9-0123-def1-234567890123",
                    productName: "Electric Motorcycle Frame",
                    targetQuota: 200,
                    completedUnits: 195,
                    deadline: "2026-01-20T00:00:00Z",
                    status: "On Track",
                    notes: "Almost complete - final inspection pending"
                },
                {
                    orderId: "e5f6a7b8-c9d0-1234-ef12-345678901234",
                    productName: "Racing Frame - Pro Series",
                    targetQuota: 50,
                    completedUnits: 25,
                    deadline: "2026-02-10T00:00:00Z",
                    status: "At Risk",
                    notes: "Complex welding required - slower than expected"
                }
            ]
        }
    ];

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            'On Track': 'bg-green-100 text-green-700 border-green-500',
            'At Risk': 'bg-yellow-100 text-yellow-700 border-yellow-500',
            'Delayed': 'bg-red-100 text-red-700 border-red-500',
            'Completed': 'bg-blue-100 text-blue-700 border-blue-500'
        };
        return statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-500';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const filteredTeams = selectedTeam === 'All' 
        ? teams 
        : teams.filter(team => team.teamName === selectedTeam);

    const uniqueTeamNames = ['All', ...new Set(teams.map(team => team.teamName))];

    return (
        <div className="flex w-full bg-gray-100">
            <main className="flex-1 p-3 md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-4xl font-bold text-[#191716] mb-2">
                        Assembly Team Performance
                    </h1>
                    <p className="text-gray-600">Track team productivity and order quotas</p>
                </div>

                {/* Team Filter */}
                <div className="mb-6">
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                        {uniqueTeamNames.map((teamName) => (
                            <button
                                key={teamName}
                                onClick={() => setSelectedTeam(teamName)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm md:text-base ${
                                    selectedTeam === teamName 
                                        ? 'bg-[#E6AF2E] text-white' 
                                        : 'bg-white hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {teamName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Teams</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                    {uniqueTeamNames.length - 1}
                                </p>
                            </div>
                            <Users size={40} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                    {teams.reduce((sum, team) => sum + team.assignedOrders.length, 0)}
                                </p>
                            </div>
                            <Package size={40} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Units</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                    {teams.reduce((sum, team) => 
                                        sum + team.assignedOrders.reduce((orderSum, order) => 
                                            orderSum + order.targetQuota, 0), 0
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp size={40} className="text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Completion</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                    {teams.length > 0 
                                        ? Math.round(
                                            teams.reduce((sum, team) => 
                                                sum + team.assignedOrders.reduce((orderSum, order) => 
                                                    orderSum + ((order.completedUnits / order.targetQuota) * 100), 0
                                                ) / Math.max(team.assignedOrders.length, 1), 0
                                            ) / teams.length
                                        )
                                        : 0
                                    }%
                                </p>
                            </div>
                            <Award size={40} className="text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Team Performance Cards */}
                <div className="space-y-6">
                    {filteredTeams.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">No team data available</p>
                        </div>
                    ) : (
                        filteredTeams.map((team) => (
                            <div key={team.teamId} className="bg-white rounded-lg shadow">
                                {/* Team Header */}
                                <div className="p-4 md:p-6 border-b border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#191716]">{team.teamName}</h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Team Leader: {team.teamLeader} • {team.memberCount} Members
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total Productivity</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    {Math.round(
                                                        team.assignedOrders.reduce((sum, order) => 
                                                            sum + ((order.completedUnits / order.targetQuota) * 100), 0
                                                        ) / Math.max(team.assignedOrders.length, 1)
                                                    )}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assigned Orders */}
                                <div className="p-4 md:p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-[#191716]">
                                        Assigned Orders ({team.assignedOrders.length})
                                    </h3>

                                    {team.assignedOrders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No orders assigned to this team
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {team.assignedOrders.map((order) => {
                                                const percentage = Math.round((order.completedUnits / order.targetQuota) * 100);
                                                
                                                return (
                                                    <div 
                                                        key={order.orderId}
                                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        ORD-{order.orderId.slice(0, 8).toUpperCase()}
                                                                    </h4>
                                                                    <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getStatusBadge(order.status)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">{order.productName}</p>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-600">Target Quota</p>
                                                                    <p className="font-semibold">{order.targetQuota.toLocaleString()} units</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-600">Completed</p>
                                                                    <p className="font-semibold text-green-600">
                                                                        {order.completedUnits.toLocaleString()} units
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-600">Remaining</p>
                                                                    <p className="font-semibold text-orange-600">
                                                                        {(order.targetQuota - order.completedUnits).toLocaleString()} units
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-600">Deadline</p>
                                                                    <p className="font-semibold">{formatDate(order.deadline)}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                                                <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                                <div 
                                                                    className={`h-3 rounded-full transition-all ${getProgressColor(percentage)}`}
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Additional Info */}
                                                        {order.notes && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                                <div className="flex items-start gap-2">
                                                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-sm text-blue-800">{order.notes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default PerformancePage;