import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import {
    categoryIdValidation,
    createCategoryValidation,
    updateCategoryValidation,
} from "../middlewares/validations/category.validations.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

export const categoryRouter = Router();

// usuario autenticado
categoryRouter.get("/categories", authMiddleware, getAllCategories);
categoryRouter.get("/categories/:id", authMiddleware, categoryIdValidation, validate, getCategoryById);

// solo admin
categoryRouter.post("/categories", authMiddleware, adminMiddleware, createCategoryValidation, validate, createCategory);
categoryRouter.put("/categories/:id", authMiddleware, adminMiddleware, updateCategoryValidation, validate, updateCategory);
categoryRouter.delete("/categories/:id", authMiddleware, adminMiddleware, categoryIdValidation, validate, deleteCategory);