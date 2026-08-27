import express from "express"; //Aqui importamos o Express, que utilizamos para criar o servidor e a API
import universidadeRoutes from "./backend/routes/universidadeRoutes.js"; //Aqui importamos as rotas de universidade.

const app = express(); //Aqui criamos nossa aplicação Express

app.use(express.json()); //Esse comando permite que o Express interprete dados JSON enviados nas requisições
app.use("/universidades", universidadeRoutes); //Aqui informamos ao Express que as requisições que começarem com /universidades serão encaminhadas para as rotas de universidade.


app.listen(3000, () => {
  console.log("Servidor rodando em https://localhost:3000");
}); //iniciamos o servidor na porta 3000