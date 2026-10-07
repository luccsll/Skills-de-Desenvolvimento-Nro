# Agente Nova UI

Especialista no design system Nova UI: escolhe os componentes, monta HTML/CSS/JS prontos para o Fluig, orienta o uso e revisa código.

## Conteúdo

```
nova-ui/                      ← a skill (o "cérebro" do agente)
  SKILL.md                    regras, tabela de decisão, formato de entrega e exemplo
  references/
    componentes.md            71 componentes: HTML base, classes, data-*, funções, eventos
    api-js.md                 índice de todas as funções NOVAUI.* e eventos nova:*
    fundamentos.md            tokens, tipografia, espaçamento, ícones, utilitários
    fluig.md                  estrutura no Fluig, pai x filho, datasets, responsividade
    nomenclatura.md           padrão ds_/fm_/wf_/gp_/pg_/pp_
    integracoes.md            NOVAUI.integration e modelo de documentação
    exemplos/                 formulário de abono e página de relatório completos
    fonte/                    código-fonte CSS/JS da biblioteca (para conferir classes)
agents/nova-ui.md             subagente do Claude Code que usa a skill
```

## Instalação no Claude Code (VS Code)

1. Copie a pasta `nova-ui/` para `.claude/skills/nova-ui/` do projeto (ou para o repositório de skills da equipe, que já entra como submódulo em `.claude/skills`).
2. Copie `agents/nova-ui.md` para `.claude/agents/nova-ui.md`.
3. Use assim: "use o agente nova-ui: quero um modal com formulário com nome, CPF e setor".

## Instalação no Claude (app)

Baixe o `nova-ui-skill.zip` na seção Skills de IA do showcase e envie como skill nas configurações do Claude. Depois é só pedir a tela em qualquer conversa.

## Manter atualizado

`references/componentes.md`, `api-js.md`, `exemplos/` e `fonte/` foram gerados a partir do showcase. Quando a biblioteca mudar (componente novo, função nova em `integrations.js`), substitua os arquivos em `fonte/` e atualize a seção do componente em `componentes.md`.
