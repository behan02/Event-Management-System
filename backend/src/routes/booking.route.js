import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createBooking, deleteBookedEvent, getUserBookedEvents } from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/myBookedEvents", protectRoute, getUserBookedEvents);
router.get("/cancelBookedEvent/:id", protectRoute, deleteBookedEvent);
router.post("/createBooking/:eventId", protectRoute, createBooking);

export default router;