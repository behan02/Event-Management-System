import express from "express";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/fetch", getEvents);
router.post("/create", createEvent);
router.delete("/delete/:id", deleteEvent);
router.put("/update/:id", updateEvent);

export default router;