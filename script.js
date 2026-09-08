const menu = document.getElementById("menu");
const closeButton = document.getElementById("close-mobile");
const nav = document.getElementById("nav-mobile");
const navLinks = document.querySelectorAll(".nav-link");

menu.addEventListener("click", () => {
  nav.classList.add("show");
  document.body.style.overflow = "hidden";
});

closeButton.addEventListener("click", () => {
  nav.classList.remove("show");
  document.body.style.overflow = "auto";
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("show");
    document.body.style.overflow = "auto";
  });
});

nav.addEventListener("click", (e) => {
  if (e.target === nav) {
    nav.classList.remove("show");
    document.body.style.overflow = "auto";
  }
});