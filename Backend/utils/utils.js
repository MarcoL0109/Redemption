require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../models/db');
const { passiveAuth } = require('../middleware/authMiddleware');
const validateResetToken = require('../middleware/authResetMiddleware');


router.get("/SessionInfo", passiveAuth, (req, res) => {
    return res.json({
        status: "SUCCESS",
        session: {
            user_id: req.user?.user_id || null,
            sessionID: req.sessionID
        }
    });
});


router.get("/ResetsessionInfo", validateResetToken, (req, res) => {
    return res.json({
        status: "SUCCESS",
        session: {
            email: req.resetEmail || null,
            sessionID: req.sessionID
        }
    });
});


module.exports = router;