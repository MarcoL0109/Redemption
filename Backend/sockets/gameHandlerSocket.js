const {constructPlayerList, constructRankingList, constructPlayerOrder} = require("../utils/gameUtils");
const API_PREFIX = require("../../utils/api_routes.json");
const {activeRoomProblems, problemStartTime} = require("../utils/gameStates")


module.exports = function(io, redisClient) {
    return {
        handleKickPlayer: async (data) => {
            const { roomCode, playerIndex } = data;
            const playerSession = await redisClient.hGet(`${roomCode}-Player-Session`, playerIndex);
            const playerUserId = await redisClient.hGet(`${roomCode}-Session-UserId`, playerSession);
            const targetSocketId = await redisClient.hGet(`${roomCode}-Session-Socket`, playerSession);
            const roomSocketId = await redisClient.hGet(roomCode, "SocketId");
            const username = await redisClient.hGet(`${roomCode}-List`, playerSession);
            const problemSetId = await redisClient.hGet(roomCode, "ProblemSetId");
            const fetchSocket = await io.in(targetSocketId).fetchSockets();
            const targetSocket = fetchSocket[0];

            await Promise.all([
                    redisClient.hDel(`${roomCode}-List`, playerSession),
                    redisClient.hDel(`${roomCode}-Player-Session`, playerIndex),
                    redisClient.hDel(`${roomCode}-Session-Player`, playerSession),
                    redisClient.hDel(`${roomCode}-Session-Socket`, playerSession),
                    redisClient.hDel(`${roomCode}-Session-Score`, playerSession),
                    redisClient.del(`${playerSession}-${roomCode}-Answer-History`, playerSession),
                    redisClient.hDel(`${roomCode}-Last-Problem-Answered`, playerSession),
                    redisClient.hDel(`${roomCode}-Session-UserId`, playerSession),
                ]);
            io.to(targetSocketId).emit("kick-player-message", `${username} is kicked by host`);
            const player_list_names = await constructPlayerList(roomCode, roomSocketId);
            io.to(roomSocketId).emit("returned-player-list", player_list_names);
            targetSocket.leave(roomSocketId);
            try {
                const updateKickStatus = await fetch(`http://backend:5500${API_PREFIX.ROOMS}/updateCompletness`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Internal-Service-Key": process.env.INTERNAL_SECRET_KEY
                    },
                    credentials: "include",
                    body: JSON.stringify({roomCode: roomCode, completness: 2, userId: playerUserId})
                })
                const repson = await updateKickStatus.json();
            } catch (error) {
                console.error(error);
                const responseJSON = await updateKickStatus.json();
                const responseSummary = responseJSON.result;
            }
        },


        handleInitGameInfo: async (data, socket_id) => {
            const {roomCode, sessionId} = data;
            const rankingList = await constructRankingList(roomCode);
            const playerIndex = await redisClient.hGet(`${roomCode}-Session-Player`, sessionId);
            io.to(socket_id).emit("set-ranklist-ref", {rankList: rankingList});
            io.to(socket_id).emit("set-player-index", {playerIndex: parseInt(playerIndex, 10)});
        },


        handleSubmitClientAnswer: async (data, socket_id) => {
            const {question_type, clientAnswer, roomCode, sessionId} = data;
            const currentDate = Date.now();
            const currProblemStartTime = problemStartTime.get(roomCode);
            const timeElapsedMs = currentDate - currProblemStartTime;
            const timeElapsedRounded = Math.floor(timeElapsedMs / 1000);
            const currProblem = activeRoomProblems.get(roomCode);
            const timeAllowed = currProblem.time_allowed_in_seconds;
            const timeRemain = timeAllowed - timeElapsedRounded;
            const correctAnswer = question_type === "MC" ? currProblem.correct_answer.MC : currProblem.correct_answer.Blanks;
            const isCaseSensitive = currProblem.case_sensitive;
            let isCorrectAnswer = false;
            if (isCaseSensitive) {
                isCorrectAnswer = correctAnswer === clientAnswer;
            } else {
                const lowerCaseCorrectAnswer = correctAnswer.toLowerCase();
                const lowerCaseClientAnswer = clientAnswer.toLowerCase();
                isCorrectAnswer = lowerCaseClientAnswer === lowerCaseCorrectAnswer;
            }
            let returnScore = (isCorrectAnswer ? 100 : 0);
            if (isCorrectAnswer === true) {
                const scoreForTime = 100 * (timeRemain / timeAllowed);
                returnScore += scoreForTime;
            }
            await redisClient.hIncrBy(`${roomCode}-Session-Score`, sessionId, returnScore);
            await redisClient.rPush(`${sessionId}-${roomCode}-Answer-History`, clientAnswer);
            await redisClient.hSet(`${roomCode}-Session-Last-Problem-Answered`, sessionId, currProblem.problem_id);
            io.to(socket_id).emit("check-answer-response", {
                correct: isCorrectAnswer,
                score: returnScore,
            });
        }
    }
}