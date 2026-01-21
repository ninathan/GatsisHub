import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Search, AlertTriangle, Eye, FileText, User, Loader } from 'lucide-react';

const VerificationPage = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessageText, setSuccessMessageText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [managerId, setManagerId] = useState(null);

    useEffect(() => {
        // Get manager ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.employeeid) {
            setManagerId(user.employeeid);
        }
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://gatsis-hub.vercel.app/submissions');
            if (!response.ok) throw new Error('Failed to fetch submissions');
            
            const data = await response.json();
            setSubmissions(data.submissions || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setErrorMessage('Failed to load submissions');
            setLoading(false);
        }
    };

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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
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

    const handleVerificationSubmit = async (decision) => {
        if (!selectedSubmission || !managerId) {
            setErrorMessage('Manager ID not found. Please log in again.');
            return;
        }

        try {
            const approved = decision === 'approve';
            
            const response = await fetch(`https://gatsis-hub.vercel.app/submissions/${selectedSubmission.submissionid}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verified_by: managerId,
                    verification_notes: verificationNotes || null,
                    approved
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to verify submission');
            }

            setSuccessMessageText(`Submission ${approved ? 'approved' : 'rejected'} successfully${approved ? ' and quota updated' : ''}!`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            
            setShowVerifyModal(false);
            setSelectedSubmission(null);
            setVerificationNotes('');
            
            // Refresh submissions
            fetchSubmissions();
        } catch (error) {
            console.error('Error verifying submission:', error);
            setErrorMessage(error.message || 'Failed to verify submission');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };
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
        .filter(sub => selectedFilter === 'All' || sub.status === selectedFilter)
        .filter(sub => {
            if (searchTerm === '') return true;
            
            const searchLower = searchTerm.toLowerCase();
            const orderName = sub.order?.ordername?.toLowerCase() || '';
            const teamName = sub.team?.teamname?.toLowerCase() || '';
            const employeeName = `${sub.employee?.firstname || ''} ${sub.employee?.lastname || ''}`.toLowerCase();
            const quotaName = sub.quota?.quotaname?.toLowerCase() || '';
            
            return orderName.includes(searchLower) ||
                teamName.includes(searchLower) ||
                employeeName.includes(searchLower) ||
                quotaName.includes(searchLower) ||
                sub.submissionid?.toLowerCase().includes(searchLower);
        });

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

                {/* Error Message */}
                {errorMessage && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
                        <AlertTriangle size={20} />
                        <span className="font-medium">{errorMessage}</span>
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
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="animate-spin text-[#E6AF2E]" size={48} />
                    </div>
                ) : (
                <div className="space-y-4">
                    {filteredSubmissions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">No submissions found</p>
                        </div>
                    ) : (
                        filteredSubmissions.map((submission) => {
                            const targetQuota = submission.quota?.targetquota || submission.order?.quantity || 0;
                            const completionPercentage = targetQuota > 0
                                ? Math.round((submission.reported_completed / targetQuota) * 100)
                                : 0;

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
                                                        {submission.order?.ordername || submission.quota?.quotaname || 'N/A'}
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
                                                    Submission ID: {submission.submissionid?.slice(0, 8).toUpperCase() || 'N/A'}
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
                                                <p className="font-semibold text-sm">{submission.team?.teamname || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">Quota: {submission.quota?.quotaname || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Submitted By</p>
                                                <p className="font-semibold text-sm flex items-center gap-1">
                                                    <User size={14} />
                                                    {`${submission.employee?.firstname || ''} ${submission.employee?.lastname || ''}`}
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDateShort(submission.submitted_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Target Quota</p>
                                                <p className="font-semibold text-sm">{targetQuota.toLocaleString()} units</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Reported Completed</p>
                                                <p className="font-semibold text-sm text-green-600">
                                                    {submission.reported_completed?.toLocaleString() || 0} units
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
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {submission.submission_notes && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-900 mb-1">Submission Notes:</p>
                                                <p className="text-sm text-blue-800">{submission.submission_notes}</p>
                                            </div>
                                        )}

                                        {/* Verification History */}
                                        {submission.verifier && (
                                            <div className="border-t pt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-3">Verification History:</p>
                                                <div className="space-y-2">
                                                    <div
                                                        className={`p-3 rounded border-l-4 ${
                                                            submission.status === 'Verified'
                                                                ? 'bg-green-50 border-green-500'
                                                                : 'bg-red-50 border-red-500'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-semibold">
                                                                {submission.status === 'Verified' ? 'Approved' : 'Rejected'} by {`${submission.verifier?.firstname || ''} ${submission.verifier?.lastname || ''}`}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                {formatDate(submission.verified_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{submission.verification_notes || 'No notes'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                )}

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
                                    <h3 className="font-semibold text-lg mb-3">{selectedSubmission.order?.ordername || selectedSubmission.quota?.quotaname || 'N/A'}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Submission ID</p>
                                            <p className="font-medium">{selectedSubmission.submissionid?.slice(0, 8).toUpperCase() || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Team</p>
                                            <p className="font-medium">{selectedSubmission.team?.teamname || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Submitted By</p>
                                            <p className="font-medium">{`${selectedSubmission.employee?.firstname || ''} ${selectedSubmission.employee?.lastname || ''}`}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Submission Date</p>
                                            <p className="font-medium">{formatDateShort(selectedSubmission.submitted_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Target Quota</p>
                                            <p className="font-medium text-lg">{(selectedSubmission.quota?.targetquota || selectedSubmission.order?.quantity || 0).toLocaleString()} units</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Reported Completed</p>
                                            <p className="font-medium text-lg text-green-600">
                                                {selectedSubmission.reported_completed?.toLocaleString() || 0} units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning for discrepancies */}
                                {selectedSubmission.reported_completed > (selectedSubmission.quota?.targetquota || selectedSubmission.order?.quantity || 0) && (
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