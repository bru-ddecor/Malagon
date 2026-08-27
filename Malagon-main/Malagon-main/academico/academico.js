// Pega o elemento <select> do país
const selectPais = document.getElementById("pais");

// Função responsável por carregar os países
async function carregarPaises() {

    try {

        // Chama a rota do nosso backend
        const resposta = await fetch("/api/paises");

        // Converte a resposta para JSON
        const dados = await resposta.json();

        // Limpa o select
        selectPais.innerHTML = "";

        // Cria a primeira opção
        const opcaoInicial = document.createElement("option");

        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione um país";

        selectPais.appendChild(opcaoInicial);

        // Percorre todos os países recebidos
        dados.forEach(pais => {

            const option = document.createElement("option");

            // Valor utilizado pelo sistema
            option.value = pais.codigo;

            // Texto mostrado para o usuário
            option.textContent = pais.nome;

            // Adiciona ao select
            selectPais.appendChild(option);

        });

    } catch (erro) {

        console.error("Erro ao carregar países:", erro);

        selectPais.innerHTML = `
            <option value="">
                Erro ao carregar países
            </option>
        `;
    }
}

// Executa assim que a página carregar
carregarPaises();