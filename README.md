# Skills de Desenvolvimento NRO

Skills e agente do Claude Code para analistas Fluig da Nova Rota do Oeste. O repositório é feito para entrar como **submódulo git em `.claude/skills`** de cada projeto Fluig.

## Estrutura

```
fluig-01-validacao-nomenclatura/SKILL.md      revisão: nomenclatura dos artefatos
fluig-02-revisao-qualidade-codigo/SKILL.md    revisão: regras R1–R4 e code smells CS1–CS5
fluig-03-gerar-documentacao-processo/SKILL.md documentação técnica do processo
fluig-04-gerar-guia-deploy/SKILL.md           guia de publicação em produção
fluig-05-sugerir-testes/SKILL.md              casos de teste de regra de negócio
fluig-06-5w2h-alteracao/SKILL.md              5W2H da alteração antes do commit/push
nova-ui/                                      skill do design system Nova UI
  SKILL.md                                    regras, tabela de decisão, formato de entrega e exemplo
  references/
    componentes.md                            71 componentes: HTML base, classes, data-*, funções, eventos
    api-js.md                                 índice de todas as funções NOVAUI.* e eventos nova:*
    fundamentos.md                            tokens, tipografia, espaçamento, ícones, utilitários
    fluig.md                                  estrutura no Fluig, pai x filho, datasets, responsividade
    nomenclatura.md                           padrão ds_/fm_/wf_/gp_/pg_/pp_
    integracoes.md                            NOVAUI.integration e modelo de documentação
    exemplos/                                 formulário de abono e página de relatório completos
    fonte/                                    código-fonte CSS/JS da biblioteca (para conferir classes)
agents/nova-ui.md                             subagente especialista na Nova UI (usa a skill nova-ui)
```

## Instalação no projeto Fluig

```bash
git submodule add <url-deste-repositorio> .claude/skills
mkdir -p .claude/agents
cp .claude/skills/agents/nova-ui.md .claude/agents/nova-ui.md
```

O Claude Code só lê agentes de `.claude/agents/`, por isso o `nova-ui.md` precisa ser copiado. As skills funcionam direto do submódulo.

Para atualizar depois:

```bash
git submodule update --remote .claude/skills
cp .claude/skills/agents/nova-ui.md .claude/agents/nova-ui.md
```

Quem clonar o projeto precisa rodar `git submodule update --init` (ou clonar com `--recurse-submodules`).

## Skills de revisão (01 a 06)

Cada skill é independente e cuida de uma única etapa. Chame pelo nome (ex.: `/fluig-02-revisao-qualidade-codigo`) ou peça em linguagem natural.

| # | Skill | O que faz | Gera |
|---|---|---|---|
| 1 | `fluig-01-validacao-nomenclatura` | Valida datasets, formulários, páginas, papéis, workflows e grupos contra o padrão da equipe | Bloco no topo do deploy + `inconsistencias.md` (se houver problema) |
| 2 | `fluig-02-revisao-qualidade-codigo` | Revisa o código JS contra as regras R1–R4 e detecta code smells CS1–CS5 | `code_review.md` (se houver problema) |
| 3 | `fluig-03-gerar-documentacao-processo` | Mapeia o projeto, lê todos os arquivos e gera a documentação técnica completa (com diagrama de sequência da arquitetura) | `README.md` |
| 4 | `fluig-04-gerar-guia-deploy` | Gera o passo a passo operacional de publicação em produção | `deploy_<nome_do_processo>.md` |
| 5 | `fluig-05-sugerir-testes` | Lê o projeto e a documentação anterior (README/deploy/code_review) e sugere casos de teste focados em falhas de regra de negócio | `testes_<nome_do_processo>.md` |
| 6 | `fluig-06-5w2h-alteracao` | Gera um 5W2H de cada alteração de código antes de subir pro Git | `5w2h_<nome_do_processo>.md` (entradas acumuladas, mais recente no topo) |

**Ordem recomendada quando usar tudo:** 1 → 2 → 3 → 4 → 5. As partes 1 e 2 podem rodar em paralelo (não dependem uma da outra). A parte 3 depende da leitura do projeto. A parte 4 pode ser gerada a qualquer momento depois que o processo já está mapeado. A parte 5 depende da documentação gerada na parte 3 (ou faz a leitura do projeto na hora, se não houver documentação). A parte 6 roda à parte, sempre que houver um commit/push — não depende das demais.

