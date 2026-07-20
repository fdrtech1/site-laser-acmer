/* =============================================================================
   NAV.JS — menu mobile e destaque do link ativo. Roda em todas as páginas.
   ============================================================================= */
(function () {
  "use strict";

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  function initActiveLink() {
    var links = document.querySelectorAll(".nav-links a[href]");
    if (!links.length) return;
    var here = location.pathname.split("/").pop() || "index.html";
    links.forEach(function (a) {
      var href = a.getAttribute("href").split("#")[0];
      if (href && href === here) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initActiveLink();
  });
})();
