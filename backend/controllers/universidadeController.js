import Universidade from "../models/universidadeModel.js";

// Antes (array mock):      universidades.find(u => u.id === id)
// Agora (Sequelize/ORM):   Universidade.findByPk(id)
// O Sequelize traduz essas chamadas para SQL de verdade por baixo dos panos.

export async function listarUniversidades(req, res) {
    const universidades = await Universidade.findAll();
    res.json(universidades);
}

export async function buscarUniversidade(req, res) {
    const id = Number(req.params.id);

    const universidade = await Universidade.findByPk(id);

    if (!universidade) {
        return res.status(404).json({
            mensagem: "Universidade não encontrada"
        });
    }

    res.json(universidade);
}

export async function criarUniversidade(req, res) {
    const { nome, cidade, site } = req.body;

    const universidade = await Universidade.create({ nome, cidade, site });

    res.status(201).json(universidade);
}

// O Controller recebe a solicitação encaminhada pela rota e determina o que deve acontecer.
// listarUniversidades  -> lista todas (GET /universidades)
// buscarUniversidade   -> busca uma pelo ID (GET /universidades/:id)
// criarUniversidade    -> cria uma nova (POST /universidades) — adicionado para
//                         demonstrar como o Sequelize simplifica o INSERT