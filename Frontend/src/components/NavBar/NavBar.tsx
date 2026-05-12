import "./NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import UserAccountBox from "../UserAccountBox/UserAccountBox";
import { useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserContext';
import Fire from "../../assets/Fire.svg";


const NavBar: React.FC = () => {

    const navigate = useNavigate();
    const [isDisplay, setIsDisplay] = useState<boolean>(false);    
    const { userData, loading } = useUser();

    const handleProfileClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsDisplay(prev => !prev);
    };

    if (loading) {
        return <nav className="NavBar"><h1 className="NavBarTitleText">Redemption</h1></nav>;
    }

    if (!userData) {
        return <nav className="NavBar">Please Log In</nav>;
    }

    const handleJoinRoom = () => navigate("/");
    const handleClose = () => setIsDisplay(false);

    return (
        <nav className="NavBar">
            <h1 className="NavBarTitleText" onClick={() => navigate("/Home")}><strong>Redemption</strong></h1>
            <div className="NavBarButtonsContainer">
                <div className="joinRoomButton" onClick={handleJoinRoom}>
                    <h2>Join Room</h2>
                </div>
                <img className="StreakIcon" src={Fire} alt="Streak Icon" />
                {userData.login_streak}
                <div className="UserIconCircle" onClick={handleProfileClick}>
                    {
                        userData.user_icon === "" ? <FontAwesomeIcon icon={faUser} size="3x" /> :
                        <img className="UserIconImage" src={userData.user_icon} alt="User Icon" />
                    }
                </div>
            </div>    
            
            {
                isDisplay &&
                <UserAccountBox onClose={handleClose} user_data={userData}/>
            }
        </nav>
    );
};

export default NavBar;