### Versões hospedadas no Fluig

Cópias dos prompts de revisão publicadas no Fluig, para uso fora do Claude Code:

1. [01-validacao-nomenclatura.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTIzNzMmdmVyPTEwMDAmZmlsZT0wMS12YWxpZGFjYW8tbm9tZW5jbGF0dXJhLm1kJmNyYz0zMDk5MDE2Njg1JnNpemU9MC4wMDM0OCZ1SWQ9MzEmZlNJZD0xJnVTSWQ9MSZkPWZhbHNlJnRrbj0mcHVibGljVXJsPXRydWUmYXR0YWNoPWZhbHNl.md)
2. [02-revisao-qualidade-codigo.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTIzNzAmdmVyPTEwMDAmZmlsZT0wMi1yZXZpc2FvLXF1YWxpZGFkZS1jb2RpZ28ubWQmY3JjPTMyNDEzMjE1OTcmc2l6ZT0wLjAwNTgxOCZ1SWQ9MzEmZlNJZD0xJnVTSWQ9MSZkPWZhbHNlJnRrbj0mcHVibGljVXJsPXRydWUmYXR0YWNoPWZhbHNl.md)
3. [03-gerar-documentacao-processo.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTIzNjkmdmVyPTEwMDAmZmlsZT0wMy1nZXJhci1kb2N1bWVudGFjYW8tcHJvY2Vzc28ubWQmY3JjPTI0ODY5OTMzMzgmc2l6ZT0wLjAwODMxNyZ1SWQ9MzEmZlNJZD0xJnVTSWQ9MSZkPWZhbHNlJnRrbj0mcHVibGljVXJsPXRydWUmYXR0YWNoPWZhbHNl.md)
4. [04-gerar-guia-deploy.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTIzNzImdmVyPTEwMDAmZmlsZT0wNC1nZXJhci1ndWlhLWRlcGxveS5tZCZjcmM9MTA0NjUwOTA4NSZzaXplPTAuMDA1MDMzJnVJZD0zMSZmU0lkPTEmdVNJZD0xJmQ9ZmFsc2UmdGtuPSZwdWJsaWNVcmw9dHJ1ZSZhdHRhY2g9ZmFsc2U=.md)
5. [05-sugerir-testes.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTI5NjkmdmVyPTEwMDAmZmlsZT0wNS1zdWdlcmlyLXRlc3Rlcy5tZCZjcmM9Mzk5Nzc3NTI1NiZzaXplPTAuMDA0NzE5JnVJZD0zMSZmU0lkPTEmdVNJZD0xJmQ9ZmFsc2UmdGtuPSZwdWJsaWNVcmw9dHJ1ZSZhdHRhY2g9ZmFsc2U=.md)
6. [06-5w2h-alteracao.md](https://concessionariarota156337.fluig.cloudtotvs.com.br/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yMTI5NjgmdmVyPTEwMDAmZmlsZT0wNi01dzJoLWFsdGVyYWNhby5tZCZjcmM9MjMzMTI4MjMyNSZzaXplPTAuMDAyMzIzJnVJZD0zMSZmU0lkPTEmdVNJZD0xJmQ9ZmFsc2UmdGtuPSZwdWJsaWNVcmw9dHJ1ZSZhdHRhY2g9ZmFsc2U=.md)

## Agente Nova UI

Especialista no design system Nova UI: escolhe os componentes, monta HTML/CSS/JS prontos para o Fluig, orienta o uso e revisa código. O agente (`agents/nova-ui.md`) lê a skill `nova-ui/`.

Uso: "use o agente nova-ui: quero um modal com formulário com nome, CPF e setor".

**No Claude (app):** baixe o `nova-ui-skill.zip` na seção Skills de IA do showcase e envie como skill nas configurações do Claude. Depois é só pedir a tela em qualquer conversa.

**Manter atualizado:** `references/componentes.md`, `api-js.md`, `exemplos/` e `fonte/` foram gerados a partir do showcase. Quando a biblioteca mudar (componente novo, função nova em `integrations.js`), substitua os arquivos em `fonte/` e atualize a seção do componente em `componentes.md`.
