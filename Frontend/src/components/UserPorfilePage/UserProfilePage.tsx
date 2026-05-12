import NavBar from "../NavBar/NavBar";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UserProfilePage.css";
import {useUser} from "../../context/UserContext";
import { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


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
        if (userData?.user_id === -1) {
            navigate("/SignIn");
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
        <div className="HomePageContainer">
            <NavBar />
            <div onClick={handleIconClick} className="UserProfileContainer">
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
            
        </div>
    )
}


export default UserProfilePage;