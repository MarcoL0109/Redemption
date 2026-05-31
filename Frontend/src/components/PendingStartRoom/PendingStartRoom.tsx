import { io, type Socket } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Overlays from "../Overlays/Overlay";
import "./PendingStartRoon.css";
import { API_ROUTES } from "../../../utils/api_routes";



function PendingStartRoom() {

    //@ts-ignore
    const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL as string;
    const socketRef = useRef<Socket | null>(null);
    const {userId, username, roomId, problem_set_id} = useParams();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [isHost, setIsHost] = useState<boolean>(false);
    const isHostRef = useRef(isHost);
    const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
    const [hostLeave, setHostLeave] = useState<boolean>(false);
    const [partLeave, setPartLeave] = useState<boolean>(false);
    const [toggleLock, setToggleLock] = useState<boolean>(false);
    const navigate = useNavigate();


    useEffect(() => {
        isHostRef.current = isHost;
    }, [isHost]);


    const handleStoreRoomCodeRedis = async (socket_id: any, session: string) => {
        const store_socket_id_redis = await fetch(`${API_ROUTES.ROOMS}/storeRoomCodeSocketId`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({room_code: roomId, socket_id: socket_id, session_id: session, user_id: userId})
        })

        if (store_socket_id_redis.status === 500) {
            console.log("Cannot store room code in redis");
        }
    }


    const handleSetRoomHost = async (room_code: string, session_id: string) => {
        const check_is_host_repsonse = await fetch(`${API_ROUTES.ROOMS}/getRoomHost`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({room_code: room_code, session_id: session_id})
        })
        if (check_is_host_repsonse.status === 200) {
            const check_is_host_repsonse_json = await check_is_host_repsonse.json();
            const check_is_host_repsonse_res = check_is_host_repsonse_json.is_host;
            setIsHost(check_is_host_repsonse_res);
        }
    }


    const getRoomSocketId = async (room_code: string) => {
        const get_socket_id_response = await fetch(`${API_ROUTES.ROOMS}/getRoomSocketID`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({room_code: room_code})
        })
        if (get_socket_id_response.status === 200) {
            const socket_json = await get_socket_id_response.json();
            return socket_json.socket_id;
        } else {
            console.log("Internal Server Error");
        }    
    }


    const getSessionID = async () => {
        const getSessionInfoRepsonse = await fetch(`${API_ROUTES.UTILS}/SessionInfo`, {
            method: "GET",
            credentials: "include"
        })
        const session_info_body = await getSessionInfoRepsonse.json();
        return session_info_body.session.sessionID;
    }


    useEffect(() => {
        if (socketRef.current) return;
        let mounted = true;
        const socket = io(SOCKET_SERVER_URL, { 
            autoConnect: false,
            transports: ["websocket"],
            withCredentials: true
        });
        socketRef.current = socket;

        (async () => {
            try {
                const session = await getSessionID();
                if (!mounted) return;
                socket.on('returned-player-list', (list) => {
                    setPlayerList(list);
                });

                socket.on("room-closed", ({reason, message}) => {
                    if (reason === "Terminated") {
                        navigate("/", { state: {roomClosed: true, isHost: isHostRef.current} });
                    } else {
                        navigate("/", { state: {inActiveRoomClosed: true} });
                    }     
                })

                socket.on("redirect-room-members", () => {
                    navigate(`/GamePage/${userId}/${username}/${roomId}/${problem_set_id}`);
                })

                socket.on("kick-player-message", (message) => {
                    navigate("/", { state: {kickMessage: true} });
                })

                socket.on("init-room-state", (isLocked) => {
                    setToggleLock(isLocked);
                })

                socket.connect();
                socket.on('connect', async () => {
                    await handleStoreRoomCodeRedis(socket.id, session);
                    await handleSetRoomHost(roomId || "", session);
                    const join_room_socket = await getRoomSocketId(roomId || "");
                    socket.emit('join-room', { 
                        socketId: join_room_socket,
                        roomCode: roomId,
                        sessionId: session,
                        playerName: username,
                        userId: userId,
                        isLocked: Number(toggleLock).toString(),
                        checkStream: false,
                        problemSetId: problem_set_id,
                    }, (err: Error, playerList: string[]) => {
                        if (err) {
                            console.error('join-room error', err);
                            navigate("/")
                            return;
                        }
                        setPlayerList(playerList);
                    });
                });
            } catch (err) {
                console.error('Failed to get user info or connect socket', err);
            }
        })();

        return () => {
            mounted = false;
            const s = socketRef.current;
            if (s) {
                s.off('returned-player-list');
                s.off('connect');
                s.disconnect();
                socketRef.current = null;
            }
        };
        }, []);


    const triggerTerminateOverlay = async () => {
        setIsOverlayOpen(true);
        setHostLeave(true);
    }


    const triggerLeaveOverlay = () => {
        setIsOverlayOpen(true);
        setPartLeave(true);
    }


    const handleLeaveRoom = async () => {
        if (socketRef.current) {
            const session = await getSessionID();
            socketRef.current.emit("leave-room", {
                roomCode: roomId,
                isHost: isHost,
                clientSessionId: session
            });
        }
        if (partLeave) {
            navigate("/")
        }
        setIsOverlayOpen(false);
    }


    const handleCloseOverlay = () => {
        setIsOverlayOpen(false);
        setHostLeave(false);
        setPartLeave(false);
    }


    const handleKickPlayer = async (index: string) => {
        if (socketRef.current) {
            socketRef.current.emit("kick-player", {
                roomCode: roomId,
                playerIndex: index.toString(),
            })
        }
    }


    const handleLockRoom = () => {
        setToggleLock(prev => {
            const newPrev = !prev;
            if (socketRef.current) {
                socketRef.current.emit("set-lock-state", {
                    roomCode: roomId,
                    isLock: Number(newPrev).toString(),
                })
            }
            return newPrev;
        });
    }


    const handleStartRoom = () => {
        if (socketRef.current) {
            socketRef.current.emit("initialize-room-start", {
                roomCode: roomId,
            });
        }
    }

    
    return (
        <div className="PendingStartRoomContainer">
            <div className="LobbyHeader">
                <div className="SessionIdentity">
                    <span className="TerminalLabel">ROOM INITIATED</span>
                    <h1 className="RoomCodeDisplay">{roomId}</h1>
                </div>
                <div className={`SecurityStatus ${toggleLock ? 'locked' : 'active'}`}>
                    <span className="StatusDot"></span>
                    {toggleLock ? 'CHANNEL LOCKED' : 'CHANNEL OPEN'}
                </div>
            </div>

            <div className="RosterSection">
                <div className="RosterMeta">
                    <span className="MetaLabel">ACTIVE UNITS IN LOBBY</span>
                    <span className="MetaCount">{playerList.length} / 100</span>
                </div>
                
                <div className="UnitGrid">
                    {playerList.map((player, index) => (
                        <div key={index} className={`UnitCard ${index === 0 ? 'host-unit' : ''}`}>
                            <div className="UnitMain">
                                <span className="UnitID">{String(index + 1).padStart(2, '0')}</span>
                                <span className="UnitName">{player}</span>
                                {index === 0 && <span className="HostBadge">MASTER</span>}
                            </div>
                            
                            {isHost && index !== 0 && (
                                <button 
                                    className="KickUnitBtn" 
                                    onClick={() => handleKickPlayer((index + 1).toString())}
                                >
                                    DISCONNECT
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="CommandDock">
                <div className="DockBlur"></div>
                <div className="DockActions">
                    {isHost ? (
                        <>
                            <button className="ConsoleAction init-btn" onClick={handleStartRoom}>
                                INITIALIZE SESSION
                            </button>
                            <button 
                                className={`ConsoleAction ${toggleLock ? 'warn-btn' : 'neutral-btn'}`} 
                                onClick={handleLockRoom}
                            >
                                {toggleLock ? 'UNLOCK CHANNEL' : 'LOCK CHANNEL'}
                            </button>
                            <button className="ConsoleAction danger-btn" onClick={triggerTerminateOverlay}>
                                TERMINATE
                            </button>
                        </>
                    ) : (
                        <button className="ConsoleAction danger-btn" onClick={triggerLeaveOverlay}>
                            ABORT CONNECTION
                        </button>
                    )}
                </div>
            </div>

            {/* Tactical Overlay */}
            <Overlays isOpen={isOverlayOpen}>
                <div className="TerminalOverlayContent">
                    <div className="OverlayHeader">
                        <h2>{hostLeave ? "SYSTEM TERMINATION" : "NODE DISCONNECT"}</h2>
                    </div>
                    <p className="OverlayMsg">
                        Warning: You are attempting to {hostLeave ? "terminate the session" : "disconnect from the link"}. 
                        This action is irreversible. Proceed with extraction?
                    </p>
                    <div className="overlay__buttons">
                        <button className="confirmDelete neon-btn-red" onClick={handleLeaveRoom}>EXIT</button>
                        <button className="cancelDelete" onClick={handleCloseOverlay}>CANCEL</button>
                    </div>
                </div>  
            </Overlays> 
        </div>
    )
}



export default PendingStartRoom