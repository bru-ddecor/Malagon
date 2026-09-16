// =============================================
// MALAGON — PAINEL FINANCEIRO
// Base de cálculo: Málaga, Espanha (EUR).
// Todos os valores internos ficam em EUR e são
// convertidos para a moeda do destino e para BRL.
// =============================================

const CUSTOS_BASE = [
    { id: 'moradia',     nome: 'Moradia',      icone: '🏠', base: 550 },
    { id: 'alimentacao', nome: 'Alimentação',  icone: '🍽️', base: 250 },
    { id: 'transporte',  nome: 'Transporte',   icone: '🚌', base: 45  },
    { id: 'materiais',   nome: 'Materiais',    icone: '📚', base: 30  },
    { id: 'saude',       nome: 'Saúde',        icone: '🏥', base: 110 },
    { id: 'lazer',       nome: 'Lazer',        icone: '🎉', base: 120 },
];

// Redução aplicada quando o estudante divide moradia
const FATOR_MORADIA_COMPARTILHADA = 0.70;

// Variação de câmbio usada no cenário de risco
const ESTRESSE_CAMBIO = 0.15;

// Caução do aluguel, em meses de moradia
const CAUCAO_MESES = 2;

// =============================================
// BASE DE DADOS DOS PAÍSES
//
// indice = nível de preços relativo (Banco Mundial / PPP, 2023)
// moeda  = moeda local usada na exibição
// visto  = comprovação financeira mensal exigida para visto de
//          estudante, na moeda local. Referências de 2024/2025;
//          mudam todo ano e precisam ser confirmadas no consulado.
// setup  = custos de instalação, em EUR (passagem em BRL)
// =============================================
const PAISES = {
    ES: {
        indice: 0.674, ano: 2023, moeda: 'EUR',
        visto: { min: 600, fonte: 'IPREM — Consulado da Espanha' },
        setup: { passagemBrl: 5200, taxaVisto: 80,  matriculaAno: 1500,  seguroMes: 40 }
    },
    PT: {
        indice: 0.598, ano: 2023, moeda: 'EUR',
        visto: { min: 870, fonte: 'Salário mínimo nacional — AIMA' },
        setup: { passagemBrl: 4800, taxaVisto: 90,  matriculaAno: 1250,  seguroMes: 40 }
    },
    DE: {
        indice: 0.821, ano: 2023, moeda: 'EUR',
        visto: { min: 992, fonte: 'Sperrkonto (conta bloqueada)' },
        setup: { passagemBrl: 5400, taxaVisto: 75,  matriculaAno: 350,   seguroMes: 120 }
    },
    FR: {
        indice: 0.829, ano: 2023, moeda: 'EUR',
        visto: { min: 615, fonte: 'Campus France' },
        setup: { passagemBrl: 5300, taxaVisto: 99,  matriculaAno: 250,   seguroMes: 40 }
    },
    IT: {
        indice: 0.726, ano: 2023, moeda: 'EUR',
        visto: { min: 470, fonte: 'Consulado da Itália' },
        setup: { passagemBrl: 5200, taxaVisto: 50,  matriculaAno: 1000,  seguroMes: 40 }
    },
    NL: {
        indice: 0.876, ano: 2023, moeda: 'EUR',
        visto: { min: 1080, fonte: 'IND — serviço de imigração' },
        setup: { passagemBrl: 5300, taxaVisto: 228, matriculaAno: 2530,  seguroMes: 120 }
    },
    PL: {
        indice: 0.460, ano: 2023, moeda: 'PLN',
        visto: { min: 776, fonte: 'Urząd do Spraw Cudzoziemców' },
        setup: { passagemBrl: 5000, taxaVisto: 80,  matriculaAno: 2000,  seguroMes: 30 }
    },
    CZ: {
        indice: 0.522, ano: 2023, moeda: 'CZK',
        visto: { min: 10375, fonte: 'Ministério do Interior da Chéquia' },
        setup: { passagemBrl: 5000, taxaVisto: 60,  matriculaAno: 1000,  seguroMes: 30 }
    },
    SE: {
        indice: 0.860, ano: 2023, moeda: 'SEK',
        visto: { min: 10314, fonte: 'Migrationsverket' },
        setup: { passagemBrl: 6000, taxaVisto: 155, matriculaAno: 9000,  seguroMes: 40 }
    },
    NO: {
        indice: 1.109, ano: 2023, moeda: 'NOK',
        visto: { min: 12640, fonte: 'UDI — diretoria de imigração' },
        setup: { passagemBrl: 6200, taxaVisto: 500, matriculaAno: 600,   seguroMes: 40 }
    },
    CH: {
        indice: 1.260, ano: 2023, moeda: 'CHF',
        visto: { min: 1750, fonte: 'SEM — secretaria de migração' },
        setup: { passagemBrl: 5800, taxaVisto: 88,  matriculaAno: 1600,  seguroMes: 120 }
    },
    GB: {
        indice: 0.795, ano: 2023, moeda: 'GBP',
        visto: { min: 1023, fonte: 'UKVI — fora de Londres' },
        setup: { passagemBrl: 4600, taxaVisto: 524, matriculaAno: 17000, seguroMes: 55 }
    },
    US: {
        indice: 1.000, ano: 2023, moeda: 'USD',
        visto: { min: 1800, fonte: 'Definido pelo I-20 da universidade' },
        setup: { passagemBrl: 4200, taxaVisto: 350, matriculaAno: 20000, seguroMes: 150 }
    },
    CA: {
        indice: 0.840, ano: 2023, moeda: 'CAD',
        visto: { min: 1720, fonte: 'IRCC — fora de Quebec' },
        setup: { passagemBrl: 4500, taxaVisto: 150, matriculaAno: 15000, seguroMes: 70 }
    },
    AU: {
        indice: 0.860, ano: 2023, moeda: 'AUD',
        visto: { min: 2476, fonte: 'Department of Home Affairs' },
        setup: { passagemBrl: 7500, taxaVisto: 450, matriculaAno: 18000, seguroMes: 50 }
    },
    JP: {
        indice: 0.620, ano: 2023, moeda: 'JPY',
        visto: { min: 130000, fonte: 'Certificado de Elegibilidade (COE)' },
        setup: { passagemBrl: 6800, taxaVisto: 25,  matriculaAno: 4500,  seguroMes: 30 }
    },
    BR: {
        indice: 0.370, ano: 2023, moeda: 'BRL',
        visto: { min: 0, fonte: 'Estudante nacional — sem exigência' },
        setup: { passagemBrl: 1200, taxaVisto: 0,   matriculaAno: 3000,  seguroMes: 25 }
    },
};

