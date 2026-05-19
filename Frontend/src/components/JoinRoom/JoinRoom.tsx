import InputPinBox from "../InputPINBox/InputPINBox";
import Overlays from "../Overlays/Overlay";
import NavBar from "../NavBar/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from '../../context/UserContext';
import "./JoimRoom.css";



function JoinRoom() {

  const navigate = useNavigate();
  const location = useLocation();
  const kickState = location.state?.kickMessage || false;
  const closeRoom = location.state?.roomClosed || false;
  const isHost = location.state?.isHost || false;
  const inActiveRoomClose = location.state?.inActiveRoomClosed || false;
  const [isKickOverlayOpen, setIsKickOverlayOpen] = useState<boolean>(false);
  const [isClosedRoomOverlayOpen, setIsClosedRoomOverlayOpen] = useState<boolean>(false);
  const [isRoomExpiredOverlayOpen, setIsRoomExpiredOverlayOpen] = useState<boolean>(false);
  const { userData, loading } = useUser();


    useEffect(() => {
        if (closeRoom && !isHost) {
            setIsClosedRoomOverlayOpen(true);
        } else if (kickState) {
            setIsKickOverlayOpen(true);
        } else if (inActiveRoomClose) {
          setIsRoomExpiredOverlayOpen(true);
        }
        navigate(location.pathname, { 
            replace: true, 
            state: {} 
        });
    }, [closeRoom, navigate, location.pathname]);


    if (loading) {
        return <nav className="NavBar"><h1 className="NavBarTitleText">Redemption</h1></nav>;
    }

    if (!userData) {
        return <nav className="NavBar">Please Log In</nav>;
    }


  const handleCloseOverlay = () => {
    setIsKickOverlayOpen(false);
    setIsClosedRoomOverlayOpen(false);
    setIsRoomExpiredOverlayOpen(false);
  }


  return (

    <div className="JoinRoomContainer">

      <Overlays isOpen={isRoomExpiredOverlayOpen}>
        <h2>Uh Oh! The Room is Expired Due to Inactivity</h2>
        <p>Have you fallen asleep? Is ok, we have closed the party for you</p>
        <div className="overlay__buttons">
            <button className="cancelDelete" onClick={handleCloseOverlay}>Close</button>
        </div>
      </Overlays>
      
      <Overlays isOpen={isKickOverlayOpen}>
        <h2>Uh Oh! You have been Removed from the Room</h2>
        <p>You may have joined a party that you are not invited to. Sure there are no hard feelings.</p>
        <div className="overlay__buttons">
            <button className="cancelDelete" onClick={handleCloseOverlay}>Close</button>
        </div>
      </Overlays>
      

      <Overlays isOpen={isClosedRoomOverlayOpen}>
        <h2>Well...The Host Shut the Party Down Early</h2>
        <p>The host shut the room down. Maybe join another one</p>
        <div className="overlay__buttons">
            <button className="cancelDelete" onClick={handleCloseOverlay}>Close</button>
        </div>
      </Overlays>
      
      {
        userData.user_id === -1 ?
        <button onClick={() => navigate("/SignIn")} className="HomeButton">
          <strong>Sign in</strong>
        </button> :
        <div className="NavbarContainer">
          <NavBar/>
        </div>
        
      }
      
      <div className="BoxContainer">
        {
          userData.user_id !== -1 ?
          <p className="TaglineText">READY FOR YOUR NEXT CHALLENGE?</p>:
          <h1>REDEMPTION</h1>
        }
        
        <InputPinBox username={userData.username} userId={userData.user_id}/>
      </div>
    </div>
  )
}


export default JoinRoom