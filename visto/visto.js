// =============================================
// MALAGON — CHECKLIST DE VISTO
// Itens organizados por fase do processo.
// "prazo" = dias antes do embarque em que a tarefa
// deveria estar concluída (negativo = depois da chegada).
// =============================================

const FASES = [
    { id: 'preparo',   nome: 'Preparação',            desc: '4 a 6 meses antes', icone: '📋' },
    { id: 'consulado', nome: 'Processo no consulado', desc: '2 a 3 meses antes', icone: '🏛️' },
    { id: 'embarque',  nome: 'Antes de embarcar',     desc: 'último mês',        icone: '✈️' },
    { id: 'chegada',   nome: 'Ao chegar',             desc: 'primeiras semanas', icone: '📍' },
];

// Itens exigidos em praticamente todo processo de estudante
const ITENS_COMUNS = [
    { id: 'passaporte',   fase: 'preparo',   prazo: 180, nome: 'Passaporte válido',
      sub: 'Precisa continuar válido por pelo menos 6 meses depois da data de retorno' },
    { id: 'aceitacao',    fase: 'preparo',   prazo: 150, nome: 'Carta de aceitação da instituição',
      sub: 'Documento oficial da universidade ou escola de idiomas' },
    { id: 'idioma',       fase: 'preparo',   prazo: 130, nome: 'Certificado de proficiência',
      sub: 'Exigido pela instituição; o consulado nem sempre pede' },
    { id: 'financeiro',   fase: 'preparo',   prazo: 120, nome: 'Comprovação financeira',
      sub: 'Extratos dos últimos 3 meses no valor mínimo exigido pelo país' },
    { id: 'seguro',       fase: 'preparo',   prazo: 100, nome: 'Seguro saúde internacional',
      sub: 'Cobertura mínima costuma ser de € 30.000 no espaço Schengen' },

    { id: 'formulario',   fase: 'consulado', prazo: 90, nome: 'Formulário de solicitação',
      sub: 'Preenchido e assinado no site oficial do consulado' },
    { id: 'antecedentes', fase: 'consulado', prazo: 90, nome: 'Antecedentes criminais',
      sub: 'Emitido pela Polícia Federal; costuma valer 90 dias' },
    { id: 'fotos',        fase: 'consulado', prazo: 85, nome: 'Fotos no padrão exigido',
      sub: 'Tamanho e fundo variam por país — confira antes de tirar' },
    { id: 'agendamento',  fase: 'consulado', prazo: 80, nome: 'Agendamento no consulado',
      sub: 'As vagas costumam abrir com semanas de antecedência' },
    { id: 'traducao',     fase: 'consulado', prazo: 75, nome: 'Tradução juramentada',
      sub: 'Documentos em português precisam de tradutor público registrado' },
    { id: 'moradia',      fase: 'consulado', prazo: 70, nome: 'Comprovante de moradia no destino',
      sub: 'Contrato de aluguel, residência estudantil ou carta de acolhimento' },
    { id: 'taxa',         fase: 'consulado', prazo: 65, nome: 'Pagamento da taxa consular',
      sub: 'Guarde o comprovante — costuma ser exigido na entrevista' },
    { id: 'entrevista',   fase: 'consulado', prazo: 55, nome: 'Biometria e entrevista',
      sub: 'Leve todos os originais, não só as cópias' },

    { id: 'passagem',     fase: 'embarque',  prazo: 45, nome: 'Passagem de ida e volta',
      sub: 'Alguns consulados só liberam o visto com a passagem comprada' },
    { id: 'vacinas',      fase: 'embarque',  prazo: 30, nome: 'Comprovante de vacinação',
      sub: 'Certificado internacional, quando o país exigir' },
    { id: 'banco',        fase: 'embarque',  prazo: 25, nome: 'Cartão internacional ou conta multimoeda',
      sub: 'Compare as taxas de câmbio e de saque antes de escolher' },
    { id: 'copias',       fase: 'embarque',  prazo: 15, nome: 'Cópias digitais de tudo',
      sub: 'Salve na nuvem e deixe uma cópia física com a família' },
    { id: 'bagagem',      fase: 'embarque',  prazo: 7,  nome: 'Documentos na bagagem de mão',
      sub: 'Visto, carta de aceitação e seguro nunca vão na mala despachada' },

    { id: 'imigracao',    fase: 'chegada',   prazo: -15, nome: 'Registro no órgão de imigração',
      sub: 'Vários países exigem isso nos primeiros 30 dias' },
    { id: 'conta',        fase: 'chegada',   prazo: -20, nome: 'Conta bancária local',
      sub: 'Normalmente pedem o comprovante de moradia e o registro de imigração' },
    { id: 'consulado_br', fase: 'chegada',   prazo: -30, nome: 'Registro no consulado brasileiro',
      sub: 'Facilita emergências e a emissão de documentos lá fora' },
];

