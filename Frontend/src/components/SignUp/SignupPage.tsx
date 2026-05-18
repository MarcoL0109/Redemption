import { useNavigate } from 'react-router-dom';
import "./SignupPage.css"
import React, { useState } from 'react';
import { FourSquare } from 'react-loading-indicators';
import { API_ROUTES } from '../../utils/api_routes'; 



function SignUpPage() {

    const navigate = useNavigate()
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [inputPassword, setInputPassword] = useState<string>("");
    const [signUpEmail, setSignUpEmail] = useState<string>("");
    const [userName, setUsername] = useState<string>("");
    const [diffPassword, setDiffPassword] = useState<boolean>(false);
    const [existingAccount, setExistingAccount] = useState<boolean>(false);
    const [displayLoading, setDisplayLoading] = useState<boolean>(false);
    const [displayErrorMessage, setDisplayErrorMessage] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    const handleInputPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInputPassword = e.target.value;
        setInputPassword(newInputPassword);
        setDiffPassword(confirmPassword !== "" && newInputPassword !== confirmPassword);
    };


    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        setDiffPassword(inputPassword !== newConfirmPassword);
    };


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setSignUpEmail(newEmail);
        setExistingAccount(false);
    }


    const handleSignUp = async (email: string, username: string, confirmPassword: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const createUserStatus = await fetch(`${API_ROUTES.USERS}/createUsers`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ email, username, confirmPassword }),
            });

            if (createUserStatus.status === 401) {
                setExistingAccount(true);
                setDisplayLoading(false);
            }
            
            if (createUserStatus.status === 200) {navigate("/ActivationTempPage");}
            else if (createUserStatus.status === 500) {setDisplayErrorMessage(true);}
            setIsSubmitting(false);

        } catch (error) {
            setDisplayErrorMessage(true);
            setIsSubmitting(false);
        }
    }

    
    const handleSignUpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setDisplayLoading(true);
        handleSignUp(signUpEmail, userName, confirmPassword)
    }

    return (
        <div className="SignUpContainer">
            <button onClick={() => navigate("/")} className="HomeButton">
                <strong>Join Room</strong>
            </button>

            <div className="SignUpBox">
                <h1 className="TitleText">REDEMPTION</h1>
                <p className="SubtitleText">NEW USER ENLISTMENT</p>
                
                <form className="SignUpForm" onSubmit={handleSignUpSubmit}>
                    <div className="InputScrollArea">
                        <input 
                            className="form_inputs"
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            required
                            value={signUpEmail}
                            onChange={handleEmailChange}
                        />
                        <input 
                            className="form_inputs"
                            type="text"
                            placeholder="USERNAME"
                            required
                            value={userName}
                            onChange={(e) => {setUsername(e.target.value)}}
                        />
                        <input 
                            className="form_inputs" 
                            type="password" 
                            placeholder="PASSWORD" 
                            required
                            value={inputPassword}
                            onChange={handleInputPasswordChange}
                        />
                        <input 
                            className="form_inputs" 
                            type="password" 
                            placeholder="CONFIRM PASSWORD" 
                            required 
                            value={confirmPassword} 
                            onChange={handleConfirmPasswordChange} 
                        />
                    </div>

                    <div className="ErrorFeedbackArea">
                        {diffPassword && <div className="ErrorMessage anim-shake">PASSWORDS_DO_NOT_MATCH</div>}
                        {existingAccount && <div className="ErrorMessage anim-shake">ID_ALREADY_EXISTS</div>}
                        {displayErrorMessage && <div className="ErrorMessage anim-shake">REGISTRATION_ERROR</div>}
                    </div>

                    {!displayLoading ?
                        <button type="submit" className="SignUpButton" disabled={diffPassword || isSubmitting}>
                            <strong>INITIALIZE ACCOUNT</strong>
                        </button> :
                        <div className="loading_icon_animations">
                            <FourSquare color="#4ecca3" size="medium" text="" />
                        </div>
                    }
                </form>
            </div>
        </div>
    )

}


export default SignUpPage