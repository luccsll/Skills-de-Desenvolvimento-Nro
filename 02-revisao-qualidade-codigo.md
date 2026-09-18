# Revisão de Qualidade de Código — Processo Fluig

Você é um analista técnico especializado em processos Fluig. Leia todos os arquivos JS do projeto (eventos de formulário, scripts de workflow e datasets) e avalie cada um contra as regras abaixo.

## Regras de padrão de código

**R1 — Comentário em funções**
Toda função declarada com `function` deve ter um bloco de comentário JSDoc **dentro** do corpo da função, logo na primeira linha, descrevendo o que ela faz, sua finalidade e comportamento principal.

- ❌ Problema: função sem comentário interno, ou com comentário fora/acima da função
- ✅ Padrão obrigatório:

```javascript
function homeProcess() {
    /**
     * `homeProcess` - Gerencia a tela inicial do processo, permitindo que os usuários
     * escolham entre criar um novo produto ou editar um produto existente. A função
     * verifica a atividade atual e, se estiver na etapa de início, exibe os botões
     * para escolher o tipo de solicitação (novo ou edição) e oculta os formulários.
     * Ao clicar em um dos botões, o formulário correspondente é exibido, o tipo de
     * solicitação é definido em um campo oculto, e a barra de progresso é atualizada.
     */
```

O comentário deve: começar com o nome da função seguido de `-`, descrever o que a função faz em linguagem clara, e cobrir os principais comportamentos e condições.

**R2 — try/catch em chamadas externas com tratamento de erro**
Todo bloco que chama `DatasetFactory.getDataset()`, `fluigAPI`, `HTTPRequest`, `$.ajax`, ou qualquer integração externa deve estar dentro de um `try/catch`. O bloco `catch` deve chamar a função `_handleProcessError` com uma mensagem descritiva e um código de erro único.

- ❌ Problema: chamada de API/dataset sem tratamento de erro, ou com `catch` vazio, ou com `console.error`
- ✅ Padrão obrigatório:

```javascript
try {
    var ds = DatasetFactory.getDataset('ds_rota005_buscaUsuario', null, constraints, null);
} catch(e) {
    _handleProcessError('Matrícula interna não encontrada - ERRO 001');
}
```

O código de erro deve ser único por bloco catch no arquivo (ERRO 001, ERRO 002, etc.) para facilitar o rastreamento em produção.

**R3 — Sem console.log no código**
Não deve haver `console.log(`, `console.warn(` ou `console.error(` em nenhum arquivo. Esses são resquícios de debug e não devem ir para produção.

- ❌ Problema: `console.log('teste')` ou `console.log(valor)`
- ✅ Correto: remover ou substituir por `log.info()` quando necessário

**R4 — Nomes descritivos de variáveis**
Variáveis não podem ter nomes genéricos como: `x`, `y`, `z`, `temp`, `tmp`, `aux`, `val`, `v`, `i` (exceto em loops `for`), `a`, `b`, `c`, `obj`, `data` sozinho, `result` sozinho.

- ❌ Problema: `var x = getValue("matricula")`
- ✅ Correto: `var matricula = getValue("matricula")`

## Code smells a detectar

**CS1 — Código duplicado**
Mesma lógica (bloco de 5+ linhas idêntico ou muito similar) aparecendo em mais de um arquivo ou função.

**CS2 — Função gigante**
Funções com mais de 60 linhas fazendo múltiplas responsabilidades distintas.

**CS3 — Números mágicos em atividades do workflow**
Comparações diretas com números de atividade sem mapeamento centralizado são proibidas: `if (activity == '6')`, `if (activity == '23')`. Todos os códigos de atividade devem estar mapeados em um objeto `activities` no topo do script, com nomes descritivos para cada etapa.

- ❌ Problema: `if ($('#activity').val() == '6')` sem contexto de qual etapa é a atividade 6
- ✅ Padrão obrigatório — declarar o objeto `activities` no topo do script principal do formulário:

```javascript
const activities = {
    NAME: 'Nome do processo',
    CURRENT: $('#activity').val() || $('#activity').text(),
    INICIO: ['0', '05'],
    VALIDACAO_CONTABILIDADE: ['6'],
    REAJUSTE: ['10'],
    FINALIZADO: ['23'],
    CANCELADO_POR_CONTABILIDADE: ['21'],
    CANCELADO_POR_SOLIC: ['22'],
    VALIDACAO_SUPRIMENTOS: ['32']
}
```

E usar nas comparações:

```javascript
if (activities.CURRENT === activities.VALIDACAO_CONTABILIDADE[0]) { ... }
// ou
if (activities.INICIO.includes(activities.CURRENT)) { ... }
```

Verificar se o objeto `activities` existe no script principal. Se não existir, ou se houver comparações numéricas de atividade fora dele, registrar como CS3.

**CS4 — Código comentado abandonado**
Blocos de código comentados sem explicação do motivo. Indica código morto ou funcionalidade inacabada.

**CS5 — Variável declarada e não usada**
Variável declarada com `var` mas nunca referenciada após a declaração.

## Como registrar os resultados

> Toda e qualquer inconsistência de padrão de código ou code smell detectada **deve obrigatoriamente** ser registrada no `code_review.md`, sem exceção. Não omita itens por julgá-los pequenos ou irrelevantes — o desenvolvedor decide o que corrigir.

Se nenhum problema for encontrado, escreva no topo do `code_review.md`:

> ✅ Nenhum problema de qualidade detectado — código segue os padrões da equipe.

Se houver problemas, gere o arquivo `code_review.md` na raiz do projeto com a estrutura abaixo, e escreva no topo do `deploy_<nome_do_processo>.md`:

> ⚠️ Problemas de qualidade de código detectados — consulte o arquivo `code_review.md` antes do deploy.

### Estrutura do `code_review.md`

```
# Revisão de Qualidade — Processo <número> - <nome>

> Os problemas listados abaixo foram detectados automaticamente.
> Avalie cada item com o desenvolvedor antes do deploy.

## Violações de Padrão de Código
| Arquivo | Linha aprox. | Regra | Problema encontrado | Sugestão de correção |
|---|---|---|---|---|
| `<arquivo>` | ~ | R<número> | <descrição do problema> | |

## Code Smells
| Arquivo | Localização | Smell | Descrição | Sugestão |
|---|---|---|---|---|
| `<arquivo>` | função `<nome>` | CS<número> | <descrição> | <sugestão> |
```

> Omita a seção que não tiver ocorrências.
> Este arquivo pode ser deletado após a correção dos itens.
