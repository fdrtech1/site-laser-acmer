---
name: publicar
description: Publica o projeto atual no GitHub Pages com verificações de segurança. Usar quando o usuário pedir para publicar, subir o site, fazer deploy ou atualizar o GitHub Pages. Cobre criação de repositório, revisão do que vai no commit, push, ativação do Pages e verificação do site no ar.
---

# /publicar — Publicar site no GitHub Pages

Fluxo completo de publicação. Executar as etapas NA ORDEM. Nunca pular a etapa 2 (revisão de segurança).

## 1. Verificar o estado do repositório

- Rodar `git status` e `git remote -v` para confirmar que o diretório atual é um repositório git e tem remote configurado.
- Se NÃO houver remote: verificar com `gh repo view <nome>` se o repositório existe no GitHub. Se não existir, criar com `gh repo create <nome> --public --source=. --push` (confirmar o nome com o usuário antes de criar).
- Se o diretório não for a raiz do projeto (pasta foi movida), avisar o usuário e confirmar o caminho antes de continuar — não assumir.

## 2. Revisão de segurança ANTES do commit (obrigatória)

Revisar `git status` e listar para o usuário tudo o que será commitado. Bloquear e remover do stage qualquer um destes:

- Arquivos de sessão ou lock de ferramentas: `*.lock`, `.claude/`, pastas de sessão, arquivos temporários de editor
- Segredos: qualquer arquivo com token, chave de API, senha, `.env`
- Arquivos pessoais que não pertencem ao site (planilhas, PDFs de orçamento, arquivos CAD)

Se encontrar algo suspeito já commitado anteriormente, avisar o usuário — não tentar reescrever histórico sem autorização.

Garantir que o `.gitignore` cobre pelo menos:

```
.claude/
*.lock
.env
*.tmp
```

Se não cobrir, adicionar as linhas que faltam e incluir no commit.

## 3. Commit e push

- Mensagem de commit curta, em português, descrevendo o que mudou.
- `git push` para a branch principal (`main`).
- Se o push falhar, diagnosticar o motivo real (autenticação, branch divergente) em vez de tentar comandos às cegas.

## 4. Ativar/confirmar o GitHub Pages

- Verificar se o Pages já está ativo: `gh api repos/{owner}/{repo}/pages` (404 = não ativado).
- Se não estiver ativo, ativar servindo da branch main, raiz:
  `gh api repos/{owner}/{repo}/pages -X POST -f "source[branch]=main" -f "source[path]=/"`
- Informar a URL final ao usuário: `https://<owner>.github.io/<repo>/`

## 5. Verificar o site no ar (não pular)

- Aguardar o build do Pages (checar `gh api repos/{owner}/{repo}/pages/builds/latest` até status `built`; se demorar mais de 2 minutos, avisar e seguir).
- Abrir a URL publicada no navegador e confirmar que a página carrega sem erro 404 e sem layout quebrado.
- Se o site tem service worker (`sw.js`), lembrar o usuário de que o navegador pode servir cache antigo — testar em aba anônima.

## 6. Resumo final

Reportar ao usuário em uma lista curta: o que foi commitado, URL do site, status do Pages, e qualquer arquivo que foi bloqueado na etapa 2.

## Regras gerais

- Ambiente: Windows com PowerShell — usar sintaxe PowerShell nos comandos de terminal quando rodar localmente.
- Nunca commitar sem mostrar antes a lista de arquivos ao usuário.
- Nunca criar repositório, mudar visibilidade ou reescrever histórico sem confirmação explícita.