// Itens específicos de cada destino
const ITENS_POR_PAIS = {
    ES: [
        { id: 'es_apostila', fase: 'consulado', prazo: 80, nome: 'Apostila de Haia',
          sub: 'Antecedentes e diploma precisam ser apostilados em cartório' },
        { id: 'es_tie', fase: 'chegada', prazo: -20, nome: 'TIE — cartão de identidade de estrangeiro',
          sub: 'Solicitar em até 30 dias após a chegada, para estadias acima de 6 meses' },
    ],
    PT: [
        { id: 'pt_nif', fase: 'chegada', prazo: -10, nome: 'NIF — número de identificação fiscal',
          sub: 'Necessário para alugar imóvel, abrir conta e contratar serviços' },
        { id: 'pt_aima', fase: 'chegada', prazo: -25, nome: 'Agendamento na AIMA',
          sub: 'Substituiu o antigo SEF; os prazos costumam ser longos' },
    ],
    DE: [
        { id: 'de_sperrkonto', fase: 'preparo', prazo: 140, nome: 'Sperrkonto — conta bloqueada',
          sub: 'Depósito do valor anual exigido, liberado em parcelas mensais' },
        { id: 'de_anmeldung', fase: 'chegada', prazo: -10, nome: 'Anmeldung — registro de endereço',
          sub: 'Obrigatório nas duas primeiras semanas' },
        { id: 'de_krankenkasse', fase: 'chegada', prazo: -20, nome: 'Seguro saúde público',
          sub: 'Estudantes normalmente precisam migrar do seguro de viagem' },
    ],
    FR: [
        { id: 'fr_campus', fase: 'preparo', prazo: 160, nome: 'Procedimento Campus France',
          sub: 'Etapa obrigatória antes de agendar o consulado' },
        { id: 'fr_cvec', fase: 'chegada', prazo: -5, nome: 'CVEC',
          sub: 'Contribuição estudantil obrigatória para efetivar a matrícula' },
        { id: 'fr_vls', fase: 'chegada', prazo: -20, nome: 'Validação do VLS-TS',
          sub: 'Online, em até 3 meses da chegada, senão o visto perde validade' },
    ],
    IT: [
        { id: 'it_permesso', fase: 'chegada', prazo: -8, nome: 'Permesso di soggiorno',
          sub: 'Solicitar em até 8 dias úteis após a chegada' },
        { id: 'it_codice', fase: 'chegada', prazo: -15, nome: 'Codice fiscale',
          sub: 'Equivalente ao CPF; exigido para quase tudo' },
    ],
    NL: [
        { id: 'nl_bsn', fase: 'chegada', prazo: -10, nome: 'BSN — número de cidadão',
          sub: 'Obtido no registro da prefeitura (gemeente)' },
    ],
    PL: [
        { id: 'pl_pesel', fase: 'chegada', prazo: -20, nome: 'PESEL',
          sub: 'Número de identificação usado em serviços públicos' },
    ],
    CZ: [
        { id: 'cz_bio', fase: 'chegada', prazo: -3, nome: 'Biometria para o cartão de residência',
          sub: 'Agendar em até 3 dias úteis após a chegada' },
    ],
    SE: [
        { id: 'se_personnummer', fase: 'chegada', prazo: -25, nome: 'Personnummer',
          sub: 'Só é emitido para estadias acima de 12 meses' },
    ],
    NO: [
        { id: 'no_politi', fase: 'chegada', prazo: -7, nome: 'Registro na polícia',
          sub: 'Obrigatório nos primeiros 7 dias' },
    ],
    CH: [
        { id: 'ch_permis', fase: 'chegada', prazo: -14, nome: 'Permis B de estudante',
          sub: 'Registro na comuna nas primeiras duas semanas' },
    ],
    GB: [
        { id: 'gb_cas', fase: 'preparo', prazo: 150, nome: 'CAS da universidade',
          sub: 'Código de confirmação sem o qual não se solicita o visto' },
        { id: 'gb_ihs', fase: 'consulado', prazo: 85, nome: 'IHS — taxa de saúde',
          sub: 'Paga junto da solicitação e dá acesso ao sistema público' },
        { id: 'gb_tb', fase: 'consulado', prazo: 95, nome: 'Exame de tuberculose',
          sub: 'Exigido do Brasil, em clínica credenciada pelo governo britânico' },
    ],
    US: [
        { id: 'us_i20', fase: 'preparo', prazo: 150, nome: 'Formulário I-20',
          sub: 'Emitido pela universidade e base de todo o processo F-1' },
        { id: 'us_sevis', fase: 'consulado', prazo: 95, nome: 'Taxa SEVIS I-901',
          sub: 'Deve ser paga antes de agendar a entrevista' },
        { id: 'us_ds160', fase: 'consulado', prazo: 90, nome: 'Formulário DS-160',
          sub: 'Guarde a página de confirmação com o código de barras' },
    ],
    CA: [
        { id: 'ca_loa', fase: 'preparo', prazo: 150, nome: 'Letter of Acceptance',
          sub: 'Emitida por instituição credenciada (DLI)' },
        { id: 'ca_pal', fase: 'consulado', prazo: 100, nome: 'PAL — carta de atestação provincial',
          sub: 'Passou a ser exigida na maioria dos programas' },
        { id: 'ca_medico', fase: 'consulado', prazo: 95, nome: 'Exame médico',
          sub: 'Em clínica autorizada pelo IRCC' },
    ],
    AU: [
        { id: 'au_coe', fase: 'preparo', prazo: 150, nome: 'CoE — Confirmation of Enrolment',
          sub: 'Emitido após o pagamento da primeira parcela do curso' },
        { id: 'au_oshc', fase: 'preparo', prazo: 120, nome: 'OSHC — seguro obrigatório',
          sub: 'Precisa cobrir todo o período do visto' },
        { id: 'au_gte', fase: 'consulado', prazo: 90, nome: 'Declaração GTE',
          sub: 'Carta explicando por que você pretende estudar e voltar' },
    ],
    JP: [
        { id: 'jp_coe', fase: 'preparo', prazo: 170, nome: 'COE — Certificado de Elegibilidade',
          sub: 'Solicitado pela escola no Japão; leva de 2 a 3 meses' },
        { id: 'jp_custeio', fase: 'preparo', prazo: 150, nome: 'Documentos do responsável financeiro',
          sub: 'Extratos, imposto de renda e carta de custeio traduzidos' },
        { id: 'jp_residence', fase: 'chegada', prazo: -14, nome: 'Residence card e registro na prefeitura',
          sub: 'O cartão sai no aeroporto; o registro é feito em até 14 dias' },
    ],
    BR: [],
};

