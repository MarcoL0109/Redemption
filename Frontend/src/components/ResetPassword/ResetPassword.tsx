import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ResetPassword.css"
import { API_ROUTES } from "../../../utils/api_routes";


function ResetPassword() {

    const nevagate = useNavigate();
    const [inputEmail, setInputEmail] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [inputPassword, setInputPassword] = useState<string>("");
    const [diffPassword, setDiffPassword] = useState<boolean>(false);


    useEffect(() => {
        const getSessionInfo = async () => {
            const sessionResponse = await fetch(`${API_ROUTES.UTILS}/ResetsessionInfo`, {
                method: 'GET',
                credentials: "include"
            });
            if (sessionResponse.ok) {
                const sessionJSON = await sessionResponse.json();
                const sessionEmail = sessionJSON.session.email;
                setInputEmail(sessionEmail);
            }
        };
        getSessionInfo();
    }, [])


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


    const handleResetPassword = async (inputEmail: string, confirmedPassword: string) => {
        const resetPasswordStatus = await fetch(`${API_ROUTES.USERS}/ResetPassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({inputEmail, confirmedPassword})
        });
        if (resetPasswordStatus.status === 200) {
            nevagate("/SignIn", { state: {passwordResetSuccess: true} });
        } else {
            nevagate("/ForgotPassword");
        }
    }


    const handleResetPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleResetPassword(inputEmail, confirmPassword);
    }


    return (
        <div className="SignUpContainer">
            <h1 className="TitleText">REDEMPTION</h1>
            
            <div className="SignUpBox">
                <div className="BoxHeader">
                    <span className="HeaderLabel">SECURITY OVERRIDE ACTIVE</span>
                    <p className="HeaderSubtext">RE-CONFIGURE ACCESS CREDENTIALS</p>
                </div>

                <form className="SignUpForm" onSubmit={handleResetPasswordSubmit}>
                    <div className="CredentialField">
                        <label className="FieldLabel">NEW PASSKEY</label>
                        <input 
                            className="password_form_inputs" 
                            type="password" 
                            required
                            value={inputPassword}
                            onChange={handleInputPasswordChange}
                        />
                    </div>

                    <div className="CredentialField">
                        <label className="FieldLabel">VERIFY PASSKEY</label>
                        <input 
                            className="confirm_password_form_inputs" 
                            type="password" 
                            required 
                            value={confirmPassword} 
                            onChange={handleConfirmPasswordChange} 
                        />
                    </div>

                    <div className="StatusConsole">
                        {diffPassword && (
                            <div className="StatusMessage error">
                                <span className="StatusIcon">!</span>
                                <span className="StatusText">MISMATCH: CREDENTIAL SYNC FAILED</span>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="SignUpButton" disabled={diffPassword}>
                        APPLY
                    </button>
                </form>
            </div>
        </div>
    )

}

export default ResetPassword;