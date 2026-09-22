// =========================
// ELEMENTOS DA BUSCA
// =========================
const origemInput = document.getElementById("origemInput");
const destinoInput = document.getElementById("destinoInput");
const origemSugestoes = document.getElementById("origemSugestoes");
const destinoSugestoes = document.getElementById("destinoSugestoes");
const destinoPaisBadge = document.getElementById("destinoPaisBadge");
const btnSalvarDestino = document.getElementById("btnSalvarDestino");
const salvarFeedback = document.getElementById("salvarFeedback");
const fusoDiferenca = document.getElementById("fusoDiferenca");
const horaDestino = document.getElementById("horaDestino");

// Chaves usadas no localStorage — outras páginas (Financeiro, futuramente)
// podem ler "malagon-destino" para saber o país já escolhido pelo estudante.
const CHAVE_ORIGEM = "malagon-origem";
const CHAVE_DESTINO = "malagon-destino";

// origemInfo/destinoInfo guardam tudo que a busca sabe sobre o lugar:
// nome de exibição, coordenadas e país (nome + código ISO de 2 letras,
// o mesmo padrão usado no seletor de país do Financeiro).
let origemInfo = {
    nome: "São Paulo, Brasil",
    lat: -23.5505, lon: -46.6333,
    paisNome: "Brasil", paisCodigo: "BR",
};

let destinoInfo = {
    nome: "Lisboa, Portugal",
    lat: 38.7223, lon: -9.1393,
    paisNome: "Portugal", paisCodigo: "PT",
};

function carregarSalvo(chave) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
        return null;
    }
}

const origemSalva = carregarSalvo(CHAVE_ORIGEM);
const destinoSalvo = carregarSalvo(CHAVE_DESTINO);
if (origemSalva) origemInfo = origemSalva;
if (destinoSalvo) destinoInfo = destinoSalvo;

// Coordenadas [lat, lon] — mantidas à parte porque o resto do arquivo
// (mapa, cálculo de distância) já trabalha com esse formato.
let origemCoord = [origemInfo.lat, origemInfo.lon];
let destinoCoord = [destinoInfo.lat, destinoInfo.lon];

origemInput.value = origemInfo.nome;
destinoInput.value = destinoInfo.nome;

// =========================
// BUSCA DE CIDADES (API Nominatim / OpenStreetMap, gratuita e sem chave)
// =========================
async function buscarCidades(termo) {
    if (termo.length < 3) return [];

    const url =
        `https://nominatim.openstreetmap.org/search?format=json` +
        `&q=${encodeURIComponent(termo)}` +
        `&featureType=city&limit=6&accept-language=pt-BR&addressdetails=1`;

    try {
        const resposta = await fetch(url);
        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao buscar cidades:", erro);
        return [];
    }
}

// =========================
// DEBOUNCE — espera o usuário parar de digitar antes de buscar,
// pra não disparar uma requisição a cada letra digitada.
// =========================
function debounce(func, atraso) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), atraso);
    };
}

// =========================
// RENDERIZAR A LISTA DE SUGESTÕES
// =========================
function mostrarSugestoes(lista, listaElemento, input, tipo) {
    listaElemento.innerHTML = "";

    if (lista.length === 0) {
        const item = document.createElement("li");
        item.className = "vazio";
        item.textContent = "Nenhuma cidade encontrada";
        listaElemento.appendChild(item);
        listaElemento.classList.add("ativo");
        return;
    }

    lista.forEach((local) => {
        const item = document.createElement("li");
        item.textContent = local.display_name;

        item.addEventListener("click", () => {
            input.value = local.display_name;

            const info = {
                nome: local.display_name,
                lat: parseFloat(local.lat),
                lon: parseFloat(local.lon),
                paisNome: local.address && local.address.country ? local.address.country : null,
                paisCodigo: local.address && local.address.country_code
                    ? local.address.country_code.toUpperCase()
                    : null,
            };

            if (tipo === "origem") {
                origemInfo = info;
                origemCoord = [info.lat, info.lon];
            } else {
                destinoInfo = info;
                destinoCoord = [info.lat, info.lon];
            }

            listaElemento.classList.remove("ativo");
            atualizarMapa();
        });

        listaElemento.appendChild(item);
    });

    listaElemento.classList.add("ativo");
}

