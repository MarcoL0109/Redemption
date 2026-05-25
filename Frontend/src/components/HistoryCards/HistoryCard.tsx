
import { HistoryCardProp } from "../HistoryPage/HistoryPage";
import { useNavigate } from "react-router-dom";
import "./HistoryCard.css";


function HistoyCard({recordId, hostName, score, gameStartDatetime, completness, problemSetName, snapShotID}: HistoryCardProp) {

    const CSS_MAPPING: { [key: string]: string } = {
        "Terminated By Host": "status-pending",
        "Incomplete": "status-progress",
        "Completed": "status-completed",
        "Kicked": "status-aborted"
    }
    const navigate = useNavigate();

    const handleViewHistoryDetail = () => {
        if (completness === "Completed")
            navigate(`/HistoryRecord/${recordId}/${snapShotID}`);
    }


    return (
        <li className={`HistoryCardContainer ${completness === "Completed" ? "clickable" : ""}`} onClick={handleViewHistoryDetail}>
            <div className="HistoryCardContentContainer">
                <div className="HistoryCardHeader">
                    <h2 className="ProblemSetName">{problemSetName}</h2>
                    <span className="GameDate">{gameStartDatetime}</span>
                </div>
                
                <div className="HistoryDetails">
                    <span className="HistoryInfoSpan">
                        <i className="user-icon"></i> Hosted By: <strong>{hostName}</strong>
                    </span>
                    <span className="HistoryInfoSpan ScoreSpan">
                        {completness === "Completed" ? 
                            <>Score: <span className="ScoreValue">{score}</span></> : 
                            `Progress: ${completness}`
                        }
                    </span>
                </div>
            </div>
            
            <div className="HistoryStatusSection">
                <div className={`completnessDiv ${CSS_MAPPING[completness || ""]}`}>
                    {completness}
                </div>
            </div>
        </li>
    )
}

export default HistoyCard;