// Dicas por destino (a primeira é sempre exibida)
const DICAS = {
    geral: [
        { icone: '📆', titulo: 'Comece pelo fim',
          texto: 'Defina a data de embarque e conte para trás. Antecedentes criminais e exames médicos vencem, então tirar cedo demais também é erro.' },
        { icone: '📄', titulo: 'Tradução juramentada',
          texto: 'Só vale quando feita por tradutor público registrado na junta comercial. Tradução comum é recusada no consulado.' },
        { icone: '🛂', titulo: 'Digitalização do passaporte',
          texto: 'Escaneie a página de identificação sem reflexo e sem cortar as bordas. É um dos motivos mais comuns de devolução.' },
        { icone: '💳', titulo: 'Extrato bancário',
          texto: 'O saldo precisa aparecer estável nos 3 meses. Um depósito grande na véspera levanta suspeita de empréstimo.' },
    ],
    Schengen: [
        { icone: '🇪🇺', titulo: 'Visto nacional, não turismo',
          texto: 'Para estadias acima de 90 dias o visto é o tipo D, emitido pelo país onde você vai estudar, não por qualquer país do bloco.' },
    ],
    GB: [
        { icone: '⏱️', titulo: 'Janela de 6 meses',
          texto: 'O pedido só pode ser feito até 6 meses antes do início do curso. Antes disso o sistema nem aceita.' },
    ],
    US: [
        { icone: '🗣️', titulo: 'A entrevista decide',
          texto: 'Responda de forma curta e direta sobre o curso e sobre seus vínculos com o Brasil. Documento nenhum substitui isso.' },
    ],
    JP: [
        { icone: '🏫', titulo: 'Quem pede o COE é a escola',
          texto: 'Você envia os documentos para a instituição no Japão e ela solicita à imigração. Só depois o consulado entra.' },
    ],
};

