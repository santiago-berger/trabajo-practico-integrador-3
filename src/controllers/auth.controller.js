import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// controlador para registrar un usuario con su perfil embebido
export const register = async (req, res) => {
    try {
        // se obtienen solo los campos validados, profile llega como objeto con sus campos
        const data = matchedData(req);

        // la contraseña se guarda hasheada
        const hashedPassword = await hashPassword(data.password);

        const newUser = await UserModel.create({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: "user",
            profile: data.profile,
        });

        // create no permite usar select, por eso se separa la contraseña del resto de los datos
        const { password, ...user } = newUser.toJSON();

        return res.status(201).json({
            msg: "Usuario registrado correctamente",
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para iniciar sesion
export const login = async (req, res) => {
    try {
        const { username, password } = matchedData(req);

        // se busca solo entre los usuarios activos, un usuario eliminado de forma logica no puede iniciar sesion
        const user = await UserModel.findOne({ username, deletedAt: null });
        if (!user) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }

        // se compara la contraseña ingresada con el hash guardado
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }

        const token = generateToken({
            id: user._id,
            username: user.username,
            role: user.role,
        });

        // el token se envia en una cookie httpOnly, asi no se puede leer desde javascript en el navegador
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        });

        return res.status(200).json({ msg: "Login exitoso" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener el perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        // req.user lo carga authMiddleware a partir del token
        const user = await UserModel.findById(req.user.id)
            .select("-password")
            // populate virtual, trae los eventos que organizo el usuario
            .populate("events", "title startDate status");

        return res.status(200).json({
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para actualizar el perfil embebido del usuario autenticado
export const updateProfile = async (req, res) => {
    try {
        const { profile } = matchedData(req, { locations: ["body"] });

        if (!profile) {
            return res.status(400).json({ msg: "No se enviaron datos del perfil para actualizar" });
        }

        const user = await UserModel.findById(req.user.id);

        // si se manda profile completo en el update, mongoose reemplaza todo el objeto embebido
        // por eso se combinan los datos que ya tenia el perfil con los nuevos, asi no se pierden los campos no enviados
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id,
            { profile: { ...user.toJSON().profile, ...profile } },
            // runValidators hace que se apliquen las validaciones del esquema tambien al actualizar
            { returnDocument: "after", runValidators: true },
        ).select("-password");

        return res.status(200).json({
            msg: "Perfil actualizado correctamente",
            data: updatedUser.profile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para cerrar sesion
export const logout = async (req, res) => {
    try {
        // se borra la cookie que guarda el token
        res.clearCookie("token");
        return res.status(200).json({ msg: "Logout exitoso" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};