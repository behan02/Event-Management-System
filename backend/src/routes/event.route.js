import express from "express";
import { createEvent, deleteEvent, getEvent, getEvents, getUserCreatedEvents, updateEvent } from "../controllers/event.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/myEvents", protectRoute, getUserCreatedEvents);
router.post("/create", protectRoute, createEvent);
router.put("/update/:id", protectRoute, updateEvent);
router.delete("/delete/:id", protectRoute, deleteEvent);
router.get("/:id", getEvent);

export default router;