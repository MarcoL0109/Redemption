import NavBar from "../NavBar/NavBar";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UserProfilePage.css";
import {useUser} from "../../context/UserContext";
import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tick from "../../assets/tick.svg";
import Trophy from "../../assets/trophy.svg";
import HistoyCard from "../HistoryCards/HistoryCard";
import DateCalendarValue from "../LoginCalendar/LoginCalendar";
import { API_ROUTES } from "../../utils/api_routes";


function UserProfilePage() {

    const {userData, refreshUser} = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const {userId} = useParams()
    const [loginDates, setLoginDates] = useState<string[]>([]);


    useEffect(() => {
        const fetchLoginDates = async () => {
            const fetchLoginDatesResponse = await fetch(`${API_ROUTES.USERS}/getLoginDates/${userId}`, {
                method: "GET",
                credentials: "include",
            });
            
            if (fetchLoginDatesResponse.ok) {
                const loginDatsJSON = await fetchLoginDatesResponse.json();
                const loginDates = loginDatsJSON.loginDates;
                setLoginDates(loginDates || []);
            }
        }
        refreshUser();
        if (userId) {
            fetchLoginDates();
        }
        
    }, [])


    const handleIconClick = () => {
        fileInputRef.current?.click();
    };


    const handleAvatarImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            alert("File size is too huge. Only accept file size smaller than 2MB");
            event.target.value = "";
            return;
        }
        await uploadAvatarImage(file);
    };


    const uploadAvatarImage = async (file: File) => {
        const signedImageURL = await fetch(`${API_ROUTES.USERS}/getNewAvatarImageURL`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({userId: userId, fileType: file.type})
        })

        if (signedImageURL.status === 200) {
            const {uploadUrl, key} = await signedImageURL.json()
            await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type
                },
                body: file
            });
            await fetch(`${API_ROUTES.USERS}/saveAvatarKey`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({userId: userId, key: key})
            })
            refreshUser();
        }
    }


    return (
        <div className="UserProfilePageContainer">
            <NavBar />
            
            <div className="DossierMainWrapper">
                <div className="DossierContainer"> 
                    <div className="IdentityModule">
                        <div className="AvatarScanner">
                            <div className="ProfileUserAvatar">
                                {userData?.user_icon !== "" ? (
                                    <img 
                                        src={userData?.user_icon} 
                                        alt="User Avatar"
                                        className="AvatarImage"
                                        onError={refreshUser}
                                        onClick={handleIconClick}
                                    />
                                ) : (
                                    <div className="DefaultAvatarPlaceholder">
                                        <FontAwesomeIcon icon={faUser} size="6x" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarImageUpload}
                            accept=".png, .jpg, .jpeg"
                            style={{ display: 'none' }}
                        />

                        <div className="IdentityText">
                            <h2 className="UnitName">{userData?.username}</h2>
                            <div className="UnitRank">RANK: OPERATIVE</div>
                            <div className="JoinDate">
                                COMMISSIONED: {userData?.created_at ? userData.created_at.split('T')[0] : "INITIALIZING..."}
                            </div>
                            
                            <div className="CalendarWrapper">
                                <DateCalendarValue loginDays={loginDates}/>
                            </div>
                        </div>
                    </div>

                    <div className="TelemetryModule">
                        <div className="StatsGrid">
                            <div className="DataPoint glow-mint">
                                <div className="DataHeader">
                                    <span className="DataLabel">SESSIONS COMPLETED</span>
                                    <img className="DataIcon" src={Tick} alt="Completed"/>
                                </div>
                                <div className="DataValue">{userData?.no_completed_quiz}</div>
                            </div>

                            <div className="DataPoint glow-amber">
                                <div className="DataHeader">
                                    <span className="DataLabel">PEAK PERFORMANCE</span>
                                    <img className="DataIcon" src={Trophy} alt="Trophy"/>
                                </div>
                                <div className="DataValue">
                                    {userData?.highest_score === -1 ? "N/A" : userData?.highest_score}
                                </div>
                            </div>
                        </div>

                        <div className="ActivityLog">
                            <div className="LogHeader">
                                <span className="LogTitle">LATEST ACTIVITY FEED</span>
                                <div className="LogPulse"></div>
                            </div>
                            <div className="LogContent">
                                {
                                    userData?.history_records && userData?.history_records.length > 0 ?
                                    userData?.history_records.map((history) =>
                                        <div key={history.recordId} className="HistoryListContainer">
                                            <ul className="ProblemList">
                                                <HistoyCard recordId={history.recordId}
                                                            score={history.score} snapShotID={history.snapShotID}
                                                            gameStartDatetime={history.gameStartDatetime} hostName={history.hostName}
                                                            completness={history.completness} problemSetName={history.problemSetName}
                                                        />
                                                </ul>
                                        </div>
                                    ) :
                                    <div className="EmptyLog">NO RECENT ROOM JOINED</div>
                                }
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}


export default UserProfilePage;