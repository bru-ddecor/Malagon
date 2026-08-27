import express from "express";
import {
    listarUniversidades,
    buscarUniversidade
} from "../controllers/universidadeController.js";

const router = express.Router();

router.get("/", listarUniversidades);

router.get("/:id", buscarUniversidade);

export default router;

//As Routes definem os endpoints da API. Elas relacionam um endereço e um método HTTP com uma função do Controller.