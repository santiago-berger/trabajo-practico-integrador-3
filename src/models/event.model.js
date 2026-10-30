import { model, Schema, Types } from "mongoose";

const eventSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            minlength: 20,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            enum: ["scheduled", "cancelled", "finished"],
            default: "scheduled"
        },
        // documento embebido uno a uno, la ubicacion se guarda dentro del evento
        location: {
            venue: {
                type: String,
                required: true,
                minlength: 3,
                maxlength: 100,
            },
            address: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 150,
            },
            city: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 50,
            },
        },
        organizer: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        categories: [
            {
                type: Types.ObjectId,
                ref: "Category",
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const EventModel = model("Event", eventSchema);