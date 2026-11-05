import { model, Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email no válido" ],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "admin"],
            default: "user",
        },
        // documento embebido uno a uno, el perfil se guarda dentro del usuario
        // al ser un objeto y no un array mongoose no le crea un _id propio
        profile: {
            firstName: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 50,
            },
            lastName: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 50,
            },
            birthDate: {
                type: Date,
            },
            phone: {
                type: String,
            },
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        // hace que el virtual events aparezca en la respuesta, porque res.json convierte el documento con toJSON
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// populate virtual uno a muchos, un usuario organiza muchos eventos
// user no guarda sus eventos, es event el que guarda el id del usuario en organizer
userSchema.virtual("events", {
    // en que modelo buscar los documentos relacionados
    ref: "Event",
    // que campo de user se usa para comparar
    localField: "_id",
    // que campo de event tiene que coincidir con ese id, referencia que event guarda hacia user
    foreignField: "organizer",
});

export const UserModel = model("User", userSchema);