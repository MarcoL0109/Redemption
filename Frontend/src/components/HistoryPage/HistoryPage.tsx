import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import HistoyCard from "../HistoryCards/HistoryCard"


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
        return {
            recordId: apiData.join_history_id,
            recordDate: new Date(apiData.join_history_date).toLocaleString(),
            gameStartDatetime: new Date(apiData.join_room_game_start_datetime).toLocaleString(),
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
        <div>
            {
                historyRecords.map((history) => 
                    <div key={history.recordId}>
                        <HistoyCard recordId={history.recordId} recordDate={history.recordDate}
                                    gameStartDatetime={history.gameStartDatetime} hostedName={history.hostedName}
                                    completness={history.completness} problemSetName={history.problemSetName}
                        />
                    </div>
                )
            }
        </div>
    )
}


export default HistoryPage