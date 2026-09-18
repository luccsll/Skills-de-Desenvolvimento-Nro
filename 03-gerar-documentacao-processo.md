# Documentar Processo Fluig

Você é um analista técnico especializado em processos Fluig. Sua tarefa é gerar a documentação completa de um processo Fluig lendo os arquivos do projeto.

## Passo 1 — Mapeie a estrutura do projeto

Antes de ler qualquer arquivo, liste os arquivos existentes no projeto ignorando `.git`. Identifique:

- O formulário principal (`forms/**/*.html`)
- O script principal do formulário (`forms/**/*.js`, excluindo `events/`)
- Os eventos do formulário (`forms/**/events/*.js`) — os possíveis são: `afterSaveNew`, `displayFields`, `enableFields`, `inputFields`, `setEnable`, `validateForm`, `afterProcessing`, `beforeProcessing`
- Os scripts de workflow (`workflow/scripts/*.js`) — os possíveis são: `afterCancelProcess`, `afterProcessCreate`, `afterProcessFinish`, `afterReleaseVersion`, `afterStateEntry`, `afterStateLeave`, `afterTaskComplete`, `afterTaskCreate`, `afterTaskSave`, `beforeCancelProcess`, `beforeSendData`, `beforeStateEntry`, `beforeStateLeave`, `beforeTaskComplete`, `beforeTaskCreate`, `beforeTaskSave`, `calculateAgreement`, `checkComplementsPermission`, `subProcessCreated`, `validateAvailableStates`, `onNotify`
- Os datasets (`datasets/*.js`)
- O diagrama de workflow — sempre em `workflow/.resources/<nome_do_workflow>.svg`
- Artefatos adicionais: planilhas exemplo, vídeos tutorial, templates de e-mail
- Integrações externas identificáveis no código (API intermediária, Protheus/RM, webservices) — necessário para o diagrama de sequência da seção 9

## Passo 2 — Leia os arquivos na ordem abaixo

Leia todos estes arquivos integralmente antes de começar a escrever qualquer documentação:

**Formulário HTML** — identifique: painéis (`data-showpanels`, `data-wkactivity`), campos hidden, tabelas filhas, botões de ação, IDs relevantes, bibliotecas carregadas.

**Script principal do formulário** — identifique: módulos importados, funções de controle de painéis, preenchimento automático, consultas a datasets, lógica de edição e histórico, campos mapeados por atividade.

**Todos os eventos de formulário** em `forms/**/events/` — leia cada arquivo encontrado (`validateForm.js`, `displayFields.js`, `enableFields.js`, `inputFields.js`, `setEnable.js`, `afterSaveNew.js`, `afterProcessing.js`, `beforeProcessing.js`).

**Todos os scripts de workflow** em `workflow/scripts/` — leia cada arquivo encontrado (lista completa no Passo 1).

**Datasets** — identifique: nome, finalidade, o que cada dataset retorna, onde é consumido, e se algum se conecta a sistema externo (ex: Protheus/RM via JDBC ou API).

Se qualquer arquivo não existir, pule-o silenciosamente.

## Passo 3 — Gere a documentação

Produza um arquivo Markdown chamado `README.md` na raiz do projeto.

Use exatamente a estrutura de seções abaixo. Não invente informações; se não encontrar dados suficientes para uma seção, escreva `> Não identificado na leitura do código.` e siga em frente.

