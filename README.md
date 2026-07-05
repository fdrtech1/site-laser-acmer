# Site Laser ACMER

Site de vitrine e orçamento para o serviço de gravação e corte a laser com a ACMER S1 (diodo 2,5W, área de trabalho 130×130mm). Página única em HTML/CSS/JS, sem backend — publicada via GitHub Pages.

**Ao vivo:** https://fdrtech1.github.io/site-laser-acmer/
**Repositório:** https://github.com/fdrtech1/site-laser-acmer

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | O site inteiro — HTML, CSS inline e a lógica (calculadora de orçamento, upload de foto, formulário) em um bloco `<script>` no fim do arquivo. |
| `Site Laser ACMER.dc.html` | Cópia idêntica de `index.html`, mantida em sincronia. Histórico do arquivo original antes de virar `index.html`. |
| `support.js` | Runtime que interpreta as tags customizadas do arquivo (`<x-dc>`, `<sc-for>`, `<sc-if>`, `<x-import>`, a classe base `DCLogic`). Sem ele a página não renderiza. |
| `image-slot.js` | Componente de "caixa de imagem" usado nos placeholders (foto da máquina, galeria, foto do fundador). Ver seção **Imagens** abaixo — importante entender as limitações dele. |
| `.thumbnail` | Miniatura gerada pela ferramenta original de criação do site. |

Não há build step, servidor, ou banco de dados. Qualquer editor de texto + um navegador bastam para testar localmente (`index.html` funciona abrindo direto no navegador, desde que `support.js` e `image-slot.js` estejam na mesma pasta).

## Como funciona o pedido de orçamento

O formulário na seção `#orcamento`:
1. Calcula uma faixa de preço estimada em tempo real (função `compute()`), com base em tamanho, material, serviço (gravação, corte, foto/imagem, personalizado) e complexidade.
2. Ao clicar em "ENVIAR PEDIDO VIA WHATSAPP", monta uma mensagem de texto com todos os dados e abre `https://wa.me/<numero>?text=<mensagem>` — **não existe envio automático real**, é só um link pré-preenchido que abre o WhatsApp Web/App do próprio cliente.
3. Se o cliente anexar uma foto (PNG/JPG/WEBP), ela sobe para o imgbb (ver abaixo) e o link da imagem já entra na mensagem. Arquivos vetoriais (DXF/SVG/AI/PDF) **não** são enviados por aqui — o aviso no formulário deixa isso explícito: eles vão anexados na própria conversa do WhatsApp.

## Upload de foto (imgbb)

