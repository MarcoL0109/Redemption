import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import "./HistoryRecordPage.css"


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
    const [answerHistory, setAnswerHistory] = useState<String[]>([]);
    // @ts-ignore
    const HISTORY_API_URL = process.env.VITE_HISTORY_MANAGEMENT_API_URL;
    const currentDisplayProblem = snapShotContent[currIndex];


    useEffect(() => {
        const fetchSnapShots = async () => {
            const fetchSnapShotResponse = await fetch(`${HISTORY_API_URL}/getSnapShotContent`, {
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
            const fetchAnswerHistoryResponse = await fetch(`${HISTORY_API_URL}/getAnswerHistory`, {
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
                setAnswerHistory(answerHistory);
            }
        }
        fetchSnapShots();
        fetchAnswerHistory();
    }, [])



    return (
        
        <div className="GamePageContainer">
            <NavBar/>
            <div className="ProblemAnswerContainer">
                <h2>Question {currIndex + 1}</h2>
                <div className="ProblemTextSection">
                    <div className="ProblemTextContainer">
                        <span>{currentDisplayProblem?.question_text}</span>
                    </div>
                </div>
                <div className="SwitchProblemButtonContainer">
                    <button 
                    disabled={currIndex === 0} 
                    onClick={() => setCurrIndex(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    
                    <button 
                        disabled={currIndex === snapShotContent.length - 1} 
                        onClick={() => setCurrIndex(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
                
                <div className="AnswerOptionContainer">
                    {
                        currentDisplayProblem?.question_type === "Multiple Choice" ?
                        <div className="OptionsContainer">
                            <div className={"OptionADiv"} data-id="option-A">{currentDisplayProblem?.answer_options.A}</div>
                            <div className={"OptionBDiv"} data-id="option-B">{currentDisplayProblem?.answer_options.B}</div>
                            <div className={"OptionCDiv"} data-id="option-C">{currentDisplayProblem?.answer_options.C}</div>
                            <div className={"OptionDDiv"} data-id="option-D">{currentDisplayProblem?.answer_options.D}</div>
                        </div> :
                        <div className="BlankAnswerContainer">
                            <form className="BlankFormContainer">
                                <div className="InputSubmitContainer">
                                    <div>
                                        {
                                            <input className="BlankAnswerInput" 
                                                type="text"
                                                placeholder="Type Your Answer"
                                                readOnly={true}
                                                value="Testing"
                                                required
                                            /> 
                                        }
                                        
                                    </div>
                                    <span className="BlankCorrectAnswer">{`Correct Answer: ${currentDisplayProblem?.correct_answer.Blanks}`}</span>
                                </div>
                            </form>
                        </div>
                    }
                </div> 
            </div>
        </div>
    )
}


export default HistoryRecord;