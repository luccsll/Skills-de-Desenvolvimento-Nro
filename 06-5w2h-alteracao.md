# Gerar 5W2H da Alteração — Antes do Commit/Push

Toda vez que uma alteração de código for enviada para o Git, gere um 5W2H descrevendo a alteração. Isso vale para qualquer commit/push relevante do projeto — correção, nova funcionalidade, ajuste de regra de negócio, etc.

## Como identificar a alteração

1. Compare o estado atual do código com a última versão conhecida (via `git diff`, `git status`, ou comparando com a documentação já existente do processo, se o histórico de git não estiver disponível)
2. Identifique exatamente o que mudou: arquivos, funções, regras de negócio, campos
3. Não gere o 5W2H a partir de suposição — se não for possível identificar algum ponto (ex: o motivo da mudança não está claro pelo código), pergunte ao usuário antes de preencher

## Estrutura do 5W2H

Gere (ou atualize) o arquivo `5w2h_<nome_do_processo>.md` na raiz do projeto. Cada alteração enviada ao Git vira uma nova entrada no topo do arquivo, mais recente primeiro — não sobrescreva entradas anteriores.

```
## Alteração — <data DD/MM/AAAA>

| | |
|---|---|
| **What** (o quê) | O que foi alterado no código, em uma frase objetiva |
| **Why** (por quê) | Motivo da alteração — bug, nova regra de negócio, pedido do cliente, melhoria técnica |
| **Where** (onde) | Arquivos e/ou funções alterados |
| **When** (quando) | Data do commit/push |
| **Who** (quem) | Responsável pela alteração |
| **How** (como) | Resumo técnico de como a alteração foi feita |
| **How much** (quanto) | Impacto/esforço — ex: tempo gasto, quantidade de arquivos afetados, se exige nova homologação |

**Arquivos alterados:**
- `<caminho/arquivo1>` — <o que mudou nele>
- `<caminho/arquivo2>` — <o que mudou nele>

**Requer atualização de documentação?**
- [ ] README.md (se a regra de negócio ou arquitetura mudou)
- [ ] deploy_<nome_do_processo>.md (se a ordem/forma de publicação mudou)
- [ ] testes_<nome_do_processo>.md (se casos de teste ficaram desatualizados)

---
```

## Instruções finais

Escreva em português brasileiro. Seja objetivo — o 5W2H deve caber numa leitura rápida antes do push, não é um relatório extenso. Se a alteração afetar uma regra de negócio documentada no `README.md`, sinalize isso explicitamente no campo **Why** ou nos checkboxes de atualização de documentação, para não deixar a documentação do processo desatualizada.