// =========================
// LIGAR CADA CAMPO DE TEXTO À BUSCA
// =========================
function configurarBusca(input, listaElemento, tipo) {
    const buscarComAtraso = debounce(async () => {
        const termo = input.value.trim();

        if (termo.length < 3) {
            listaElemento.classList.remove("ativo");
            return;
        }

        const resultados = await buscarCidades(termo);
        mostrarSugestoes(resultados, listaElemento, input, tipo);
    }, 500);

    input.addEventListener("input", buscarComAtraso);

    // Fecha a lista se o usuário clicar fora do campo
    document.addEventListener("click", (evento) => {
        if (!input.parentElement.contains(evento.target)) {
            listaElemento.classList.remove("ativo");
        }
    });
}

configurarBusca(origemInput, origemSugestoes, "origem");
configurarBusca(destinoInput, destinoSugestoes, "destino");

// =========================
// TROCAR ORIGEM E DESTINO
// =========================
function trocarLocais() {
    const valorTemp = origemInput.value;
    const infoTemp = origemInfo;

    origemInput.value = destinoInput.value;
    origemInfo = destinoInfo;
    origemCoord = [origemInfo.lat, origemInfo.lon];

    destinoInput.value = valorTemp;
    destinoInfo = infoTemp;
    destinoCoord = [destinoInfo.lat, destinoInfo.lon];

    atualizarMapa();
}

// =========================
// MAPA
//
// Usa o tile server padrão do OpenStreetMap — sem chave, sem custo, sem
// limite comercial. O visual escuro vem de um filtro CSS aplicado só nos
// tiles (ver .leaflet-tile-pane em local.css), não de um provedor de mapa
// escuro pago. Provedores como CartoDB e Stadia passaram a exigir chave
// de API para o estilo escuro, então evitamos depender disso.
// =========================
const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }
).addTo(map);

let markerOrigem;
let markerDestino;
let linha;

// =========================
// DISTÂNCIA (fórmula de Haversine)
// =========================
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

