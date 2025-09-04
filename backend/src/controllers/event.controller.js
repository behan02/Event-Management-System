import Event from "../models/event.model.js"
import mongoose from "mongoose"

export const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        if (!title || !description || !date || !location) {
            return res.status(400).json({ message: "Missing required fields: title, description, date, and location" });
        }
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event" });
    }
};

export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    try {
        const deletedEvent = await Event.findOneAndDelete({ _id: id });
        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Error deleting event" });
    }
};

export const updateEvent = async (req, res) => {
    const { id } = req.params;

    const updatedData = req.body;

    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
       console.error("Error updating event:", error);
       res.status(500).json({ message: "Error updating event" });
   }
}