const imagens = document.querySelectorAll(".bg");
let index = 0;

setInterval(() => {
  imagens[index].classList.remove("ativo");

  index = (index + 1) % imagens.length;

  imagens[index].classList.add("ativo");
}, 4000);


// BOTÃO VER MAIS (rolar página)
document.getElementById("btnVerMais").addEventListener("click", () => {
  window.scrollBy({
    top: window.innerHeight,
    behavior: "smooth"
  });
});