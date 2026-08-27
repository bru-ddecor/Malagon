// =========================
// ELEMENTOS DA BUSCA
// =========================
const origemInput = document.getElementById("origemInput");
const destinoInput = document.getElementById("destinoInput");
const origemSugestoes = document.getElementById("origemSugestoes");
const destinoSugestoes = document.getElementById("destinoSugestoes");

// Coordenadas [lat, lon] atualmente selecionadas.
// Começam com valores padrão só pra já carregar o mapa com algo ao abrir a página.
let origemCoord = [-23.5505, -46.6333]; // São Paulo, Brasil
let destinoCoord = [38.7223, -9.1393];  // Lisboa, Portugal

origemInput.value = "São Paulo, Brasil";
destinoInput.value = "Lisboa, Portugal";

// =========================
// BUSCA DE CIDADES (API Nominatim / OpenStreetMap, gratuita e sem chave)
// =========================
async function buscarCidades(termo) {
    if (termo.length < 3) return [];

    const url =
        `https://nominatim.openstreetmap.org/search?format=json` +
        `&q=${encodeURIComponent(termo)}` +
        `&featureType=city&limit=6&accept-language=pt-BR`;

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
            const coord = [parseFloat(local.lat), parseFloat(local.lon)];

            if (tipo === "origem") {
                origemCoord = coord;
            } else {
                destinoCoord = coord;
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
    const coordTemp = origemCoord;

    origemInput.value = destinoInput.value;
    origemCoord = destinoCoord;

    destinoInput.value = valorTemp;
    destinoCoord = coordTemp;

    atualizarMapa();
}

// =========================
// MAPA
// =========================
const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; OpenStreetMap & CartoDB' }
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
// ATUALIZAR MAPA E ESTATÍSTICAS
// =========================
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
}

// =========================
// BOTÃO CONFIRMAR
// =========================
document.querySelector(".confirmar").addEventListener("click", atualizarMapa);

// =========================
// INICIAR
// =========================
window.onload = atualizarMapa;
