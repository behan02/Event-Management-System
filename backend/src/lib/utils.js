import jwt from "jsonwebtoken";

export const generateToken = (id, res) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: "1d"});

    res.cookie("token", token, { 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true, 
        secure: (process.env.NODE_ENV || "development") === "production", // Fallback to development
        sameSite: "strict"
    });

    return token;
}