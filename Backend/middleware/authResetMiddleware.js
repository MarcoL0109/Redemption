const jwt = require("jsonwebtoken");


const validateResetToken = (req, res, next) => {
    const tempToken = req.signedCookies?.resetToken || req.cookies?.resetToken;

    if (!tempToken) {
        return res.status(401).json({ 
            status: "ERROR", 
            message: "Access Denied: Password reset session missing or expired." 
        });
    }
    try {
        const decoded = jwt.verify(tempToken, process.env.REACT_APP_SESSION_SECRET);
        if (decoded.purpose !== "Password Reset") {
            return res.status(403).json({ status: "ERROR", message: "Invalid session token purpose." });
        }
        req.resetEmail = decoded.email;
        return next();
    } catch (error) {
        return res.status(403).json({ 
            status: "ERROR", 
            message: "Access Denied: Reset token invalid or expired." 
        });
    }
};


module.exports = validateResetToken;