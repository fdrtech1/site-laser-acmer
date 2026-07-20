/* =============================================================================
   EFFECTS.JS — revelação no scroll, parallax e fundo estrelado (canvas).
   Menu mobile e link ativo do menu ficam em js/nav.js.
   ============================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- revelação no scroll (.reveal / .reveal-cut) ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal, .reveal-cut");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax no scroll ---------- */
  function initParallax() {
    var els = document.querySelectorAll("[data-parallax]");
    if (!els.length || reduceMotion) return;
    var ticking = false;

    function apply() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = "translateY(" + (center * -speed).toFixed(1) + "px)";
      });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }, { passive: true });
    window.addEventListener("resize", function () { requestAnimationFrame(apply); });
    apply();
  }

  /* ---------- fundo estrelado no #space-canvas ---------- */
  function initStarfield() {
    var canvas = document.getElementById("space-canvas");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var stars = [];
    var w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      var count = Math.min(160, Math.round((w * h) / 9000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
        });
      }
    }

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(234,240,255," + alpha.toFixed(2) + ")";
        ctx.fill();
      }
      t++;
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initParallax();
    initStarfield();
  });
})();
