import { body, param } from "express-validator";
import { EventModel } from "../../models/event.model.js";
import { CategoryModel } from "../../models/category.model.js";

// validacion del id del evento que llega por parametro
// la existencia se verifica en el controlador o en ownerOrAdminMiddleware para poder responder con 404
export const eventIdValidation = [
    param("id")
        .isMongoId().withMessage("El id debe ser un ObjectId válido"),
];

// validaciones para crear un evento
export const createEventValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("El título es obligatorio")
        .bail()
        .isLength({ min: 3, max: 150 }).withMessage("El título debe tener entre 3 y 150 caracteres")
        .bail()
        // evita eventos con el mismo titulo
        .custom(async (title) => {
            const event = await EventModel.findOne({ title });
            if (event) throw new Error("Ya existe un evento con ese título");
        }),
    body("description")
        .trim()
        .notEmpty().withMessage("La descripción es obligatoria")
        .bail()
        .isLength({ min: 20 }).withMessage("La descripción debe tener al menos 20 caracteres"),
    body("startDate")
        .notEmpty().withMessage("La fecha de inicio es obligatoria")
        .bail()
        .isISO8601().withMessage("La fecha de inicio debe ser una fecha válida"),
    body("endDate")
        .notEmpty().withMessage("La fecha de fin es obligatoria")
        .bail()
        .isISO8601().withMessage("La fecha de fin debe ser una fecha válida")
        .bail()
        // el segundo parametro de custom da acceso a req, lo que permite leer la fecha de inicio del mismo body
        // custom sincrono, tiene que devolver true para que la validacion pase
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.startDate)) {
                throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
            }
            return true;
        }),
    body("capacity")
        .notEmpty().withMessage("La capacidad es obligatoria")
        .bail()
        .isInt({ min: 1 }).withMessage("La capacidad debe ser un número entero mayor o igual a 1"),
    body("price")
        .optional()
        .isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0"),
    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"]).withMessage("El estado solo puede ser scheduled, cancelled o finished"),

    // validaciones del documento embebido location
    body("location.venue")
        .trim()
        .notEmpty().withMessage("El lugar es obligatorio")
        .bail()
        .isLength({ min: 3, max: 100 }).withMessage("El lugar debe tener entre 3 y 100 caracteres"),
    body("location.address")
        .trim()
        .notEmpty().withMessage("La dirección es obligatoria")
        .bail()
        .isLength({ min: 5, max: 150 }).withMessage("La dirección debe tener entre 5 y 150 caracteres"),
    body("location.city")
        .trim()
        .notEmpty().withMessage("La ciudad es obligatoria")
        .bail()
        .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

    // categorias es opcional, pero si se manda tiene que ser un array
    body("categories")
        .optional()
        .isArray().withMessage("categories debe ser un array"),
    // el asterisco recorre cada elemento del array
    body("categories.*")
        .isMongoId().withMessage("Cada categoría debe ser un ObjectId válido")
        .bail()
        // se verifica que cada categoria enviada exista
        .custom(async (categoryId) => {
            const category = await CategoryModel.findById(categoryId);
            if (!category) throw new Error(`La categoría ${categoryId} no existe`);
        }),
];

// validaciones para actualizar un evento, todos los campos son opcionales
// en la ruta se ejecutan despues de ownerOrAdminMiddleware, por eso req.event ya tiene el evento guardado
export const updateEventValidation = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 150 }).withMessage("El título debe tener entre 3 y 150 caracteres")
        .bail()
        // evita duplicados excluyendo al propio evento que se esta actualizando
        .custom(async (title, { req }) => {
            const event = await EventModel.findOne({ title, _id: { $ne: req.params.id } });
            if (event) throw new Error("Ya existe un evento con ese título");
        }),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 20 }).withMessage("La descripción debe tener al menos 20 caracteres"),
    body("startDate")
        .optional()
        .isISO8601().withMessage("La fecha de inicio debe ser una fecha válida")
        .bail()
        // si no se manda la fecha de fin, se compara con la que ya tiene guardada el evento
        .custom((startDate, { req }) => {
            if (!req.body.endDate && new Date(startDate) >= req.event.endDate) {
                throw new Error("La fecha de inicio debe ser anterior a la fecha de fin del evento");
            }
            return true;
        }),
    body("endDate")
        .optional()
        .isISO8601().withMessage("La fecha de fin debe ser una fecha válida")
        .bail()
        // si no se manda la fecha de inicio, se compara con la que ya tiene guardada el evento
        .custom((endDate, { req }) => {
            const startDate = req.body.startDate ? new Date(req.body.startDate) : req.event.startDate;
            if (new Date(endDate) <= startDate) {
                throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
            }
            return true;
        }),
    body("capacity")
        .optional()
        .isInt({ min: 1 }).withMessage("La capacidad debe ser un número entero mayor o igual a 1"),
    body("price")
        .optional()
        .isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0"),
    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"]).withMessage("El estado solo puede ser scheduled, cancelled o finished"),
    body("location.venue")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage("El lugar debe tener entre 3 y 100 caracteres"),
    body("location.address")
        .optional()
        .trim()
        .isLength({ min: 5, max: 150 }).withMessage("La dirección debe tener entre 5 y 150 caracteres"),
    body("location.city")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),
    body("categories")
        .optional()
        .isArray().withMessage("categories debe ser un array"),
    body("categories.*")
        .isMongoId().withMessage("Cada categoría debe ser un ObjectId válido")
        .bail()
        .custom(async (categoryId) => {
            const category = await CategoryModel.findById(categoryId);
            if (!category) throw new Error(`La categoría ${categoryId} no existe`);
        }),
];