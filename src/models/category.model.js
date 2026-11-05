import { model, Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minlength: 2,
            maxlength: 30,
        },
        description: {
            type: String,
            maxlength: 200,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// populate virtual muchos a muchos, una categoria esta en muchos eventos
// mongoose busca en event los documentos cuyo array categories contenga el id de esta categoria
categorySchema.virtual("events", {
    ref: "Event",
    localField: "_id",
    foreignField: "categories",
});

export const CategoryModel = model("Category", categorySchema);