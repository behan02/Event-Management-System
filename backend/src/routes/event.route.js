import express from "express";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/event.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/fetch", getEvents);
router.post("/create", protectRoute, createEvent);
router.delete("/delete/:id", protectRoute, deleteEvent);
router.put("/update/:id", protectRoute, updateEvent);

export default router;