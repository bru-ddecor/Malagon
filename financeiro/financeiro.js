// =============================================
// DADOS BASE (custos em Málaga, Espanha)
// =============================================

// Cada item tem: nome, ícone, e valor mensal médio em euros (base = Espanha)
const CUSTOS_BASE = [
    { nome: 'Moradia',      icone: '🏠', base: 550 },
    { nome: 'Alimentação',  icone: '🍽️', base: 250 },
    { nome: 'Transporte',   icone: '🚌', base: 45  },
    { nome: 'Materiais',    icone: '📚', base: 30  },
    { nome: 'Saúde',        icone: '🏥', base: 110 },
    { nome: 'Lazer',        icone: '🎉', base: 120 },
];

// Índice de nível de preços da Espanha (buscado do Banco Mundial na inicialização)
// Serve como referência: os outros países serão comparados com esse valor.
let indicePaisBase = null;

// Índice do país atualmente selecionado (buscado a cada troca de país)
let indicePaisAtual = null;

// Taxa de câmbio BRL → EUR (buscada da Frankfurter API)
let taxaCambio = null;

// =============================================
// ELEMENTOS DA TELA
// =============================================
const paisSelect    = document.getElementById('paisSelect');
const paisTag       = document.getElementById('paisTag');
const paisStatus    = document.getElementById('paisStatus');
const paisAno       = document.getElementById('paisAno');
const cambioValor   = document.getElementById('cambioValor');
const cambioData    = document.getElementById('cambioData');
const custosLista   = document.getElementById('custosLista');
const totalEur      = document.getElementById('totalEur');
const totalBrl      = document.getElementById('totalBrl');
const orcamentoInput = document.getElementById('orcamento');
const duracaoInput   = document.getElementById('duracao');
const orcamentoValor = document.getElementById('orcamentoValor');
const duracaoValor   = document.getElementById('duracaoValor');
const resultadoTitulo = document.getElementById('resultadoTitulo');
const resultadoSub    = document.getElementById('resultadoSub');
const custoTotalSub   = document.getElementById('custoTotalSub');
const cardOrcamento   = document.getElementById('cardOrcamento');
const btnRelatorio    = document.getElementById('btnRelatorio');
const modalOverlay    = document.getElementById('modalOverlay');
const modalFechar     = document.getElementById('modalFechar');
const modalCorpo      = document.getElementById('modalCorpo');

// =============================================
// FORMATAÇÃO DE MOEDA
// =============================================
function formatEur(valor) {
    return '€' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBrl(valor) {
    return 'R$\u00a0' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================================
// API 1: CÂMBIO BRL/EUR (Frankfurter — gratuita, sem chave)
// =============================================
async function buscarCambio() {
    try {
        const resp = await fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL');
        const dados = await resp.json();
        taxaCambio = dados.rates.BRL;
        cambioValor.textContent = 'R$ ' + taxaCambio.toFixed(4);
        cambioData.textContent = 'atualizado ' + dados.date;
    } catch (e) {
        cambioValor.textContent = '—';
        cambioData.textContent = 'erro ao carregar';
    }
}

// =============================================
// INDICES DE CUSTO DE VIDA POR PAIS
// Fonte: Banco Mundial - indice de nivel de precos (PA.NUS.PPPC.RF), 2022/2023.
// Representa o custo de vida geral do pais em relacao aos EUA (base = 1.0).
// A gente usa isso pra calcular o fator: indicePaisAtual / indicePaisBase (ES).
// Se o fator for > 1, o pais e mais caro que a Espanha; se < 1, mais barato.
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

function buscarIndicePais(codigoPais) {
    return INDICES_PAISES[codigoPais] || null;
}

// =============================================
// CALCULAR E ATUALIZAR CUSTOS NA TELA
// =============================================
function calcularFator() {
    // Se não tiver os dois índices, usa fator 1 (sem ajuste)
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
        spanValor.textContent = formatEur(valorAjustado);

        // Cores indicando variação em relação à base
        spanValor.classList.remove('subiu', 'desceu');
        if (fator > 1.02) spanValor.classList.add('subiu');
        if (fator < 0.98) spanValor.classList.add('desceu');
    });

    totalEur.textContent = formatEur(total);

    if (taxaCambio) {
        totalBrl.textContent = formatBrl(total * taxaCambio) + ' / mês';
    }

    atualizarSimulador(total);
    return total;
}