// Cotações de contingência (1 EUR = X), usadas se a API falhar
const CAMBIO_FALLBACK = {
    EUR: 1,     BRL: 6.30,  USD: 1.17,  GBP: 0.87,  JPY: 172.0,
    CHF: 0.94,  CAD: 1.61,  AUD: 1.77,  SEK: 11.00, NOK: 11.70,
    PLN: 4.25,  CZK: 24.30,
};

// =============================================
// ESTADO
// =============================================
let paisBase     = PAISES.ES;
let paisAtual    = PAISES.ES;
let cambio       = { ...CAMBIO_FALLBACK };
let cambioAoVivo = false;

// =============================================
// ELEMENTOS
// =============================================
const el = id => document.getElementById(id);

const paisSelect       = el('paisSelect');
const paisTag          = el('paisTag');
const paisStatus       = el('paisStatus');
const cambioValor      = el('cambioValor');
const cambioData       = el('cambioData');
const custosLista      = el('custosLista');
const totalLocal       = el('totalEur');
const totalBrl         = el('totalBrl');
const orcamentoInput   = el('orcamento');
const duracaoInput     = el('duracao');
const orcamentoValor   = el('orcamentoValor');
const orcamentoLocalEl = el('orcamentoLocal');
const duracaoValor     = el('duracaoValor');
const resultadoTitulo  = el('resultadoTitulo');
const resultadoSub     = el('resultadoSub');
const custoTotalSub    = el('custoTotalSub');
const cardOrcamento    = el('cardOrcamento');
const cardVisto        = el('cardVisto');
const vistoTitulo      = el('vistoTitulo');
const vistoSub         = el('vistoSub');
const vistoIcone       = el('vistoIcone');
const cardEstresse     = el('cardEstresse');
const estresseSub      = el('estresseSub');
const setupLista       = el('setupLista');
const setupTotal       = el('setupTotal');
const setupTotalBrl    = el('setupTotalBrl');
const chkMoradia       = el('chkMoradia');
const chkSeguro        = el('chkSeguro');
const btnRelatorio     = el('btnRelatorio');
const modalOverlay     = el('modalOverlay');
const modalFechar      = el('modalFechar');
const modalCorpo       = el('modalCorpo');
const btnImprimirPdf   = el('btnImprimirPdf');

const compararChips    = el('compararChips');
const compararResultado = el('compararResultado');
const compararAviso    = el('compararAviso');

// =============================================
// FORMATAÇÃO
// =============================================
function formatar(valor, moeda) {
    const casas = (moeda === 'JPY') ? 0 : 2;
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: moeda,
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    });
}

function formatarBrl(valor) {
    return formatar(valor, 'BRL');
}

function paraMoeda(valorEur, moeda) {
    return valorEur * (cambio[moeda] || 1);
}

