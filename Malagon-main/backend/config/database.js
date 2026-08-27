// Configuração do Sequelize (ORM) para o banco de dados do Malagon.
//
// Estamos usando SQLite como banco: não precisa instalar nem configurar
// nenhum servidor de banco de dados separado, o Sequelize cria o arquivo
// "malagon.sqlite" automaticamente na primeira execução. Isso facilita
// para desenvolvimento e para apresentação/demonstração.
//
// Se no futuro quiser trocar para MySQL/Postgres (ex: em produção), basta
// mudar o "dialect" e passar host/usuário/senha nas options abaixo —
// o resto do código (models, controllers) não muda nada, essa é uma das
// grandes vantagens de usar um ORM.

import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../../malagon.sqlite"),
    logging: false, // true mostra no console o SQL que o Sequelize gera
});

export default sequelize;

