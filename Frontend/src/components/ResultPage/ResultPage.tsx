import { useLocation, useNavigate } from "react-router-dom"
import RankPage from "../RankPage/RankPage";
import "./ResultPage.css";


function ResultPage() {

    const location = useLocation();
    const navigate = useNavigate();
    const playerRank = location.state?.playerRank;
    const rankList = location.state?.rankList;
    const isHost = location.state?.isHost;
    const joinInfoSaved = location.state?.joinInfoSaved;
    const playerIndex = location.state?.playerIndex;


    const handleBackHome = () => {
        navigate("/");
    }

    return (
        <div className="ResultPageContainer">
            <h1>
                {isHost ? (
                    "All Problems are Streamed!"
                ) : (
                    <>
                        {`You Ranked ${playerRank}`}
                        {playerRank === 1 ? "st" : 
                        playerRank === 2 ? "nd" : 
                        playerRank === 3 ? "rd" : "th"}
                    </>
                )}
            </h1>
            <RankPage players={rankList.players} isHost={false} clientPlayerIndex={playerIndex}/>
            {
                joinInfoSaved == 1 &&
                <span className="SaveSuccessMessage">
                    {"This Activity has been Saved into Your History!!"}
                </span>
            }
            <div className="BackToHomeButtonContainer">
                <button className="BackToHomeButton" onClick={handleBackHome}>Back To Home</button>
            </div>
        </div>
    )
}



export default ResultPage