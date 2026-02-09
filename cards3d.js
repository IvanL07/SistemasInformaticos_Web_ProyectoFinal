document.querySelectorAll(".card-3d").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const rx = ((y / r.height) - 0.5) * -10; // rotación X
    const ry = ((x / r.width) - 0.5) * 12;  // rotación Y

    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.boxShadow = "0 25px 60px rgba(0,0,0,.18)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    card.style.boxShadow = "";
  });
});