function moedaDestino() {
    return paisAtual.moeda;
}

function formatarDestino(valorEur) {
    return formatar(paraMoeda(valorEur, moedaDestino()), moedaDestino());
}

// Igual a formatarDestino, mas para um país qualquer — usado na comparação
function formatarPara(valorEur, moeda) {
    return formatar(paraMoeda(valorEur, moeda), moeda);
}

// =============================================
// API DE CÂMBIO — Frankfurter (base EUR, dados do BCE)
// =============================================
async function buscarCambio() {
    const simbolos = Object.keys(CAMBIO_FALLBACK).filter(m => m !== 'EUR').join(',');

    try {
        const resp = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${simbolos}`);
        if (!resp.ok) throw new Error('Resposta inválida da API');

        const dados = await resp.json();
        if (!dados.rates || !dados.rates.BRL) throw new Error('Cotações ausentes');

        cambio = { EUR: 1, ...dados.rates };
        cambioAoVivo = true;

        const data = new Date(dados.date + 'T12:00:00');
        cambioValor.textContent = `1 EUR = ${cambio.BRL.toFixed(2)} BRL`;
        cambioData.textContent  = 'referência de ' + data.toLocaleDateString('pt-BR');
    } catch (e) {
        cambio = { ...CAMBIO_FALLBACK };
        cambioAoVivo = false;
        cambioValor.textContent = `1 EUR = ${cambio.BRL.toFixed(2)} BRL`;
        cambioData.textContent  = 'cotação estimada — API indisponível';
    }
}

// =============================================
// CUSTOS MENSAIS
// =============================================
function fatorPais(pais = paisAtual) {
    return pais.indice / paisBase.indice;
}

function calcularCategorias(pais = paisAtual) {
    const fator = fatorPais(pais);

    const itens = CUSTOS_BASE.map(c => {
        let valor = c.base * fator;
        if (c.id === 'moradia' && chkMoradia.checked) {
            valor *= FATOR_MORADIA_COMPARTILHADA;
        }
        return { ...c, valor: Math.round(valor) };
    });

    if (chkSeguro.checked) {
        itens.push({
            id: 'seguro',
            nome: 'Seguro internacional',
            icone: '🛡️',
            valor: Math.round(pais.setup.seguroMes),
        });
    }

    return itens;
}

// =============================================
// CUSTOS DE INSTALAÇÃO (UMA ÚNICA VEZ)
// =============================================
function calcularInstalacao(duracao, pais = paisAtual) {
    const fator = fatorPais(pais);
    const s = pais.setup;

    let moradiaMes = CUSTOS_BASE[0].base * fator;
    if (chkMoradia.checked) moradiaMes *= FATOR_MORADIA_COMPARTILHADA;

    const anos = Math.max(duracao / 12, 1 / 12);

    return [
        { nome: 'Passagem aérea (ida e volta)', icone: '✈️', valor: s.passagemBrl / cambio.BRL },
        { nome: 'Visto e taxas consulares',     icone: '🛂', valor: s.taxaVisto },
        { nome: 'Caução do aluguel',            icone: '🔑', valor: moradiaMes * CAUCAO_MESES },
        { nome: 'Matrícula e taxas acadêmicas', icone: '🎓', valor: s.matriculaAno * anos },
    ].map(i => ({ ...i, valor: Math.round(i.valor) }));
}

function totalInstalacaoEur(duracao, pais = paisAtual) {
    return calcularInstalacao(duracao, pais).reduce((s, i) => s + i.valor, 0);
}

// =============================================
// RENDERIZAÇÃO DAS LISTAS
// =============================================
function criarItemLista(icone, nome, texto, textoBrl = null, classes = []) {
    const li = document.createElement('li');

    const info = document.createElement('div');
    info.className = 'item-info';

    const spanIcone = document.createElement('span');
    spanIcone.className = 'item-icone';
    spanIcone.setAttribute('aria-hidden', 'true');
    spanIcone.textContent = icone;

    const spanNome = document.createElement('span');
    spanNome.className = 'item-nome';
    spanNome.textContent = nome;

    info.appendChild(spanIcone);
    info.appendChild(spanNome);

    const valores = document.createElement('div');
    valores.className = 'item-valores';

    const spanValor = document.createElement('span');
    spanValor.className = 'item-valor';
    classes.forEach(c => spanValor.classList.add(c));
    spanValor.textContent = texto;
    valores.appendChild(spanValor);

    // Só mostra a linha de BRL quando a moeda do destino não é BRL
    // (evita "R$ X / R$ X" duplicado para quem simula o Brasil)
    if (textoBrl) {
        const spanBrl = document.createElement('span');
        spanBrl.className = 'item-valor-brl';
        spanBrl.textContent = textoBrl;
        valores.appendChild(spanBrl);
    }

    li.appendChild(info);
    li.appendChild(valores);
    return li;
}

function renderCategorias(categorias) {
    const fator = fatorPais();
    const moeda = moedaDestino();
    custosLista.innerHTML = '';

    categorias.forEach(c => {
        const classes = [];
        if (c.id !== 'seguro') {
            if (fator > 1.02) classes.push('subiu');
            if (fator < 0.98) classes.push('desceu');
        }
        const brl = moeda === 'BRL' ? null : formatarBrl(paraMoeda(c.valor, 'BRL'));
        custosLista.appendChild(
            criarItemLista(c.icone, c.nome, formatarDestino(c.valor), brl, classes)
        );
    });
}

function renderInstalacao(duracao) {
    const itens = calcularInstalacao(duracao);
    const moeda = moedaDestino();
    setupLista.innerHTML = '';

    itens.forEach(i => {
        const brl = moeda === 'BRL' ? null : formatarBrl(paraMoeda(i.valor, 'BRL'));
        setupLista.appendChild(
            criarItemLista(i.icone, i.nome, formatarDestino(i.valor), brl)
        );
    });

    const total = itens.reduce((s, i) => s + i.valor, 0);
    setupTotal.textContent    = formatarDestino(total);
    setupTotalBrl.textContent = formatarBrl(paraMoeda(total, 'BRL'));
}

// =============================================
// SIMULADOR
// =============================================
function atualizarSimulador(custoMensal) {
    const orcamentoBrl = parseInt(orcamentoInput.value, 10);
    const duracao      = parseInt(duracaoInput.value, 10);
    const orcamentoEur = orcamentoBrl / cambio.BRL;

    orcamentoValor.textContent   = formatarBrl(orcamentoBrl);
    orcamentoLocalEl.textContent = 'equivale a ' + formatarDestino(orcamentoEur) + ' no destino';
    duracaoValor.textContent     = duracao + (duracao === 1 ? ' mês' : ' meses');

    // Sustentabilidade mensal
    const margem = orcamentoEur - custoMensal;

    cardOrcamento.classList.remove('ok', 'alerta', 'perigo');
    if (margem >= 0) {
        cardOrcamento.classList.add('ok');
        resultadoTitulo.textContent = 'Orçamento viável';
        resultadoSub.textContent    = 'Sobra ' + formatarDestino(margem) + ' por mês';
    } else if (margem >= -200) {
        cardOrcamento.classList.add('alerta');
        resultadoTitulo.textContent = 'Orçamento apertado';
        resultadoSub.textContent    = 'Faltam ' + formatarDestino(Math.abs(margem)) + ' por mês';
    } else {
        cardOrcamento.classList.add('perigo');
        resultadoTitulo.textContent = 'Orçamento insuficiente';
        resultadoSub.textContent    = 'Faltam ' + formatarDestino(Math.abs(margem)) + ' por mês';
    }

    // Custo projetado = recorrente + instalação
    const instalacao = totalInstalacaoEur(duracao);
    const custoTotal = custoMensal * duracao + instalacao;
    custoTotalSub.textContent =
        formatarDestino(custoTotal) + ' · ' + formatarBrl(paraMoeda(custoTotal, 'BRL'));

    atualizarVisto(orcamentoEur);
    atualizarEstresse(orcamentoBrl, custoMensal);
    renderInstalacao(duracao);
}

function atualizarVisto(orcamentoEur) {
    const exigencia = paisAtual.visto;

    cardVisto.classList.remove('ok', 'alerta', 'perigo', 'info');

    if (!exigencia.min) {
        cardVisto.classList.add('info');
        vistoIcone.textContent  = '🛂';
        vistoTitulo.textContent = 'Sem comprovação exigida';
        vistoSub.textContent    = exigencia.fonte;
        return;
    }

    const orcamentoLocal = paraMoeda(orcamentoEur, paisAtual.moeda);
    const exigido = formatar(exigencia.min, paisAtual.moeda);

    if (orcamentoLocal >= exigencia.min) {
        cardVisto.classList.add('ok');
        vistoIcone.textContent  = '✓';
        vistoTitulo.textContent = 'Comprovação atendida';
        vistoSub.textContent    = 'Mínimo de ' + exigido + '/mês · ' + exigencia.fonte;
    } else {
        cardVisto.classList.add('perigo');
        vistoIcone.textContent  = '✕';
        vistoTitulo.textContent = 'Abaixo do mínimo do visto';
        vistoSub.textContent    = 'Exigido ' + exigido + '/mês · ' + exigencia.fonte;
    }
}

function atualizarEstresse(orcamentoBrl, custoMensal) {
    const cambioAlta   = cambio.BRL * (1 + ESTRESSE_CAMBIO);
    const orcamentoEur = orcamentoBrl / cambioAlta;
    const margem       = orcamentoEur - custoMensal;

    cardEstresse.classList.remove('ok', 'alerta', 'perigo');

    const prefixo = 'Euro a ' + formatarBrl(cambioAlta) + ': ';

    if (margem >= 0) {
        cardEstresse.classList.add('ok');
        estresseSub.textContent = prefixo + 'ainda sobra ' + formatarDestino(margem) + '/mês';
    } else {
        cardEstresse.classList.add('perigo');
        estresseSub.textContent = prefixo + 'faltam ' + formatarDestino(Math.abs(margem)) + '/mês';
    }
}

// =============================================
// ATUALIZAÇÃO GERAL
// =============================================
function atualizarTudo() {
    const categorias = calcularCategorias();
    const total = categorias.reduce((s, c) => s + c.valor, 0);

    renderCategorias(categorias);

    totalLocal.textContent = formatarDestino(total);
    totalBrl.textContent   = formatarBrl(paraMoeda(total, 'BRL')) + ' por mês';

    atualizarSimulador(total);
    renderComparacao();
}

function trocarPais() {
    const texto = paisSelect.options[paisSelect.selectedIndex].text;
    paisTag.textContent = texto.split(' ').slice(0, 2).join(' ');

    paisAtual = PAISES[paisSelect.value] || paisBase;

    paisStatus.innerHTML =
        'Nível de preços: Banco Mundial (' + paisAtual.ano + ') &bull; ' +
        'Câmbio: BCE via Frankfurter &bull; Moeda local: ' + paisAtual.moeda;

    atualizarTudo();
}

// =============================================
// RELATÓRIO
// =============================================
function criarSecaoModal(titulo) {
    const div = document.createElement('div');
    div.className = 'modal-secao';
    const h3 = document.createElement('h3');
    h3.textContent = titulo;
    div.appendChild(h3);
    return div;
}

function criarLinhaModal(rotulo, valor, corValor = null) {
    const linha = document.createElement('div');
    linha.className = 'modal-linha';
    const spanR = document.createElement('span');
    spanR.textContent = rotulo;
    const spanV = document.createElement('span');
    spanV.textContent = valor;
    if (corValor) spanV.style.color = corValor;
    linha.appendChild(spanR);
    linha.appendChild(spanV);
    return linha;
}

function gerarRelatorio() {
    const duracao      = parseInt(duracaoInput.value, 10);
    const orcamentoBrl = parseInt(orcamentoInput.value, 10);
    const orcamentoEur = orcamentoBrl / cambio.BRL;
    const paisNome     = paisSelect.options[paisSelect.selectedIndex].text;
    const moeda        = moedaDestino();

    modalCorpo.innerHTML = '';

    // Destino
    const secDestino = criarSecaoModal('Destino selecionado');
    secDestino.appendChild(criarLinhaModal('País', paisNome));
    secDestino.appendChild(criarLinhaModal('Moeda local', moeda));
    secDestino.appendChild(criarLinhaModal('Duração', duracao + (duracao === 1 ? ' mês' : ' meses')));
    secDestino.appendChild(criarLinhaModal('Orçamento mensal', formatarBrl(orcamentoBrl)));
    secDestino.appendChild(criarLinhaModal(
        'Cotação usada',
        '1 EUR = ' + formatarBrl(cambio.BRL) + (cambioAoVivo ? '' : ' (estimada)')
    ));
    modalCorpo.appendChild(secDestino);

    // Custos mensais + gráfico
    const categorias  = calcularCategorias();
    const totalMensal = categorias.reduce((s, c) => s + c.valor, 0);
    const cores = ['#ff7a00', '#2ec4b6', '#e71d36', '#ff9f1c', '#7209b7', '#4361ee', '#00b4d8'];

    const secCustos = criarSecaoModal('Custos mensais recorrentes');

    const containerGrafico = document.createElement('div');
    containerGrafico.style.marginBottom = '16px';

    const barra = document.createElement('div');
    barra.style.display      = 'flex';
    barra.style.width        = '100%';
    barra.style.height       = '12px';
    barra.style.borderRadius = '6px';
    barra.style.overflow     = 'hidden';
    barra.style.background   = 'rgba(255,255,255,0.05)';
    barra.style.gap          = '2px';

    const legendas = document.createElement('div');
    legendas.style.display             = 'grid';
    legendas.style.gridTemplateColumns = '1fr 1fr';
    legendas.style.gap                 = '8px';
    legendas.style.marginTop           = '12px';

    categorias.forEach((c, i) => {
        const cor = cores[i % cores.length];
        const pct = ((c.valor / totalMensal) * 100).toFixed(1);

        const pedaco = document.createElement('div');
        pedaco.style.width           = pct + '%';
        pedaco.style.height          = '100%';
        pedaco.style.backgroundColor = cor;
        barra.appendChild(pedaco);

        const item = document.createElement('div');
        item.style.display    = 'flex';
        item.style.alignItems = 'center';
        item.style.gap        = '6px';
        item.style.fontSize   = '11px';
        item.style.color      = '#ccc';

        const bolinha = document.createElement('span');
        bolinha.style.width           = '8px';
        bolinha.style.height          = '8px';
        bolinha.style.borderRadius    = '50%';
        bolinha.style.backgroundColor = cor;
        bolinha.style.display         = 'inline-block';

        const texto = document.createElement('span');
        texto.textContent = `${c.icone} ${c.nome} (${pct}%)`;

        item.appendChild(bolinha);
        item.appendChild(texto);
        legendas.appendChild(item);
    });

    containerGrafico.appendChild(barra);
    containerGrafico.appendChild(legendas);
    secCustos.appendChild(containerGrafico);

    categorias.forEach(c => {
        secCustos.appendChild(criarLinhaModal(`${c.icone} ${c.nome}`, formatarDestino(c.valor)));
    });

    const linhaTotal = document.createElement('div');
    linhaTotal.className = 'modal-total-linha';
    linhaTotal.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    linhaTotal.style.marginTop = '10px';
    const tR = document.createElement('span');
    tR.textContent = 'Total mensal';
    const tV = document.createElement('span');
    tV.textContent = formatarDestino(totalMensal) + ' · ' + formatarBrl(paraMoeda(totalMensal, 'BRL'));
    linhaTotal.appendChild(tR);
    linhaTotal.appendChild(tV);
    secCustos.appendChild(linhaTotal);
    modalCorpo.appendChild(secCustos);

    // Instalação
    const instalacao = calcularInstalacao(duracao);
    const totalSetup = instalacao.reduce((s, i) => s + i.valor, 0);

    const secSetup = criarSecaoModal('Custos de instalação (uma única vez)');
    instalacao.forEach(i => {
        secSetup.appendChild(criarLinhaModal(`${i.icone} ${i.nome}`, formatarDestino(i.valor)));
    });
    const linhaSetup = document.createElement('div');
    linhaSetup.className = 'modal-total-linha';
    linhaSetup.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    linhaSetup.style.marginTop = '10px';
    const sR = document.createElement('span');
    sR.textContent = 'Total de instalação';
    const sV = document.createElement('span');
    sV.textContent = formatarDestino(totalSetup) + ' · ' + formatarBrl(paraMoeda(totalSetup, 'BRL'));
    linhaSetup.appendChild(sR);
    linhaSetup.appendChild(sV);
    secSetup.appendChild(linhaSetup);
    modalCorpo.appendChild(secSetup);

    // Projeção
    const custoTotal = totalMensal * duracao + totalSetup;
    const margem     = orcamentoEur - totalMensal;

    const secProj = criarSecaoModal('Projeção financeira');
    secProj.appendChild(criarLinhaModal(
        `Custo recorrente em ${duracao} ${duracao === 1 ? 'mês' : 'meses'}`,
        formatarDestino(totalMensal * duracao)
    ));
    secProj.appendChild(criarLinhaModal('Custos de instalação', formatarDestino(totalSetup)));
    secProj.appendChild(criarLinhaModal(
        'Custo total do intercâmbio',
        formatarDestino(custoTotal) + ' · ' + formatarBrl(paraMoeda(custoTotal, 'BRL'))
    ));
    secProj.appendChild(criarLinhaModal(
        margem >= 0 ? 'Sobra mensal' : 'Déficit mensal',
        formatarDestino(Math.abs(margem)),
        margem >= 0 ? '#4caf50' : '#ff6b6b'
    ));
    modalCorpo.appendChild(secProj);

    // Visto
    const secVisto = criarSecaoModal('Comprovação financeira para o visto');
    if (paisAtual.visto.min) {
        const orcamentoLocal = paraMoeda(orcamentoEur, moeda);
        const atende = orcamentoLocal >= paisAtual.visto.min;
        secVisto.appendChild(criarLinhaModal('Mínimo exigido', formatar(paisAtual.visto.min, moeda) + ' / mês'));
        secVisto.appendChild(criarLinhaModal('Seu orçamento', formatar(orcamentoLocal, moeda) + ' / mês'));
        secVisto.appendChild(criarLinhaModal(
            'Situação',
            atende ? 'Atende ao mínimo' : 'Abaixo do mínimo',
            atende ? '#4caf50' : '#ff6b6b'
        ));
        secVisto.appendChild(criarLinhaModal('Referência', paisAtual.visto.fonte));
    } else {
        secVisto.appendChild(criarLinhaModal('Situação', paisAtual.visto.fonte));
    }
    modalCorpo.appendChild(secVisto);

    // Risco cambial
    const cambioAlta      = cambio.BRL * (1 + ESTRESSE_CAMBIO);
    const orcamentoEstres = orcamentoBrl / cambioAlta;
    const margemEstres    = orcamentoEstres - totalMensal;

    const secRisco = criarSecaoModal('Cenário de risco cambial');
    secRisco.appendChild(criarLinhaModal(
        `Euro ${Math.round(ESTRESSE_CAMBIO * 100)}% mais caro`,
        '1 EUR = ' + formatarBrl(cambioAlta)
    ));
    secRisco.appendChild(criarLinhaModal(
        'Poder de compra do orçamento',
        formatarDestino(orcamentoEstres) + ' / mês'
    ));
    secRisco.appendChild(criarLinhaModal(
        margemEstres >= 0 ? 'Sobra mensal no cenário' : 'Déficit mensal no cenário',
        formatarDestino(Math.abs(margemEstres)),
        margemEstres >= 0 ? '#4caf50' : '#ff6b6b'
    ));
    modalCorpo.appendChild(secRisco);

    const aviso = document.createElement('div');
    aviso.className = 'modal-aviso';
    aviso.textContent =
        'Custos estimados por paridade de poder de compra (Banco Mundial, ' + paisAtual.ano + ') ' +
        'e convertidos pelo câmbio do Banco Central Europeu via API Frankfurter. ' +
        'Os valores de comprovação financeira são referências de 2024/2025, mudam a cada ano e ' +
        'devem ser confirmados no consulado antes de solicitar o visto.';
    modalCorpo.appendChild(aviso);

    modalOverlay.classList.add('ativo');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalFechar.focus();
}

function fecharModal() {
    modalOverlay.classList.remove('ativo');
    modalOverlay.setAttribute('aria-hidden', 'true');
    if (btnRelatorio) btnRelatorio.focus();
}

function baixarRelatorioPdf() {
    const elemento = document.createElement('div');
    elemento.style.padding      = '30px';
    elemento.style.background   = '#121214';
    elemento.style.color        = '#ffffff';
    elemento.style.fontFamily   = 'Poppins, Arial, sans-serif';
    elemento.style.borderRadius = '12px';
    elemento.style.boxSizing    = 'border-box';

    elemento.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff7a00; padding-bottom: 12px; margin-bottom: 20px;">
            <div>
                <h1 style="font-size: 18px; color: #ff7a00; margin: 0; font-weight: 700;">Malagon</h1>
                <p style="font-size: 10px; color: #aaa; margin: 2px 0 0 0;">Relatório financeiro e simulação de intercâmbio</p>
            </div>
            <span style="font-size: 10px; color: #888;">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        ${modalCorpo.innerHTML}
    `;

    elemento.querySelectorAll('.modal-linha').forEach(l => {
        l.style.borderBottom   = '1px solid rgba(255, 255, 255, 0.08)';
        l.style.padding        = '8px 0';
        l.style.display        = 'flex';
        l.style.justifyContent = 'space-between';
        l.style.color          = '#ffffff';
    });

    elemento.querySelectorAll('.modal-secao h3').forEach(s => {
        s.style.color         = '#ff7a00';
        s.style.fontSize      = '11px';
        s.style.letterSpacing = '1px';
        s.style.marginTop     = '15px';
        s.style.marginBottom  = '8px';
    });

    elemento.querySelectorAll('.modal-aviso').forEach(a => {
        a.style.background   = 'rgba(255, 255, 255, 0.05)';
        a.style.padding      = '10px';
        a.style.borderRadius = '6px';
        a.style.fontSize     = '10px';
        a.style.color        = '#bbb';
        a.style.marginTop    = '15px';
    });

    html2pdf().from(elemento).set({
        margin:      [10, 10, 10, 10],
        filename:    `malagon-financeiro-${paisSelect.value.toLowerCase()}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}

// =============================================
// COMPARAÇÃO ENTRE DESTINOS (até 3 países)
// =============================================

// Códigos selecionados para comparar, na ordem em que foram marcados
let paisesComparados = [];
const MAX_COMPARACAO = 3;

function montarChipsComparacao() {
    compararChips.innerHTML = '';

    Array.from(paisSelect.options).forEach(opt => {
        const codigo = opt.value;
        const chip = document.createElement('label');
        chip.className = 'chip-toggle chip-pais';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = codigo;
        input.checked = paisesComparados.includes(codigo);
        input.addEventListener('change', () => alternarPaisComparado(codigo, input.checked));

        const texto = document.createElement('span');
        texto.textContent = opt.text;

        chip.appendChild(input);
        chip.appendChild(texto);
        compararChips.appendChild(chip);
    });
}

function alternarPaisComparado(codigo, marcado) {
    if (marcado) {
        if (paisesComparados.length >= MAX_COMPARACAO) {
            compararAviso.textContent = `Escolha no máximo ${MAX_COMPARACAO} países por vez.`;
            montarChipsComparacao(); // desmarca visualmente o chip que excedeu o limite
            return;
        }
        paisesComparados.push(codigo);
    } else {
        paisesComparados = paisesComparados.filter(c => c !== codigo);
    }
    compararAviso.textContent = '';
    renderComparacao();
}

function renderComparacao() {
    compararResultado.innerHTML = '';

    if (!paisesComparados.length) {
        const vazio = document.createElement('p');
        vazio.className = 'comparar-vazio';
        vazio.textContent = `Marque de 2 a ${MAX_COMPARACAO} países acima para comparar lado a lado.`;
        compararResultado.appendChild(vazio);
        return;
    }

    const orcamentoBrl = parseInt(orcamentoInput.value, 10);
    const duracao      = parseInt(duracaoInput.value, 10);

    paisesComparados.forEach(codigo => {
        const pais = PAISES[codigo];
        if (!pais) return;

        const moeda = pais.moeda;
        const orcamentoEur   = orcamentoBrl / cambio.BRL;
        const orcamentoLocal = paraMoeda(orcamentoEur, moeda);

        const categorias  = calcularCategorias(pais);
        const totalMensal = categorias.reduce((s, c) => s + c.valor, 0);
        const instalacao  = totalInstalacaoEur(duracao, pais);
        const custoTotal  = totalMensal * duracao + instalacao;
        const margem      = orcamentoEur - totalMensal;

        const card = document.createElement('div');
        card.className = 'comparar-card';

        const nomeOpt = Array.from(paisSelect.options).find(o => o.value === codigo);
        const titulo = document.createElement('div');
        titulo.className = 'comparar-titulo';
        titulo.textContent = nomeOpt ? nomeOpt.text : codigo;
        card.appendChild(titulo);

        const linhas = [
            ['Custo mensal', formatarPara(totalMensal, moeda) + ' · ' + formatarBrl(paraMoeda(totalMensal, 'BRL'))],
            [margem >= 0 ? 'Sobra por mês' : 'Falta por mês', formatarPara(Math.abs(margem), moeda)],
            [`Custo total (${duracao} ${duracao === 1 ? 'mês' : 'meses'})`, formatarPara(custoTotal, moeda)],
        ];

        linhas.forEach(([rotulo, valor]) => {
            const linha = document.createElement('div');
            linha.className = 'comparar-linha';
            const r = document.createElement('span');
            r.textContent = rotulo;
            const v = document.createElement('span');
            v.textContent = valor;
            linha.appendChild(r);
            linha.appendChild(v);
            card.appendChild(linha);
        });

        const vistoOk = !pais.visto.min || orcamentoLocal >= pais.visto.min;
        const selo = document.createElement('div');
        selo.className = 'comparar-selo ' + (
            !pais.visto.min ? 'info' : (vistoOk ? 'ok' : 'perigo')
        );
        selo.textContent = !pais.visto.min
            ? 'Sem exigência de visto'
            : (vistoOk ? 'Atende ao visto' : 'Abaixo do mínimo do visto');
        card.appendChild(selo);

        const orcamentoStatus = document.createElement('div');
        orcamentoStatus.className = 'comparar-selo ' + (margem >= 0 ? 'ok' : 'perigo');
        orcamentoStatus.textContent = margem >= 0 ? 'Orçamento viável' : 'Orçamento insuficiente';
        card.appendChild(orcamentoStatus);

        compararResultado.appendChild(card);
    });
}

// =============================================
// EVENTOS
// =============================================
orcamentoInput.addEventListener('input', atualizarTudo);
duracaoInput.addEventListener('input',   atualizarTudo);
chkMoradia.addEventListener('change',    atualizarTudo);
chkSeguro.addEventListener('change',     atualizarTudo);
paisSelect.addEventListener('change',    trocarPais);

if (btnRelatorio)   btnRelatorio.addEventListener('click', gerarRelatorio);
if (modalFechar)    modalFechar.addEventListener('click', fecharModal);
if (btnImprimirPdf) btnImprimirPdf.addEventListener('click', baixarRelatorioPdf);

if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) fecharModal();
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('ativo')) fecharModal();
});

// =============================================
// INICIALIZAÇÃO
// =============================================
async function inicializar() {
    paisBase  = PAISES.ES;
    paisAtual = PAISES[paisSelect.value] || PAISES.ES;

    montarChipsComparacao();
    await buscarCambio();
    trocarPais();
}

inicializar();
