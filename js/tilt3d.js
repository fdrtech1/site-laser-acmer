/* =============================================================================
   TILT3D.JS — cards de produto/serviço inclinam em 3D seguindo o mouse.
   Só roda com mouse de verdade (pointer: fine) e sem prefers-reduced-motion.
   ============================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  function initTilt() {
    if (reduceMotion || !finePointer) return;
    var els = document.querySelectorAll(".card:not(.tilt-3d), .produto:not(.tilt-3d)");
    if (!els.length) return;

    els.forEach(function (el) {
      el.classList.add("tilt-3d");
      var raf = null;

      el.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 12;
        var ry = (px - 0.5) * 14;
        el.classList.add("tilt-active");
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = "perspective(700px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
        });
      });

      el.addEventListener("pointerleave", function () {
        el.classList.remove("tilt-active");
        el.style.transform = "";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initTilt);
  document.addEventListener("catalog:loaded", initTilt); // cards do catálogo chegam depois, via fetch
})();
