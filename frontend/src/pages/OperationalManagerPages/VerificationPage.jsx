import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Search, AlertTriangle, Eye, FileText, User } from 'lucide-react';

const VerificationPage = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessageText, setSuccessMessageText] = useState('');

    // Hard-coded submission data
    const [submissions, setSubmissions] = useState([
        {
            submissionId: "sub-001",
            orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            productName: "Order A",
            teamName: "Assembly Line A",
            teamLeader: "Juan Dela Cruz",
            submittedBy: "Pedro Garcia",
            submittedDate:  "2026-01-19T14:30:00Z",
            targetQuota: 100,
            reportedCompleted: 85,
            deadline: "2026-01-25T00:00:00Z",
            status: "Pending",
            priority: "High",
            notes:  "Priority order - requesting early verification",
            evidence: [
                { type: "Photo", count: 5 },
                { type: "Quality Report", count: 1 }
            ],
            verificationHistory: []
        },
        {
            submissionId: "sub-002",
            orderId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            productName: "Order B",
            teamName: "Assembly Line A",
            teamLeader: "Juan Dela Cruz",
            submittedBy: "Maria Lopez",
            submittedDate:  "2026-01-19T10:15:00Z",
            targetQuota: 150,
            reportedCompleted:  120,
            deadline: "2026-02-01T00:00:00Z",
            status: "Pending",
            priority: "Medium",
            notes: null,
            evidence: [
                { type: "Photo", count:  3 }
            ],
            verificationHistory: []
        },
        {
            submissionId: "sub-003",
            orderId:  "d4e5f6a7-b8c9-0123-def1-234567890123",
            productName: "Order C",
            teamName: "Assembly Line B",
            teamLeader: "Maria Santos",
            submittedBy:  "Carlos Reyes",
            submittedDate: "2026-01-18T16:45:00Z",
            targetQuota: 200,
            reportedCompleted:  195,
            deadline: "2026-01-20T00:00:00Z",
            status: "Verified",
            priority: "High",
            notes: "Final batch completed - ready for inspection",
            evidence: [
                { type: "Photo", count:  8 },
                { type: "Quality Report", count: 2 },
                { type: "Inspection Checklist", count: 1 }
            ],
            verificationHistory: [
                {
                    verifiedBy: "Manager Admin",
                    verifiedDate:  "2026-01-19T09:00:00Z",
                    decision: "Approved",
                    notes: "All units verified.  Quality excellent."
                }
            ]
        },
        {
            submissionId: "sub-004",
            orderId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
            productName: "Order D",
            teamName: "Assembly Line A",
            teamLeader: "Juan Dela Cruz",
            submittedBy: "Ana Santos",
            submittedDate:  "2026-01-18T11:20:00Z",
            targetQuota: 75,
            reportedCompleted:  45,
            deadline: "2026-01-30T00:00:00Z",
            status: "Rejected",
            priority: "Medium",
            notes: "Completed 45 units for verification",
            evidence: [
                { type: "Photo", count:  2 }
            ],
            verificationHistory: [
                {
                    verifiedBy: "Manager Admin",
                    verifiedDate: "2026-01-19T08:30:00Z",
                    decision: "Rejected",
                    notes: "Count mismatch - only 42 units found.  Please recount and resubmit."
                }
            ]
        },
        {
            submissionId: "sub-005",
            orderId: "e5f6a7b8-c9d0-1234-ef12-345678901234",
            productName: "Order E",
            teamName: "Assembly Line B",
            teamLeader: "Maria Santos",
            submittedBy: "Roberto Cruz",
            submittedDate:  "2026-01-19T15:00:00Z",
            targetQuota: 50,
            reportedCompleted:  25,
            deadline: "2026-02-10T00:00:00Z",
            status: "Pending",
            priority: "Low",
            notes: "First batch of complex welding completed",
            evidence: [
                { type: "Photo", count:  4 },
                { type: "Quality Report", count: 1 }
            ],
            verificationHistory:  []
        }
    ]);

    const getStatusBadge = (status) => {
        const styles = {
            'Pending':  'bg-yellow-100 text-yellow-700 border-yellow-500',
            'Verified': 'bg-green-100 text-green-700 border-green-500',
            'Rejected': 'bg-red-100 text-red-700 border-red-500'
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-500';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Pending': return <Clock size={16} />;
            case 'Verified': return <CheckCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            default: return null;
        }
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            'High': 'bg-red-50 text-red-700 border-red-300',
            'Medium': 'bg-orange-50 text-orange-700 border-orange-300',
            'Low': 'bg-blue-50 text-blue-700 border-blue-300'
        };
        return styles[priority] || 'bg-gray-50 text-gray-700 border-gray-300';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date. toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleVerifyClick = (submission) => {
        setSelectedSubmission(submission);
        setVerificationNotes('');
        setShowVerifyModal(true);
    };

    const handleVerificationSubmit = (decision) => {
        if (! selectedSubmission) return;

        const newStatus = decision === 'approve' ? 'Verified' :  'Rejected';
        
        setSubmissions(prevSubmissions =>
            prevSubmissions.map(sub => {
                if (sub.submissionId === selectedSubmission.submissionId) {
                    return {
                        ...sub,
                        status: newStatus,
                        verificationHistory:  [
                            ...sub.verificationHistory,
                            {
                                verifiedBy: "Operational Manager", // In real app, get from auth
                                verifiedDate: new Date().toISOString(),
                                decision: decision === 'approve' ? 'Approved' : 'Rejected',
                                notes: verificationNotes || 'No additional notes'
                            }
                        ]
                    };
                }
                return sub;
            })
        );

        setSuccessMessageText(
            decision === 'approve' 
                ? 'Submission verified successfully!' 
                : 'Submission rejected and returned to team.'
        );
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        setShowVerifyModal(false);
        setSelectedSubmission(null);
        setVerificationNotes('');
    };

    const filteredSubmissions = submissions
        .filter(sub => selectedFilter === 'All' || sub. status === selectedFilter)
        .filter(sub => 
            searchTerm === '' ||
            sub.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.orderId.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'Pending').length,
        verified: submissions.filter(s => s.status === 'Verified').length,
        rejected: submissions.filter(s => s.status === 'Rejected').length
    };

    return (
        <div className="flex w-full bg-gray-100 min-h-screen">
            <main className="flex-1 p-3 md:p-6">
                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
                        <CheckCircle size={20} />
                        <span className="font-medium">{successMessageText}</span>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-4xl font-bold text-[#191716] mb-2">
                        Quota Verification Dashboard
                    </h1>
                    <p className="text-gray-600">Review and verify production quota submissions</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Submissions</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#191716] mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <FileText size={32} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Review</p>
                                <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1">
                                    {stats.pending}
                                </p>
                            </div>
                            <Clock size={32} className="text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">
                                    {stats. verified}
                                </p>
                            </div>
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">
                                    {stats.rejected}
                                </p>
                            </div>
                            <XCircle size={32} className="text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 flex-1">
                            <Filter size={20} className="text-gray-500" />
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {['All', 'Pending', 'Verified', 'Rejected'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setSelectedFilter(filter)}
                                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                                            selectedFilter === filter
                                                ?  'bg-[#E6AF2E] text-white'
                                                :  'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg flex-1 md:max-w-md">
                            <Search size={20} className="text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by product, team, or order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target. value)}
                                className="bg-transparent flex-1 outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    {filteredSubmissions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">No submissions found</p>
                        </div>
                    ) : (
                        filteredSubmissions.map((submission) => {
                            const completionPercentage = Math.round(
                                (submission.reportedCompleted / submission.targetQuota) * 100
                            );

                            return (
                                <div
                                    key={submission.submissionId}
                                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4 md:p-6">
                                        {/* Header */}
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {submission.productName}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-semibold flex items-center gap-1 ${getStatusBadge(submission. status)}`}>
                                                        {getStatusIcon(submission.status)}
                                                        {submission.status}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded border font-semibold ${getPriorityBadge(submission.priority)}`}>
                                                        {submission.priority} Priority
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Order ID: ORD-{submission.orderId.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>

                                            {submission.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleVerifyClick(submission)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#E6AF2E] text-white rounded-lg hover:bg-[#d19d1f] transition-colors whitespace-nowrap"
                                                >
                                                    <Eye size={16} />
                                                    <span className="text-sm font-medium">Review & Verify</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Team</p>
                                                <p className="font-semibold text-sm">{submission.teamName}</p>
                                                <p className="text-xs text-gray-500">{submission.teamLeader}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Submitted By</p>
                                                <p className="font-semibold text-sm flex items-center gap-1">
                                                    <User size={14} />
                                                    {submission.submittedBy}
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDateShort(submission.submittedDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Target Quota</p>
                                                <p className="font-semibold text-sm">{submission.targetQuota. toLocaleString()} units</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Reported Completed</p>
                                                <p className="font-semibold text-sm text-green-600">
                                                    {submission.reportedCompleted.toLocaleString()} units
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                                                <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all ${
                                                        completionPercentage >= 90 ?  'bg-green-500' : 
                                                        completionPercentage >= 70 ? 'bg-blue-500' :
                                                        completionPercentage >= 50 ? 'bg-yellow-500' :  'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Evidence */}
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Evidence Submitted:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {submission.evidence.map((ev, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                                                    >
                                                        {ev. type} ({ev.count})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {submission.notes && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-900 mb-1">Submission Notes:</p>
                                                <p className="text-sm text-blue-800">{submission. notes}</p>
                                            </div>
                                        )}

                                        {/* Verification History */}
                                        {submission.verificationHistory. length > 0 && (
                                            <div className="border-t pt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-3">Verification History:</p>
                                                <div className="space-y-2">
                                                    {submission.verificationHistory.map((history, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`p-3 rounded border-l-4 ${
                                                                history.decision === 'Approved'
                                                                    ? 'bg-green-50 border-green-500'
                                                                    :  'bg-red-50 border-red-500'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-semibold">
                                                                    {history.decision} by {history.verifiedBy}
                                                                </span>
                                                                <span className="text-xs text-gray-600">
                                                                    {formatDate(history.verifiedDate)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{history.notes}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Verification Modal */}
                {showVerifyModal && selectedSubmission && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Verify Submission</h2>
                                    <button
                                        onClick={() => setShowVerifyModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                {/* Submission Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h3 className="font-semibold text-lg mb-3">{selectedSubmission.productName}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Order ID</p>
                                            <p className="font-medium">ORD-{selectedSubmission.orderId.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Team</p>
                                            <p className="font-medium">{selectedSubmission.teamName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Submitted By</p>
                                            <p className="font-medium">{selectedSubmission.submittedBy}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Submission Date</p>
                                            <p className="font-medium">{formatDateShort(selectedSubmission.submittedDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Target Quota</p>
                                            <p className="font-medium text-lg">{selectedSubmission.targetQuota.toLocaleString()} units</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Reported Completed</p>
                                            <p className="font-medium text-lg text-green-600">
                                                {selectedSubmission.reportedCompleted.toLocaleString()} units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning for discrepancies */}
                                {selectedSubmission.reportedCompleted > selectedSubmission.targetQuota && (
                                    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4 flex items-start gap-2">
                                        <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800">Warning</p>
                                            <p className="text-sm text-yellow-700">
                                                Reported units exceed target quota.  Please verify count carefully.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Notes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Notes (Optional)
                                    </label>
                                    <textarea
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent"
                                        placeholder="Add any notes about the verification (e.g., discrepancies found, quality issues, etc.)"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleVerificationSubmit('reject')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject Submission
                                    </button>
                                    <button
                                        onClick={() => handleVerificationSubmit('approve')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <CheckCircle size={20} />
                                        Approve & Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                . animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default VerificationPage;