import universidades from "../models/universidadeModel.js";

export function listarUniversidades(req, res) {
    res.json(universidades);
}

export function buscarUniversidade(req, res) {
    const id = Number(req.params.id);

    const universidade = universidades.find(
        universidade => universidade.id === id
    );

    if (!universidade) {
        return res.status(404).json({
            mensagem: "Universidade não encontrada"
        });
    }

    res.json(universidade);
}

// O Controller recebe a solicitação encaminhada pela rota e determina o que deve acontecer. Aqui temos uma função para listar todas as universidades e outra para procurar uma universidade pelo ID.