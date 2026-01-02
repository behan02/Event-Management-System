import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import bookingRoutes from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { connectDB } from "./lib/db.js";

import "./models/event.model.js";
import "./models/user.model.js";
import "./models/booking.model.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(cors({
    origin: "https://main.d1blm9ncda9np.amplifyapp.com",
    credentials: true
}));

// Webhook route needs raw body - placed before express.json() and handled separately
app.post("/api/payment/webhook", express.raw({ type: 'application/json' }), async (req, res, next) => {
    const { handleWebhook } = await import("./controllers/payment.controller.js");
    handleWebhook(req, res, next);
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})
