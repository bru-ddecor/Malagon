document.addEventListener('DOMContentLoaded', () => {
    // Referências do formulário
    const inputBusca = document.getElementById('inputBusca');
    const selectPais = document.getElementById('pais');
    const selectArea = document.getElementById('area');
    const selectNivel = document.getElementById('nivel');
    const selectIdioma = document.getElementById('idioma');
    const btnAplicar = document.getElementById('btnAplicar');
    const btnLimpar = document.getElementById('btnLimpar');
    const listaUniversidades = document.getElementById('listaUniversidades');
    const totalUniversidades = document.getElementById('totalUniversidades');

    const mapaPaises = {
        "Alemanha": "Germany",
        "Argentina": "Argentina",
        "Austrália": "Australia",
        "Áustria": "Austria",
        "Bélgica": "Belgium",
        "Brasil": "Brazil",
        "Canadá": "Canada",
        "Chile": "Chile",
        "China": "China",
        "Colômbia": "Colombia",
        "Coreia do Sul": "South Korea",
        "Dinamarca": "Denmark",
        "Espanha": "Spain",
        "Estados Unidos": "United States",
        "França": "France",
        "Holanda": "Netherlands",
        "Inglaterra": "United Kingdom",
        "Irlanda": "Ireland",
        "Itália": "Italy",
        "Japão": "Japan",
        "México": "Mexico",
        "Noruega": "Norway",
        "Nova Zelândia": "New Zealand",
        "Portugal": "Portugal",
        "Suécia": "Sweden",
        "Suíça": "Switzerland"
    };

    const palavrasChaveArea = {
        ti: ["technology", "tech", "computer", "informatics", "software", "digital", "polytechnic", "applied sciences", "information", "tecnologia", "computacao"],
        engenharia: ["engineering", "engineer", "polytechnic", "applied sciences", "technology", "mechanics", "engenharia"],
        dados: ["data", "science and technology", "analytics", "information", "computing", "dados"]
    };

    const fallbackCampusImg = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80";
    const fallbackLogoImg = "https://cdn-icons-png.flaticon.com/512/807/807409.png";

    // 1. Conexão com a Shared Navbar (Marcação do link ativo)
    function integrarSharedNavbar() {
        // Se a navbar injetar elementos dinamicamente, ajusta a classe ativa
        const navLinks = document.querySelectorAll('.navbar a, nav a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').includes('academico')) {
                link.classList.add('active');
            }
        });
    }

    // 2. Preenchimento de países
    function popularSelectPaises() {
        if (!selectPais) return;
        selectPais.innerHTML = '<option value="">Selecione um país</option>';
        selectPais.innerHTML += '<option value="ALL">Todos os países</option>';

        Object.keys(mapaPaises).sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(paisPt => {
            const option = document.createElement('option');
            option.value = mapaPaises[paisPt];
            option.textContent = paisPt;
            selectPais.appendChild(option);
        });
    }

    // 3. Consulta à Wikipedia para dados reais
    async function buscarDadosWikipedia(nomeUniversidade) {
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeUniversidade)}`;
            const response = await fetch(url);
            if (!response.ok) return { img: null, desc: null };
            const data = await response.json();
            return {
                img: data.thumbnail ? data.thumbnail.source : null,
                desc: data.extract ? data.extract : null
            };
        } catch {
            return { img: null, desc: null };
        }
    }

    // 4. Lógica de busca principal
    async function buscarUniversidades() {
        const termoTexto = inputBusca ? inputBusca.value.trim().toLowerCase() : "";
        const paisIngles = selectPais ? selectPais.value : "";
        const areaSelecionada = selectArea ? selectArea.value : "";

        if (!paisIngles && !termoTexto) {
            listaUniversidades.innerHTML = `<p style="color: var(--color-muted);">Digite o nome de uma universidade ou selecione um país para buscar.</p>`;
            totalUniversidades.textContent = "0 universidades encontradas";
            return;
        }

        listaUniversidades.innerHTML = `<p style="color: var(--color-muted);">Buscando universidades...</p>`;

        try {
            const url = 'https://cdn.jsdelivr.net/gh/Hipo/university-domains-list@master/world_universities_and_domains.json';
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao carregar dados da API");

            const todasUniversidades = await response.json();
            let resultados = todasUniversidades;

            if (termoTexto) {
                resultados = resultados.filter(u => u.name.toLowerCase().includes(termoTexto));
            }

            if (paisIngles && paisIngles !== "ALL") {
                resultados = resultados.filter(u => u.country.toLowerCase() === paisIngles.toLowerCase());
            }

            if (areaSelecionada && palavrasChaveArea[areaSelecionada]) {
                const termos = palavrasChaveArea[areaSelecionada];
                resultados = resultados.filter(uni => {
                    const nomeUni = uni.name.toLowerCase();
                    const dominioUni = (uni.domains && uni.domains[0]) ? uni.domains[0].toLowerCase() : "";
                    return termos.some(termo => nomeUni.includes(termo) || dominioUni.includes(termo));
                });
            }

            totalUniversidades.textContent = `${resultados.length} universidades encontradas`;
            renderizarCards(resultados);

        } catch (erro) {
            console.error("Erro na busca de dados:", erro);
            listaUniversidades.innerHTML = `<p style="color: #ff4d4d;">Não foi possível carregar as universidades no momento.</p>`;
        }
    }

    // 5. Renderização dos Cards
    async function renderizarCards(lista) {
        if (lista.length === 0) {
            listaUniversidades.innerHTML = `<p style="color: var(--color-muted);">Nenhuma universidade encontrada para os filtros selecionados.</p>`;
            return;
        }

        const cardsHTML = await Promise.all(lista.map(async (uni, index) => {
            const domain = uni.domains && uni.domains[0] ? uni.domains[0].replace(/^www\./, "") : "";
            const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : fallbackLogoImg;
            const siteUrl = uni.web_pages && uni.web_pages[0] ? uni.web_pages[0] : '#';
            const estado = uni['state-province'] ? `${uni['state-province']}, ` : '';

            let imgCampus = fallbackCampusImg;
            let descricaoReal = `Instituição de ensino superior localizada em ${uni.country}. Acesse o site oficial para informações sobre cursos e ingressos.`;

            if (index < 20) {
                const wikiData = await buscarDadosWikipedia(uni.name);
                if (wikiData.img) imgCampus = wikiData.img;
                if (wikiData.desc) descricaoReal = wikiData.desc;
            }

            return `
                <div class="card-universidade">
                    <div class="card-thumb">
                        <img src="${imgCampus}" alt="${uni.name}" class="img-bg" onerror="this.src='${fallbackCampusImg}'">
                        <div class="logo-wrapper">
                            <img src="${logoUrl}" alt="Logo ${uni.name}" class="uni-logo" onerror="this.onerror=null; this.src='${fallbackLogoImg}';">
                        </div>
                    </div>

                    <div class="card-info">
                        <h4 class="uni-nome">${uni.name}</h4>
                        <p class="uni-local">📍 ${estado}${uni.country}</p>
                        <p class="uni-descricao">${descricaoReal}</p>
                    </div>

                    <div class="card-acoes">
                        <div class="botoes-grupo">
                            <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="btn-detalhes">Ver detalhes</a>
                            <button class="btn-favorito" title="Salvar">🔖</button>
                        </div>
                    </div>
                </div>
            `;
        }));

        listaUniversidades.innerHTML = cardsHTML.join('');
    }

    // Ouvintes de evento
    if (btnAplicar) btnAplicar.addEventListener('click', buscarUniversidades);

    if (inputBusca) {
        inputBusca.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') buscarUniversidades();
        });
    }

    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            if (inputBusca) inputBusca.value = "";
            if (selectPais) selectPais.value = "";
            if (selectArea) selectArea.value = "";
            if (selectNivel) selectNivel.value = "";
            if (selectIdioma) selectIdioma.value = "";
            listaUniversidades.innerHTML = "";
            totalUniversidades.textContent = "0 universidades encontradas";
        });
    }

    // Inicialização integrada
    popularSelectPaises();
    integrarSharedNavbar();
});