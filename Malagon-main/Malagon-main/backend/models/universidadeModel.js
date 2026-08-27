// Com sequelize

// import { DataTypes } from "sequelize";
// import sequelize from "../config/database.js";

// const Universidade = sequelize.define("Universidade", {
//     nome: {
//         type: DataTypes.STRING
//     },

//     cidade: {
//         type: DataTypes.STRING
//     },

//     site: {
//         type: DataTypes.STRING
//     }
// });

// export default Universidade;

//Vamos configurar Sequelize depois, por enquanto vamos usar o mysql2/promise ============================

const universidades = [
    {
        id: 1,
        nome: "Universidade de Málaga",
        cidade: "Málaga"
    },
    {
        id: 2,
        nome: "Universidade Exemplo",
        cidade: "Málaga"
    }
];

export default universidades;
