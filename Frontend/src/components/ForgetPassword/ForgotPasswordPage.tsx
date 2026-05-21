import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ForgotPasswordPage.css";
import { FourSquare } from 'react-loading-indicators';
import { API_ROUTES } from '../../../utils/api_routes';


function ForgotPasswordPage() {

    const navigate = useNavigate()
    const [inputEmail, setInputEmail] = useState<string>("");
    const [userAccountNotFound, setuserAccountNotFound] = useState<boolean>(false);
    const [displayLoading, setDisplayLoading] = useState<boolean>(false);

    const handleForgotPassword = async (email: string) => {
        const resetPassword = await fetch(`${API_ROUTES.USERS}/forgotPassword`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        })
        if (resetPassword.status === 401) {
            setuserAccountNotFound(true);
            setDisplayLoading(false);
        }
        
        if (resetPassword.status === 200) {
            navigate("/ValidateResetPasswordCode");
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDisplayLoading(true);
        handleForgotPassword(inputEmail);
    }

    return (
        <div className="ForgotPasswordContainer">
            <button onClick={() => navigate("/")} className="HomeButton">
                <strong>Join Room</strong>
            </button>
            
            <div className="ForgotPasswordBox">
                <h1 className="TitleText">REDEMPTION</h1>
                <p className="SubtitleText">RECOVERY INITIALIZATION</p>
                
                <form onSubmit={handleSubmit} className="ForgotPasswordForm">
                    <div className="InputWrapper">
                        <input 
                            className="email_form_inputs"
                            type="email" 
                            placeholder="ENTER REGISTERED EMAIL"
                            required
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                        />
                    </div>

                    <div className="FeedbackArea">
                        {userAccountNotFound && (
                            <div className="ErrorMessage anim-shake">
                                <span>ERROR: ACCOUNT NOT LOCATED</span>
                            </div>
                        )}
                    </div>

                    {!displayLoading ? (
                        <button type="submit" className="SendCodeButton">
                            <strong>SEND RECOVERY CODE</strong>
                        </button>
                    ) : (
                        <div className="loading_icon_animations">
                            <FourSquare color="#4ecca3" size="medium" text="" />
                        </div>
                    )}
                </form>
            </div>
        </div>
    )

}

export default ForgotPasswordPage