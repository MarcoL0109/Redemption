const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const {redisClient, subscriber} = require("../utils/redis");
const db = require('../models/db');
const ROOM_SHADOW_KEYS_EXPIRAION_TIME = 7500;



router.get("/getRoomCode", async (req, res) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let room_code = '', exists = 1;
    while (room_code === '' || exists === 1) {
        for (let i = 0; i < 6; i++) {
            room_code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        exists = await redisClient.keys(room_code);
    }
    return res.json({ code: room_code });
})


router.post("/storeRoomCodeSocketId", async (req, res) => {
    const room_code = req.body.room_code;
    const socket_id = req.body.socket_id;
    const session_id = req.body.session_id;
    const userId = req.body.user_id;
    const is_here = await redisClient.exists(room_code);

    // If the room is not found yet in redis. That means the room is not previously made by any users yet. Any users 
    // that can call this api route is a host.
    if (is_here === 0) {
        try {
            await redisClient.hSet(room_code, "SocketId", socket_id);
            await redisClient.hSet(room_code, "Host", session_id);
            await redisClient.hSet(room_code, "Host-UserId", userId);
            await redisClient.hSet(room_code, "RoomStartTime", Date.now());
            await redisClient.expire(room_code, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal Server Error"});
        }
    }
    res.status(200).json({message: "Room Code Stored in Redis"});
})


router.post("/getRoomSocketID", async (req, res) => {
    const room_code = req.body.room_code;
    try {
        const socket_id = await redisClient.hGet(room_code, "SocketId");
        res.status(200).json({socket_id: socket_id});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/checkRoomCodeExist", async (req, res) => {
    const {roomCode} = req.body;
    const is_room_exist = await redisClient.exists(roomCode);
    if (is_room_exist === 0) {
        res.status(404).json({message: "Room with such code is not found"});
    } else {
        const isLocked = await redisClient.hGet(roomCode, "IsLocked");
        if (isLocked === "0") {
            res.status(200).json({message: "Room Found"});
        } else {
            res.status(401).json({message: "Room is Locked by the Host"});
        }
    }
})


router.post("/getRoomHost", async (req, res) => {
    const room_code = req.body.room_code;
    const received_session_id = req.body.session_id;
    try {
        const host_session_id = await redisClient.hGet(room_code, "Host");
        const is_host = host_session_id === received_session_id;
        res.status(200).json({is_host: is_host});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/insertJoinHistoryInfo", async (req, res) => {
    const {roomCode, userIds} = req.body;
    try {
        const hostUserId = await redisClient.hGet(roomCode, "Host-UserId");
        const gameStartTime = await redisClient.hGet(roomCode, "GameStartTime");
        const problemSnapShotId = await redisClient.hGet(roomCode, "ProblemSnapShotID");
        // Cannot use problem set ID directly as we are doing snapshots and not record relations
        // Need to have a snapshot ID first in order to insert in here
        const values = userIds.map(userId => [userId, hostUserId, new Date(Number(gameStartTime)).toISOString().slice(0, 19).replace('T', ' '), Number(problemSnapShotId)]);
        const insertJoinHistoryQuery = 'INSERT INTO join_history (user_id, join_history_hosted_by, join_history_game_start_datetime, join_history_snapshot_id) VALUES ?';
        const [resultHeader] = await db.query(insertJoinHistoryQuery, [values]);
        const firstId = resultHeader.insertId;
        const insertRecordMapping = Object.fromEntries(
            userIds.map((userId, index) => [userId, firstId + index])
        );
        res.status(200).json({success: true, mapping: insertRecordMapping});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, mapping: null});
    }
})


router.post("/insertAnswerHistoryScore", async (req, res) => {
    const {roomCode} = req.body;
    const allSessionsWithUserId = await redisClient.hGetAll(`${roomCode}-Session-UserId`);
    const historyRecords = await redisClient.hVals(`${roomCode}-UserId-HistoryId`);
    const historyNumericId = historyRecords.map(Number);
    const hostSessionId = await redisClient.hGet(roomCode, "Host");
    let successSessionIds = [], failedSessionIds = [];
    for (const [sessionId, userId] of Object.entries(allSessionsWithUserId)) {
        if (sessionId !== hostSessionId) {
            const sessionAnswerHistory = await redisClient.hGetAll(`${sessionId}-${roomCode}-Answer-History`);
            const sessionScore = await redisClient.hGet(`${roomCode}-Session-Score`, sessionId);
            const updateQuery = `UPDATE join_history SET join_history_score = ?, join_history_answer_history = ?, join_history_completness = ?
                                WHERE join_history_id IN (?) AND user_id = ?`;
            try {
                await db.query(updateQuery, [sessionScore, JSON.stringify(sessionAnswerHistory), "Completed", historyNumericId, Number(userId)]);
                successSessionIds.push(sessionId);
            } catch (error) {
                console.error(`SYNC_FAILURE: User ${userId} | Session ${sessionId}`, error);
                failedSessionIds.push({
                    userId: userId,
                    sessionId: sessionId,
                    error: error.message
                });
            }
        }
    };
    res.status(200).json({summary: {total: successSessionIds.length + failedSessionIds.length,
        successCount: successSessionIds.length, failedCount: failedSessionIds.length,
    }, result: {success: successSessionIds, failed: failedSessionIds}})
})


router.post("/updateCompletness", async (req, res) => {
    const {roomCode, completness, userId = null} = req.body;
    const completnessMap = {2: "Kicked", 3: "Terminated By Host"};
    const allSessionsWithUserId = await redisClient.hGetAll(`${roomCode}-Session-UserId`);
    const historyRecords = await redisClient.hVals(`${roomCode}-UserId-HistoryId`);
    const historyNumericId = historyRecords.map(Number);
    const hostSessionId = await redisClient.hGet(roomCode, "Host");    
    const isRoomStarted = await redisClient.hExists(roomCode, "Status");
    const updateQuery = `UPDATE join_history SET join_history_completness = ?
                                WHERE join_history_id IN (?) AND user_id = ?`;
    if (completness === 2 && userId !== null && isRoomStarted !== 0) {
        try {
            await db.query(updateQuery, [completnessMap[completness], historyNumericId, Number(userId)]);
            console.log("Update successful");
            res.status(200).json({message: "User Status Updated Successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Interal Server Error"});
        }
    } else if (isRoomStarted !== 0) {
        let successSessionIds = [], failedSessionIds = [];
        for (const [sessionId, userId] of Object.entries(allSessionsWithUserId)) {
            if (sessionId !== hostSessionId) {
                try {
                    await db.query(updateQuery, [completnessMap[completness], historyNumericId, Number(userId)]);
                    successSessionIds.push(sessionId);
                } catch (error) {
                    console.error(`STATUS_SYNC_FAILURE: User ${userId} | Session ${sessionId}`, error);
                    failedSessionIds.push({
                        userId: userId,
                        sessionId: sessionId,
                        error: error.message
                    });
                }
            }
        };
        res.status(200).json({summary: {total: successSessionIds.length + failedSessionIds.length,
            successCount: successSessionIds.length, failedCount: failedSessionIds.length,
        }, result: {success: successSessionIds, failed: failedSessionIds}})
    }
})


router.post("/fetchProblemSetSnapShotId", async (req, res) => {
    
    try {
        const { roomCode } = req.body;
        
        const problemSetId = await redisClient.hGet(roomCode, "ProblemSetId");
        if (!problemSetId) return res.status(404).json({ error: "Problem Set not found" });

        const [titleRows] = await db.query(
            `SELECT problem_set_title FROM problem_sets WHERE problem_set_id = ?`, 
            [problemSetId]
        );
        const [problemRows] = await db.query(
            `SELECT problem_id, sequence_no, question_type, question_text, answer_options, correct_answer
             FROM problems WHERE problem_set_id = ?`, 
            [problemSetId]
        );

        if (titleRows.length === 0) return res.status(404).json({ error: "Problem set content missing" });

        const title = titleRows[0].problem_set_title;

        const snapshotData = {
            title: title,
            questions: problemRows.map(q => ({
                id: q.problem_id,
                seq: q.sequence_no,
                type: q.question_type,
                text: q.question_text,
                options: q.answer_options,
                answer: q.correct_answer
            })).sort((a, b) => a.seq - b.seq)
        };
        
        const snapShotString = JSON.stringify(snapshotData);
        const snapshotHash = crypto.createHash('sha256').update(snapShotString).digest('hex');

        const [checkHashRes] = await db.query(
            `SELECT snapshot_id FROM problem_set_snapshots WHERE set_hash = ?`, 
            [snapshotHash]
        );

        let snapShotId;

        if (checkHashRes.length > 0) {
            snapShotId = checkHashRes[0].snapshot_id;
        } else {
            const [resHeader] = await db.query(
                `INSERT INTO problem_set_snapshots (set_hash, problem_set_title) VALUES (?, ?)`, 
                [snapshotHash, title]
            );
            
            snapShotId = resHeader.insertId;

            const questionValues = problemRows.map(q => [
                snapShotId,
                q.question_text, 
                q.question_type, 
                JSON.stringify(q.correct_answer), 
                JSON.stringify(q.answer_options), 
                q.sequence_no
            ]);

            await db.query(
                `INSERT INTO snapshot_questions 
                (snapshot_id, question_text, question_type, correct_answer, answer_options, sequence_no) 
                VALUES ?`, 
                [questionValues]
            );
        }

        res.status(200).json({ success: true, snapshotId: snapShotId });

    } catch (error) {
        console.error("Snapshot API Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


router.post("/getHistoryRecord", async (req, res) => {
    const {userId} = req.body;
    // Need to join 4 tables, join_history, user_info, problem_set_snapshots, snapshot_questions...
    const selectQuery = ``;
    try {
        const historyRecords = await db.query(selectQuery, [userId]);
        res.status(200).json({historyRecords: historyRecords[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


module.exports = router