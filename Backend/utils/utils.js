require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../models/db')


router.get("/SessionInfo", (req, res) => {
    return res.json({
        status: "SUCCESS",
        session: {
            user_id: req.user?.user_id || null,
            sessionID: req.sessionID
        }
    });
});


module.exports = router;