import { useState, useEffect } from "react"
import HistoyCard from "../HistoryCards/HistoryCard"
import NavBar from "../NavBar/NavBar"
import "./HistoryPage.css"
import { useParams } from "react-router-dom"
import { API_ROUTES } from "../../../utils/api_routes"


export interface HistoryCardProp {
    recordId: number,
    hostName: string,
    problemSetName: string,
    score: number,
    gameStartDatetime: string,
    completness: string,
    snapShotID: number,
}


export const mapApiRecordToInterface = (apiData: any): HistoryCardProp => {
    const dateObj = apiData.join_history_game_start_datetime instanceof Date 
    ? apiData.join_history_game_start_datetime 
    : new Date(apiData.join_history_game_start_datetime);

    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');
    return {
        recordId: apiData.join_history_id,
        hostName: apiData.Host || "Unknown Host",
        score: apiData.join_history_score,
        gameStartDatetime: `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`,
        completness: apiData.join_history_completness,
        problemSetName: apiData.ProblemSetTitle,
        snapShotID: apiData.join_history_snapshot_id
    };
};


function HistoryPage() {

    const [historyRecords, setHistoryRecords] = useState<HistoryCardProp[]>([]);
    const {userId} = useParams()


    useEffect(() => {
        const fetchHistoryRecords = async () => {
            const fetchHistoryResponse = await fetch(`${API_ROUTES.HISTORY}/getHistoryRecord`, {
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
            <NavBar/>
            {
                historyRecords.length > 0 ?
                historyRecords.map((history) =>
                    <div key={history.recordId} className="HistoryListContainer">
                        <ul className="ProblemList" data-testid={`history-card-${history.recordId}`}>
                            <HistoyCard recordId={history.recordId}
                                        score={history.score} snapShotID={history.snapShotID}
                                        gameStartDatetime={history.gameStartDatetime} hostName={history.hostName}
                                        completness={history.completness} problemSetName={history.problemSetName}
                                    />
                        </ul>
                    </div>
                ) :
                <div className="CreateFirstProblemTextMessageContainer">
                    <div className="HistTechnicalStatusIndicator YellowStatus">[ NO RECORD FOUND ]</div>
                    <h2 className="HistCreateFirstProblemTextMessage">No session history detected_</h2>
                    <p className="HistCreateFirstProblemSubTextMessage">Your past rooms and performance metrics will populate here once initialization occurs.</p>
                </div>
            }
        </div>            
    )
}


export default HistoryPage