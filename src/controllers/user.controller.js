import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { EventModel } from "../models/event.model.js";

// controlador para obtener todos los usuarios activos
export const getAllUsers = async (req, res) => {
    try {
        // se filtra por deletedAt en null para excluir los usuarios eliminados de forma logica
        const users = await UserModel.find({ deletedAt: null })
            // el signo menos excluye el campo password de la respuesta
            .select("-password")
            // populate virtual de la relacion uno a muchos, user no guarda sus eventos
            // mongoose busca en la coleccion events los documentos cuyo organizer coincide con el id de cada usuario
            .populate("events", "title startDate status");

        return res.status(200).json({
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor",
        });
    }
};

// controlador para obtener un usuario activo por su id
export const getUserById = async (req, res) => {
    try {
        const { id } = matchedData(req);

        const user = await UserModel.findOne({ _id: id, deletedAt: null })
            .select("-password")
            .populate("events", "title startDate status");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor",
        });
    }
};

// controlador para actualizar un usuario
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // solo los datos validados del cuerpo, sin el id del parametro
        const data = matchedData(req, { locations: ["body"] });

        // verificacion de existencia previa, solo se pueden editar usuarios activos
        const user = await UserModel.findOne({ _id: id, deletedAt: null });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // si se manda profile se combina con el perfil actual para no perder los campos no enviados
        if (data.profile) {
            data.profile = { ...user.toJSON().profile, ...data.profile };
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            runValidators: true,
        }).select("-password");

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor",
        });
    }
};

// controlador para eliminar un usuario de forma logica y en cascada
export const deleteUser = async (req, res) => {
    try {
        const { id } = matchedData(req);

        // verificacion de existencia previa
        const user = await UserModel.findOne({ _id: id, deletedAt: null });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // eliminacion logica, el documento no se borra sino que se guarda la fecha en deletedAt
        await UserModel.findByIdAndUpdate(id, { deletedAt: new Date() });

        // eliminacion en cascada sobre la relacion uno a muchos
        // deleteMany borra todos los eventos cuyo organizer sea el usuario eliminado
        await EventModel.deleteMany({ organizer: id });

        return res.status(200).json({
            message: "Usuario eliminado correctamente junto con sus eventos",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor",
        });
    }
};