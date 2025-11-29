import jwt from "jsonwebtoken";

export const generateRefreshToken = (id) => {
    const refreshToken = jwt.sign({id}, process.env.REFRESH_SECRET_KEY, { expiresIn: "7d"});

    return refreshToken;
};

export const generateAccessToken = (id) => {
    const accessToken = jwt.sign({id}, process.env.ACCESS_SECRET_KEY, { expiresIn: "15m"});

    return accessToken;
};