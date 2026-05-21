import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./TempPageForActivation.css";
import icon from "../../../public/icon.svg"


function TempPageForActivation() {
    const [countDown, setCountDown] = useState<number>(10);
    const navigate = useNavigate();

    useEffect(() => {        
        if (countDown === 0) {
            navigate("/SignIn");
            return;
        }

        const timer = setTimeout(() => {
            setCountDown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countDown, navigate]);

    return (
        <div className="notification-screen">
            <div className="notification-card">
                
                <div className="icon-container">
                    <img src={icon} alt="App Icon" style={{ width: '24px', height: '24px' }} />
                </div>

                <h1>Activation Token Dispatched</h1>

                <p>
                    An authorization link has been routed to your registered email address to verify account ownership.
                </p>

                <div className="security-notice">
                    <span>⏱️</span>
                    <span>TTL SECURITY NOTICE: EXPIRATION WINDOW CLOCKS AT 30 MINUTES.</span>
                </div>

                <div className="status-footer">
                    <div className="routing-status">
                        <span className="pulse-indicator"></span>
                        <span>Routing client session...</span>
                    </div>
                    
                    <span className="countdown-badge">
                        REDIRECT_IN: {countDown}s
                    </span>
                </div>

            </div>
        </div>
    );
}

export default TempPageForActivation;