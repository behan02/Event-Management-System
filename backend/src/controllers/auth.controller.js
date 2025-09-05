import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

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
        generateToken(newUser._id, res);

        res.status(201).json({
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
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

        generateToken(user._id, res);

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch(error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({message: "Server error during login"});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: (process.env.NODE_ENV || "development") === "production",
            sameSite: "strict"
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ message: "Server error during logout" });
    }
}