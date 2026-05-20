import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { API_ROUTES } from '../../../utils/api_routes';

const ProtectResetLayers = () => {
    

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const status = await fetch(`${API_ROUTES.USERS}/VerifyTemp`, {
                    method: "GET",
                    credentials: "include"
                })
                if (status.ok) setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    if (loading) {
        return <div className="loading-screen">Verifying session...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/SignIn" replace />;
    }

    return (
        <Outlet /> 
    );
};

export default ProtectResetLayers;