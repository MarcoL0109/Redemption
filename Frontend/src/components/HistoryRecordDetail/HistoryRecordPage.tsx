import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import "./HistoryRecordPage.css"
import { API_ROUTES } from "../../../utils/api_routes";


interface HistoryRecords {
    question_text: string,
    question_type: string,
    correct_answer: Record<string, string>,
    answer_options: Record<string, string>,
    sequence_no: Number,
}


function HistoryRecord() {

    const {recordId, snapShotId} = useParams();
    const [snapShotContent, setSnapShotContent] = useState<HistoryRecords[]>([]);
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [answerHistory, setAnswerHistory] = useState<string[]>([]);
    const currentDisplayProblem = snapShotContent[currIndex];
    const currentAnswerHistory = answerHistory[currIndex];


    useEffect(() => {
        const fetchSnapShots = async () => {
            const fetchSnapShotResponse = await fetch(`${API_ROUTES.HISTORY}/getSnapShotContent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({snapShotId: snapShotId})
            })
            if (fetchSnapShotResponse.status === 200) {
                const fetchSnapshotJSON = await fetchSnapShotResponse.json();
                const snapShotContent = fetchSnapshotJSON.result;
                setSnapShotContent(snapShotContent);
            }
        }

        const fetchAnswerHistory = async () => {
            const fetchAnswerHistoryResponse = await fetch(`${API_ROUTES.HISTORY}/getAnswerHistory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({historyRecordId: recordId})
            })
            if (fetchAnswerHistoryResponse.status === 200) {
                const fetchAnswerHistoryJSON = await fetchAnswerHistoryResponse.json();
                const answerHistory = fetchAnswerHistoryJSON.result;
                if (answerHistory.length > 0) setAnswerHistory(answerHistory[0].join_history_answer_history);
            }
        }
        fetchSnapShots();
        fetchAnswerHistory();
    }, [])



    return (
        
        <div className="HistoryRecordPageContainer">
            <NavBar />
            
            <div className="SimulationWrapper">
                <div className="HistoryPageProblemAnswerContainer">
                    <div className="AssessmentHeader">
                        <div className="HeaderMain">
                            <span className="LiveTag">ASSESSMENT HISTORY</span>
                            <h2 className="QuestionNoHeader">NODE {currIndex + 1}</h2>
                        </div>
                        
                        <div className="SwitchProblemButtonContainer">
                            <button 
                                className="NavButton"
                                disabled={currIndex === 0} 
                                onClick={() => setCurrIndex(prev => prev - 1)}
                            >
                                PREV NODE
                            </button>
                            <div className="NodeProgress">
                                {currIndex + 1} / {snapShotContent.length}
                            </div>
                            <button 
                                className="NavButton"
                                disabled={currIndex === snapShotContent.length - 1} 
                                onClick={() => setCurrIndex(prev => prev + 1)}
                            >
                                NEXT NODE
                            </button>
                        </div>
                    </div>

                    {/* Problem Section: The Objective */}
                    <div className="HistoryPageProblemTextSection">
                        <div className="HistoryPageProblemTextContainer">
                            <div className="TextBracket left"></div>
                            <span className="QuestionText">{currentDisplayProblem?.question_text}</span>
                            <div className="TextBracket right"></div>
                        </div>
                    </div>
                    
                    {/* Answer Section: The Console */}
                    <div className="HistoryPageAnswerOptionContainer">
                        {currentDisplayProblem?.question_type === "Multiple Choice" ? (
                            <div className="OptionsGrid">
                                {['A', 'B', 'C', 'D'].map((key) => {
                                    const isCorrect = currentDisplayProblem.correct_answer.MC === key;
                                    const wasSelected = currentAnswerHistory === key;

                                    return (
                                        <div 
                                            key={key}
                                            className={`TacticalOption 
                                                ${isCorrect ? "is-correct" : 'is-wrong'} 
                                                ${wasSelected ? "is-selected" : ''}`}
                                        >
                                            <span className="OptionID">{key}</span>
                                            <span className="OptionContent">{currentDisplayProblem?.answer_options[key]}</span>
                                            
                                            <div className="OptionStatusLabel">
                                                {isCorrect ? "CORRECT ANSWER" : wasSelected ? "YOUR CHOICE" : ""}
                                            </div>

                                            <div className="SelectionIndicator"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="HistoryPageBlankAnswerContainer">
                                <div className="HistoryPageBlankFormContainer">
                                    <div className="InputSubmitContainer">
                                        <label className="HistoryPageInputLabel">INPUT RESPONSE</label>
                                        <input 
                                            className="HistoryPageBlankAnswerInput" 
                                            type="text"
                                            readOnly={true}
                                            defaultValue={currentAnswerHistory === "TIMEOUT_NULL" ? "" : currentAnswerHistory}
                                        /> 
                                        <div className="CorrectAnswerFeedback">
                                            <span className="FeedbackLabel">CORRECT ANSWER:</span>
                                            <span className="FeedbackValue">{currentDisplayProblem?.correct_answer.Blanks}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div> 
                </div>
            </div>
        </div>
    )
}


export default HistoryRecord;