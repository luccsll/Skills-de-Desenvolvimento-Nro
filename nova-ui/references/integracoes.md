# Integrações — NOVAUI.integration

Funções que conversam com sistemas e dados (sem relação com layout). Ficam em `integrations.js`, registradas em `NOVAUI.integration`, que pode ser carregado antes ou depois do `nova-ui.min.js`. Código atual: `fonte/integrations.js`.

| Categoria | Objeto | Para quê |
|---|---|---|
| Datasets | `NOVAUI.integration.datasets` | Consultas a datasets (DatasetFactory), filtros, conversão do resultado |
| Protheus | `NOVAUI.integration.protheus` | APIs REST do Protheus: consultas, inclusões, tratamento de erro |
| RM | `NOVAUI.integration.rm` | Dataserver e SQL do RM: integrantes, folha, ponto |
| Fluig | `NOVAUI.integration.fluig` | Usuário logado, processos, tarefas, GED, anexos |
| Utilitários | `NOVAUI.integration.util` | Formatação, datas, conversões |

**Situação atual:** as categorias estão criadas e vazias. Antes de usar uma função de integração num código entregue, confira em `fonte/integrations.js` se ela existe. Se não existir, não invente a chamada: escreva a função no formulário (ou proponha incluí-la em `integrations.js`) e documente com o modelo abaixo.

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
