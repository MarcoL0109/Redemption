import { useParams } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "../NavBar/NavBar";


function HistoryRecord() {

    const {recordId, snapShotId} = useParams();

    useEffect(() => {
        const fetchSnapShots = async () => {
            const fetchSnapShotResponse = await fetch("/getSnapShot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({snapShotId: snapShotId})
            })
        }

        fetchSnapShots();
    }, [])



    return (
        
        <div className="HomePageContainer">
            <NavBar/>
            This is the History Page
        </div>
    )
}


export default HistoryRecord;