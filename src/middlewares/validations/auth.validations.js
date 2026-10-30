import { body } from "express-validator";
import { UserModel } from "../../models/user.model.js";

// validaciones para registrar un usuario
export const registerValidation = [
    body("username")
        .trim()
        .notEmpty().withMessage("El username es obligatorio")
        .bail()
        .isLength({ min: 3, max: 20 }).withMessage("El username debe tener entre 3 y 20 caracteres")
        .bail()
        .isAlphanumeric().withMessage("El username debe ser alfanumérico")
        .bail()
        // evita duplicados, busca si ya existe un usuario con ese username
        .custom(async (username) => {
            const user = await UserModel.findOne({ username });
            if (user) throw new Error("El username ya está en uso");
        }),
    body("email")
        .trim()
        .notEmpty().withMessage("El email es obligatorio")
        .bail()
        .isEmail().withMessage("El email no es válido")
        .bail()
        // evita duplicados, busca si ya existe un usuario con ese email
        .custom(async (email) => {
            const user = await UserModel.findOne({ email });
            if (user) throw new Error("El email ya está registrado");
        }),
    body("password")
        .notEmpty().withMessage("La contraseña es obligatoria")
        .bail()
        // minimo 8 caracteres, al menos una mayuscula, una minuscula y un numero
        .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
        .withMessage("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número"),

    // validaciones del documento embebido profile
    // con el punto se accede a los campos de adentro del objeto
    body("profile.firstName")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .bail()
        .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .bail()
        .isAlpha("es-ES", { ignore: " " }).withMessage("El nombre solo puede contener letras"),
    body("profile.lastName")
        .trim()
        .notEmpty().withMessage("El apellido es obligatorio")
        .bail()
        .isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres")
        .bail()
        .isAlpha("es-ES", { ignore: " " }).withMessage("El apellido solo puede contener letras"),
    body("profile.birthDate")
        .optional()
        .isISO8601().withMessage("La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)")
        .bail()
        // custom sincrono, tiene que devolver true para que la validacion pase
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

// validaciones para iniciar sesion
export const loginValidation = [
    body("username")
        .trim()
        .notEmpty().withMessage("El username es obligatorio"),
    body("password")
        .notEmpty().withMessage("La contraseña es obligatoria"),
];

// validaciones para actualizar el perfil del usuario autenticado, todos los campos son opcionales
export const updateProfileValidation = [
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