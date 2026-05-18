import './SignInPage.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import Eye from "../../assets/Eye.svg";
import HiddenEye from "../../assets/HiddenEye.svg";
import {API_ROUTES}  from "../../utils/api_routes";


function SignInPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    const [incorrectLoginInfo, setincorrectLoginInfo] = useState<boolean>(false);
    const [notActivated, setNotActivated] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(true);
    const { refreshUser } = useUser();
    //@ts-ignore


    const HandleSignIn = async (email: string, password: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const login_status = await fetch(`${API_ROUTES.USERS}/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })
            setincorrectLoginInfo(login_status.status === 401 || login_status.status === 404);
            setNotActivated(login_status.status === 400);
            if (login_status.status === 200) {
                refreshUser();
                const data = await login_status.json();
                const streak = data.streak;
                navigate("/Home", { state: { streak: streak } });
            }
            setIsSubmitting(false);
        } catch (error) {
            console.log(error);
            setIsSubmitting(false);
        }
    };


    const handleHiddenState = () => {
        setHidden(prev => !prev);
    }

    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        HandleSignIn(email, password)
    }

    return (
        <div className="SignInContainer">
            <button onClick={() => navigate("/")} className="HomeButton">
                <strong>Join Room</strong>
            </button>

            <div className="SignInBox">
                <h1 className="TitleText">REDEMPTION</h1>
                <p className="SubtitleText">PROVE YOUR WORTH</p>
                
                <form className="SignInForm" onSubmit={handleSubmit}>
                    <input 
                        className="email_form_inputs" 
                        type="text" 
                        placeholder="Email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <div className="InputPasswordContainer">
                        <input 
                            className="password_form_inputs" 
                            type={hidden ? "password" : "text"} 
                            placeholder="Password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <img className="EyeIcon" src={hidden ? Eye : HiddenEye} alt="Toggle" onClick={handleHiddenState}/>
                    </div>

                    {incorrectLoginInfo && <div className="ErrorMessage anim-shake">Incorrect Credentials</div>}
                    {notActivated && <div className="ErrorMessage anim-shake">Account Not Activated</div>}

                    <button type="submit" className="SignInButton" disabled={isSubmitting}>
                        <strong>{isSubmitting ? "AUTHENTICATING..." : "SIGN IN"}</strong>
                    </button>

                    <div className="AccountManagementTags">
                        <a onClick={() => navigate("/ForgotPassword")} className="ForgotPasswordTag">Forgot Password?</a>
                        <a onClick={() => navigate('/SignUp')} className="SignUpTag">Sign Up</a>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default SignInPage