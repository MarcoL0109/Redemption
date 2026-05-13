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
        <nav className="NavBar glass-nav">
            <div className="NavBrand" onClick={() => navigate("/Home")}>
                <h1 className="NavBarTitleText">REDEMPTION</h1>
                <div className="brand-glow"></div>
            </div>

            <div className="NavBarButtonsContainer">
                <button className="joinRoomButton neon-btn" onClick={handleJoinRoom}>
                    <span className="btn-text">Join Room</span>
                    <div className="btn-glow"></div>
                </button>

                <div className="StatsWrapper">
                    <div className="StreakDisplay">
                        <img className="StreakIcon" src={Fire} alt="Streak" />
                        <span className="StreakCount">{userData.login_streak}</span>
                    </div>

                    <div className="UserIconCircle" onClick={handleProfileClick}>
                        {userData.user_icon === "" ? 
                            <FontAwesomeIcon icon={faUser} className="default-avatar" /> :
                            <img className="UserIconImage" src={userData.user_icon} alt="User Avatar" />
                        }
                    </div>
                </div>
            </div>    
            
            {isDisplay && <UserAccountBox onClose={handleClose} user_data={userData}/>}
        </nav>
    );
};

export default NavBar;