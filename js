/* =============================================================================
   MAIN.JS — Preenche textos vindos do CONFIG, monta links de WhatsApp,
   controla o FAQ e registra o PWA (service worker + botão instalar).
   ============================================================================= */
(function () {
  "use strict";
  const CFG = window.CONFIG;

  function waNumber() {
    let n = String(CFG.marca.whatsapp || "").replace(/\D/g, "");
    if (n.length === 10 || n.length === 11) n = "55" + n;
    return n || "5511912130716";
  }
  const waBase = "https://wa.me/" + waNumber();

  document.addEventListener("DOMContentLoaded", function () {
    // ---- textos da marca ----
    document.querySelectorAll("[data-brand]").forEach(function (e) { e.textContent = CFG.marca.nome; });
    document.querySelectorAll("[data-slogan]").forEach(function (e) { e.textContent = CFG.marca.slogan; });
    document.querySelectorAll("[data-cidade]").forEach(function (e) { e.textContent = CFG.marca.cidade; });
    document.querySelectorAll("[data-ano]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

    // ---- specs da máquina ----
    const setTxt = (sel, val) => document.querySelectorAll(sel).forEach(function (e) { e.textContent = val; });
    setTxt("[data-maq-modelo]", CFG.maquina.modelo);
    setTxt("[data-maq-potencia]", CFG.maquina.potencia);
    setTxt("[data-maq-area]", CFG.maquina.areaUtil);
    setTxt("[data-maq-vel]", CFG.maquina.velocidadeMax);

    // ---- links de contato ----
    document.querySelectorAll("[data-wa-link]").forEach(function (a) {
      const msg = a.getAttribute("data-wa-msg") || "";
      a.href = waBase + (msg ? "?text=" + encodeURIComponent(msg) : "");
      a.target = "_blank"; a.rel = "noopener";
    });
    document.querySelectorAll("[data-insta]").forEach(function (a) { a.href = CFG.marca.instagram; a.target = "_blank"; a.rel = "noopener"; });
    document.querySelectorAll("[data-email]").forEach(function (a) { a.href = "mailto:" + CFG.marca.email; a.textContent = a.textContent === "" ? CFG.marca.email : a.textContent; });

    // ---- FAQ acordeão ----
    document.querySelectorAll(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const item = btn.closest(".faq-item");
        const aberto = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (i) { i.classList.remove("open"); });
        if (!aberto) item.classList.add("open");
      });
    });
  });

  /* ---------- PWA: registra o service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (e) {
        console.warn("SW não registrado:", e);
      });
    });
  }

  /* ---------- PWA: botão/toast "instalar app" ---------- */
  let deferredPrompt = null;
  const toast = document.getElementById("pwa-toast");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (toast) toast.classList.add("show");
  });
  document.addEventListener("DOMContentLoaded", function () {
    const inst = document.getElementById("pwa-install");
    const close = document.getElementById("pwa-close");
    if (inst) inst.addEventListener("click", async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (toast) toast.classList.remove("show");
    });
    if (close) close.addEventListener("click", function () { if (toast) toast.classList.remove("show"); });
  });
})();
