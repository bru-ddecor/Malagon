document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector('.container');
  const cadastroBtn = document.querySelector('.btn-cadastro');
  const loginBtn = document.querySelector('.btn-login');

  // Alterna para a tela de cadastro
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', () => {
      container.classList.add('active');
    });
  }

  // Alterna para a tela de login
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      container.classList.remove('active');
    });
  }

  // Tratamento de envio do formulário de login (integração futura com backend)
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      // Redireciona para o painel principal
      window.location.href = "../home/home.html";
    });
  }
});