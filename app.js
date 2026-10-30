import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { startDB } from "./src/config/database.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// rutas

app.listen(PORT, async () => {
  await startDB();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});