import { body, param } from "express-validator";
import { CategoryModel } from "../../models/category.model.js";

// validacion del id de la categoria que llega por parametro
// la existencia se verifica en el controlador para poder responder con 404
export const categoryIdValidation = [
    param("id")
        .isMongoId().withMessage("El id debe ser un ObjectId válido"),
];

// validaciones para crear una categoria
export const createCategoryValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .bail()
        .isLength({ min: 2, max: 30 }).withMessage("El nombre debe tener entre 2 y 30 caracteres")
        .bail()
        // evita categorias duplicadas
        .custom(async (name) => {
            const category = await CategoryModel.findOne({ name });
            if (category) throw new Error("Ya existe una categoría con ese nombre");
        }),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("La descripción no puede superar 200 caracteres"),
];

// validaciones para actualizar una categoria
export const updateCategoryValidation = [
    ...categoryIdValidation,
    body("name")
        .optional()
        .trim()
        .notEmpty().withMessage("El nombre no puede estar vacío")
        .bail()
        .isLength({ min: 2, max: 30 }).withMessage("El nombre debe tener entre 2 y 30 caracteres")
        .bail()
        // evita duplicados excluyendo a la propia categoria que se esta actualizando
        .custom(async (name, { req }) => {
            const category = await CategoryModel.findOne({ name, _id: { $ne: req.params.id } });
            if (category) throw new Error("Ya existe una categoría con ese nombre");
        }),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("La descripción no puede superar 200 caracteres"),
];