
import { HistoryCardProp } from "../HistoryPage/HistoryPage";
import "./HistoryCard.css";

// For the content of the snapshot, I'll do a useEffect API call in here for both the questions and answerHistory

function HistoyCard({recordId, hostName, score, gameStartDatetime, completness, problemSetName, snapShotID}: HistoryCardProp) {


    return (
        <div className="HistoryCardContainer">
            <div className="HistoryCardContentContainer">
                {recordId} {hostName} {score} {gameStartDatetime} {completness} {problemSetName} {snapShotID}
            </div>
        </div>
    )
}

export default HistoyCard;