const PAISES_SCHENGEN = ['ES', 'PT', 'DE', 'FR', 'IT', 'NL', 'PL', 'CZ', 'SE', 'NO', 'CH'];

// =============================================
// ESTADO
// =============================================
let paisAtual  = 'ES';
let concluidos = new Set();
let soPendentes = false;

// =============================================
// ELEMENTOS
// =============================================
const el = id => document.getElementById(id);

const paisSelect    = el('paisSelect');
const dataEmbarque  = el('dataEmbarque');
const listaFases    = el('listaFases');
const progValor     = el('progValor');
const progBar       = el('progBar');
const progDetalhe   = el('progDetalhe');
const itensRestantes = el('itensRestantes');
const chkPendentes  = el('chkPendentes');
const btnLimpar     = el('btnLimpar');
const btnImprimir   = el('btnImprimir');
const dicasLista    = el('dicasLista');
const proximoPasso  = el('proximoPasso');
const alertaPrazo   = el('alertaPrazo');

// =============================================
// PERSISTÊNCIA (por país)
// =============================================
function chaveStorage() {
    return 'malagon-visto-' + paisAtual;
}

function carregarProgresso() {
    try {
        const bruto = localStorage.getItem(chaveStorage());
        concluidos = new Set(bruto ? JSON.parse(bruto) : []);
    } catch (e) {
        concluidos = new Set();
    }
}

function salvarProgresso() {
    try {
        localStorage.setItem(chaveStorage(), JSON.stringify([...concluidos]));
    } catch (e) {
        // Navegador sem armazenamento disponível: o checklist segue funcionando na sessão.
    }
}

function carregarData() {
    try {
        const salva = localStorage.getItem('malagon-visto-embarque');
        if (salva) dataEmbarque.value = salva;
    } catch (e) { /* ignora */ }
}

function salvarData() {
    try {
        localStorage.setItem('malagon-visto-embarque', dataEmbarque.value);
    } catch (e) { /* ignora */ }
}

// =============================================
// DADOS DERIVADOS
// =============================================
function itensDoPais() {
    const extras = ITENS_POR_PAIS[paisAtual] || [];
    return [...ITENS_COMUNS, ...extras].sort((a, b) => b.prazo - a.prazo);
}

function dicasDoPais() {
    const lista = [...DICAS.geral];
    if (PAISES_SCHENGEN.includes(paisAtual)) lista.unshift(...DICAS.Schengen);
    if (DICAS[paisAtual]) lista.unshift(...DICAS[paisAtual]);
    return lista;
}

