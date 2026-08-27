// Com sequelize
// import {sequelize} from "sequelize";

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         dialect: "mysql",
//     }
// );  
    

// export default sequelize;

// Sem sequelize ============================

import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "malagon"
});

export default db;

