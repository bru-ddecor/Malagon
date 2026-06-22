(function () {

  const pages = [
    { href: '../home/home.html',             label: 'Home' },
    { href: '../financeiro/financeiro.html', label: 'Financeiro' },
    { href: '../academico/academico.html',   label: 'Acadêmico' },
    { href: '../visto/visto.html',           label: 'Visto' },
    { href: '../local/local.html',           label: 'Localização' },
    { href: '../login/login.html',           label: 'Login', classe: 'login' }
  ];

  function buildNav() {
    const currentFile = window.location.pathname.split('/').pop().toLowerCase();

    const linksHTML = pages.map(p => {
      const pageFile = p.href.split('/').pop().toLowerCase();
      const isLogin  = p.classe === 'login';
      const isAtivo  = !isLogin && currentFile === pageFile;

      const classes = [p.classe || '', isAtivo ? 'ativo' : ''].filter(Boolean).join(' ');

      return `<a href="${p.href}" class="${classes}">${p.label}</a>`;
    }).join('\n');

    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
      <a class="logo" href="../home/home.html">MALAGON</a>
      <div class="links">
        ${linksHTML}
        <button class="theme-toggle" id="themeToggle" aria-label="Alternar tema">
          <span class="toggle-track"></span>
          <span class="toggle-icon">🌙</span>
        </button>
      </div>
    `;

    document.body.insertBefore(nav, document.body.firstChild);

    const spacer = document.createElement('div');
    spacer.className = 'nav-spacer';
    document.body.insertBefore(spacer, nav.nextSibling);
  }

  /* ---- Tema ---- */

  const KEY = 'malagon-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const icon = document.querySelector('.toggle-icon');
    if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  }

  function init() {
    /* Aplica tema ANTES de renderizar — evita flash */
    const saved      = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));

    /* Remove nav antiga se existir, injeta a nova */
    const old = document.querySelector('nav.nav, div.nav');
    if (old) old.remove();
    buildNav();

    document.getElementById('themeToggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
