import { Router } from "express";
import {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
} from "../controllers/auth.controller.js";
import {
    registerValidation,
    loginValidation,
    updateProfileValidation,
} from "../middlewares/validations/auth.validations.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

// publicas
authRouter.post("/auth/register", registerValidation, validate, register);
authRouter.post("/auth/login", loginValidation, validate, login);

// usuario autenticado
authRouter.get("/auth/profile", authMiddleware, getProfile);
authRouter.put("/auth/profile", authMiddleware, updateProfileValidation, validate, updateProfile);
authRouter.post("/auth/logout", authMiddleware, logout);