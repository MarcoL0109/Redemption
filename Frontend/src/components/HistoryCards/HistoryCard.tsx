
import { HistoryCardProp } from "../HistoryPage/HistoryPage";
import "./HistoryCard.css";

function HistoyCard({recordId, recordDate, gameStartDatetime, hostedName, completness, problemSetName}: HistoryCardProp) {


    return (
        <div className="HistoryCardContainer">
            <div className="HistoryCardContentContainer">
                <h2>{problemSetName}</h2>
            </div>
        </div>
    )
}

export default HistoyCard;