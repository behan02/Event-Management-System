import Booking from "../models/booking.model.js";
import mongoose from "mongoose";
import Event from "../models/event.model.js";
import crypto from "crypto";

export const getUserBookedEvents = async (req, res) => {
    const userId = req.user._id;

    try {
        const bookings = await Booking.find({ userId: userId })
            .populate('eventId', 'title description date location price imageUrl')
            .populate('userId', 'name email');

        res.status(200).json({
            count: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        console.error("Error in getUserBookedEvents controller:", error);
        res.status(500).json({ message: "Error fetching user booked events" });
    }
}

export const deleteBookedEvent = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid booking ID format" });
    }

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only delete your own bookings" });
        }

        // Use transaction to ensure both operations succeed or fail together
        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Update the event's bookedCount
                await Event.findByIdAndUpdate(
                    booking.eventId, 
                    { $inc: { bookedCount: -booking.quantity } },
                    { session }
                );
                
                // Delete the booking
                await Booking.findByIdAndDelete(id, { session });
            });

            res.status(200).json({ 
                message: "Booking deleted successfully",
                decrementedBy: booking.quantity 
            });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        console.error("Error in deleteBookedEvent controller:", error);
        res.status(500).json({ message: "Error deleting booking" });
    }
}

const buildPaymentMeta = (eventPrice, providedId) => {
    const paymentId = providedId || `PAY-${crypto.randomUUID ? crypto.randomUUID() : new mongoose.Types.ObjectId().toString()}`;
    const isFreeEvent = eventPrice === 0;
    return {
        paymentId,
        isPaid: isFreeEvent,
        paymentStatus: isFreeEvent ? "success" : "pending"
    };
};

export const createBooking = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { quantity, paymentId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        // Validate quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({ message: "Cannot book past events" });
        }

        // Check if enough spots available (if maxParticipants exists)
        if (event.maxParticipants && (event.bookedCount + quantity) > event.maxParticipants) {
            return res.status(400).json({ 
                message: `Not enough spots available. Only ${event.maxParticipants - event.bookedCount} spots left` 
            });
        }

        // Check for duplicate booking (user can only book once per event)
        const existingBooking = await Booking.findOne({
            eventId: eventId,
            userId: req.user._id
        });
        if (existingBooking) {
            return res.status(400).json({ message: "You have already booked this event" });
        }

        // Calculate total price
        const totalPrice = quantity * event.price;
        const paymentMeta = buildPaymentMeta(event.price, paymentId);

        // Use transaction to ensure both operations succeed
        const session = await mongoose.startSession();
        
        try {
            let newBooking;
            
            await session.withTransaction(async () => {
                newBooking = new Booking({
                    eventId,
                    userId: req.user._id,
                    quantity,
                    totalPrice,
                    ...paymentMeta
                });
                await newBooking.save({ session });

                // Update event's bookedCount
                await Event.findByIdAndUpdate(
                    eventId,
                    { $inc: { bookedCount: quantity } },
                    { session }
                );
            });

            // Populate the booking with event and user details
            await newBooking.populate('eventId', 'title date location price');
            await newBooking.populate('userId', 'name email');

            res.status(201).json({
                message: "Booking created successfully",
                booking: newBooking
            });
        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking" });
    }
}