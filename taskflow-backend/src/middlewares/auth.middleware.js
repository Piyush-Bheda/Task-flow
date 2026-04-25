const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        // format: Bearer TOKEN
        let actualToken;
        if (token.startsWith("Bearer ")) {
            actualToken = token.split(" ")[1];
        } else {
            actualToken = token; // Fallback if they just sent the token without the word "Bearer "
        }
        if (!actualToken) return res.status(401).json({ message: "Malformed token" });

        const decoded = jwt.verify(
            actualToken,
            process.env.JWT_SECRET
        );

        req.user = decoded; // attach user data
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};