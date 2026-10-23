# Integrações — NOVAUI.integration

Funções que conversam com sistemas e dados (sem relação com layout). Ficam em `integrations.js`, registradas em `NOVAUI.integration`. Código atual: `fonte/integrations.js`.

| Categoria | Objeto | Para quê |
|---|---|---|
| Datasets | `NOVAUI.integration.datasets` | Consultas a datasets (DatasetFactory), filtros, conversão do resultado |
| Protheus | `NOVAUI.integration.protheus` | APIs REST do Protheus: consultas, inclusões, tratamento de erro |
| RM | `NOVAUI.integration.rm` | Dataserver e SQL do RM: integrantes, folha, ponto |
| Fluig | `NOVAUI.integration.fluig` | Usuário logado, processos, tarefas, GED, anexos |
| Utilitários | `NOVAUI.integration.util` | Formatação, datas, conversões |

**Situação atual:** `integrations.js` já vem no fim do `nova-ui.min.js`: **não inclua outro arquivo** no formulário. O formulário que chamar `NOVAUI.integration.*` precisa do `/webdesk/vcXMLRPC.js` (cria o `DatasetFactory`). Sem ele, as funções devolvem `status: false`. Antes de usar uma função, confira em `fonte/integrations.js` se ela existe. Se não existir, não invente a chamada: escreva a função no formulário (ou proponha incluí-la em `integrations.js`) e documente com o modelo abaixo.

## Funções disponíveis

### `NOVAUI.integration.rm.searchLeader(searchParam, request)`

Dados do solicitante no RM e a hierarquia acima dele (líder, supervisor, coordenador, gerente, diretor, presidente). Dataset `ds_global_executeQueryRm`. Síncrona.

- `searchParam`: matrícula (chapa) do solicitante.
- `request`: `'solic'` (só o solicitante) · `'all'` (L0 a L5) · um ou mais cargos (`'GERENTE'`, `'COORDENADOR,DIRETOR'` ou lista) — devolve o solicitante e o primeiro líder de cada cargo pedido, ou o próximo acima.
- **Retorna string JSON** → use `JSON.parse`. `{ status: true, data }` ou `{ status: false, message }`.
  - `'solic'`: `data = { nameSolic, funcSolic, directLeader, secaoSolic, chapaSolic }`
  - `'all'`: `data = { 'DADOS-SOLIC': {...}, L0…L5: { DENOMINATION, NOME, MATRICULA, FUNCAO, SECAO, LIDER } }` (nível ausente: `NOME: null`)
  - cargos: `data = [ DADOS-SOLIC, líder, … ]`
- Matrícula inexistente, ou cadeia com "Líder" e algum nível faltando acima, devolve `status: false`. Sempre trate `status`.

```js
var resp = JSON.parse(NOVAUI.integration.rm.searchLeader('004871', 'GERENTE'));
if (!resp.status) {
  NOVAUI.toast({ type: 'error', message: 'Gestor não encontrado.' });
  return;
}
var gerente = resp.data[1];   // resp.data[0] é o DADOS-SOLIC
```

### `NOVAUI.integration.rm.searchTeam(chapa, request)`

Equipe de um líder. Dataset `ds_rota009_buscaLiderados`. Síncrona.

- `chapa`: matrícula do líder.
- `request`: `'all'` (árvore completa, cada membro com `EQUIPE`) ou outro valor (só os diretos).
- **Retorna objeto** (sem `JSON.parse`): `{ status: true, data: { LEADER: { nome, funcao, chapa, secao, codigoLider }, EQUIPE: [ { CHAPA, NOME, FUNCAO, SECAO, CODIGO_LIDER, EQUIPE } ] } }` ou `{ status: false, message }` (`'Líder não encontrado'` ou a pilha do erro).
- Erros do dataset voltam como `{ status: false, message }` (tem `try/catch` interno). Com `'all'` faz uma consulta por pessoa; use loader.

```js
var resp = NOVAUI.integration.rm.searchTeam('004871', 'all');
if (!resp.status) {
  NOVAUI.toast({ type: 'warning', message: 'Não foi possível buscar a equipe.' });
  return;
}
$.each(resp.data.EQUIPE, function (i, membro) { /* … */ });
```

O código dessas duas funções é da equipe (com ajustes pontuais em 14/10/2026): não reescreva nem simplifique ao usar; só chame pela API.

## Criar uma função

```js
/**
 * Busca integrantes no RM pela matrícula ou pelo nome.
 * @param {string} termo matrícula (6 dígitos) ou parte do nome
 * @param {object} [opcoes]
 * @param {boolean} [opcoes.somenteAtivos=true]
 * @returns {Promise<Array<{matricula, nome, setor, cargo}>>}
 */
NOVAUI.integration.rm.buscarIntegrante = function (termo, opcoes) {
  // código da função
};
```

Uso:

```js
NOVAUI.integration.rm.buscarIntegrante('004871')
  .then(function (lista) { /* … */ })
  .catch(function (erro) { NOVAUI.toast({ type: 'error', message: erro.message }); });
```

## Modelo de documentação (seção Integrações do showcase)

Para cada função: nome completo, descrição, categoria, dataset/API de que depende, onde é usada, tabela de parâmetros (nome, tipo, obrigatório, descrição), retorno, código, exemplo de uso, observações (erros conhecidos, limites, permissões, tempo médio), data de atualização e responsável. Atualize também o índice de funções.
