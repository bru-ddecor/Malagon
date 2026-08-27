// Model do Sequelize (ORM): descreve a tabela "Universidades" do banco.
// Cada propriedade abaixo vira uma coluna na tabela. A partir daqui,
// o Sequelize cuida de gerar o SQL (CREATE TABLE, SELECT, INSERT, etc)
// automaticamente — não escrevemos mais SQL manualmente.

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Universidade = sequelize.define("Universidade", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    cidade: {
        type: DataTypes.STRING
    },

    site: {
        type: DataTypes.STRING
    }
});

export default Universidade;