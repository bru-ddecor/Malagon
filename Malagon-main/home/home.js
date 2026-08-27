document.addEventListener("DOMContentLoaded", () => {
  // 1. SLIDER DE IMAGENS DE FUNDO
  const imagens = document.querySelectorAll(".bg");
  let index = 0;

  if (imagens.length > 0) {
    setInterval(() => {
      imagens[index].classList.remove("ativo");
      index = (index + 1) % imagens.length;
      imagens[index].classList.add("ativo");
    }, 4500);
  }

  // 2. SCROLL SUAVE
  const btnVerMais = document.getElementById("btnVerMais");
  if (btnVerMais) {
    btnVerMais.addEventListener("click", () => {
      const universidadeSection = document.querySelector(".universidades");
      if (universidadeSection) {
        universidadeSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 3. CALCULADORA INTERATIVA
  const rangeAluguel = document.getElementById("range-aluguel");
  const rangeAlimentacao = document.getElementById("range-alimentacao");
  const rangeTransporte = document.getElementById("range-transporte");
  const rangeLazer = document.getElementById("range-lazer");

  const valAluguel = document.getElementById("valor-aluguel");
  const valAlimentacao = document.getElementById("valor-alimentacao");
  const valTransporte = document.getElementById("valor-transporte");
  const valLazer = document.getElementById("valor-lazer");
  const totalEstimado = document.getElementById("total-estimado");

  function atualizarCalculadora() {
    if (!rangeAluguel) return;

    const aluguel = parseInt(rangeAluguel.value);
    const alimentacao = parseInt(rangeAlimentacao.value);
    const transporte = parseInt(rangeTransporte.value);
    const lazer = parseInt(rangeLazer.value);

    valAluguel.textContent = `€ ${aluguel}`;
    valAlimentacao.textContent = `€ ${alimentacao}`;
    valTransporte.textContent = `€ ${transporte}`;
    valLazer.textContent = `€ ${lazer}`;

    const total = aluguel + alimentacao + transporte + lazer;
    totalEstimado.textContent = `~ € ${total.toLocaleString("pt-BR")},00 / mês`;
  }

  [rangeAluguel, rangeAlimentacao, rangeTransporte, rangeLazer].forEach((slider) => {
    if (slider) slider.addEventListener("input", atualizarCalculadora);
  });

  // 4. RENDERIZAÇÃO DE UNIVERSIDADES INTERNACIONAIS DE TECNOLOGIA
  const containerUniversidades = document.getElementById("container-universidades");

  const dadosPadrao = [
    {
      nome: "Universidade de Málaga (Espanha)",
      descricao: "Polo de inovação europeu em engenharia, computação e inteligência artificial.",
      imagem: "../img/fundo5.jpg",
      tag: "QS Ranking: #39",
      metrica1Rotulo: "Custo / Ano",
      metrica1Valor: "€ 5.550",
      metrica2Rotulo: "Empregabilidade",
      metrica2Valor: "94%"
    },
    {
      nome: "ETH Zürich (Suíça)",
      descricao: "Uma das principais universidades de tecnologia e engenharia do mundo.",
      imagem: "../img/fundo6.jpg",
      tag: "Top #7 Global",
      metrica1Rotulo: "Custo / Ano",
      metrica1Valor: "CHF 1.500",
      metrica2Rotulo: "Empregabilidade",
      metrica2Valor: "98%"
    }
  ];

  function renderizarUniversidades(lista) {
    if (!containerUniversidades) return;
    containerUniversidades.innerHTML = "";

    lista.forEach((item) => {
      const cardHTML = `
        <div class="card">
          <div class="img-wrapper">
            <img src="${item.imagem || '../img/fundo5.jpg'}" alt="${item.nome}" />
            <span class="badge-ranking">${item.tag || 'Internacional'}</span>
          </div>
          <div class="card-content">
            <h3>${item.nome}</h3>
            <p>${item.descricao}</p>
            <div class="card-metrics">
              <div><span>${item.metrica1Rotulo || 'Custo'}</span><strong>${item.metrica1Valor || item.custo}</strong></div>
              <div><span>${item.metrica2Rotulo || 'Taxa'}</span><strong>${item.metrica2Valor || item.empregabilidade}</strong></div>
            </div>
          </div>
        </div>
      `;
      containerUniversidades.innerHTML += cardHTML;
    });
  }

  fetch("/universidades")
    .then((res) => {
      if (!res.ok) throw new Error("Servidor offline");
      return res.json();
    })
    .then((dados) => renderizarUniversidades(dados))
    .catch(() => renderizarUniversidades(dadosPadrao));
});