
import { HistoryCardProp } from "../HistoryPage/HistoryPage";

function HistoyCard({recordId, recordDate, gameStartDatetime, hostedName, completness, problemSetName}: HistoryCardProp) {


    return (
        <div className="HistoryCardContainer">
            {recordId} {recordDate} {gameStartDatetime}, {hostedName}, {completness}, {problemSetName}
        </div>
    )
}

export default HistoyCard;