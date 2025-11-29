import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: "Unauthorized"});
    }

    const accessToken = authHeader.split(' ')[1];

    if(!accessToken){
        return res.status(401).json({message: "Unauthorized - No token provided"});
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY);

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid Token"});
        }

        const user = await User.findById(decoded.id).select("-password"); 
        
        req.user = user;
        next();
    } catch(error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(500).json({message: "Server error during authentication"});
    }
}