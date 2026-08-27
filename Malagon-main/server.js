import express from "express"; //Aqui importamos o Express, que utilizamos para criar o servidor e a API
import universidadeRoutes from "./backend/routes/universidadeRoutes.js"; //Aqui importamos as rotas de universidade.
import sequelize from "./backend/config/database.js"; //Conexão do Sequelize (ORM) com o banco de dados
import Universidade from "./backend/models/universidadeModel.js";

const app = express(); //Aqui criamos nossa aplicação Express

app.use(express.json()); //Esse comando permite que o Express interprete dados JSON enviados nas requisições
app.use("/universidades", universidadeRoutes); //Aqui informamos ao Express que as requisições que começarem com /universidades serão encaminhadas para as rotas de universidade.

// sequelize.sync() garante que as tabelas existam no banco, criando-as
// automaticamente a partir dos models caso ainda não existam.
async function iniciar() {
  await sequelize.sync();

  // Seed: se a tabela estiver vazia, cria alguns registros de exemplo
  // (equivalente aos dados que antes estavam fixos no array mock).
  const total = await Universidade.count();
  if (total === 0) {
    await Universidade.bulkCreate([
      { nome: "Universidade de Málaga", cidade: "Málaga" },
      { nome: "Universidade Exemplo", cidade: "Málaga" }
    ]);
  }

  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  }); //iniciamos o servidor na porta 3000
}

iniciar();