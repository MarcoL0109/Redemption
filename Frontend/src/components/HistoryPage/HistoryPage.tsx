import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import HistoyCard from "../HistoryCards/HistoryCard"
import "./HistroyPage.css"


export interface HistoryCardProp {
    recordId: number,
    recordDate: string,
    gameStartDatetime: string,
    hostedName: string,
    completness: string,
    problemSetName: string,
}


function HistoryPage() {

    // @ts-ignore
    const ROOM_API_URL = process.env.VITE_ROOM_MANAGEMENT_API_URL
    const {userId} = useParams();
    const [historyRecords, setHistoryRecords] = useState<HistoryCardProp[]>([]);


    const mapApiRecordToInterface = (apiData: any): HistoryCardProp => {
        const dateObj = apiData.join_room_game_start_datetime instanceof Date 
        ? apiData.join_room_game_start_datetime 
        : new Date(apiData.join_room_game_start_datetime);

        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        const ss = String(dateObj.getSeconds()).padStart(2, '0');
        return {
            recordId: apiData.join_history_id,
            recordDate: new Date(apiData.join_history_date).toISOString().replace('T', ' ').slice(0, 19),
            gameStartDatetime: `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`,
            hostedName: apiData.Host || "Unknown Host",
            completness: apiData.join_history_completness,
            problemSetName: apiData.ProblemSet
        };
    };


    useEffect(() => {
        const fetchHistoryRecords = async () => {
            const fetchHistoryResponse = await fetch(`${ROOM_API_URL}/getHistoryRecord`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({userId: userId})
            })
            if (fetchHistoryResponse.status === 200) {
                const historyRecordJson = await fetchHistoryResponse.json();
                const historyRecordContent: HistoryCardProp[] = historyRecordJson.historyRecords.map(mapApiRecordToInterface);
                setHistoryRecords(historyRecordContent)
            }
        }

        fetchHistoryRecords();
    }, [])


    return (
        <div className="HomePageContainer">
            {
                historyRecords.map((history) =>
                    <div key={history.recordId} className="HistoryListContainer">
                        <ul className="ProblemList">
                        <HistoyCard recordId={history.recordId} recordDate={history.recordDate}
                                    gameStartDatetime={history.gameStartDatetime} hostedName={history.hostedName}
                                    completness={history.completness} problemSetName={history.problemSetName}
                                />
                        </ul>
                    </div>
                )
            }
        </div>            
    )
}


export default HistoryPage