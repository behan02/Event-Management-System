import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false,
            default: "No description provided"
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            default: 0
        },
        imageUrl: {
            type: String,
            default: ""
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        bookedCount: {
            type: Number,
            default: 0
        },
        maxParticipants: {
            type: Number,
            required: true,
            min: [1, "Maximum participants must be at least 1"]
        },
        category: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

const Event = mongoose.model("Event", eventSchema);

export default Event;