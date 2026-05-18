import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HistoryCardProp, mapApiRecordToInterface} from '../components/HistoryPage/HistoryPage';
import { useNavigate } from 'react-router-dom';
import { API_ROUTES } from '../utils/api_routes';


interface UserData {
    username: string;
    email: string;
    user_id: number;
    created_at: string;
    user_icon: string;
    login_streak: number;
    highest_score: number;
    no_completed_quiz: number;
    history_records: HistoryCardProp[];

}

interface UserContextType {
    userData: UserData | null;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const DEFAULT_USER: UserData = {
    username: "Guest",
    email: "",
    user_id: -1,
    created_at: new Date().toISOString(),
    user_icon: "" ,
    login_streak: 0,
    highest_score: -1,
    no_completed_quiz: 0,
    history_records: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<UserData>(DEFAULT_USER);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const logout = () => {
        setUserData(DEFAULT_USER);
    };

    const fetchUser = useCallback(async () => {
        const getSessionInfoRepsonse = await fetch(`${API_ROUTES.UTILS}/SessionInfo`, {
            method: "GET",
            credentials: "include"
        })
        const session_info_body = await getSessionInfoRepsonse.json();
        const session_user_id = session_info_body.session.user_id || null
        if (!session_user_id) {
            setLoading(false);
            navigate("/SignIn");
            return;
        }
        const get_user_data_response = await fetch(`${API_ROUTES.USERS}/getUserInfo`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({user_id: session_user_id}),
        });
        const user_data_json = await get_user_data_response.json();
        const user_data_content = user_data_json.userData;
        let image_url = "";
        try {
            const response = await fetch(`${API_ROUTES.USERS}/getAvatarUrl/${user_data_content.user_id}`);
            if (response.ok) {
                const data = await response.json();
                image_url = data.imageUrl;
            }
        } catch (err) {
            console.error("Failed to load avatar", err);
        }

        const recentJoinHistory = await fetch(`${API_ROUTES.HISTORY}/getHistoryRecord`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({userId: session_user_id, limit: 10})
        });
        let historyRecordContent: HistoryCardProp[] = [];
        if (recentJoinHistory.status === 200) {
            const recentJoinHistoryJSON = await recentJoinHistory.json();
            historyRecordContent = recentJoinHistoryJSON.historyRecords.map(mapApiRecordToInterface);
        }

        setUserData({
            username: user_data_content.username,
            email: user_data_content.email,
            user_id: user_data_content.user_id,
            created_at: user_data_content.create_date.toString(),
            user_icon: image_url,
            login_streak: user_data_content.login_streak,
            highest_score: user_data_content.highest_score === null ? -1: user_data_content.highest_score,
            no_completed_quiz: user_data_content.no_of_completed_quiz,
            history_records: historyRecordContent
        })
        setLoading(false);
    }, []);


    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ userData, loading, logout, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};