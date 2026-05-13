import "./ProblemSetCard.css";
import PlayButton from "../../assets/play.svg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {ProblemSetModificationMap} from "../HomePage/HomePage"



interface ProblemCard {
    problem_set: {
        problem_set_id: number, problem_set_title: string, problem_set_description: string, 
        problem_counts: number, created_by: number, created_at?: string, 
        last_update_at?: string
    },
    editMode: boolean,
    deleteMode: boolean,
    is_temp: boolean,
    handleClearToggle: number,
    handleChange: (id: number, change: ProblemSetModificationMap, is_temp: boolean) => void
    handleAddPotentialDeleteProblems: (id: number) => void
    handleRemovePotentialDeleteProblems: (id: number) => void
}


function ProblemSetCard({problem_set, editMode, deleteMode, is_temp, handleClearToggle, handleChange, handleAddPotentialDeleteProblems, handleRemovePotentialDeleteProblems}: ProblemCard) {
    const navigate = useNavigate()
    const [toggle, setToggle] = useState<number>(0);


    const handleonClick = () => {
        if (!editMode && !deleteMode) {
            navigate(`/ProblemList/${problem_set.problem_set_id}`);
        }
    }


    const formatDate = (dateString: string) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-AU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };


    useEffect(() => {
        setToggle(0);
    }, [handleClearToggle])


    useEffect(() => {
        if (toggle === 1) {
            handleAddPotentialDeleteProblems(problem_set.problem_set_id);
        } else {
            handleRemovePotentialDeleteProblems(problem_set.problem_set_id);
        }
    }, [toggle, problem_set.problem_set_id]);


    const handleProblemSetTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const current_problem_set_title = event.target.value;
        handleChange(problem_set.problem_set_id, {
            problem_set_title: current_problem_set_title,
        }, is_temp)
    }


    const handleProblemSetDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const current_problem_set_description = event.target.value;
        handleChange(problem_set.problem_set_id, {
            problem_set_description: current_problem_set_description,
        }, is_temp)
    }


    const handleDeleteCheckBoxChange = () => {
        setToggle(prev => prev ^ 1);
    }


    return (
        <div className={`ProblemSetCard ${deleteMode ? 'delete-mode' : ''} ${toggle === 1 ? 'selected' : ''}`} onClick={handleonClick}>
            {deleteMode && (
                <div className="SelectionOverlay">
                    <input 
                        className="DeleteCheckBox"
                        type="checkbox"
                        checked={toggle === 1}
                        onChange={handleDeleteCheckBoxChange}
                    />
                </div>
            )}
            
            <div className="CardBody">
                <div className="ProblemSetTitleContainer">
                    {editMode ? (
                        <TextareaAutosize
                            className="EditInput title-edit"
                            defaultValue={problem_set.problem_set_title}
                            placeholder="Set Title"
                            onChange={handleProblemSetTitleChange}
                        />
                    ) : (
                        <h3 className="ProblemSetTitle">{problem_set.problem_set_title}</h3>
                    )}        
                </div>
                
                <div className="ProblemSetDescriptionContainer">
                    {editMode ? (
                        <TextareaAutosize
                            className="EditInput desc-edit"
                            defaultValue={problem_set.problem_set_description}
                            placeholder="Set Description"
                            onChange={handleProblemSetDescriptionChange}
                        />
                    ) : (
                        <p className="ProblemSetDescription">{problem_set.problem_set_description}</p>
                    )}
                </div>
            </div>

            <div className="CardFooter">
                <div className="MetaData">
                    <span className="CountBadge">{problem_set.problem_counts} MODULES</span>
                    <span className="UpdateText">REV: {problem_set.last_update_at && formatDate(problem_set.last_update_at)}</span>                      
                </div>

                {!deleteMode && !editMode && (
                    <div className="PlayButton">
                        <img className="PlayButtonIcon" src={PlayButton} alt="Initialize"/>
                    </div>
                )}
            </div>
        </div>
    )
}


export default ProblemSetCard;