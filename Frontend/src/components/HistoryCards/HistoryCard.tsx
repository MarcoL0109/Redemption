
import { HistoryCardProp } from "../HistoryPage/HistoryPage";
import "./HistoryCard.css";

// useEffect is not called in here, call it in the historyContent page


function HistoyCard({recordId, hostName, score, gameStartDatetime, completness, problemSetName, snapShotID}: HistoryCardProp) {

    const CSS_MAPPING: { [key: string]: string } = {
        "Terminated By Host": "Terminated",
        "Incomplete": "Incomplete",
        "Completed": "Completed",
        "Kicked": "Kicked"
    }


    return (
        <li className="HistoryCardContainer">
            <div className="HistoryCardContentContainer">
                <h2>{problemSetName}</h2>
                <div>
                    <span className="HistroyInfoSpan">Hosted By: {hostName}</span>
                </div>
                <div>
                    <span className="HistroyInfoSpan">Game Start Datetime: {gameStartDatetime}</span>
                </div>
                <div>
                    <span className="HistroyInfoSpan">
                        {
                            completness === "Completed" ?
                            `Score: ${score}`:
                            `Not Availabel when ${completness}`
                        }
                        
                    </span>
                </div>
            </div>
            <div>
                <div className={`completnessDiv ${CSS_MAPPING[completness || ""]}`}>
                    <span>{completness}</span>
                </div>
            </div>
        </li>
    )
}

export default HistoyCard;