import "./InputPINBox.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom";


interface InputPINProps {
    username: string,
    userId: number,
}


function InputPinBox({username, userId}: InputPINProps) {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState<string>("");
    const [displayRoomNotFound, setDisplayRoomNotFound] = useState<boolean>(false);
    const [displayRoomLocked, setDisplayRoomLocked] = useState<boolean>(false);
    //@ts-ignore
    const ROOM_MANAGEMENT_API_URL = process.env.VITE_ROOM_MANAGEMENT_API_URL;


    const handleSearchRoom = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDisplayRoomLocked(false);
        setDisplayRoomNotFound(false);
        const check_room_exist = await fetch(`${ROOM_MANAGEMENT_API_URL}/checkRoomCodeExist`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({roomCode})
        });
        if (check_room_exist.status === 404) {
            setDisplayRoomNotFound(true);
        } else if (check_room_exist.status === 200) {
            navigate(userId === -1 ? `/PlayerNamePendingPage/${roomCode}`: `/PendingStartRoom/${userId}/${username}/${roomCode}/0`)
        } else {
            setDisplayRoomLocked(true);
        }
    }


    const handleRoomCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const room_code = event.target.value;
        setRoomCode(room_code);
    }
    
    
    return (    
        <div className="InputPINBoxDiv glass-panel">
            <form className="PINForm" onSubmit={handleSearchRoom}>
                <div className="InputWrapper">
                    <input className="RoomCodeInput" 
                            type="text"
                            placeholder="ENTER PIN CODE"
                            required
                            onChange={handleRoomCodeChange}/>
                    <div className="input-line"></div>
                </div>
                
                <button className="ConfirmButton neon-btn-gold">
                    <strong>ENTER</strong>
                </button>

                <div className="ErrorContainer">
                    {(displayRoomNotFound) && (
                        <div className="ErrorMessage anim-shake">
                            <span className="RoomNotFoundErrorMessage">ACCESS DENIED: Room Not Found</span>
                        </div>
                    )}

                    {(displayRoomLocked) && (
                        <div className="ErrorMessage anim-shake">
                            <span className="RoomNotFoundErrorMessage">SECURE LOCK: Room Restricted</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}



export default InputPinBox