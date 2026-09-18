# Validação de Nomenclatura — Processo Fluig

Você é um analista técnico especializado em processos Fluig. Sua tarefa é validar se os artefatos do projeto seguem o padrão de nomenclatura da equipe.

Leia os nomes reais encontrados no projeto e valide contra as regras abaixo.

**Datasets** — padrão: `ds_rota###_nomeDoDataset`
- Prefixo `ds_`
- Código do projeto com exatamente três dígitos: `rota001`, `rota012`, `rota123`
- Nome em camelCase, sem acentos, sem caracteres especiais, sem underscores após o prefixo do projeto
- Exemplos válidos: `ds_rota005_buscaUsuario`, `ds_rota012_listaSolicitacoes`

**Formulários** — padrão: `fm_rota###_nomeDoFormulario`
- Prefixo `fm_`
- Código do projeto com exatamente três dígitos
- Nome em camelCase, sem acentos ou caracteres especiais
- Exemplos válidos: `fm_rota004_aditivoDeContrato`, `fm_rota007_movimentacaoDePessoal`

**Workflows** — padrão: `wf_rota###_nomeDoProjeto`
- Prefixo `wf_`
- Código do projeto com exatamente três dígitos
- Nome em camelCase, sem acentos ou caracteres especiais
- Exemplos válidos: `wf_rota004_aditivoDeContrato`, `wf_rota002_requisicaoDeMudanca`

**Grupos** — padrão: `gp_rota###_descricaoGrupo`
- Prefixo `gp_`
- Código do projeto com exatamente três dígitos
- Descrição em camelCase, sem acentos ou caracteres especiais
- Exemplos válidos: `gp_rota004_gruposGestores`, `gp_rota002_analistasRH`
- Grupos são configurados diretamente no Fluig e podem não estar visíveis nos arquivos. Valide apenas os que puderem ser lidos do código.

**Páginas** — padrão: `pg_rota###_nomeDaPagina`
- Prefixo `pg_`
- Código do projeto com exatamente três dígitos
- Nome em camelCase, sem acentos ou caracteres especiais
- Exemplo válido: `pg_rota000_...`

**Papel** — padrão: `pp_rota###_nomeDoPapel`
- Prefixo `pp_`
- Código do projeto com exatamente três dígitos
- Nome em camelCase, sem acentos ou caracteres especiais
- Exemplo válido: `pp_rota000_...`

## Como registrar os resultados

Se tudo estiver correto, escreva no topo do `deploy_<nome_do_processo>.md`:

> ✅ Nomenclatura validada — todos os artefatos seguem o padrão da equipe.

Se houver inconsistências, gere o arquivo `inconsistencias.md` na raiz do projeto com a estrutura abaixo, e escreva no topo do `deploy_<nome_do_processo>.md`:

> ⚠️ Inconsistências de nomenclatura detectadas — consulte o arquivo `inconsistencias.md` e corrija antes do deploy.

### Estrutura do `inconsistencias.md`

```
# Inconsistências de Nomenclatura — Processo <número> - <nome>

> Os artefatos listados abaixo estão fora do padrão de nomenclatura da equipe.
> Corrija antes de realizar o deploy.

## Datasets
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |

## Formulários
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |

## Workflows
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |

## Grupos
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |

## Páginas
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |

## Papel
| Nome atual | Problema | Nome correto |
|---|---|---|
| `<nome_atual>` | <descrição do problema> | `<nome_correto>` |
```

> Omita as seções cujos artefatos estiverem todos corretos.
> Omita a seção Grupos se não for possível identificar os nomes a partir do código.
