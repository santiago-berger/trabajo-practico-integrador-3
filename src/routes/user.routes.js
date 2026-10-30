import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/user.controller.js";
import {
    userIdValidation,
    updateUserValidation,
} from "../middlewares/validations/user.validations.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

export const userRouter = Router();

// solo admin
userRouter.get("/users", authMiddleware, adminMiddleware, getAllUsers);
userRouter.get("/users/:id", authMiddleware, adminMiddleware, userIdValidation, validate, getUserById);
userRouter.put("/users/:id", authMiddleware, adminMiddleware, updateUserValidation, validate, updateUser);
userRouter.delete("/users/:id", authMiddleware, adminMiddleware, userIdValidation, validate, deleteUser);