// Data limite de cada item, a partir da data de embarque
function dataLimite(item) {
    if (!dataEmbarque.value) return null;
    const base = new Date(dataEmbarque.value + 'T12:00:00');
    if (isNaN(base)) return null;
    const d = new Date(base);
    d.setDate(d.getDate() - item.prazo);
    return d;
}

function diasRestantes(data) {
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    return Math.round((data - hoje) / 86400000);
}

function formatarData(d) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// =============================================
// RENDERIZAÇÃO
// =============================================
function criarItem(item) {
    const feito = concluidos.has(item.id);

    const linha = document.createElement('label');
    linha.className = 'checklist-item' + (feito ? ' checked' : '');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'check-input';
    input.checked = feito;
    input.addEventListener('change', () => alternarItem(item.id, input.checked));

    const caixa = document.createElement('span');
    caixa.className = 'check-box' + (feito ? ' checked' : '');
    caixa.setAttribute('aria-hidden', 'true');
    caixa.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
        '<path d="M2 7L5.5 10.5L12 3.5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>';

    const info = document.createElement('div');
    info.className = 'item-info';

    const nome = document.createElement('span');
    nome.className = 'item-nome';
    nome.textContent = item.nome;

    const sub = document.createElement('span');
    sub.className = 'item-sub';
    sub.textContent = item.sub;

    info.appendChild(nome);
    info.appendChild(sub);

    linha.appendChild(input);
    linha.appendChild(caixa);
    linha.appendChild(info);
    linha.appendChild(criarBadge(item, feito));

    return linha;
}

function criarBadge(item, feito) {
    const badge = document.createElement('span');
    badge.className = 'badge';

    if (feito) {
        badge.classList.add('valid');
        badge.textContent = 'Concluído';
        return badge;
    }

    const limite = dataLimite(item);
    if (!limite) {
        badge.classList.add('pending');
        badge.textContent = 'Pendente';
        return badge;
    }

    const dias = diasRestantes(limite);

    if (dias < 0) {
        badge.classList.add('atrasado');
        badge.textContent = 'Atrasado';
    } else if (dias <= 14) {
        badge.classList.add('urgente');
        badge.textContent = 'Até ' + formatarData(limite);
    } else {
        badge.classList.add('pending');
        badge.textContent = 'Até ' + formatarData(limite);
    }
    return badge;
}

function renderChecklist() {
    const itens = itensDoPais();
    listaFases.innerHTML = '';

    FASES.forEach(fase => {
        const doGrupo = itens.filter(i => i.fase === fase.id);
        const visiveis = soPendentes ? doGrupo.filter(i => !concluidos.has(i.id)) : doGrupo;
        if (!visiveis.length) return;

        const feitos = doGrupo.filter(i => concluidos.has(i.id)).length;

        const bloco = document.createElement('section');
        bloco.className = 'fase-bloco';

        const cabecalho = document.createElement('div');
        cabecalho.className = 'fase-header';
        cabecalho.innerHTML =
            '<span class="fase-icone" aria-hidden="true">' + fase.icone + '</span>' +
            '<div class="fase-titulo"><strong>' + fase.nome + '</strong>' +
            '<span>' + fase.desc + '</span></div>' +
            '<span class="fase-contador">' + feitos + '/' + doGrupo.length + '</span>';

        bloco.appendChild(cabecalho);
        visiveis.forEach(i => bloco.appendChild(criarItem(i)));
        listaFases.appendChild(bloco);
    });

    if (!listaFases.children.length) {
        const vazio = document.createElement('p');
        vazio.className = 'lista-vazia';
        vazio.textContent = 'Nenhum item pendente. Desmarque o filtro para rever a lista completa.';
        listaFases.appendChild(vazio);
    }
}

