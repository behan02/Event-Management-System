import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import bookingRoutes from "./routes/booking.route.js";
import { connectDB } from "./lib/db.js";

import "./models/event.model.js";
import "./models/user.model.js";
import "./models/booking.model.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})