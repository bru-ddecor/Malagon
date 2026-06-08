const container = document.querySelector('.container');
const cadastroBtn = document.querySelector('.btn-cadastro');
const loginBtn = document.querySelector('.btn-login');

cadastroBtn.addEventListener('click', ()=>{
    container.classList.add('active');
})

loginBtn.addEventListener('click', ()=>{
    container.classList.remove('active');
})