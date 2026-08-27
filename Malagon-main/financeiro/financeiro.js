// =============================================
// DADOS BASE (Málaga, Espanha)
// =============================================
const CUSTOS_BASE = [
    { nome: 'Moradia',      icone: '🏠', base: 550 },
    { nome: 'Alimentação',  icone: '🍽️', base: 250 },
    { nome: 'Transporte',   icone: '🚌', base: 45  },
    { nome: 'Materiais',    icone: '📚', base: 30  },
    { nome: 'Saúde',        icone: '🏥', base: 110 },
    { nome: 'Lazer',        icone: '🎉', base: 120 },
];

let indicePaisBase = null;
let indicePaisAtual = null;
let taxaCambio = null;

// =============================================
// ELEMENTOS DA TELA
// =============================================
const paisSelect      = document.getElementById('paisSelect');
const paisTag         = document.getElementById('paisTag');
const paisStatus      = document.getElementById('paisStatus');
const cambioValor     = document.getElementById('cambioValor');
const cambioData      = document.getElementById('cambioData');
const custosLista     = document.getElementById('custosLista');
const totalEur        = document.getElementById('totalEur');
const totalBrl        = document.getElementById('totalBrl');
const orcamentoInput  = document.getElementById('orcamento');
const duracaoInput    = document.getElementById('duracao');
const orcamentoValor  = document.getElementById('orcamentoValor');
const duracaoValor    = document.getElementById('duracaoValor');
const resultadoTitulo = document.getElementById('resultadoTitulo');
const resultadoSub    = document.getElementById('resultadoSub');
const custoTotalSub   = document.getElementById('custoTotalSub');
const cardOrcamento   = document.getElementById('cardOrcamento');
const btnRelatorio    = document.getElementById('btnRelatorio');
const modalOverlay    = document.getElementById('modalOverlay');
const modalFechar     = document.getElementById('modalFechar');
const modalCorpo      = document.getElementById('modalCorpo');
const btnImprimirPdf  = document.getElementById('btnImprimirPdf');