// =============================================
// SIMULADOR (sliders de orçamento e duração)
// =============================================
function atualizarSimulador(custoMensal) {
    const orcamento = parseInt(orcamentoInput.value);
    const duracao   = parseInt(duracaoInput.value);

    orcamentoValor.textContent = '€ ' + orcamento.toLocaleString('pt-BR');
    duracaoValor.textContent   = duracao + (duracao === 1 ? ' Mês' : ' Meses');

    const custoTotal  = custoMensal * duracao;
    const margem      = orcamento - custoMensal;

    custoTotalSub.textContent = formatEur(custoTotal) + ' em ' + duracao + ' meses';

    cardOrcamento.classList.remove('ok', 'alerta', 'perigo');
    if (margem >= 0) {
        cardOrcamento.classList.add('ok');
        resultadoTitulo.textContent = 'Orçamento Viável';
        resultadoSub.textContent    = 'SOBRA MENSAL: ' + formatEur(margem);
    } else if (margem >= -200) {
        cardOrcamento.classList.add('alerta');
        resultadoTitulo.textContent = 'Atenção';
        resultadoSub.textContent    = 'DÉFICIT: ' + formatEur(Math.abs(margem));
    } else {
        cardOrcamento.classList.add('perigo');
        resultadoTitulo.textContent = 'Orçamento Insuficiente';
        resultadoSub.textContent    = 'DÉFICIT: ' + formatEur(Math.abs(margem));
    }
}

// =============================================
// TROCAR PAÍS (chamado ao mudar o select)
// =============================================
function trocarPais() {
    const codigo   = paisSelect.value;
    const textoOpt = paisSelect.options[paisSelect.selectedIndex].text;
    paisTag.textContent = textoOpt.split(' ').slice(0,2).join(' ');

    const resultado = buscarIndicePais(codigo);

    if (resultado) {
        indicePaisAtual = resultado;
        paisStatus.innerHTML =
            'Dados do Banco Mundial &bull; ' + resultado.ano;
    } else {
        indicePaisAtual = indicePaisBase;
        paisStatus.textContent = 'Usando estimativa base';
    }

    atualizarCustos();
}

// =============================================
// MODAL DE RELATÓRIO
// =============================================
function gerarRelatorio() {
    const fator    = calcularFator();
    const duracao  = parseInt(duracaoInput.value);
    const orcamento = parseInt(orcamentoInput.value);
    const paisNome = paisSelect.options[paisSelect.selectedIndex].text;

    let itensHtml = '';
    let total = 0;
    CUSTOS_BASE.forEach(c => {
        const v = Math.round(c.base * fator);
        total += v;
        itensHtml += `
            <div class="modal-linha">
                <span>${c.icone} ${c.nome}</span>
                <span>${formatEur(v)}</span>
            </div>`;
    });

    const custoTotal = total * duracao;
    const margem     = orcamento - total;
    const brl        = taxaCambio ? formatBrl(total * taxaCambio) : '—';

    modalCorpo.innerHTML = `
        <div class="modal-secao">
            <h3>DESTINO</h3>
            <div class="modal-linha"><span>País</span><span>${paisNome}</span></div>
            <div class="modal-linha"><span>Duração do intercâmbio</span><span>${duracao} meses</span></div>
            <div class="modal-linha"><span>Orçamento mensal disponível</span><span>${formatEur(orcamento)}</span></div>
        </div>

        <div class="modal-secao">
            <h3>BREAKDOWN DE CUSTOS (mensal)</h3>
            ${itensHtml}
            <div class="modal-total-linha">
                <span>Total mensal estimado</span>
                <span>${formatEur(total)}</span>
            </div>
        </div>

        <div class="modal-secao">
            <h3>PROJEÇÃO TOTAL</h3>
            <div class="modal-linha"><span>Custo total em ${duracao} meses</span><span>${formatEur(custoTotal)}</span></div>
            <div class="modal-linha"><span>Equivalente em BRL (câmbio atual)</span><span>${brl} / mês</span></div>
            <div class="modal-linha">
                <span>${margem >= 0 ? 'Sobra mensal' : 'Déficit mensal'}</span>
                <span style="color:${margem >= 0 ? '#4caf50' : '#ff6b6b'}">${formatEur(Math.abs(margem))}</span>
            </div>
        </div>

        <div class="modal-aviso">
            ℹ️ Estimativas baseadas no índice de nível de preços do Banco Mundial (${indicePaisAtual?.ano || '—'})
            e câmbio BRL/EUR da Frankfurter API. Os valores são aproximados e podem variar conforme
            cidade, estilo de vida e período do intercâmbio.
        </div>
    `;

    modalOverlay.classList.add('ativo');
}

// =============================================
// EVENTOS
// =============================================
orcamentoInput.addEventListener('input', () => atualizarCustos());
duracaoInput.addEventListener('input',   () => atualizarCustos());
paisSelect.addEventListener('change',    trocarPais);
btnRelatorio.addEventListener('click',   gerarRelatorio);
modalFechar.addEventListener('click',    () => modalOverlay.classList.remove('ativo'));
modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('ativo');
});

// =============================================
// INICIALIZAÇÃO
// =============================================
async function inicializar() {
    // Busca cambio em tempo real e carrega indice da Espanha da tabela local
    indicePaisBase  = buscarIndicePais('ES');
    indicePaisAtual = indicePaisBase;

    if (indicePaisBase) {
        paisStatus.innerHTML = 'Dados do Banco Mundial &bull; ' + indicePaisBase.ano;
    }

    await buscarCambio();
    atualizarCustos();
}

inicializar();
