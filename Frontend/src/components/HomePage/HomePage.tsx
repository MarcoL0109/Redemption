import "./HomePage.css";
import NavBar from "../NavBar/NavBar";
import ProblemSetCard from "../ProblemSetCard/ProblemSetCard";
import Overlays from "../Overlays/Overlay";
import { Mosaic } from 'react-loading-indicators';
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";


export interface ProblemSetModificationMap {
    "problem_set_title" ?: string,
    "problem_set_description" ?: string,
}

interface ProblemSet {
    "problem_set_id": number,
    "problem_set_title": string,
    "problem_set_description": string,
    "problem_counts": number,
    "created_by": number,
    "created_at"?: string,
    "last_update_at"?: string,
    "is_temp" ?: boolean,
}


function HomePage() {

    const navigate = useNavigate();
    // @ts-ignore
    const UTILS_API_URL = process.env.VITE_UTILS_API_URL;
    // @ts-ignore
    const USER_API_URL = process.env.VITE_USER_API_URL;
    // @ts-ignore
    const PROBLEM_SET_API_URL = process.env.VITE_PROBLEM_SETS_API_URL;
    const { userData, loading } = useUser();
    const [problemSets, setProblemSets] = useState<ProblemSet[]>([
        {
        problem_set_id: -1, problem_set_title: "", problem_set_description: "", 
        problem_counts: -1, created_by: -1, created_at: "", 
        last_update_at: ""
        }
    ])
    const [isloaded, setIsLoaded] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [problemSetModMap, setProblemSetModMap] = useState<{[key: number]: {attributes: ProblemSetModificationMap}}>({});
    const [potentialCreateProblemSet, setPotentialCreateProblemSet] = useState<{[key: number]: {attributes: ProblemSetModificationMap}}>({});
    const [snapShotProblemSet, setSnapShotProblemSet] = useState([
        {
            problem_set_id: -1, problem_set_title: "", problem_set_description: "", 
            problem_counts: -1, created_by: -1, created_at: "", 
            last_update_at: ""
        }
    ])
    const [createIndex, setCreateIndex] = useState<number>(0);
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [potentialDeleteList, setPotentialDeleteList] = useState<number[]>([]);
    const [clearToggle, setClearToggle] = useState<number>(0);
    const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
    const location = useLocation();
    const [streak, setStreak] = useState(location.state?.streak || 0);


    const fetch_problem_sets = async (session_user_id: number) => {
        const fecth_problem_set_response = await fetch(`${PROBLEM_SET_API_URL}/getProblemSets`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({user_id: session_user_id}),
        })
        const fetched_problem_sets_json = await fecth_problem_set_response.json();
        const fetched_problem_sets_data = fetched_problem_sets_json.problem_sets;
        setProblemSets(fetched_problem_sets_data);
        setSnapShotProblemSet(fetched_problem_sets_data);
        setIsLoaded(true);
    }

    useEffect(() => {
        const checkUserValidation = async () => {
            const getSessionInfoRepsonse = await fetch(`${UTILS_API_URL}/SessionInfo`, {
                method: "GET",
                credentials: "include"
            })
            const session_info_body = await getSessionInfoRepsonse.json();
            const session_user_id = session_info_body.session.user_id || null
            if (session_user_id === null) {
                navigate("/SignIn");
            } else {
                await fetch_problem_sets(session_user_id);
            }
        }
        checkUserValidation();
    }, []);


    if (loading) {
        return null;
    }
    if (!userData) {
        return <span>User Data Not Found</span>
    }

    const handleEditMode = async () => {
        setEditMode(true);
    }


    const handleSaveUpdate = async () => {
        const update_problem_set_status = await fetch(`${PROBLEM_SET_API_URL}/UpdateProblemSets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({problemSetModMap})
        })

        if (update_problem_set_status.status === 500) {
            console.log("Internal Server Error");
        } else {
            setProblemSetModMap({});
        }
    }


    const handleSaveCreate = async () => {
        const create_problem_set_status = await fetch(`${PROBLEM_SET_API_URL}/CreateNewProblemSet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({potentialCreateProblemSet})
        })

        if (create_problem_set_status.status === 200) {
            setPotentialCreateProblemSet({});
        } else {
           console.log("Internal Server Error") ;
        }
    }


    const handleSaveDelete = async () => {
        const delete_problems_response = await fetch(`${PROBLEM_SET_API_URL}/DeleteProblemSets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({potentialDeleteList})
        })

        if (delete_problems_response.status === 200) {
            setPotentialDeleteList([]);
        } else {
            console.log("Internal Server Error");
        }
    }


    const handleSave = async () => {
        if (Object.keys(potentialCreateProblemSet).length > 0) {
            await handleSaveCreate();
        }
        if (Object.keys(problemSetModMap).length > 0) {
            await handleSaveUpdate();
        }
        if (potentialDeleteList.length > 0) {
            setIsOverlayOpen(true);
        } else {
            await fetch_problem_sets(userData.user_id);
            setEditMode(false);
            setDeleteMode(false);
        }
    }


    const handleDelete = async () => {
        setDeleteMode(true);
    }


    const handleAddPotentialDelete = (problem_set_id: number) => {
        setPotentialDeleteList(prev => [
            ...prev,
            problem_set_id
        ])
    }


    const handleRemovePotentialDelete = (problem_set_id: number) => {
        setPotentialDeleteList(prev => prev.filter(id => id != problem_set_id));
    }


    const handleAddProblemSet = async () => {
        setEditMode(true);
        const new_problem_set: ProblemSet = {
            "problem_set_id": createIndex,
            "problem_set_title": "",
            "problem_set_description": "",
            "problem_counts": 0,
            "created_by": userData.user_id,
            "is_temp": true,
        };
        setProblemSets(prev => [
            ...prev,
            new_problem_set
        ]);
        setPotentialCreateProblemSet(prev => ({
            ...prev,
            [createIndex]: {
                attributes: {
                    ...(prev[createIndex]?.attributes || {}),
                    ...new_problem_set,
                },
            },
        }));
        setCreateIndex(prev => prev + 1);
    };


    const handleCancel = () => {
        setPotentialDeleteList([]);
        setPotentialCreateProblemSet({});
        setProblemSetModMap({});
        setClearToggle(prev => prev ^ 1)
        setProblemSets(snapShotProblemSet);
        setEditMode(false);
        setDeleteMode(false);
    }


    const handleProblemSetChange = (problem_set_id: number, change: ProblemSetModificationMap, is_temp: boolean) => {
        if (!is_temp) {
            setProblemSetModMap(prev => ({
                ...prev,
                [problem_set_id]: {
                    attributes: {
                        ...(prev[problem_set_id]?.attributes || {}),
                        ...change,
                    }
                }
            }))
        }
        else {
            setPotentialCreateProblemSet(prev => ({
                ...prev,
                [problem_set_id]: {
                    attributes: {
                        ...(prev[problem_set_id]?.attributes || {}),
                        ...change,
                    }
                }
            }))
        }
    }


    const handleCloseOverlay = () => {
        setPotentialDeleteList([]);
        setIsOverlayOpen(false);
    }


    const handleConfirmDelete = async () => {
        await handleSaveDelete();
        setIsOverlayOpen(false);
        setDeleteMode(false);
        await fetch_problem_sets(userData.user_id);
    }


    return (
        <div className="HomePageContainer">
            <NavBar/>
            <Overlays isOpen={isOverlayOpen}>
                <div className="DeleteAlertContent">
                    <div className="AlertHeader">
                        <h1 className="WarningTitleText">CRITICAL OPERATION</h1>
                        <div className="WarningPulse"></div>
                    </div>
                    
                    <p className="WarningMessageText">
                        <span className="Highlight">{potentialDeleteList.length} DATA MODULES</span> 
                        SELECTED FOR PERMANENT PURGE. ONCE EXECUTED, DATA RECOVERY IS IMPOSSIBLE.
                    </p>
                    
                    <div className="overlay__buttons">
                        <button className="confirmDelete neon-btn-red" onClick={handleConfirmDelete}>
                            CONFIRM
                        </button>
                        <button className="cancelDelete" onClick={handleCloseOverlay}>
                            ABORT
                        </button>
                    </div>
                </div>
            </Overlays>

            {isloaded && problemSets.length > 0 && (
                <div className="ControlConsole">
                    {editMode || deleteMode ? (
                        <div className="CommandBar active-override">
                            <button className="CommandButton save-btn" onClick={handleSave}>
                                <span className="btn-glitch">SAVE CHANGES</span>
                            </button>
                            <button className="CommandButton revert-btn" onClick={handleCancel}>
                                ABORT CHANGES
                            </button>
                        </div>
                    ) : (
                        <div className="CommandBar">
                            <button className="CommandButton edit-btn" onClick={handleEditMode}>
                                MODIFY ARCHIVE
                            </button>
                            <button className="CommandButton delete-btn" onClick={handleDelete}>
                                PURGE MODE
                            </button>
                        </div>
                    )}
                </div>
            )}

            {
                (isloaded && problemSets.length == 0) &&
                <div className="CreateFirstProblemTextMessageContainer">
                    <h2 className="CreateFirstProblemTextMessage">Create your first Problem Set Now!!</h2>
                </div>
            }

            {
                isloaded ?
                <div className="problemSetCardsContainer">
                    {
                    problemSets.map(problem_set => (
                        <div key={problem_set.problem_set_id}>
                            <ProblemSetCard problem_set={problem_set} editMode={editMode} deleteMode={deleteMode} is_temp={problem_set.is_temp ?? false}
                            handleChange={handleProblemSetChange}
                            handleAddPotentialDeleteProblems={handleAddPotentialDelete}
                            handleRemovePotentialDeleteProblems={handleRemovePotentialDelete}
                            handleClearToggle={clearToggle}/>
                        </div>
                    ))
                    }
                </div> :
                <div className="LoadingAnimationContainer">
                    <Mosaic color="#d6af37" size="large"/>
                </div>
            }
            {
                isloaded && 
                <div className="AddDivButtonContainer">
                    <div className="TerminalAddButton" onClick={handleAddProblemSet}>
                        <div className="button-frame">
                            <div className="plus-icon">+</div>
                            <div className="button-glitch"></div>
                        </div>
                        <span className="button-label">NEW PROBLEM SETS</span>
                    </div>
                </div>
            }
        </div>
    )
}




export default HomePage;