```
# Processo <número> - <nome>

## 1. Objetivo do processo
<Descreva em linguagem de negócio o que o processo resolve...>

## 2. Escopo funcional
<Descreva quem usa o processo e o que o formulário permite fazer...>

## 3. Resumo executivo do fluxo
<Para cada tipo de solicitação identificado, crie uma subseção com lista numerada
das etapas do fluxo, do início ao encerramento. Inclua o BPMN do processo
(workflow/.resources/<nome_do_workflow>.svg).>

## 4. Atores envolvidos
<Liste cada papel/ator identificado...>

## 5. Usuários-chave do levantamento
> Preencher manualmente com os nomes e cargos dos usuários que participaram
> do levantamento, validação e homologação.

## 6. Regras de negócio principais
<Liste as regras de negócio identificadas nos scripts...>

## 7. Campos obrigatórios por tipo
<Para cada tipo de solicitação, liste os campos obrigatórios de validateForm.js...>

## 8. Mapeamento técnico das atividades
| Codigo | Etapa |
|---|---|
| `<código>` | |

## 9. Arquitetura técnica
<Descreva os arquivos principais do projeto e a responsabilidade de cada um.>

### Diagrama de sequência
<Se o processo envolver integração com sistemas externos (API intermediária,
Protheus/RM, webservices), gere um diagrama Mermaid mostrando o fluxo completo
de ida e volta entre os sistemas. Use como base os pontos de chamada
identificados nos datasets e nos scripts de workflow (ex: beforeTaskSave,
afterTaskSave, chamadas DatasetFactory/HTTPRequest a sistemas externos).
Se o processo NÃO tiver integração externa relevante, omita esta subseção.>

\`\`\`mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Fluig (Workflow)
    participant A as <nome da API/integração, se houver>
    participant P as <sistema externo, ex: Protheus/RM>

    U->>F: <ação que inicia o processo>
    F->>F: <validação interna, se houver>
    F->>A: <chamada — dataset ou script de workflow que dispara>
    A->>P: <chamada ao sistema externo>
    P-->>A: <retorno>
    A-->>F: <resposta tratada>
    F-->>U: <resultado / notificação>

    alt Erro na integração
        P-->>A: <erro>
        A-->>F: <payload de erro>
        F-->>U: <alerta de falha>
    end
\`\`\`

### Formulário
<Localização, painéis existentes e responsabilidade geral.>

### Script principal do formulário
<Localização e responsabilidades de alto nível.>

### Eventos do formulário
| Arquivo | O que faz |
|---|---|
| `events/validateForm.js` | <descrição> |
| `events/displayFields.js` | <descrição> |
| `events/enableFields.js` | <descrição> |
| `events/inputFields.js` | <descrição> |
| `events/setEnable.js` | <descrição> |
| `events/afterSaveNew.js` | <descrição> |
| `events/afterProcessing.js` | <descrição> |
| `events/beforeProcessing.js` | <descrição> |
<Omita os que não existirem no projeto.>

### Scripts de workflow
| Arquivo | O que faz |
|---|---|
| `workflow/scripts/beforeTaskSave.js` | <descrição> |
| `workflow/scripts/afterTaskSave.js` | <descrição> |
| ... (demais scripts listados no Passo 1) | <descrição> |
<Omita os que não existirem no projeto.>

### Datasets
<Liste cada dataset em datasets/ com caminho e finalidade.>

## 10. Campos hidden de controle
| Campo | Finalidade |
|---|---|
| `<nome>` | |

## 11. Datasets e integrações usados
<Para cada dataset, crie uma subseção com nome, caminho, finalidade. Se for
dataset com múltiplos tipos de consulta (constraint `tipo`), documente cada
tipo em tabela:>

| `tipo` | Tabela(s) consultada(s) | Colunas retornadas | Uso no formulário |
|---|---|---|---|
| `<valor>` | `<tabela>` | `<col1>, <col2>` | <onde é usado> |

<Explique o mecanismo de constraint e inclua um exemplo de uso em JS para o
tipo mais complexo. Se conectar via JDBC, informe datasource, banco de
destino e observações de segurança.>

## 12. Dependências externas (frontend)
| Biblioteca | Finalidade |
|---|---|
| `<nome>` | |

## 13. Regras técnicas de roteamento
<Documente as regras do beforeTaskSave.js: transições, campos obrigatórios
por transição, bloqueios por tipo. Agrupe por atividade de origem.>

## 14. Persistências adicionais no workflow
<Documente o que afterTaskSave.js e afterProcessCreate.js persistem.>

## 15. Comportamento de interface relevante
<Documente comportamentos visuais/interativos não óbvios: preenchimento
automático, importação de planilha, cálculo automático, etc.>

## 16. Pontos de atenção para manutenção
<Riscos e armadilhas: lógica duplicada, código comentado reativável,
dependências externas críticas, campos que crescem indefinidamente.>

## 17. Melhorias futuras
<Funcionalidades inacabadas ou comentadas no código.>

## 18. Responsável pelo desenvolvimento
- <nome> - <cargo>
- Versão da documentação: 1.0.0
- Data da atualização desta documentação: <data de hoje DD/MM/AAAA>

### Histórico de versões da documentação
| Versão | Data | Descrição |
|---|---|---|
| 1.0.0 | | Versão inicial gerada automaticamente |
```

## Instruções finais

Escreva em português brasileiro. Seja preciso: cite nomes reais de funções, IDs de campos, nomes de datasets e caminhos de arquivos encontrados no código. Não invente atividades, campos ou regras que não estejam no código. Se um campo hidden aparecer apenas no HTML mas não for referenciado no script, registre-o assim mesmo — pode ser usado pelo workflow. Se o projeto tiver múltiplos formulários, documente ambos na seção 9, mas foque as demais seções no formulário principal do processo.

Ao terminar, informe ao usuário o caminho do arquivo gerado e destaque os pontos que precisam de preenchimento manual (seção 5 e dados do responsável na seção 18).
