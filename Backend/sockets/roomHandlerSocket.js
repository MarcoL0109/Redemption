
const ROOM_CODE_EXPIRATION_TIME = 7200;
const ROOM_SHADOW_KEYS_EXPIRAION_TIME = 7500;
const {activeRoomProblems, problemStartTime} = require("../utils/gameStates")
const {constructPlayerList, constructRankingList, constructPlayerOrder} = require("../utils/gameUtils");
const PROBLEM_SET_API_URL = process.env.VITE_PROBLEM_SETS_API_URL;
const ROOM_API_URL = process.env.VITE_ROOM_MANAGEMENT_API_URL;
const HISTORY_API_URL = process.env.VITE_HISTORY_MANAGEMENT_API_URL;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



module.exports = function(io, redisClient) {


    const clearRoomInfo = async (roomCode) => {
        activeRoomProblems.delete(roomCode);
        problemStartTime.delete(roomCode);
        await Promise.all([
            redisClient.del(`${roomCode}-List`),
            redisClient.del(roomCode),
            redisClient.del(`${roomCode}-Player-Session`),
            redisClient.del(`${roomCode}-Session-Socket`),
            redisClient.del(`${roomCode}-Session-Score`),
            redisClient.del(`${roomCode}-Joined-Barrier`),
            redisClient.del(`${roomCode}-Session-Last-Problem-Answered`),
            redisClient.del(`${roomCode}-UserId`),
            redisClient.del(`${roomCode}-Session-UserId`),
            redisClient.del(`${roomCode}-UserId-HistoryId`),
        ]);
        const allSession = await redisClient.hGetAll(`${roomCode}-Session-Player`);
        for (const sessionId in allSession) {
            await redisClient.del(`${sessionId}-${roomCode}-Answer-History`);
        }
        await redisClient.del(`${roomCode}-Session-Player`);
    }


    async function streamProblems(problemSetId, roomCode) {
        const roomSocketId = await redisClient.hGet(roomCode, "SocketId");
        const fetch_problem_list_response = await fetch(`${PROBLEM_SET_API_URL}/getProblems`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ problem_set_id: problemSetId }),
        });

        if (fetch_problem_list_response.status === 500) return;

        const problemListJson = await fetch_problem_list_response.json();
        const problemList = problemListJson.problem_list;

        const runProblemTimer = (seconds, mode) => {
            return new Promise((resolve) => {
                let secondsLeft = seconds;
                if (mode === "percentage") {
                    io.to(roomSocketId).emit("receive-timer-update", { 
                        timeAllowed: seconds
                    });
                }
                const interval = setInterval(() => {
                    if (mode === 'actual') {
                        io.to(roomSocketId).emit("receive-count-down-update", { 
                            secondsLeft: secondsLeft
                        });
                    }
                    if (secondsLeft <= 0) {
                        clearInterval(interval);
                        resolve(); 
                    }
                    secondsLeft--;
                }, 1000);
            });
        };

        await runProblemTimer(3, "actual");
        for (let i = 0; i < problemList.length; i++) {

            const roomExists = await redisClient.exists(roomCode);
            if (!roomExists) {
                console.log(`Stream stopped for ${roomCode}: Room terminated.`);
                return;
            }
            const problem = problemList[i];
            activeRoomProblems.set(roomCode, problem);
            io.to(roomSocketId).emit("set-open-submit", {isOpen: true});
            io.to(roomSocketId).emit("receive-problem", { currProblem: problem });

            problemStartTime.set(roomCode, Date.now());
            await runProblemTimer(problem.time_allowed_in_seconds, "percentage");

            io.to(roomSocketId).emit("set-open-submit", {isOpen: false});
            io.to(roomSocketId).emit("display-correct-answer");
            await runProblemTimer(5, "percentage");

            const currProblemId = problem.problem_id;
            const allProgress = await redisClient.hGetAll(`${roomCode}-Session-Last-Problem-Answered`);
            const hostSession = await redisClient.hGet(roomCode, "Host");
            for (const sessionId in allProgress) {
                if (allProgress[sessionId] !== String(currProblemId) && sessionId !== hostSession) {
                    await redisClient.rPush(`${sessionId}-${roomCode}-Answer-History`, "TIMEOUT_NULL");
                }
            }

            if (i + 1 < problemList.length) {
                const rankingList = await constructRankingList(roomCode);
                io.to(roomSocketId).emit("receive-rank-list", { rankList: rankingList });
                await sleep(5000); 
            } else {

                try {
                    const updateScoreAnswerHistory = await fetch(`${ROOM_API_URL}/insertAnswerHistoryScore`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({roomCode: roomCode})
                    })
                    const responseJSON = await updateScoreAnswerHistory.json();
                    const successSessions = responseJSON.result.success;
                    const failedSessions = responseJSON.result.failed;
                    const emissions = [
                        ...successSessions.map(session => ({ session, status: 1 })),
                        ...failedSessions.map(session => ({ session, status: 0 }))
                    ];
                    for (const { session, status } of emissions) {
                        const socketId = await redisClient.hGet(`${roomCode}-Session-Socket`, session);
                        if (socketId) {
                            io.to(socketId).emit('send-save-status', { responseCode: status });
                        } else {
                            console.warn(`Could not find socket for session: ${session}`);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }

                const finalRankList = await constructPlayerOrder(roomCode);
                const rankingList = await constructRankingList(roomCode);
                let prev = null, rank = 1;

                for (let j = 0; j < finalRankList.length; j++) {
                    const player = finalRankList[j];
                    if (prev !== null && prev !== player.playerScore) {
                        rank++;
                    }
                    prev = player.playerScore;
                    const playerSocketId = await redisClient.hGet(`${roomCode}-Session-Socket`, player.sessionId);
                    if (playerSocketId) {
                        io.to(playerSocketId).emit("redirect-player-result-page", { playerRank: rank, rankingList: rankingList });
                    }
                }
                const roomHostSession = await redisClient.hGet(roomCode, "Host");
                if (roomHostSession) {
                    const roomHostSocket = await redisClient.hGet(`${roomCode}-Session-Socket`, roomHostSession);
                    if (roomHostSocket) {
                        io.to(roomHostSocket).emit("redirect-player-result-page", { playerRank: -1, rankingList: rankingList });
                    }
                }
                await clearRoomInfo(roomCode);
            }              
        }
    }


    const storeUserJoinData = async (roomCode) => {
        const loggedInUser = await redisClient.hVals(`${roomCode}-Session-UserId`);
        if (loggedInUser.length > 0) {
             try {
                const insertHistoryRecord = await fetch(`${ROOM_API_URL}/insertJoinHistoryInfo`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    }, credentials: "include",
                    body: JSON.stringify({roomCode: roomCode, userIds: loggedInUser})
                })
                if (insertHistoryRecord.status === 200) {
                    const insertedRecordJSON = await insertHistoryRecord.json();
                    const insertRecordMapping = insertedRecordJSON.mapping;
                    await redisClient.hSet(`${roomCode}-UserId-HistoryId`, insertRecordMapping);
                    console.log(`Users with ${loggedInUser} has inserted a new join hisotry to the database`)
                }
            } catch (error) {
                console.error(error);
            }
        }
    }


    const storeProblemSnapshots = async (roomCode) => {
        try {
            const snapShotResponse = await fetch(`${HISTORY_API_URL}/fetchInsertProblemSetSnapShotId`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }, credentials: "include",
                body: JSON.stringify({roomCode: roomCode})
            })
            if (snapShotResponse.status === 200) {
                const snapShotJSON = await snapShotResponse.json();
                const snapShotId = snapShotJSON.snapshotId;
                await redisClient.hSet(roomCode, "ProblemSnapShotID", snapShotId);
            }
        } catch (error) {
            console.error(error);
        }
    }


    return {

        clearRoomInfo,

        handleJoinRoom: async (data, ack, socket) => {
            const { socketId, roomCode, sessionId, playerName, userId, isLocked, checkStream, problemSetId } = data;
            const is_lock_state_here = await redisClient.hExists(roomCode, "IsLocked");
            let currentLockState = "0";
            socket.join(socketId);
            let playerIndex = await redisClient.hGet(`${roomCode}-Session-Player`, sessionId);
            if (!playerIndex) {
                const currentPlayerCount = await redisClient.hLen(`${roomCode}-List`) + 1;
                await redisClient.hSet(`${roomCode}-Player-Session`, currentPlayerCount, sessionId);
                await redisClient.hSet(`${roomCode}-Session-Player`, sessionId, currentPlayerCount);
            }
            await redisClient.hSet(`${roomCode}-List`, sessionId, playerName);
            await redisClient.hSet(`${roomCode}-Session-Socket`, sessionId, socket.id);
            await redisClient.hSet(`${roomCode}-Session-Score`, sessionId, 0);
            await redisClient.hSet(`${roomCode}-Session-Last-Problem-Answered`, sessionId, -1);
            if (!is_lock_state_here) {
                await redisClient.hSet(roomCode, "IsLocked", isLocked);
                await redisClient.hSet(roomCode, "ProblemSetId", problemSetId);
                await redisClient.expire(`${roomCode}-List`, ROOM_CODE_EXPIRATION_TIME);
                await redisClient.expire(`${roomCode}-Player-Session`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
                await redisClient.expire(`${roomCode}-Session-Socket`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
                await redisClient.expire(`${roomCode}-Session-Player`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
                await redisClient.expire(`${roomCode}-Session-Score`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
                await redisClient.expire(`${roomCode}-Session-Last-Problem-Answered`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            } else {
                currentLockState = await redisClient.hGet(roomCode, "IsLocked");
            }
            const hostSessionId = await redisClient.hGet(roomCode, "Host");
            if (userId != "0" && sessionId != hostSessionId) {
                await redisClient.hSet(`${roomCode}-Session-UserId`, sessionId, userId);
                await redisClient.expire(`${roomCode}-UserId`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            }
            
            const player_list_names = await constructPlayerList(roomCode, socketId);
            io.to(socketId).emit("returned-player-list", player_list_names);
            io.to(socketId).emit("init-room-state", Number(currentLockState));
            if (typeof ack === "function") ack(null, player_list_names);
            if (!checkStream) return
            const currentJoined = await redisClient.incr(`${roomCode}-Joined-Barrier`);
            const totalExpected = await redisClient.hLen(`${roomCode}-Session-Score`);
            if (currentJoined === totalExpected) {
                const isStarted = await redisClient.hExists(roomCode, "Status");
                if (isStarted === 0) {
                    await redisClient.hSet(roomCode, "Status", "Started")
                    await redisClient.hSet(roomCode, "GameStartTime", Date.now());
                    await storeProblemSnapshots(roomCode);
                    await storeUserJoinData(roomCode);
                    const problemSetId = await redisClient.hGet(roomCode, "ProblemSetId");
                    streamProblems(problemSetId, roomCode);
                }
            }
        },


        handleLeaveRoom: async (data, socket) => {
            const { roomCode, isHost, clientSessionId } = data;
            const roomSocketId = await redisClient.hGet(roomCode, "SocketId");
            const userName = await redisClient.hGet(`${roomCode}-List`, clientSessionId);
            if (!isHost) {
                socket.leave(roomSocketId);
                io.to(roomSocketId).emit("log-leave-message", `${userName} has left the room`);
                await redisClient.hDel(`${roomCode}-List`, clientSessionId);
                await redisClient.hDel(`${roomCode}-Session-Socket`, clientSessionId);
                const myPlayerIndex = await redisClient.hGet(`${roomCode}-Session-Player`, clientSessionId);
                await redisClient.hDel(`${roomCode}-Session-Player`, clientSessionId);
                await redisClient.hDel(`${roomCode}-Player-Session`, myPlayerIndex);
                await redisClient.hDel(`${roomCode}-Session-Score`, clientSessionId);
                await redisClient.hDel(`${roomCode}-Last-Problem-Answered`, clientSessionId);
                await redisClient.del(`${clientSessionId}-Answer-History`);
                await redisClient.hDel(`${roomCode}-Session-UserId`, clientSessionId);
                const player_list_names = await constructPlayerList(roomCode);
                io.to(roomSocketId).emit("returned-player-list", player_list_names);
            } else {
                io.to(roomSocketId).emit("room-closed", {
                    reason: "Terminated",
                    message: "Room is closed by the host"
                });
                io.in(roomSocketId).socketsLeave(roomSocketId);
                try {
                    const problemSetId = await redisClient.hGet(roomCode, "ProblemSetId");
                    const updateKickStatus = await fetch(`${ROOM_API_URL}/updateCompletness`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({roomCode: roomCode, completness: 3, userId: null})
                    })
                } catch (error) {
                    console.error(error);
                    const responseJSON = await updateKickStatus.json();
                    const responseSummary = responseJSON.result;
                    console.log(responseSummary);
                } finally {
                    await clearRoomInfo(roomCode);
                }
            }
        },


        handleSetLockState: async (data) => {
            const { roomCode, isLock } = data;
            await redisClient.hSet(roomCode, "IsLocked", isLock);
        },


        handleInitRoomStart: async (data) => {
            const {roomCode} = data;
            const roomSocketId = await redisClient.hGet(roomCode, "SocketId");
            await redisClient.expire(`${roomCode}-List`, ROOM_CODE_EXPIRATION_TIME);
            await redisClient.expire(`${roomCode}-Player-Session`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}-Session-Socket`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}-Session-Player`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}-Session-Score`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}-Joined-Barrier`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            await redisClient.expire(`${roomCode}-UserId`, ROOM_SHADOW_KEYS_EXPIRAION_TIME);
            io.to(roomSocketId).emit("redirect-room-members");
        },
    }
}