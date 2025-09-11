import express from "express";
import { createEvent, deleteEvent, getEvent, getEvents, getUserBookedEvents, getUserCreatedEvents, updateEvent } from "../controllers/event.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/create", protectRoute, createEvent);
router.delete("/delete/:id", protectRoute, deleteEvent);
router.put("/update/:id", protectRoute, updateEvent);
router.get("/myEvents", protectRoute, getUserCreatedEvents);
// router.get("/myBookedEvents/:userId", protectRoute, getUserBookedEvents);

export default router;