const express = require('express');
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
    const {roomCode, problemSetId, userIds} = req.body;
    try {
        const hostUserId = await redisClient.hGet(roomCode, "Host-UserId");
        const gameStartTime = await redisClient.hGet(roomCode, "GameStartTime");
        const values = userIds.map(userId => [userId, problemSetId, hostUserId, new Date(Number(gameStartTime)).toISOString().slice(0, 19).replace('T', ' ')]);
        const insertJoinHistoryQuery = 'INSERT INTO join_history (user_id, join_room_problems_set, join_room_hosted_by, join_room_game_start_datetime) VALUES ?';
        await db.query(insertJoinHistoryQuery, [values]);
        res.status(200).json({message: "Record Inserted"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/insertAnswerHistoryScore", async (req, res) => {
    const {roomCode} = req.body;
    const allSessionsWithUserId = await redisClient.hGetAll(`${roomCode}-Session-UserId`);
    const gameStartTimeFromRedis = await redisClient.hGet(roomCode, "GameStartTime");
    const formattedStartTime = new Date(Number(gameStartTimeFromRedis)).toISOString().replace('T', ' ').slice(0, 19);
    const hostSessionId = await redisClient.hGet(roomCode, "Host");
    const problemSetId = await redisClient.hGet(roomCode, "ProblemSetId");
    let successSessionIds = [], failedSessionIds = [];
    for (const [sessionId, userId] of Object.entries(allSessionsWithUserId)) {
        if (sessionId !== hostSessionId) {
            const sessionAnswerHistory = await redisClient.hGetAll(`${sessionId}-${roomCode}-Answer-History`);
            const sessionScore = await redisClient.hGet(`${roomCode}-Session-Score`, sessionId);
            const updateQuery = `UPDATE join_history SET join_history_score = ?, join_room_answer_history = ?, join_history_completness = ?
                                WHERE join_room_game_start_datetime = ? AND join_room_problems_set = ? AND user_id = ?`;
            try {
                await db.query(updateQuery, [sessionScore, JSON.stringify(sessionAnswerHistory), "Completed", formattedStartTime, Number(problemSetId), Number(userId)]);
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
    const {roomCode, completness, userId = null, problemSetId} = req.body;
    const completnessMap = {2: "Kicked", 3: "Terminated By Host"};
    const gameStartTimeFromRedis = await redisClient.hGet(roomCode, "GameStartTime");
    const allSessionsWithUserId = await redisClient.hGetAll(`${roomCode}-Session-UserId`);
    const hostSessionId = await redisClient.hGet(roomCode, "Host");
    const formatGameStartTime = new Date(Number(gameStartTimeFromRedis)).toISOString().replace('T', ' ').slice(0, 19);
    
    const isRoomStarted = await redisClient.hExists(roomCode, "Status");
    const updateQuery = `UPDATE join_history SET join_history_completness = ?
                                WHERE user_id = ? AND join_room_game_start_datetime = ? AND join_room_problems_set = ?`;
    if (completness === 2 && userId !== null && isRoomStarted !== 0) {
        try {
            await db.query(updateQuery, [completnessMap[completness], Number(userId), formatGameStartTime, Number(problemSetId)]);
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
                    await db.query(updateQuery, [completnessMap[completness], Number(userId), formatGameStartTime, Number(problemSetId)]);
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

router.post("/getHistoryRecord", async (req, res) => {
    const {userId} = req.body;
    const selectQuery = `SELECT join_history_id, join_history_date, join_room_game_start_datetime, 
                            host.username as Host, join_history_completness, s.problem_set_title as ProblemSet
                            FROM join_history j 
                            JOIN problem_sets s ON j.join_room_problems_set = s.problem_set_id
                            JOIN user_info host ON host.user_id = j.join_room_hosted_by
                            WHERE j.user_id = ?`;
    try {
        const historyRecords = await db.query(selectQuery, [userId]);
        res.status(200).json({historyRecords: historyRecords[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


module.exports = router