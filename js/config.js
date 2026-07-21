/* =============================================================================
   CONFIG.JS — dados editáveis do site: marca, máquina e regras de preço.
   ============================================================================= */
window.CONFIG = {
  marca: {
    nome: "ACMER S1",
    slogan: "Gravação a laser de precisão",
    cidade: "Capelinha — MG",
    whatsapp: "5511912130716",
    instagram: "https://www.instagram.com/_fernando.dr/",
    email: "fernandoxjc@icloud.com",
  },

  maquina: {
    modelo: "ACMER S1",
    potencia: "2,5 W",
    areaUtil: "130 × 130 mm",
    velocidadeMax: "10.000 mm/min",
  },

  precificacao: {
    hourlyRate: 200,
    setupFee: 30,
    minimo: 35,
    taxaArte: 25,
    materiais: {
      "Madeira / MDF": { base: 8, fator: 1.0 },
      "Acrílico": { base: 14, fator: 1.15 },
      "Couro": { base: 10, fator: 1.1 },
      "Plástico": { base: 7, fator: 1.05 },
      "Papel / papelão": { base: 4, fator: 0.8 },
      "Metal anodizado": { base: 18, fator: 1.35 },
    },
    complexidade: { baixa: 0.7, media: 1.0, alta: 1.6 },
    servico: { gravacao: 1.0, foto: 2.3, personalizado: 1.4 },
    // desconto por volume, aplicado ao subtotal de peças (não ao setup)
    lote: [
      { min: 100, desconto: 0.30 },
      { min: 50, desconto: 0.25 },
      { min: 25, desconto: 0.20 },
      { min: 10, desconto: 0.15 },
      { min: 5, desconto: 0.10 },
      { min: 1, desconto: 0 },
    ],
  },

  // Chave do imgbb: definida em js/secrets.js (arquivo local, não versionado).
  // Sem ela, o upload automático de foto fica desativado — o cliente ainda
  // consegue enviar o pedido, só que a foto vai direto pelo WhatsApp.
  upload: {
    imgbbKey: window.IMGBB_KEY || "",
    maxFileMb: 25,
    allowedImgExt: ["png", "jpg", "jpeg", "webp"],
    allowedVectorExt: ["dxf", "svg", "ai", "pdf"],
    dangerousExt: [
      "exe", "scr", "bat", "cmd", "com", "msi", "msp", "jar", "apk", "dll",
      "ps1", "ps1xml", "sh", "app", "pkg", "dmg", "iso", "lnk", "vbs", "vbe",
      "js", "jse", "wsf", "wsh", "html", "htm", "hta", "reg", "vb", "gadget",
      "cpl", "msc", "jsp", "php",
    ],
  },
};
