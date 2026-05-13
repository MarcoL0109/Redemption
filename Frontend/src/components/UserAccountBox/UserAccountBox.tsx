import "./UserAccountBox.css";
import { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../context/UserContext';
import { useNavigate } from "react-router-dom";
import UserIcon from '../../assets/user_icon.svg';
import CogIcon from '../../assets/setting_icon.svg'
import CollectionIcon from '../../assets/collections.svg'
import HistoryIcon from '../../assets/history_icon.svg'



interface UserAccountBoxProps {
    onClose: () => void;
    user_data: {username: string, email: string, user_id: number, created_at: string, user_icon: string};
}

const UserAccountBox: React.FC<UserAccountBoxProps> = ({ onClose, user_data }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    // @ts-ignore
    const USER_API_URL = process.env.VITE_USER_API_URL;
    const nevigate = useNavigate();
    const { logout } = useUser();


    const handleLogOut = async () => {
        const logout_response = await fetch(`${USER_API_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
        if (logout_response.status === 200) {
            logout();
            nevigate("/SignIn")
        }
    }


    const handleDirectHistoryPage = () => {
        nevigate(`/HistoryPage/`);
    }

    const handleDirectUserProfile = () => {
        nevigate(`/UserProfilePage/${user_data.user_id}`);
    }


    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setIsVisible(true);
        });
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            cancelAnimationFrame(id);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [onClose]);

    
    return (
        <div className={`AccountInfoBox ${isVisible ? "show": ""}`} ref={ref}>
            <div className="UserNameIconContainer">
                <div className="BoxUserIconCircle">
                    {user_data.user_icon === "" ? <FontAwesomeIcon icon={faUser} size="2x" /> : 
                    <img className="UserIconImage" src={user_data.user_icon} alt="User Icon" />}
                </div>
                <div className="UserTextInfo">
                    <h2 className="UsernameHeader">{user_data.username}</h2>
                    <span className="UserStatus">Online</span>
                </div>
            </div>

            <div className="ActionButtonContainer">
                <div className="ActionButton" onClick={handleDirectUserProfile}>
                    <img className="iconImage" src={UserIcon} alt="Profile"/>
                    <strong>Profile</strong>
                </div>

                <div className="ActionButton">
                    <img className="iconImage" src={CogIcon} alt="Settings"/>
                    <strong>Settings</strong>
                </div>

                <div className="ActionButton">
                    <img className="collectionImage" src={CollectionIcon} alt="Albums"/>
                    <strong>Albums</strong>
                </div>

                <div className="ActionButton" onClick={handleDirectHistoryPage}>
                    <img className="historyImage" src={HistoryIcon} alt="History"/>
                    <strong>History</strong>
                </div>
            </div>

            <div className="SignOutContainer">
                <button className="SignOutButton" onClick={handleLogOut}>
                    <FontAwesomeIcon className="LogOutIcon" icon={faArrowRightFromBracket} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default UserAccountBox;