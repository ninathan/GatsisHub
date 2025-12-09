import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import SidebarPA from '../components/Production/SidebarPA'
import LoadingSpinner from '../components/LoadingSpinner'

const ProductionLayout = () => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if employee is logged in and has correct department
        const employeeData = localStorage.getItem('employee');
        
        if (!employeeData) {
            // Not logged in, redirect to login
            navigate('/authPA', { replace: true });
            return;
        }

        try {
            const employee = JSON.parse(employeeData);
            
            // Check if employee is from Production or Assembly department
            if (employee.assigneddepartment !== 'Production' && employee.assigneddepartment !== 'Assembly') {
                // Not authorized, redirect to login
                alert('Access denied. Only Production and Assembly employees can access this area.');
                localStorage.removeItem('employee');
                navigate('/authPA', { replace: true });
                return;
            }

            // Authorized
            setIsAuthorized(true);
        } catch (error) {
            console.error('Error parsing employee data:', error);
            localStorage.removeItem('employee');
            navigate('/authPA', { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" text="Verifying access..." />
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className='flex min-h-screen'>
            <SidebarPA />
            <Outlet />
        </div>
    )
}

export default ProductionLayout