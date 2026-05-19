console.log("!!! SERVER.JS IS STARTING !!!");
require('dotenv').config();
const express = require("express");
const path = require('path');
const cors = require("cors");
const sessions = require("express-session");
const { redisClient } = require("./utils/redis.js");
const { RedisStore } = require("connect-redis");
const cookie_parser = require("cookie-parser");

// 💡 IMPORT YOUR NEW JWT MIDDLEWARE GUARD HERE
const { strictAuth, passiveAuth } = require('./middleware/authMiddleware.js'); 

// APIs
const userAPIs = require('./API/accountManagement.js');
const utilAPIs = require('./utils/utils.js');
const problemSetsAPIs = require('./API/problemSetManagement.js');
const roomManagementAPI = require('./API/quizRoomManagement.js');
const historyManagementAPI = require('./API/historyManagement.js');

const app = express();

async function startApp() {
    try {
        if (!redisClient.isOpen) {
            console.log("🔄 Connecting to Redis...");
            await redisClient.connect();
        }
        console.log("✅ Redis Connected.");

        app.use(cookie_parser(process.env.REACT_APP_SESSION_SECRET));
        app.use(express.json());

        app.use(cors({ 
            credentials: true, 
            origin: true,
        }));

        app.use(sessions({
            secret: process.env.REACT_APP_SESSION_SECRET,
            store: new RedisStore({ client: redisClient }),
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 180 * 60 * 1000 }
        }));

        const distPath = path.join(__dirname, '/../Frontend/dist');
        app.use(express.static(distPath));

        
        app.use("/api/users", userAPIs);
        // This needs to be tested to see whether non login user can use room APIs
        app.use("/api/rooms", passiveAuth, roomManagementAPI);
        app.use("/utils", passiveAuth, utilAPIs);
        app.use("/api/problemsets", strictAuth, problemSetsAPIs);
        app.use("/api/history", strictAuth, historyManagementAPI);

        app.get('/', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });

        const PORT = 5500;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ CRITICAL: Server failed to start:", err);
        process.exit(1);
    }
}

startApp();