// =========================
// TEMPO DE VIAGEM
// =========================
function calcularTempoViagem(distanciaKm) {
    const velocidadeMedia = 850;
    const horas = distanciaKm / velocidadeMedia;
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${horasInteiras}h ${minutos}min`;
}

// =========================
// BANDEIRA A PARTIR DO CÓDIGO ISO DO PAÍS
// =========================
function bandeiraEmoji(codigoPais) {
    if (!codigoPais || codigoPais.length !== 2) return "";
    return codigoPais
        .toUpperCase()
        .replace(/./g, (letra) => String.fromCodePoint(127397 + letra.charCodeAt(0)));
}

// =========================
// FUSO HORÁRIO ESTIMADO
// A partir da longitude (15° por hora). É uma estimativa — países grandes
// têm mais de um fuso e alguns fusos não seguem múltiplos exatos de 15°,
// mas serve para dar uma noção rápida da diferença de horário.
// =========================
function estimarFuso(longitude) {
    return Math.round(longitude / 15);
}

function atualizarFusoEHora() {
    const fusoOrigem = estimarFuso(origemCoord[1]);
    const fusoDestinoValor = estimarFuso(destinoCoord[1]);
    const diferenca = fusoDestinoValor - fusoOrigem;

    if (diferenca === 0) {
        fusoDiferenca.textContent = "Mesmo fuso da origem";
    } else {
        const sinal = diferenca > 0 ? "+" : "";
        fusoDiferenca.textContent = `${sinal}${diferenca}h em relação à origem`;
    }

    const agoraUTC = new Date(new Date().toUTCString());
    const horaLocalDestino = new Date(agoraUTC.getTime() + fusoDestinoValor * 3600000);
    const horas = horaLocalDestino.getUTCHours().toString().padStart(2, "0");
    const minutos = horaLocalDestino.getUTCMinutes().toString().padStart(2, "0");
    horaDestino.textContent = `${horas}:${minutos} (estimado)`;
}

// =========================
// BADGE DO PAÍS DE DESTINO
// =========================
function atualizarPaisBadge() {
    if (!destinoPaisBadge) return;

    if (destinoInfo.paisCodigo) {
        destinoPaisBadge.textContent = `${bandeiraEmoji(destinoInfo.paisCodigo)} ${destinoInfo.paisNome}`;
        destinoPaisBadge.classList.add("ativo");
    } else {
        destinoPaisBadge.textContent = "País não identificado";
        destinoPaisBadge.classList.remove("ativo");
    }

    // Se o país não veio nesta busca, o destino salvo não terá como ser
    // usado pelo Financeiro — então avisa desde já em vez de falhar depois.
    if (btnSalvarDestino) {
        btnSalvarDestino.disabled = !destinoInfo.paisCodigo;
    }
}

function atualizarMapa() {
    if (!origemCoord || !destinoCoord) return;

    if (markerOrigem) map.removeLayer(markerOrigem);
    if (markerDestino) map.removeLayer(markerDestino);
    if (linha) map.removeLayer(linha);

    markerOrigem = L.marker(origemCoord).addTo(map);
    markerDestino = L.marker(destinoCoord).addTo(map);

    linha = L.polyline(
        [origemCoord, destinoCoord],
        { color: "#ff7a00", weight: 4 }
    ).addTo(map);

    map.fitBounds(linha.getBounds(), { padding: [50, 50] });

    const km = calcularDistancia(
        origemCoord[0], origemCoord[1],
        destinoCoord[0], destinoCoord[1]
    );

    document.getElementById("distance").textContent = km.toLocaleString("pt-BR");
    document.getElementById("travelTime").textContent = calcularTempoViagem(km);

    // Barra de progresso visual (escala até 20.000 km, é só estética)
    const distanciaMaxima = 20000;
    const percentual = Math.min((km / distanciaMaxima) * 100, 100);
    document.getElementById("distanceBar").style.width = percentual + "%";

    atualizarFusoEHora();
    atualizarPaisBadge();

    if (salvarFeedback) salvarFeedback.textContent = "";
}

// =========================
// SALVAR DESTINO (para outras páginas, como o Financeiro, usarem depois)
// =========================
function salvarDestino() {
    if (!destinoInfo.paisCodigo) return;

    try {
        localStorage.setItem(CHAVE_ORIGEM, JSON.stringify(origemInfo));
        localStorage.setItem(CHAVE_DESTINO, JSON.stringify(destinoInfo));
        if (salvarFeedback) salvarFeedback.textContent = "Destino salvo ✓";
    } catch (e) {
        if (salvarFeedback) salvarFeedback.textContent = "Não foi possível salvar neste navegador.";
    }
}

if (btnSalvarDestino) btnSalvarDestino.addEventListener("click", salvarDestino);

// =========================
// BOTÃO CONFIRMAR
// =========================
document.querySelector(".confirmar").addEventListener("click", atualizarMapa);

// =========================
// PASSO A PASSO ATÉ O DESTINO
//
// Usa uma base própria de aeroportos (airports.json, gerada a partir do
// dataset público OurAirports) em vez de consultar uma API a cada busca.
// Isso evita depender de um serviço externo respondendo na hora exata da
// apresentação — o arquivo carrega uma vez e a busca do aeroporto mais
// próximo roda inteiramente no navegador, comparando distância por
// Haversine com a lista já carregada.
// =========================
let aeroportosCache = null;

async function carregarAeroportos() {
    if (aeroportosCache) return aeroportosCache;

    const resposta = await fetch('airports.json');
    if (!resposta.ok) throw new Error('Não foi possível carregar a base de aeroportos.');

    aeroportosCache = await resposta.json();
    return aeroportosCache;
}

async function buscarAeroportoProximo(lat, lon) {
    const aeroportos = await carregarAeroportos();

    let maisProximo = null;
    let menorDistancia = Infinity;

    for (const a of aeroportos) {
        const distancia = calcularDistancia(lat, lon, a.lat, a.lon);
        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            maisProximo = a;
        }
    }

    if (!maisProximo) return null;

    return {
        nome: maisProximo.nome,
        iata: maisProximo.iata,
        lat: maisProximo.lat,
        lon: maisProximo.lon,
        distancia: menorDistancia,
    };
}

const btnGerarRoteiro = document.getElementById("btnGerarRoteiro");
const roteiroContainer = document.getElementById("roteiroContainer");

function primeiroNome(nomeCompleto) {
    return nomeCompleto.split(",")[0];
}

function renderRoteiro(passos) {
    roteiroContainer.innerHTML = "";

    passos.forEach((passo, indice) => {
        const item = document.createElement("div");
        item.className = "roteiro-passo";

        const numero = document.createElement("span");
        numero.className = "roteiro-numero";
        numero.textContent = indice + 1;

        const corpo = document.createElement("div");
        corpo.className = "roteiro-corpo";

        const titulo = document.createElement("strong");
        titulo.textContent = passo.titulo;
        corpo.appendChild(titulo);

        if (passo.info) {
            const info = document.createElement("span");
            info.className = "roteiro-info";
            info.textContent = passo.info;
            corpo.appendChild(info);
        }

        const texto = document.createElement("p");
        texto.textContent = passo.texto;
        corpo.appendChild(texto);

        if (passo.link) {
            const link = document.createElement("a");
            link.href = passo.link.href;
            link.textContent = passo.link.texto;
            link.className = "roteiro-link";
            corpo.appendChild(link);
        }

        item.appendChild(numero);
        item.appendChild(corpo);
        roteiroContainer.appendChild(item);
    });
}

async function gerarRoteiro() {
    if (!origemCoord || !destinoCoord || !btnGerarRoteiro || !roteiroContainer) return;

    roteiroContainer.innerHTML = '<p class="roteiro-status">Procurando os aeroportos mais próximos...</p>';
    btnGerarRoteiro.disabled = true;

    let aeroportoOrigem, aeroportoDestino;

    try {
        [aeroportoOrigem, aeroportoDestino] = await Promise.all([
            buscarAeroportoProximo(origemCoord[0], origemCoord[1]),
            buscarAeroportoProximo(destinoCoord[0], destinoCoord[1]),
        ]);
    } catch (erro) {
        console.error("Erro ao carregar a base de aeroportos:", erro);
        btnGerarRoteiro.disabled = false;
        roteiroContainer.innerHTML =
            '<p class="roteiro-status erro">Não foi possível carregar a base de aeroportos (airports.json). ' +
            'Confira se o arquivo está na mesma pasta de local.html e se a página está sendo aberta por um servidor local, não direto do disco.</p>';
        return;
    }

    btnGerarRoteiro.disabled = false;

    if (!aeroportoOrigem || !aeroportoDestino) {
        roteiroContainer.innerHTML =
            '<p class="roteiro-status erro">Não encontramos um aeroporto na base para um dos pontos selecionados.</p>';
        return;
    }

    const distAteAeroportoOrigem = calcularDistancia(
        origemCoord[0], origemCoord[1], aeroportoOrigem.lat, aeroportoOrigem.lon
    );
    const distVoo = calcularDistancia(
        aeroportoOrigem.lat, aeroportoOrigem.lon, aeroportoDestino.lat, aeroportoDestino.lon
    );
    const distAteDestino = calcularDistancia(
        aeroportoDestino.lat, aeroportoDestino.lon, destinoCoord[0], destinoCoord[1]
    );

    const origemNome = primeiroNome(origemInfo.nome);
    const destinoNome = primeiroNome(destinoInfo.nome);

    const passos = [
        {
            titulo: `${origemNome} → Aeroporto ${aeroportoOrigem.nome}`,
            info: `${distAteAeroportoOrigem.toLocaleString("pt-BR")} km até o aeroporto de partida` +
                  (aeroportoOrigem.iata ? ` (${aeroportoOrigem.iata})` : ""),
            texto: "Verifique se há trem, ônibus executivo ou corrida compartilhada até o aeroporto — em geral existe mais de uma opção, com preço e tempo bem diferentes entre si.",
        },
        {
            titulo: `Voo até ${aeroportoDestino.nome}`,
            info: `${distVoo.toLocaleString("pt-BR")} km · ${calcularTempoViagem(distVoo)} de voo (estimado, sem escalas)`,
            texto: "Pesquise com antecedência: passagens internacionais para estudante costumam ficar mais caras nos 60 dias antes do embarque.",
        },
        {
            titulo: `Aeroporto ${aeroportoDestino.nome} → ${destinoNome}`,
            info: `${distAteDestino.toLocaleString("pt-BR")} km até o centro da cidade` +
                  (aeroportoDestino.iata ? ` (${aeroportoDestino.iata})` : ""),
            texto: "A maioria dos aeroportos informa a opção mais barata (trem ou ônibus) e a mais rápida (táxi ou shuttle) direto na página de chegadas do site oficial — vale checar perto da data da viagem, já que linhas e preços mudam.",
        },
        {
            titulo: `Chegando em ${destinoNome}`,
            info: null,
            texto: "Depois do desembarque, os primeiros passos costumam ser registro de imigração, conta bancária e chip local — a fase \"Ao chegar\" do checklist de visto já lista isso por país.",
            link: { href: "../visto/visto.html", texto: "Abrir checklist de visto →" },
        },
    ];

    renderRoteiro(passos);
}

if (btnGerarRoteiro) btnGerarRoteiro.addEventListener("click", gerarRoteiro);

// =========================
// INICIAR
// =========================
window.onload = atualizarMapa;
