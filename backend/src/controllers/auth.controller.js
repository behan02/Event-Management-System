import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required!"});
        }
            
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Please provide a valid email address"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
        
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
        if(!passwordRegex.test(password)){
            return res.status(400).json({message: "Password must contain at least one letter and one number"});
        }

        // Check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "This email is already registered!"});
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const refreshToken = generateRefreshToken(newUser._id);
        const accessToken = generateAccessToken(newUser._id);

        res.cookie("refreshToken", refreshToken, { 
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, 
            secure: true,
            sameSite: "strict"
        });

        res.status(201).json({
            // newUser,
            accessToken
        });

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({message: "Server error during registration"});
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if(!email || !password){
            return res.status(400).json({message: "All fields are required!"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Please provide a valid email address"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid email or password"});
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, { 
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, 
            secure: true,
            sameSite: "strict"
        });

        res.status(200).json({
            // user,
            accessToken
        });

    } catch(error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({message: "Server error during login"});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ message: "Server error during logout" });
    }
}

export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({message: "Unauthorized - No refresh token provided"})
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid Token"});
        }

        const user = await User.findById(decoded.id).select("-password"); 
        
        if(!user){
            return res.status(401).json({message: "Unauthorized - User not found"});
        }

        const newAccessToken = generateAccessToken(user._id, res);

        res.status(200).json({
            // user,
            accessToken: newAccessToken
        });

    } catch(error) {
        console.error("Error in refresh controller:", error.message);
        res.status(500).json({message: "Server error during token refresh"});
    }
}