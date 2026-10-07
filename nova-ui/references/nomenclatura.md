# Nomenclatura dos artefatos Fluig (NRO)

Mesma regra que a skill **01 · Validação de nomenclatura** confere antes do deploy.

## Estrutura

`<prefixo>_<rota###>_<nomeCamelCase>` — três partes separadas por `_`. Depois do código do projeto não entra mais nenhum `_`.

| Artefato | Prefixo | Padrão | Exemplos |
|---|---|---|---|
| Dataset | `ds_` | `ds_rota###_nomeDoDataset` · `ds_global_nomeDoDataset` | `ds_rota005_buscaUsuario`, `ds_global_buscaColaborador` |
| Formulário | `fm_` | `fm_rota###_nomeDoFormulario` | `fm_rota007_movimentacaoDePessoal` |
| Workflow | `wf_` | `wf_rota###_nomeDoProjeto` | `wf_rota004_aditivoDeContrato` |
| Grupo | `gp_` | `gp_rota###_descricaoGrupo` | `gp_rota002_analistasRH` |
| Página | `pg_` | `pg_rota###_nomeDaPagina` | `pg_rota003_painelDeIndicadores` |
| Papel | `pp_` | `pp_rota###_nomeDoPapel` | `pp_rota003_aprovadorFinanceiro` |

## Regras

- Projeto: `rota` + exatamente 3 dígitos com zeros à esquerda (`rota001`, `rota012`).
- Nome em camelCase (primeira palavra minúscula); siglas podem ficar maiúsculas (`analistasRH`).
- Sem acento, espaço, hífen, símbolo ou `_` depois do código.
- **Só dataset pode ser global**: `ds_global_nome` para dataset usado em vários projetos.

## Errado → certo

| Errado | Problema | Certo |
|---|---|---|
| `ds_rota5_buscaUsuario` | código com 1 dígito | `ds_rota005_buscaUsuario` |
| `ds_rota005_busca_usuario` | underscore no nome | `ds_rota005_buscaUsuario` |
| `fm_rota007_MovimentaçãoPessoal` | acento e inicial maiúscula | `fm_rota007_movimentacaoPessoal` |
| `dataset_rota005_busca` | prefixo errado | `ds_rota005_busca` |
| `fm_global_cadastroFornecedor` | só dataset pode ser global | `fm_rota###_cadastroFornecedor` |

Quando o código do projeto não for informado, use `rota###` e peça o número numa linha.
