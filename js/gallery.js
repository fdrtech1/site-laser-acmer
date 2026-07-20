/* =============================================================================
   GALLERY.JS — preenche #galeria-grid a partir de data/galeria.json e
   controla o lightbox (ampliar/navegar/fechar).
   ============================================================================= */
(function () {
  "use strict";

  var trabalhos = [];
  var current = -1;

  function item(t, i) {
    var el = document.createElement("div");
    el.className = "g-item";
    el.innerHTML =
      '<img src="' + t.imagem + '" alt="' + t.legenda + '" loading="lazy">' +
      '<div class="g-cap"><div>' + t.legenda + '</div><div class="mat">' + t.material + '</div></div>';
    el.addEventListener("click", function () { openLightbox(i); });
    return el;
  }

  function openLightbox(i) {
    current = i;
    var t = trabalhos[current];
    var lb = document.getElementById("lightbox");
    document.getElementById("lb-img").src = t.imagem;
    document.getElementById("lb-img").alt = t.legenda;
    document.getElementById("lb-cap").innerHTML = t.legenda + ' <span class="mat">— ' + t.material + "</span>";
    lb.classList.add("open");
  }

  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    current = -1;
  }

  function nav(delta) {
    if (current === -1) return;
    openLightbox((current + delta + trabalhos.length) % trabalhos.length);
  }

  function initLightboxControls() {
    var lb = document.getElementById("lightbox");
    document.querySelector(".lb-close").addEventListener("click", closeLightbox);
    document.querySelector(".lb-nav.prev").addEventListener("click", function () { nav(-1); });
    document.querySelector(".lb-nav.next").addEventListener("click", function () { nav(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === "ArrowRight") nav(1);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("galeria-grid");
    initLightboxControls();
    if (!grid) return;
    fetch("data/galeria.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        trabalhos = data.trabalhos || [];
        trabalhos.forEach(function (t, i) { grid.appendChild(item(t, i)); });
      })
      .catch(function (e) { console.warn("Não foi possível carregar a galeria:", e); });
  });
})();
