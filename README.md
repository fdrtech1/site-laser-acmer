# Site Laser ACMER

Vitrine e orçamento para gravação a laser com a ACMER S1 (diodo 2,5W, área 130×130mm — grava, não corta). Estático, sem backend, publicado via GitHub Pages.

**Ao vivo:** https://fdrtech1.github.io/site-laser-acmer/

## Estrutura

```
index.html              Home
o-problema.html         por que gravar a laser em vez de improvisar
como-funciona.html      passo a passo do pedido
produtos.html           catálogo (renderiza data/catalogo.json)
galeria.html            galeria de trabalhos (renderiza data/galeria.json)
orcamento.html          calculadora + formulário + FAQ
css/styles.css          estilos compartilhados
js/config.js            marca, contato, preços, materiais
js/effects.js           scroll reveal, parallax, fundo animado
js/nav.js               menu mobile, link ativo do menu
js/tilt3d.js            tilt 3D nos cards (segue o mouse)
js/plaque3d.js          plaquinha 3D em canvas (arrastável)
js/calculator.js        calculadora de orçamento
js/catalog.js           renderiza data/catalogo.json
js/gallery.js           renderiza data/galeria.json + lightbox
js/form.js              upload de foto (imgbb) + envio via WhatsApp
js/main.js              textos de marca, FAQ, PWA
js/secrets.js           chave do imgbb — não versionado (ver .gitignore)
data/catalogo.json      produtos/serviços do catálogo
data/galeria.json       fotos da galeria de trabalhos
images/                 fotos (machine.jpg, founder.jpg, work1–6.jpg, icons/)
manifest.json, sw.js, offline.html   PWA
Site Laser ACMER.dc.html, support.js, image-slot.js   fonte da ferramenta de design original (não usada no site publicado)
```

## Configuração

Edite `js/config.js`: nome da marca, WhatsApp, Instagram, e-mail, e a tabela de preços por material.

**Chave do imgbb** (upload automático de foto no formulário): crie `js/secrets.js` — esse arquivo é ignorado pelo git, então cada máquina/deploy precisa do seu:

```js
window.IMGBB_KEY = "sua-chave-aqui";
```

Sem esse arquivo, o formulário continua funcionando normalmente — só que a foto vai direto anexada na conversa do WhatsApp em vez de subir automaticamente.

## Rodar local

Abrir `index.html` no navegador. Sem build step.

## Segurança

Upload aceita só `.png .jpg .jpeg .webp` (foto) e `.dxf .svg .ai .pdf` (vetor), até 25MB; qualquer outra extensão é bloqueada. Nome, contato e observações do formulário passam por sanitização antes de virar link do WhatsApp. Validação é só no navegador — não é proteção contra alguém que sabe contornar isso.

## Domínio próprio

Adicionar um arquivo `CNAME` na raiz com o domínio e apontar o DNS para o GitHub Pages (registro `A`/`CNAME`, conforme o registrador).
