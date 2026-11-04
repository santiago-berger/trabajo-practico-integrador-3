import { matchedData } from "express-validator";
import { EventModel } from "../models/event.model.js";

// controlador para crear un evento
export const createEvent = async (req, res) => {
    try {
        const data = matchedData(req);

        // el organizador es el usuario autenticado, se toma de req.user y no del body
        const newEvent = await EventModel.create({ ...data, organizer: req.user.id });

        return res.status(201).json({
            msg: "Evento creado correctamente",
            data: newEvent,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener todos los eventos
export const getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.find()
            // populate directo de la relacion uno a muchos, event guarda el id del usuario en organizer
            .populate("organizer", "username email")
            // populate directo de la relacion muchos a muchos, cada id del array se reemplaza por la categoria
            .populate("categories", "name");

        return res.status(200).json({
            data: events,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener los eventos del usuario logueado
export const getMyEvents = async (req, res) => {
    try {
        const events = await EventModel.find({ organizer: req.user.id }).populate("categories", "name");

        return res.status(200).json({
            data: events,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener un evento por su id
export const getEventById = async (req, res) => {
    try {
        const { id } = matchedData(req);

        const event = await EventModel.findById(id)
            .populate("organizer", "username email")
            .populate("categories", "name");

        if (!event) {
            return res.status(404).json({ msg: "Evento no encontrado" });
        }

        return res.status(200).json({
            data: event,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para actualizar un evento y sus categorias
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = matchedData(req, { locations: ["body"] });

        // req.event lo carga ownerOrAdminMiddleware, que ya verifico que el evento exista
        // si se manda location se combina con la ubicacion actual para no perder los campos no enviados
        if (data.location) {
            data.location = { ...req.event.toJSON().location, ...data.location };
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            runValidators: true,
        })
            .populate("organizer", "username email")
            .populate("categories", "name");

        return res.status(200).json({
            msg: "Evento actualizado correctamente",
            data: updatedEvent,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para eliminar un evento de forma fisica
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // eliminacion fisica, el documento se borra definitivamente de la coleccion events
        const deletedEvent = await EventModel.findByIdAndDelete(id);

        return res.status(200).json({
            msg: "Evento eliminado correctamente",
            data: deletedEvent,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};