import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
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
        }
    },
    { timestamps: true }
)

const Event = mongoose.model("Event", eventSchema);

export default Event;