O upload usa a API gratuita do [imgbb](https://api.imgbb.com/). A chave está em `IMGBB_KEY`, perto do topo do `<script>`:

```js
const IMGBB_KEY = "088b9a743daeecb0cc80fdedc3895e97";
```

**Importante:** por ser um site 100% estático (sem servidor próprio), essa chave fica visível para qualquer pessoa que abrir o "código-fonte" da página no navegador. Isso é uma limitação inerente a qualquer integração client-side com uma API pública — não é um erro de configuração. O risco prático é baixo (a chave só permite subir imagens na sua conta imgbb, nada além disso), mas:

- Se notar uso anormal (muitos uploads, cota estourando), gere uma chave nova em imgbb.com → API e substitua o valor de `IMGBB_KEY` nos dois arquivos HTML.
- Fotos sobem com `expiration=15552000` (180 dias) — elas se apagam sozinhas do imgbb depois desse prazo, então salve localmente qualquer foto de pedido que queira guardar por mais tempo.

## Segurança

Como é um site estático sem servidor, toda validação abaixo acontece **no navegador do visitante** — é uma camada de higiene básica, não uma barreira de segurança real contra um atacante que sabe o que está fazendo (alguém pode abrir o DevTools e contornar tudo). As proteções reais continuam sendo o bom senso de quem recebe os arquivos depois, no WhatsApp.

**O que foi implementado no formulário:**

- **Lista de permissão de arquivo (allowlist):** só `.dxf .svg .ai .pdf .png .jpg .jpeg .webp` passam. Qualquer outra extensão — incluindo uma lista explícita de formatos executáveis/script (`.exe .bat .js .vbs .html .msi .apk` etc.) — é rejeitada com uma mensagem de erro visível, mesmo se arrastada por drag-and-drop (que ignora o filtro `accept` do input).
- **Limite de tamanho:** 25MB por arquivo, checado antes de qualquer processamento.
- **SVG nunca vira "foto":** mesmo que o navegador reporte `image/svg+xml`, SVG é tratado como vetor (vai só por WhatsApp), nunca é lido como imagem para upload — SVG pode conter `<script>` embutido, então evitamos processá-lo no cliente.
- **Sanitização de texto** (nome, contato, observações) contra golpes de "texto que trava o WhatsApp": remove caracteres invisíveis (zero-width, override de direção de escrita), caracteres de controle, pilhas de acento combinável ("zalgo text"), colapsa repetições excessivas do mesmo caractere e capa o tamanho de cada campo — tudo isso roda a cada tecla digitada e de novo, defensivamente, na mensagem final antes de virar link do WhatsApp.
- **Avisos na interface:** o formulário explica que vetores vão por WhatsApp e fotos vão pelo site; um FAQ dedicado ("Como vocês cuidam da segurança dos arquivos enviados?") e uma nota abaixo do campo de observações pedem para não colar links de sites desconhecidos.

**O que isso NÃO cobre (cuidados manuais que continuam necessários):**

- **Nunca abra/execute um arquivo enviado por um cliente sem confirmar a origem**, mesmo que a extensão pareça válida (um arquivo pode ter dupla extensão tipo `desenho.dxf.exe`, ou um PDF/SVG malicioso pode ter payload — vetores podem carregar scripts).
- Antes de abrir um arquivo suspeito, passe por um antivírus ou por https://www.virustotal.com (upload público, então nunca envie um arquivo com dados sensíveis do cliente).
- Se um link aparecer nas observações do pedido e você não reconhecer o domínio, não clique — pergunte ao cliente o que é antes.
- A validação de tipo/tamanho é só no navegador; se algum dia este site ganhar um backend real, repita essas mesmas checagens no servidor (nunca confie soh no que o cliente manda).

## Imagens: onde colocar, como nomear, qual resolução

Isso é o ponto mais importante para o site parecer "no ar de verdade" em vez de cheio de caixas vazias escrito "arraste uma imagem".

**Por que arrastar uma foto no site ao vivo (GitHub Pages) não funciona hoje:** o componente `<x-import ... id="machinephoto">` (de `image-slot.js`) foi feito para uma ferramenta de edição específica (um "runtime omelette") que grava a imagem arrastada num arquivo `.image-slots.state.json` através de `window.omelette.writeFile`. O GitHub Pages é hospedagem 100% estática — não existe esse `window.omelette` nem um servidor para gravar esse arquivo. Resultado: se um visitante arrastar uma foto no site publicado, ela aparece só naquela sessão do navegador dele e some ao recarregar a página. Ninguém mais vê.

**A forma correta de colocar fotos reais e definitivas no site:** usar o atributo `src` do próprio componente, que funciona como "imagem padrão" sempre visível (o comentário de uso em `image-slot.js` confirma: *"src — Optional initial/fallback image URL"*). **Isso já está pronto** — a pasta `images/` existe no repositório com placeholders no tamanho certo, e cada `<x-import>` do HTML já tem o `src="images/..."` apontando pra lá. Só falta você:

1. Redimensionar suas fotos com o **PowerToys Image Resizer** (botão direito no arquivo → "Redimensionar imagens") para os tamanhos da tabela abaixo.
2. Salvar/sobrescrever o arquivo em `images/` **com o mesmo nome exato** do placeholder — não precisa mexer no HTML, ele já aponta pra lá.
3. Fazer commit e push — pronto, a imagem passa a aparecer para todo mundo, permanentemente, sem depender de nenhuma ferramenta especial.

| Nome do arquivo (já existe como placeholder) | Onde aparece | Proporção do quadro | Resolução recomendada |
|---|---|---|---|
| `images/machine.jpg` | Foto da ACMER S1 (seção Máquina) | 4:3 | 1200×900px |
| `images/founder.jpg` | Sua foto (seção Sobre Mim) | 1:1 (quadrado) | 1200×1200px |
| `images/work1.jpg` … `images/work6.jpg` | Galeria de trabalhos (6 quadros, cada um com sua tag: MDF/gravação, acrílico/corte, couro/brinde, metal/tag, MDF/decoração, personalizado) | 1:1 (quadrado) | 1200×1200px |

No PowerToys, ao redimensionar, escolha "Tamanho personalizado" e digite a largura/altura da tabela — para as fotos quadradas (founder e work1–6), recorte a foto original num quadrado antes de redimensionar (o Editor de Fotos do Windows ou o Paint fazem esse corte) para não distorcer.

**Por que esses valores:**
- **1200px no lado maior** é o próprio limite (`MAX_DIM = 1200`) que o componente usa internamente para redimensionar — ir além disso é banda larga desperdiçada, sem ganho visual.
- Formatos aceitos pelo componente: **PNG, JPEG ou WEBP** (ele recusa SVG e GIF de propósito — GIF perderia a animação, SVG pode carregar script).
- Prefira **JPEG qualidade ~85% ou WEBP**, o que dá arquivos de ~150–300KB — carregam rápido mesmo no 4G do cliente.
- Toda foto usada como fundo de card (`fit="cover"`) deve ser cortada **na mesma proporção do quadro** (quadrado para a galeria, 4:3 para a máquina) para não distorcer ou cortar errado.

Se em algum momento você quiser voltar a usar a ferramenta de edição original (arrastar e soltar), ela vai gerar o arquivo `.image-slots.state.json` — nesse caso, é só garantir que esse arquivo também seja commitado junto do `index.html` na raiz do repositório, e aí o `fetch('.image-slots.state.json')` do componente consegue carregá-lo no site publicado também.

## Hospedagem e domínio — colocando no ar "de verdade"

**Hoje:** o site já está no ar, grátis, com HTTPS automático, via **GitHub Pages**, direto deste repositório (branch `main`). Isso é suficiente para um site de vitrine + formulário como este — não precisa de servidor.

**Domínio próprio (recomendado, é o que mais passa profissionalismo):**
1. Registre um domínio — para `.com.br`, o registro oficial é o [Registro.br](https://registro.br) (~R$40/ano); para `.com`, qualquer registrador confiável (Cloudflare Registrar, Namecheap, GoDaddy).
2. Configure o DNS do domínio apontando para o GitHub Pages: um registro `CNAME` (para subdomínio, ex. `www`) ou registros `A` apontando para os IPs do GitHub Pages, para o domínio raiz.
3. No repositório, adicione um arquivo `CNAME` (sem extensão) na raiz contendo só o domínio, ex. `laseracmer.com.br`.
4. Nas configurações de Pages do repositório (Settings → Pages), o GitHub emite o certificado HTTPS automaticamente depois que o DNS propaga (pode levar algumas horas).

**Se um dia precisar de mais do que um site estático** (ex.: formulário que envia e-mail de verdade, verificação de arquivo no servidor, painel de pedidos): GitHub Pages não roda backend. Alternativas gratuitas e simples de migrar, já que o site é só HTML/CSS/JS: **Cloudflare Pages**, **Netlify** ou **Vercel** — todas com deploy automático a partir do GitHub, e suporte a "functions" (backend leve) quando for necessário.

**Outras ideias práticas para "parecer no ar há 2 meses":**
- Crie um perfil no **Google Meu Negócio** (Google Business Profile) com o mesmo nome/telefone — ajuda a aparecer em buscas locais e dá um selo extra de legitimidade.
- Mantenha o Instagram ativo e linkado (já está no rodapé do site).
- Assim que tiver os primeiros pedidos reais, troque os depoimentos de exemplo da seção "O que os clientes dizem" por avaliações verdadeiras — os que estão lá agora são ilustrativos, escritos para dar o tom certo mas sem cliente real por trás.
