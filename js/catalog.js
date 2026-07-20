/* =============================================================================
   CATALOG.JS — preenche #catalogo-grid a partir de data/catalogo.json.
   ============================================================================= */
(function () {
  "use strict";

  function card(p) {
    var el = document.createElement("div");
    el.className = "produto";
    var preco = p.precoDesde == null
      ? "Sob consulta"
      : "R$" + p.precoDesde + " <small>a partir de, " + p.unidade + "</small>";
    el.innerHTML =
      '<div class="thumb"><img src="' + p.imagem + '" alt="' + p.nome + '" loading="lazy">' +
      '<span class="tag-mat">' + p.material + '</span></div>' +
      '<div class="body"><h3>' + p.nome + '</h3>' +
      '<p class="desc">' + p.descricao + '</p>' +
      '<div class="preco">' + preco + '</div></div>';
    return el;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("catalogo-grid");
    if (!grid) return;
    fetch("data/catalogo.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        (data.produtos || []).forEach(function (p) { grid.appendChild(card(p)); });
      })
      .catch(function (e) { console.warn("Não foi possível carregar o catálogo:", e); });
  });
})();
