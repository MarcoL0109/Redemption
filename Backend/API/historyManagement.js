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
    const {userId} = req.body;
    const selectQuery = `SELECT join_history_id, host.username as Host, ps.problem_set_title as ProblemSetTitle, join_history_score,
                            join_history_game_start_datetime,
                            join_history_completness, join_history_snapshot_id
                            FROM join_history j 
                            JOIN user_info host ON j.join_history_hosted_by = host.user_id
                            JOIN problem_set_snapshots ps ON ps.snapshot_id = j.join_history_snapshot_id
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