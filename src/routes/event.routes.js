import { Router } from "express";
import {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller.js";
import {
    eventIdValidation,
    createEventValidation,
    updateEventValidation,
} from "../middlewares/validations/event.validations.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerOrAdminMiddleware } from "../middlewares/ownerOrAdmin.middleware.js";

export const eventRouter = Router();

// usuario autenticado
eventRouter.post("/events", authMiddleware, createEventValidation, validate, createEvent);
eventRouter.get("/events", authMiddleware, getAllEvents);
eventRouter.get("/events/my", authMiddleware, getMyEvents);
eventRouter.get("/events/:id", authMiddleware, eventIdValidation, validate, getEventById);

// solo organizador o admin
eventRouter.put(
    "/events/:id",
    authMiddleware,
    eventIdValidation,
    validate,
    ownerOrAdminMiddleware,
    updateEventValidation,
    validate,
    updateEvent,
);
eventRouter.delete(
    "/events/:id",
    authMiddleware,
    eventIdValidation,
    validate,
    ownerOrAdminMiddleware,
    deleteEvent,
);