// =============================================
// FORMATAÇÃO
// =============================================
function formatarEur(valor) {
    return '€' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarBrl(valor) {
    return 'R$\u00a0' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================================
// API DE CÂMBIO (1 EUR = X.XX BRL)
// =============================================
async function buscarCambio() {
    const taxaFallback = 5.48;

    try {
        const resp = await fetch('https://economia.awesomeapi.com.br/json/last/EUR-BRL');
        if (!resp.ok) throw new Error('Erro na API');
        
        const dados = await resp.json();
        const cotacao = dados.EURBRL;
        
        taxaCambio = parseFloat(cotacao.bid);
        cambioValor.textContent = `1 EUR = ${taxaCambio.toFixed(2)} BRL`;
        cambioData.textContent = 'atualizado em ' + cotacao.create_date;
    } catch (e) {
        taxaCambio = taxaFallback;
        cambioValor.textContent = `1 EUR = ${taxaFallback.toFixed(2)} BRL`;
        cambioData.textContent = 'modo offline (estimado)';
    }
}

// =============================================
// ÍNDICES DO BANCO MUNDIAL
// =============================================
const INDICES_PAISES = {
    ES: { valor: 0.674, ano: 2023 },
    PT: { valor: 0.598, ano: 2023 },
    DE: { valor: 0.821, ano: 2023 },
    FR: { valor: 0.829, ano: 2023 },
    IT: { valor: 0.726, ano: 2023 },
    NL: { valor: 0.876, ano: 2023 },
    PL: { valor: 0.460, ano: 2023 },
    CZ: { valor: 0.522, ano: 2023 },
    SE: { valor: 0.860, ano: 2023 },
    NO: { valor: 1.109, ano: 2023 },
    CH: { valor: 1.260, ano: 2023 },
    GB: { valor: 0.795, ano: 2023 },
    US: { valor: 1.000, ano: 2023 },
    CA: { valor: 0.840, ano: 2023 },
    AU: { valor: 0.860, ano: 2023 },
    JP: { valor: 0.620, ano: 2023 },
    BR: { valor: 0.370, ano: 2023 },
};

function buscarIndicePais(codigo) {
    return INDICES_PAISES[codigo] || null;
}

// =============================================
// LÓGICA DE CÁLCULO
// =============================================
function calcularFator() {
    if (!indicePaisBase || !indicePaisAtual) return 1;
    return indicePaisAtual.valor / indicePaisBase.valor;
}

function atualizarCustos() {
    const fator = calcularFator();
    const itens = custosLista.querySelectorAll('li');
    let total = 0;

    CUSTOS_BASE.forEach((custo, i) => {
        const valorAjustado = Math.round(custo.base * fator);
        total += valorAjustado;

        const spanValor = itens[i].querySelector('.item-valor');
        spanValor.textContent = formatarEur(valorAjustado);

        spanValor.classList.remove('subiu', 'desceu');
        if (fator > 1.02) spanValor.classList.add('subiu');
        if (fator < 0.98) spanValor.classList.add('desceu');
    });

    totalEur.textContent = formatarEur(total);

    if (taxaCambio) {
        totalBrl.textContent = formatarBrl(total * taxaCambio) + ' / mês';
    }

    atualizarSimulador(total);
    return total;
}

function atualizarSimulador(custoMensal) {
    const orcamento = parseInt(orcamentoInput.value);
    const duracao   = parseInt(duracaoInput.value);

    orcamentoValor.textContent = '€ ' + orcamento.toLocaleString('pt-BR');
    duracaoValor.textContent   = duracao + (duracao === 1 ? ' Mês' : ' Meses');

    const custoTotal = custoMensal * duracao;
    const margem     = orcamento - custoMensal;

    custoTotalSub.textContent = formatarEur(custoTotal) + ' em ' + duracao + ' meses';

    cardOrcamento.classList.remove('ok', 'alerta', 'perigo');
    if (margem >= 0) {
        cardOrcamento.classList.add('ok');
        resultadoTitulo.textContent = 'Orçamento Viável';
        resultadoSub.textContent    = 'MARGEM: ' + formatarEur(margem);
    } else if (margem >= -200) {
        cardOrcamento.classList.add('alerta');
        resultadoTitulo.textContent = 'Atenção';
        resultadoSub.textContent    = 'DÉFICIT: ' + formatarEur(Math.abs(margem));
    } else {
        cardOrcamento.classList.add('perigo');
        resultadoTitulo.textContent = 'Orçamento Insuficiente';
        resultadoSub.textContent    = 'DÉFICIT: ' + formatarEur(Math.abs(margem));
    }
}

function trocarPais() {
    const codigo   = paisSelect.value;
    const textoOpt = paisSelect.options[paisSelect.selectedIndex].text;
    paisTag.textContent = textoOpt.split(' ').slice(0, 2).join(' ');

    const resultado = buscarIndicePais(codigo);
    if (resultado) {
        indicePaisAtual = resultado;
        paisStatus.innerHTML = 'Dados oficiais &bull; Banco Mundial (' + resultado.ano + ')';
    } else {
        indicePaisAtual = indicePaisBase;
        paisStatus.textContent = 'Usando estimativa base';
    }

    atualizarCustos();
}

// =============================================
// MODAL COM GRÁFICO E PDF ESCURO
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
    const fator     = calcularFator();
    const duracao   = parseInt(duracaoInput.value);
    const orcamento = parseInt(orcamentoInput.value);
    const paisNome  = paisSelect.options[paisSelect.selectedIndex].text;

    modalCorpo.innerHTML = '';

    const secDestino = criarSecaoModal('DESTINO SELECIONADO');
    secDestino.appendChild(criarLinhaModal('País', paisNome));
    secDestino.appendChild(criarLinhaModal('Duração', duracao + (duracao === 1 ? ' mês' : ' meses')));
    secDestino.appendChild(criarLinhaModal('Orçamento mensal', formatarEur(orcamento)));
    modalCorpo.appendChild(secDestino);

    const coresCategorias = ['#ff7a00', '#2ec4b6', '#e71d36', '#ff9f1c', '#7209b7', '#4361ee'];
    let totalMensal = 0;
    const custosCalculados = CUSTOS_BASE.map((c, index) => {
        const v = Math.round(c.base * fator);
        totalMensal += v;
        return { ...c, valorAjustado: v, cor: coresCategorias[index % coresCategorias.length] };
    });

    const secCustos = criarSecaoModal('DETALHAMENTO E DISTRIBUIÇÃO MENSAL');
    
    const containerGrafico = document.createElement('div');
    containerGrafico.style.marginBottom = '16px';

    const barraGrafico = document.createElement('div');
    barraGrafico.style.display = 'flex';
    barraGrafico.style.width = '100%';
    barraGrafico.style.height = '12px';
    barraGrafico.style.borderRadius = '6px';
    barraGrafico.style.overflow = 'hidden';
    barraGrafico.style.background = 'rgba(255,255,255,0.05)';
    barraGrafico.style.gap = '2px';

    const gridLegendas = document.createElement('div');
    gridLegendas.style.display = 'grid';
    gridLegendas.style.gridTemplateColumns = '1fr 1fr';
    gridLegendas.style.gap = '8px';
    gridLegendas.style.marginTop = '12px';

    custosCalculados.forEach(c => {
        const percentual = ((c.valorAjustado / totalMensal) * 100).toFixed(1);

        const pedaco = document.createElement('div');
        pedaco.style.width = percentual + '%';
        pedaco.style.height = '100%';
        pedaco.style.backgroundColor = c.cor;
        barraGrafico.appendChild(pedaco);

        const itemLegenda = document.createElement('div');
        itemLegenda.style.display = 'flex';
        itemLegenda.style.alignItems = 'center';
        itemLegenda.style.gap = '6px';
        itemLegenda.style.fontSize = '11px';
        itemLegenda.style.color = '#ccc';

        const bolinha = document.createElement('span');
        bolinha.style.width = '8px';
        bolinha.style.height = '8px';
        bolinha.style.borderRadius = '50%';
        bolinha.style.backgroundColor = c.cor;
        bolinha.style.display = 'inline-block';

        const textoLegenda = document.createElement('span');
        textoLegenda.textContent = `${c.icone} ${c.nome} (${percentual}%)`;

        itemLegenda.appendChild(bolinha);
        itemLegenda.appendChild(textoLegenda);
        gridLegendas.appendChild(itemLegenda);
    });

    containerGrafico.appendChild(barraGrafico);
    containerGrafico.appendChild(gridLegendas);
    secCustos.appendChild(containerGrafico);

    custosCalculados.forEach(c => {
        secCustos.appendChild(criarLinhaModal(`${c.icone} ${c.nome}`, formatarEur(c.valorAjustado)));
    });

    const totalLinha = document.createElement('div');
    totalLinha.className = 'modal-total-linha';
    totalLinha.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    totalLinha.style.marginTop = '10px';
    const tRotulo = document.createElement('span');
    tRotulo.textContent = 'Total mensal estimado';
    const tValor = document.createElement('span');
    tValor.textContent = formatarEur(totalMensal);
    totalLinha.appendChild(tRotulo);
    totalLinha.appendChild(tValor);
    secCustos.appendChild(totalLinha);
    modalCorpo.appendChild(secCustos);

    const custoTotal = totalMensal * duracao;
    const margem     = orcamento - totalMensal;
    const brl        = taxaCambio ? formatarBrl(totalMensal * taxaCambio) : '—';

    const secProj = criarSecaoModal('PROJEÇÃO FINANCEIRA');
    secProj.appendChild(criarLinhaModal(`Custo total em ${duracao} meses`, formatarEur(custoTotal)));
    secProj.appendChild(criarLinhaModal('Equivalente em BRL (câmbio)', brl + ' / mês'));
    secProj.appendChild(criarLinhaModal(
        margem >= 0 ? 'Sobra mensal' : 'Déficit mensal',
        formatarEur(Math.abs(margem)),
        margem >= 0 ? '#4caf50' : '#ff6b6b'
    ));
    modalCorpo.appendChild(secProj);

    const aviso = document.createElement('div');
    aviso.className = 'modal-aviso';
    aviso.textContent = 'ℹ️ Estimativas calculadas via paridade de poder de compra e câmbio atualizado via API. Valores sujeitos a variações locais.';
    modalCorpo.appendChild(aviso);

    modalOverlay.classList.add('ativo');
    modalOverlay.setAttribute('aria-hidden', 'false');
}

function fecharModal() {
    modalOverlay.classList.remove('ativo');
    modalOverlay.setAttribute('aria-hidden', 'true');
}

function baixarRelatorioPdf() {
    const elemento = document.createElement('div');
    elemento.style.padding = '30px';
    elemento.style.background = '#121214';
    elemento.style.color = '#ffffff';
    elemento.style.fontFamily = 'Poppins, Arial, sans-serif';
    elemento.style.borderRadius = '12px';
    elemento.style.boxSizing = 'border-box';
    
    let htmlConteudo = modalCorpo.innerHTML;
    
    elemento.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff7a00; padding-bottom: 12px; margin-bottom: 20px;">
            <div>
                <h1 style="font-size: 18px; color: #ff7a00; margin: 0; font-weight: 700;">Malagon</h1>
                <p style="font-size: 10px; color: #aaa; margin: 2px 0 0 0;">Relatório Financeiro e Simulação de Intercâmbio</p>
            </div>
            <span style="font-size: 10px; color: #888;">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        ${htmlConteudo}
    `;

    setTimeout(() => {
        const linhas = elemento.querySelectorAll('.modal-linha');
        linhas.forEach(l => {
            l.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
            l.style.padding = '8px 0';
            l.style.display = 'flex';
            l.style.justifyContent = 'space-between';
            l.style.color = '#ffffff';
        });

        const secoes = elemento.querySelectorAll('.modal-secao h3');
        secoes.forEach(s => {
            s.style.color = '#ff7a00';
            s.style.fontSize = '11px';
            s.style.letterSpacing = '1px';
            s.style.marginTop = '15px';
            s.style.marginBottom = '8px';
        });

        const avisos = elemento.querySelectorAll('.modal-aviso');
        avisos.forEach(a => {
            a.style.background = 'rgba(255, 255, 255, 0.05)';
            a.style.padding = '10px';
            a.style.borderRadius = '6px';
            a.style.fontSize = '10px';
            a.style.color = '#bbb';
            a.style.marginTop = '15px';
        });
    }, 10);

    const opcoes = {
        margin:       [10, 10, 10, 10],
        filename:     'relatorio-financeiro-malagon.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(elemento).set(opcoes).save();
}

// =============================================
// EVENTOS
// =============================================
orcamentoInput.addEventListener('input', () => atualizarCustos());
duracaoInput.addEventListener('input',   () => atualizarCustos());
paisSelect.addEventListener('change',    trocarPais);

if (btnRelatorio) btnRelatorio.addEventListener('click', gerarRelatorio);
if (modalFechar) modalFechar.addEventListener('click', fecharModal);
if (btnImprimirPdf) btnImprimirPdf.addEventListener('click', baixarRelatorioPdf);

if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) fecharModal();
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('ativo')) {
        fecharModal();
    }
});

// =============================================
// INICIALIZAÇÃO
// =============================================
async function inicializar() {
    indicePaisBase  = buscarIndicePais('ES');
    indicePaisAtual = indicePaisBase;

    if (indicePaisBase) {
        paisStatus.innerHTML = 'Dados oficiais &bull; Banco Mundial (' + indicePaisBase.ano + ')';
    }

    await buscarCambio();
    atualizarCustos();
}

inicializar();