require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../models/db')


router.get("/SessionInfo", (req, res) => {
    return res.json({session: req.session, sessionID: req.sessionID})
})


module.exports = router;