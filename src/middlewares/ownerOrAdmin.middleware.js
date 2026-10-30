import { EventModel } from "../models/event.model.js";

// verifica que el usuario sea el organizador del evento o sea admin
export const ownerOrAdminMiddleware = async (req, res, next) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }

        const esOrganizador = event.organizer.toString() === req.user.id;
        const esAdmin = req.user.role === "admin";

        if (!esOrganizador && !esAdmin) {
            return res.status(403).json({ message: "Acceso denegado: no sos el organizador del evento" });
        }

        // se guarda el evento en req para no volver a buscarlo en el controlador
        req.event = event;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};