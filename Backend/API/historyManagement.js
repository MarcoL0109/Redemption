// Move all the History related API to this file
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const {redisClient, subscriber} = require("../utils/redis");
const db = require('../models/db');


router.post("/fetchInsertProblemSetSnapShotId", async (req, res) => {
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
    const { userId, limit } = req.body;
    let selectQuery = `SELECT join_history_id, host.username as Host, ps.problem_set_title as ProblemSetTitle, join_history_score,
                            join_history_game_start_datetime,
                            join_history_completness, join_history_snapshot_id
                            FROM join_history j 
                            JOIN user_info host ON j.join_history_hosted_by = host.user_id
                            JOIN problem_set_snapshots ps ON ps.snapshot_id = j.join_history_snapshot_id
                            WHERE j.user_id = ?
                            ORDER BY join_history_game_start_datetime DESC`;
    
    const queryParams = [userId];
    if (limit && !isNaN(limit)) {
        selectQuery += ` LIMIT ?`;
        queryParams.push(parseInt(limit));
    }
    try {
        const historyRecords = await db.query(selectQuery, queryParams);
        res.status(200).json({historyRecords: historyRecords[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/getSnapShotContent", async (req, res) => {
    const {snapShotId} = req.body;
    const selectQuery = "SELECT question_text, question_type, correct_answer, answer_options, sequence_no FROM snapshot_questions WHERE snapshot_id = ? ORDER BY sequence_no";
    try {
        const [snapShotContent] = await db.query(selectQuery, [Number(snapShotId)]);
        res.status(200).json({result: snapShotContent});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/getAnswerHistory", async (req, res) => {
    const {historyRecordId} = req.body;
    const selectQuery = "SELECT join_history_answer_history FROM join_history WHERE join_history_id = ?";
    try {
        const [answerHistory] = await db.query(selectQuery, [historyRecordId]);
        if (answerHistory.length === 0) {            
            return res.status(200).json({ result: [] });
        }
        res.status(200).json({result: answerHistory});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})


router.post("/insertJoinHistoryInfo", async (req, res) => {
    const {roomCode, userIds} = req.body;
    try {
        const hostUserId = await redisClient.hGet(roomCode, "Host-UserId");
        const gameStartTime = await redisClient.hGet(roomCode, "GameStartTime");
        const problemSnapShotId = await redisClient.hGet(roomCode, "ProblemSnapShotID");
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
            const sessionAnswerHistory = await redisClient.lRange(`${sessionId}-${roomCode}-Answer-History`, 0, -1);
            const sessionScore = await redisClient.hGet(`${roomCode}-Session-Score`, sessionId);
            try {
                await db.query(`UPDATE join_history 
                                SET join_history_score = ?, join_history_answer_history = ?, join_history_completness = ?
                                WHERE join_history_id IN (?) AND user_id = ?;`, 
                                [sessionScore, JSON.stringify(sessionAnswerHistory), "Completed", historyNumericId, userId]);
                await db.query(
                    `UPDATE user_stats 
                    SET highest_score = ? 
                    WHERE user_id = ? AND highest_score < ?`,
                    [sessionScore, userId, sessionScore]
                );
                await db.query(
                    `UPDATE user_stats
                    SET no_of_completed_quiz = no_of_completed_quiz + 1
                    WHERE user_id = ?`,
                    [userId]
                );
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
    let successSessionIds = [], failedSessionIds = [];
    const updateQuery = `UPDATE join_history SET join_history_completness = ?
                                WHERE join_history_id IN (?) AND user_id = ?`;
    if (completness === 2 && userId !== null && isRoomStarted !== 0) {
        try {
            await db.query(updateQuery, [completnessMap[completness], historyNumericId, Number(userId)]);
            successSessionIds.push(userId);
        } catch (error) {
            console.error(error);
            failedSessionIds.push({
                userId: userId,
                error: error.message
            });
        }
    } else if (isRoomStarted !== 0) {
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
    }
    res.status(200).json({summary: {total: successSessionIds.length + failedSessionIds.length,
        successCount: successSessionIds.length, failedCount: failedSessionIds.length,
    }, result: {success: successSessionIds, failed: failedSessionIds}})
})


module.exports = router