function renderProgresso() {
    const itens = itensDoPais();
    const total = itens.length;
    const feitos = itens.filter(i => concluidos.has(i.id)).length;
    const pct = total ? Math.round((feitos / total) * 100) : 0;

    progValor.textContent   = pct + '%';
    progBar.style.width     = pct + '%';
    progDetalhe.textContent = feitos + ' de ' + total + ' itens';

    const restantes = total - feitos;
    itensRestantes.textContent = restantes === 0
        ? 'tudo concluído'
        : restantes + (restantes === 1 ? ' item restante' : ' itens restantes');
}

function renderProximoPasso() {
    const pendentes = itensDoPais().filter(i => !concluidos.has(i.id));

    if (!pendentes.length) {
        proximoPasso.textContent = 'Checklist completo para este destino.';
        alertaPrazo.textContent = '';
        alertaPrazo.className = 'alerta-prazo';
        return;
    }

    const proximo = pendentes[0];
    proximoPasso.textContent = proximo.nome;

    const limite = dataLimite(proximo);
    if (!limite) {
        alertaPrazo.textContent = 'Informe a data de embarque para calcular os prazos.';
        alertaPrazo.className = 'alerta-prazo';
        return;
    }

    const dias = diasRestantes(limite);
    const atrasados = pendentes.filter(i => {
        const d = dataLimite(i);
        return d && diasRestantes(d) < 0;
    }).length;

    if (atrasados > 0) {
        alertaPrazo.textContent = atrasados + (atrasados === 1
            ? ' item já passou do prazo recomendado.'
            : ' itens já passaram do prazo recomendado.');
        alertaPrazo.className = 'alerta-prazo perigo';
    } else if (dias <= 14) {
        alertaPrazo.textContent = 'Prazo recomendado em ' + dias + (dias === 1 ? ' dia.' : ' dias.');
        alertaPrazo.className = 'alerta-prazo urgente';
    } else {
        alertaPrazo.textContent = 'Prazo recomendado: ' + formatarData(limite) + '.';
        alertaPrazo.className = 'alerta-prazo';
    }
}

function renderDicas() {
    dicasLista.innerHTML = '';

    dicasDoPais().forEach(d => {
        const item = document.createElement('div');
        item.className = 'dica-item';

        const icone = document.createElement('div');
        icone.className = 'dica-icon';
        icone.setAttribute('aria-hidden', 'true');
        icone.textContent = d.icone;

        const texto = document.createElement('div');
        texto.className = 'dica-texto';

        const titulo = document.createElement('span');
        titulo.className = 'dica-titulo';
        titulo.textContent = d.titulo;

        const p = document.createElement('p');
        p.textContent = d.texto;

        texto.appendChild(titulo);
        texto.appendChild(p);
        item.appendChild(icone);
        item.appendChild(texto);
        dicasLista.appendChild(item);
    });
}

function renderTudo() {
    renderChecklist();
    renderProgresso();
    renderProximoPasso();
}

// =============================================
// AÇÕES
// =============================================
function alternarItem(id, marcado) {
    if (marcado) concluidos.add(id);
    else concluidos.delete(id);
    salvarProgresso();
    renderTudo();
}

function trocarPais() {
    paisAtual = paisSelect.value;
    carregarProgresso();
    renderDicas();
    renderTudo();
}

function limparProgresso() {
    if (!concluidos.size) return;
    const texto = paisSelect.options[paisSelect.selectedIndex].text;
    if (!confirm('Desmarcar todos os itens de ' + texto + '?')) return;
    concluidos.clear();
    salvarProgresso();
    renderTudo();
}

// =============================================
// EVENTOS
// =============================================
paisSelect.addEventListener('change', trocarPais);

dataEmbarque.addEventListener('change', () => {
    salvarData();
    renderTudo();
});

chkPendentes.addEventListener('change', () => {
    soPendentes = chkPendentes.checked;
    renderChecklist();
});

btnLimpar.addEventListener('click', limparProgresso);
btnImprimir.addEventListener('click', () => window.print());

// =============================================
// INICIALIZAÇÃO
// =============================================
function inicializar() {
    paisAtual = paisSelect.value;
    carregarData();
    carregarProgresso();
    renderDicas();
    renderTudo();
}

inicializar();
