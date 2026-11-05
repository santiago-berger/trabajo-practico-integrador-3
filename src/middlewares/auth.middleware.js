import { verifyToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token de la cookie
        const token = req.cookies["token"];

        if (!token) {
        return res.status(401).json({ message: "No autenticado" });
        }
        // Verificar y decodificar token
        const decoded = verifyToken(token);

        // solo usuarios activos, un usuario eliminado de forma logica no puede seguir usando su token
        const user = await UserModel.findOne({ _id: decoded.id, deletedAt: null });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado o dado de baja" });
        }

        // se guardan los datos del usuario en req para usarlos en los siguientes middlewares y controladores
        req.user = {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
        };

        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor" });
    }
};