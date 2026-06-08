// =========================
// CIDADES
// =========================
const cidades = {
    "São Paulo, Brasil": [-23.5505, -46.6333],
    "Rio de Janeiro, Brasil": [-22.9068, -43.1729],
    "Lisboa, Portugal": [38.7223, -9.1393],
    "Porto, Portugal": [41.1579, -8.6291],
    "Nova York, EUA": [40.7128, -74.0060],
    "Toronto, Canadá": [43.6532, -79.3832],
    "Cidade do México, México": [19.4326, -99.1332],
    "Londres, Reino Unido": [51.5074, -0.1278],
    "Paris, França": [48.8566, 2.3522],
    "Madri, Espanha": [40.4168, -3.7038],
    "Málaga, Espanha": [36.7213, -4.4214],
    "Berlim, Alemanha": [52.5200, 13.4050],
    "Roma, Itália": [41.9028, 12.4964],
    "Atenas, Grécia": [37.9838, 23.7275],
    "Tóquio, Japão": [35.6762, 139.6503],
    "Seul, Coreia do Sul": [37.5665, 126.9780],
    "Pequim, China": [39.9042, 116.4074],
    "Bangkok, Tailândia": [13.7563, 100.5018],
    "Dubai, Emirados Árabes": [25.2048, 55.2708],
    "Cairo, Egito": [30.0444, 31.2357],
    "Cidade do Cabo, África do Sul": [-33.9249, 18.4241],
    "Sydney, Austrália": [-33.8688, 151.2093]
};

// =========================
// POPULAR SELECTS
// =========================
const selectOrigem = document.getElementById("origem");
const selectDestino = document.getElementById("destino");

Object.keys(cidades).forEach(cidade => {

    const op1 = document.createElement("option");
    op1.value = cidade;
    op1.textContent = cidade;
    selectOrigem.appendChild(op1);

    const op2 = document.createElement("option");
    op2.value = cidade;
    op2.textContent = cidade;
    selectDestino.appendChild(op2);

});

// Valores iniciais
selectOrigem.value = "São Paulo, Brasil";
selectDestino.value = "Lisboa, Portugal";

// =========================
// TROCAR LOCAIS
// =========================
function trocarLocais() {
    const temp = selectOrigem.value;
    selectOrigem.value = selectDestino.value;
    selectDestino.value = temp;

    atualizarMapa();
}

// =========================
// MAPA
// =========================
const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
        attribution: '&copy; OpenStreetMap & CartoDB'
    }
).addTo(map);

let markerOrigem;
let markerDestino;
let linha;

// =========================
// DISTÂNCIA
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

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return Math.round(R * c);
}

// =========================
// TEMPO DE VIAGEM
// =========================
function calcularTempoViagem(distanciaKm) {

    const velocidadeMedia = 850;

    const horas = distanciaKm / velocidadeMedia;

    const horasInteiras = Math.floor(horas);

    const minutos = Math.round(
        (horas - horasInteiras) * 60
    );

    return `${horasInteiras}h ${minutos}min`;
}

// =========================
// ATUALIZAR MAPA
// =========================
function atualizarMapa() {

    const origem = cidades[selectOrigem.value];
    const destino = cidades[selectDestino.value];

    if (!origem || !destino) return;

    if (markerOrigem) map.removeLayer(markerOrigem);
    if (markerDestino) map.removeLayer(markerDestino);
    if (linha) map.removeLayer(linha);

    markerOrigem = L.marker(origem).addTo(map);
    markerDestino = L.marker(destino).addTo(map);

    linha = L.polyline(
        [origem, destino],
        {
            color: "#ff7a00",
            weight: 4
        }
    ).addTo(map);

    map.fitBounds(
        linha.getBounds(),
        {
            padding: [50, 50]
        }
    );

    const km = calcularDistancia(
        origem[0],
        origem[1],
        destino[0],
        destino[1]
    );

    document.getElementById("distance").textContent =
        km.toLocaleString("pt-BR") + " Km";

    document.getElementById("travelTime").textContent =
        calcularTempoViagem(km);
}

// =========================
// BOTÃO CONFIRMAR
// =========================
document
    .querySelector(".confirmar")
    .addEventListener("click", atualizarMapa);

// =========================
// INICIAR
// =========================
window.onload = atualizarMapa;