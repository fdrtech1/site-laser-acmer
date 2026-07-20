/* =============================================================================
   CALCULATOR.JS — calculadora de orçamento (tempo de máquina + material).
   Expõe window.Calc.compute(estado) para o form.js reaproveitar na hora de
   montar a mensagem do WhatsApp.
   ============================================================================= */
(function () {
  "use strict";
  var CFG = window.CONFIG;
  var P = CFG.precificacao;

  function brl(n) {
    return "R$" + Math.round(n).toLocaleString("pt-BR");
  }

  function descontoLote(qty) {
    for (var i = 0; i < P.lote.length; i++) {
      if (qty >= P.lote[i].min) return P.lote[i].desconto;
    }
    return 0;
  }

  function lerEstado() {
    var largura = Math.max(0, Number(byId("calc-largura").value) || 0);
    var altura = Math.max(0, Number(byId("calc-altura").value) || 0);
    return {
      material: byId("calc-material").value,
      servico: byId("calc-servico").value,
      larguraMm: largura,
      alturaMm: altura,
      qty: Math.max(1, Number(byId("calc-qtd").value) || 1),
      complexidade: byId("calc-complexidade").value,
      arte: byId("calc-arte").checked,
    };
  }

  function byId(id) { return document.getElementById(id); }

  // ---------- fórmula ----------
  function compute(state) {
    var mat = P.materiais[state.material] || { base: 8, fator: 1.0 };
    var complexMult = P.complexidade[state.complexidade] || 1.0;
    var servicoMult = P.servico[state.servico] || 1.0;
    var qty = Math.max(1, Number(state.qty) || 1);

    // área em cm² (inputs do formulário são em mm)
    var areaCm2 = (state.larguraMm / 10) * (state.alturaMm / 10);

    var minsPerPiece = 6 + areaCm2 * 0.10 * complexMult * servicoMult;
    var laborPerPiece = (minsPerPiece / 60) * P.hourlyRate;
    var matPerPiece = mat.base * mat.fator * (1 + areaCm2 / 600);
    var perPiece = laborPerPiece + matPerPiece;

    var desconto = descontoLote(qty);
    var subtotalPecas = perPiece * qty * (1 - desconto);
    var taxaArte = state.arte ? P.taxaArte : 0;
    var total = Math.max(P.setupFee + subtotalPecas + taxaArte, P.minimo);

    return {
      total: total,
      setup: P.setupFee,
      perPiece: perPiece,
      subtotalPecas: subtotalPecas,
      desconto: desconto,
      taxaArte: taxaArte,
      qty: qty,
    };
  }

  // ---------- UI ----------
  function render() {
    var state = lerEstado();
    var c = compute(state);

    byId("r-price").textContent = brl(c.total);
    byId("r-range").textContent = brl(c.total * 0.9) + " – " + brl(c.total * 1.15);
    byId("rb-peca").textContent = brl(c.perPiece);
    byId("rb-qtd").textContent = c.qty + "x";
    byId("rb-subtotal").textContent = brl(c.subtotalPecas);

    var descRow = byId("rb-desc-row");
    if (c.desconto > 0) {
      descRow.style.display = "";
      byId("rb-desc").textContent = "-" + Math.round(c.desconto * 100) + "%";
    } else {
      descRow.style.display = "none";
    }

    byId("rb-arte").textContent = c.taxaArte > 0 ? brl(c.taxaArte) : "—";

    var badge = byId("badge-lote");
    if (c.desconto > 0) {
      badge.style.display = "";
      badge.textContent = "DESCONTO DE LOTE APLICADO — " + Math.round(c.desconto * 100) + "%";
    } else {
      badge.style.display = "none";
    }
  }

  function initMaterialOptions() {
    var sel = byId("calc-material");
    if (sel.options.length) return; // já veio populado do HTML
    Object.keys(P.materiais).forEach(function (nome) {
      var opt = document.createElement("option");
      opt.value = nome; opt.textContent = nome;
      sel.appendChild(opt);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMaterialOptions();
    ["calc-material", "calc-servico", "calc-largura", "calc-altura", "calc-complexidade", "calc-qtd", "calc-arte"]
      .forEach(function (id) {
        var el = byId(id);
        if (!el) return;
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      });
    render();
  });

  window.Calc = { compute: compute, lerEstado: lerEstado, brl: brl };
})();
