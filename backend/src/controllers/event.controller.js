import Event from "../models/event.model.js"
import mongoose from "mongoose"

export const getEvents = async (req, res) => {
    try {
        const events = await Event.find();

        if(events.length === 0) {
            return res.status(404).json({ message: "No events found" });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
};

export const getEvent = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
    }

    try {
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        
        res.status(200).json(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "Error fetching event" });
    }
}

export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, maxParticipants } = req.body;
        if (!title || !description || !date || !location || !maxParticipants) {
            return res.status(400).json({ message: "Missing required fields: title, description, date, location, and maxParticipants" });
        }

        // Validate date format and ensure it's not in the past
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (eventDate < new Date()) {
            return res.status(400).json({ message: "Event date cannot be in the past" });
        }

        // Create event with authenticated user as creator
        const newEvent = new Event({
            ...req.body,
            createdBy: req.user._id
        });
        
        await newEvent.save();
        
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event" });
    }
};

export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only delete your own events" });
        }

        await Event.findByIdAndDelete(id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Error deleting event" });
    }
};

export const updateEvent = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
    }

    const updatedData = req.body;

    try {
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only update your own events" });
        }

        // Validate date if it's being updated
        if (updatedData.date) {
            const eventDate = new Date(updatedData.date);
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }
            if (eventDate < new Date()) {
                return res.status(400).json({ message: "Event date cannot be in the past" });
            }
        }

        const { createdBy, ...allowedUpdates } = updatedData;

        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: allowedUpdates }, { new: true });

        res.status(200).json(updatedEvent);
    } catch (error) {
       console.error("Error updating event:", error);
       res.status(500).json({ message: "Error updating event" });
   }
}

export const getUserCreatedEvents = async (req, res) => {
    const userId = req.user._id;

    try {
        const events = await Event.find({ createdBy: userId });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching user created events:", error);
        res.status(500).json({ message: "Error fetching user created events" });
    }
}