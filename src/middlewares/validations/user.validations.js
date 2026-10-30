import { body, param } from "express-validator";
import { UserModel } from "../../models/user.model.js";

// validacion del id que llega por parametro, se reutiliza en buscar por id, actualizar y eliminar
// la existencia del usuario se verifica en el controlador para poder responder con 404
export const userIdValidation = [
    param("id")
        .isMongoId().withMessage("El id debe ser un ObjectId válido"),
];

// validaciones para actualizar un usuario, todos los campos son opcionales
export const updateUserValidation = [
    ...userIdValidation,
    body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage("El username debe tener entre 3 y 20 caracteres")
        .bail()
        .isAlphanumeric().withMessage("El username debe ser alfanumérico")
        .bail()
        // evita duplicados excluyendo al propio usuario que se esta actualizando
        .custom(async (username, { req }) => {
            const user = await UserModel.findOne({
                username,
                _id: { $ne: req.params.id },
            });
            if (user) throw new Error("El username ya está en uso");
        }),
    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("El email no es válido")
        .bail()
        .custom(async (email, { req }) => {
            const user = await UserModel.findOne({
                email,
                _id: { $ne: req.params.id },
            });
            if (user) throw new Error("El email ya está registrado");
        }),
    body("role")
        .optional()
        .isIn(["user", "admin"]).withMessage("El rol solo puede ser user o admin"),
    body("profile.firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .bail()
        .isAlpha("es-ES", { ignore: " " }).withMessage("El nombre solo puede contener letras"),
    body("profile.lastName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres")
        .bail()
        .isAlpha("es-ES", { ignore: " " }).withMessage("El apellido solo puede contener letras"),
    body("profile.birthDate")
        .optional()
        .isISO8601().withMessage("La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)")
        .bail()
        .custom((birthDate) => {
            if (new Date(birthDate) > new Date()) throw new Error("La fecha de nacimiento no puede ser futura");
            return true;
        }),
    body("profile.phone")
        .optional()
        .isNumeric().withMessage("El teléfono solo puede contener números")
        .bail()
        .isLength({ min: 8, max: 15 }).withMessage("El teléfono debe tener entre 8 y 15 dígitos"),
];