/* =============================================================================
   FORM.JS - dropzone de arquivo, upload de foto no imgbb, sanitizacao de texto
   e montagem do pedido enviado via WhatsApp.
   ============================================================================= */
(function () {
  "use strict";
  var CFG = window.CONFIG;
  var U = CFG.upload;

  var state = { fileName: "", fileUrl: "", uploading: false };

  function byId(id) { return document.getElementById(id); }

  function getExt(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }

  function charRange(a, b) {
    var s = "";
    for (var i = a; i <= b; i++) s += String.fromCharCode(i);
    return s;
  }

  // conjuntos de caracteres problematicos, construidos por codigo (evita bytes
  // invisiveis/de controle soltos no proprio arquivo-fonte)
  var ZERO_WIDTH = charRange(0x200B, 0x200F) + charRange(0x202A, 0x202E) + charRange(0x2060, 0x2069) + String.fromCharCode(0xFEFF);
  var CONTROL = charRange(0x0000, 0x0008) + String.fromCharCode(0x000B) + String.fromCharCode(0x000C) + charRange(0x000E, 0x001F) + String.fromCharCode(0x007F);
  var COMBINING = charRange(0x0300, 0x036F);
  var STRIP = ZERO_WIDTH + CONTROL;

  // remove caracteres invisiveis/bidi e de controle, colapsa pilhas de acento
  // combinavel ("zalgo"), repeticao excessiva do mesmo caractere e linhas em
  // branco demais; tudo antes de virar link do WhatsApp. Ver README, Seguranca.
  function sanitizeText(str, maxLen) {
    if (!str) return "";
    var s = String(str)
      .split("")
      .filter(function (ch) { return STRIP.indexOf(ch) === -1; })
      .join("");
    var combiningRe = new RegExp("[" + COMBINING + "]{3,}", "g");
    s = s.replace(combiningRe, "");
    s = s.replace(/(.)\1{9,}/g, "$1$1$1");
    s = s.replace(/\n{4,}/g, "\n\n\n");
    return s.slice(0, maxLen);
  }

  function waNumber() {
    var n = String(CFG.marca.whatsapp || "").replace(/\D/g, "");
    if (n.length === 10 || n.length === 11) n = "55" + n;
    return n || "5511912130716";
  }

  function shrinkImage(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var MAX = 1600, w = img.width, h = img.height;
        if (Math.max(w, h) > MAX) {
          var k = MAX / Math.max(w, h);
          w = Math.round(w * k); h = Math.round(h * k);
        }
        var cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        var r = new FileReader();
        r.onload = function () { resolve(String(r.result).split(",")[1]); };
        r.onerror = function () { resolve(null); };
        r.readAsDataURL(file);
      };
      img.src = url;
    });
  }

  function setStatus(msg) { byId("upload-status").textContent = msg; }
  function setErr(msg) { byId("file-err").textContent = msg || ""; }

  function uploadImage(file) {
    if (!U.imgbbKey) return; // sem chave: envia so pelo WhatsApp direto
    state.uploading = true;
    setStatus("Enviando foto...");
    shrinkImage(file).then(function (b64) {
      if (!b64) throw new Error("leitura");
      var fd = new FormData();
      fd.append("image", b64);
      return fetch("https://api.imgbb.com/1/upload?key=" + U.imgbbKey + "&expiration=15552000", { method: "POST", body: fd });
    }).then(function (res) { return res.json(); })
      .then(function (j) {
        state.uploading = false;
        if (j && j.success && j.data && j.data.url) {
          state.fileUrl = j.data.url;
          setStatus("Foto enviada");
        } else {
          setStatus("Nao foi possivel enviar a foto agora - ela vai direto na conversa do WhatsApp.");
        }
      }).catch(function () {
        state.uploading = false;
        setStatus("Nao foi possivel enviar a foto agora - ela vai direto na conversa do WhatsApp.");
      });
  }

  function handleFile(file) {
    if (!file) return;
    setErr("");
    if (file.size > U.maxFileMb * 1024 * 1024) {
      setErr("Arquivo maior que " + U.maxFileMb + "MB - envie um arquivo menor ou mande direto pelo WhatsApp.");
      return;
    }
    var ext = getExt(file.name);
    var isImg = /^image\//.test(file.type) && U.allowedImgExt.indexOf(ext) !== -1;
    var isVector = U.allowedVectorExt.indexOf(ext) !== -1;
    if (U.dangerousExt.indexOf(ext) !== -1 || (!isImg && !isVector)) {
      setErr("Tipo de arquivo nao aceito. Envie DXF, SVG, AI, PDF, PNG, JPG ou WEBP.");
      return;
    }
    state.fileName = file.name;
    state.fileUrl = "";
    if (isImg) {
      var preview = byId("upload-preview");
      var reader = new FileReader();
      reader.onload = function () {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
      uploadImage(file);
    } else {
      byId("upload-preview").style.display = "none";
      setStatus("Arquivo \"" + file.name + "\" sera enviado direto na conversa do WhatsApp.");
    }
  }

  function serviceLabel(s) {
    return s === "corte" ? "Corte a laser"
      : s === "personalizado" ? "Personalizado / brinde"
      : s === "foto" ? "Gravacao de foto/imagem"
      : "Gravacao a laser";
  }

  function submitWhatsApp() {
    if (state.uploading) {
      alert("A foto ainda esta subindo... aguarde uns segundos e toque em ENVIAR de novo.");
      return;
    }
    var est = window.Calc.lerEstado();
    var c = window.Calc.compute(est);
    var nome = sanitizeText(byId("form-nome").value, 80);
    var contato = sanitizeText(byId("form-contato").value, 60);
    var obs = sanitizeText(byId("form-obs").value, 500);

    var fileLine = state.fileUrl
      ? "Arquivo: " + state.fileName + " (foto no link abaixo)"
      : "Arquivo: " + (state.fileName ? state.fileName + " - vou anexar aqui na conversa" : "(vou enviar em seguida)");

    var lines = [
      "*NOVO PEDIDO DE ORCAMENTO*",
      "",
      "Nome: " + (nome || "-"),
      "Contato: " + (contato || "-"),
      "Servico: " + serviceLabel(est.servico),
      "Material: " + est.material,
      "Tamanho: " + est.larguraMm + " x " + est.alturaMm + " mm",
      "Quantidade: " + est.qty,
      "Complexidade: " + est.complexidade,
      fileLine,
      state.fileUrl ? "Foto: " + state.fileUrl : "",
      "",
      "Estimativa do site: " + window.Calc.brl(c.total * 0.9) + " a " + window.Calc.brl(c.total * 1.15),
      obs ? "Obs: " + obs : "",
    ].filter(Boolean);

    var msg = sanitizeText(lines.join("\n"), 1500);
    var url = "https://wa.me/" + waNumber() + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dropzone = byId("dropzone");
    var fileInput = byId("file-input");
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", function () { fileInput.click(); });
    dropzone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener("change", function (e) { handleFile(e.target.files && e.target.files[0]); });

    dropzone.addEventListener("dragover", function (e) { e.preventDefault(); dropzone.classList.add("drag"); });
    dropzone.addEventListener("dragleave", function (e) { e.preventDefault(); dropzone.classList.remove("drag"); });
    dropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropzone.classList.remove("drag");
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(f);
    });

    var btn = byId("btn-enviar");
    if (btn) btn.addEventListener("click", submitWhatsApp);
  });
})();
