const jwt = require("jsonwebtoken");


const validateRoomToken = (req, res, next) => {
    const token = res.signedCookie?.roomToken;
    if (!token) {
        return res.status(401).json({ 
            status: "ERROR", 
            message: "Access Denied: Password reset session missing or expired." 
        });
    }

    try {
        const decode = jwt.decode(token, process.env.ROOM_JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: "ERROR", 
            message: "Access Denied: Reset token invalid or expired." 
        });
    }
}

module.exports = validateRoomToken;