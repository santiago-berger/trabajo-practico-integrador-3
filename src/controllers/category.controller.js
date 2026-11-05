import { matchedData } from "express-validator";
import { CategoryModel } from "../models/category.model.js";
// eventmodel se importa para aplicar la eliminacion en cascada, quitando la categoria de los eventos que la tengan
import { EventModel } from "../models/event.model.js";

// controlador para crear una categoria
export const createCategory = async (req, res) => {
    try {
        const data = matchedData(req);

        const newCategory = await CategoryModel.create(data);

        return res.status(201).json({
            msg: "Categoría creada correctamente",
            data: newCategory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener todas las categorias
export const getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find();

        return res.status(200).json({
            data: categories,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para obtener una categoria por su id con sus eventos
export const getCategoryById = async (req, res) => {
    try {
        const { id } = matchedData(req);

        // populate virtual de la relacion muchos a muchos, category no guarda referencias a los eventos
        // mongoose busca en la coleccion events los documentos cuyo array categories contenga el id de la categoria
        const category = await CategoryModel.findById(id).populate("events", "title startDate status");

        if (!category) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        return res.status(200).json({
            data: category,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para actualizar una categoria
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = matchedData(req, { locations: ["body"] });

        // verificacion de existencia previa
        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            runValidators: true,
        });

        return res.status(200).json({
            msg: "Categoría actualizada correctamente",
            data: updatedCategory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};

// controlador para eliminar una categoria de forma fisica y en cascada
export const deleteCategory = async (req, res) => {
    try {
        const { id } = matchedData(req);

        // verificacion de existencia previa
        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        // eliminacion en cascada sobre la relacion muchos a muchos
        // updateMany busca todos los eventos cuyo array categories contenga el id de la categoria
        // el operador pull saca ese id del array categories de cada evento encontrado
        await EventModel.updateMany({ categories: id }, { $pull: { categories: id } });

        // eliminacion fisica de la categoria
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            msg: "Categoría eliminada correctamente y quitada de los eventos",
            data: deletedCategory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error interno del servidor",
        });
    }
};