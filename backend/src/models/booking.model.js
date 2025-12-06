import mongoose from "mongoose";

const bookingSchema = mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        totalPrice: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending"
        },
        paymentId: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

// Create a compound unique index to prevent duplicate bookings
bookingSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;