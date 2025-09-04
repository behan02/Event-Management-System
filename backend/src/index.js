import express from "express";
import dotenv from "dotenv";

import eventRoutes from "./routes/event.route.js";
import { connectDB } from "./lib/db.js";

import "./models/event.model.js";
import "./models/user.model.js";
import "./models/booking.model.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/events", eventRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    connectDB();
})