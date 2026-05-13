import NavBar from "../NavBar/NavBar";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UserProfilePage.css";
import {useUser} from "../../context/UserContext";
import { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tick from "../../assets/tick.svg";
import Trophy from "../../assets/trophy.svg";


function UserProfilePage() {

    // A new table for storing user game stats: user_id, login streaks, highest score, 
    //                                          total join count, number of quiz owned

    const {userData, refreshUser} = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const {userId} = useParams()
    const navigate = useNavigate();
    // @ts-ignore
    const USER_API_URL = process.env.VITE_USER_API_URL;


    useEffect(() => {
        refreshUser()
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
        const signedImageURL = await fetch(`${USER_API_URL}/getNewAvatarImageURL`, {
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
            await fetch(`${USER_API_URL}/saveAvatarKey`, {
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
            <div onClick={handleIconClick} className="UserProfileContainer">
                <div>
                    <div className="ProfileUserAvatar">
                        {userData?.user_icon !== "" ? (
                            <img src={userData?.user_icon} 
                            alt="User Avatar"
                            className="AvatarImage"
                            onError={() => {
                                refreshUser();
                            }}
                            />
                            ) : (
                            <FontAwesomeIcon icon={faUser} size="10x" />
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarImageUpload}
                        accept=".png, .jpg, .jpeg"
                        style={{ display: 'none' }}
                    />
                    <div className="userInfoContainer">
                        <h2><strong>{userData?.username}</strong></h2>
                        <em>Join At: {userData?.created_at ? userData.created_at.split('T')[0] : "Loading..."}</em>
                    </div>
                </div>

                <div className="userProfileRightSide">
                    <div className="StatsCardContainer">
                        <div className="StatsCard glow-green">
                            <div className="CardHeader">
                                <span className="CardLabel">Completed Quizzes</span>
                                <img className="CardIcon" src={Tick} alt="Completed Icon"/>
                            </div>
                            <div className="CardBody">
                                <h2 className="StatNumber">{userData?.no_completed_quiz}</h2>
                            </div>
                        </div>

                        <div className="StatsCard glow-purple">
                            <div className="CardHeader">
                                <span className="CardLabel">Highest Score</span>
                                <img className="CardIcon" src={Trophy} alt="Trophy Icon"/>
                            </div>
                            <div className="CardBody">
                                <h2 className="StatNumber">{userData?.highest_score === -1 ? "-" : userData?.highest_score}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="StatsCardContainer">
                        Latest Activity
                    </div>
                </div>
                
            </div>
            
        </div>
    )
}


export default UserProfilePage;