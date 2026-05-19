const jwt = require('jsonwebtoken');


// This is the strict JWT validation check, no token no passing through expect when you hold the internal secrets in the request header
const strictAuth = (req, res, next) => {
    const token = req.signedCookies.authToken;
    const internalKey = req.headers['x-internal-service-key'];
    if (internalKey && internalKey === process.env.RECAT_APP_INTERNAL_SECRET_KEY) {
        return next();
    }

    if (!token) {
        return res.status(401).json({ 
            status: "ERROR", 
            message: "Access Denied: Guard verification failed. No token found_" 
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.REACT_APP_SESSION_SECRET);      
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: "ERROR", 
            message: "Access Denied: Verification sequence invalid or expired_" 
        });
    }
};


const passiveAuth = (req, res, next) => {

    const internalKey = req.headers['x-internal-service-key'];
    if (internalKey && internalKey === process.env.INTERNAL_SERVICE_KEY) {
        return next();
    }
    const token = req.signedCookies?.authToken || req.cookies?.authToken;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.REACT_APP_SESSION_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        console.log(err)
        req.user = null;
        next();
    }
};

module.exports = { strictAuth, passiveAuth };
