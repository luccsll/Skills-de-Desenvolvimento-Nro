# Nova UI — Catálogo de componentes

Gerado a partir do catálogo oficial do showcase (botão "<> Código"). 71 componentes. Todos já vêm em `nova-ui.min.css` / `nova-ui.min.js`; os arquivos-fonte citados servem só para consultar em `references/fonte/`.

## Índice

- **Botões:** [Botão](#botao) · [Botão com ícone](#botao-icone) · [Botão carregando](#botao-carregando) · [Botão com contador](#botao-contador) · [Botões agrupados (segmentado)](#botao-segmentado)
- **Formulário:** [Campo de texto](#campo-texto) · [Campo de busca (ícone e limpar)](#campo-busca) · [Campo com máscara e validação](#campo-mascara) · [Campo preenchido automaticamente](#campo-auto) · [Área de texto com contador](#textarea) · [Código de verificação (OTP / PIN)](#otp) · [Campo numérico com + e −](#stepper-numerico) · [Grid de formulário (12 colunas)](#grid-formulario) · [Grupo de campos (fieldset)](#fieldset) · [Resumo de erros do formulário](#resumo-erros)
- **Seleção:** [Checkbox](#checkbox) · [Radio](#radio) · [Switch (liga/desliga)](#switch) · [Select (lista suspensa)](#select) · [Multi select](#multi-select) · [Combobox (digitar para filtrar)](#combobox) · [Autocomplete (busca em dataset)](#autocomplete) · [Listbox (lista de opções visível)](#listbox) · [Tag (etiqueta)](#tag) · [Tags de filtro](#tag-filtro) · [Campo de tags](#campo-tags)
- **Campos extras:** [Editor de texto (rich text)](#editor-texto) · [Upload de arquivos](#upload) · [Seletor de cor](#cor) · [Slider (controle deslizante)](#slider) · [Avaliação (estrelas)](#avaliacao)
- **Exibição de dados:** [Badge (status)](#badge) · [Tabela](#tabela) · [Avatar](#avatar) · [Indicador (stat / KPI)](#stat) · [Card](#card) · [Card com foto (produto)](#card-produto) · [Lista (list item)](#lista) · [Lista de descrição (dados)](#lista-descricao) · [Accordion](#accordion) · [Timeline (histórico)](#timeline) · [Árvore (tree view)](#arvore) · [Kanban](#kanban) · [Calendário](#calendario) · [Data grid (tabela editável)](#data-grid) · [Barra de progresso](#progresso)
- **Navegação:** [Breadcrumb (trilha)](#breadcrumb) · [Abas (tabs)](#abas) · [Paginação](#paginacao) · [Stepper (etapas)](#stepper) · [Menu suspenso (dropdown)](#menu) · [Menu de contexto (botão direito)](#menu-contexto)
- **Experiência:** [Estado vazio / erro / sucesso](#estado-vazio) · [Alerta (aviso na página)](#alerta) · [Banner (faixa no topo)](#banner) · [Confirmação](#confirmacao) · [Tooltip e ajuda (?)](#tooltip) · [Coachmark (novidade)](#coachmark) · [Tour guiado](#tour) · [Painel de ajuda](#painel-ajuda) · [FAQ (perguntas frequentes)](#faq) · [Onboarding (primeiros passos)](#onboarding) · [Página 404 / 403 / 500 / manutenção](#pagina-erro)
- **Sobreposições:** [Toast (aviso rápido)](#toast) · [Modal](#modal) · [Drawer (painel lateral)](#drawer)
- **Carregamento:** [Loader sobre um elemento](#loader-overlay) · [Tela de abertura (widget)](#tela-abertura) · [Spinner e pontos](#spinner) · [Skeleton](#skeleton) · [Barra de carregamento no topo](#barra-topo)

---

# Botões

<a id="botao"></a>
## Botão

`key: botao` · palavras-chave: button primario secundario · fonte CSS: buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<button type="button" class="btn btn--primary">Salvar</button>
<button type="button" class="btn btn--secondary">Cancelar</button>
<button type="button" class="btn btn--tertiary">Ver detalhes</button>
<button type="button" class="btn btn--danger">Excluir</button>

<!-- variantes: --primary --secondary --tertiary --ghost --success --danger
     --secondary-danger --soft-info --soft-success --soft-warning --soft-danger
     tamanhos: --sm --lg · largura total: --block -->
```

**Classes**

Combine uma variante, um tamanho e, se quiser, largura total.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.btn--primary` | — | — | Ação principal da tela. Use uma por área. |
| `.btn--secondary` | — | — | Ação secundária, com borda. |
| `.btn--tertiary` | — | — | Ação discreta, sem borda (ex.: "Ver detalhes"). |
| `.btn--ghost` | — | — | Sem fundo nem borda, para barras e listas. |
| `.btn--success` | — | — | Confirma algo positivo (ex.: "Aprovar"). |
| `.btn--danger · .btn--danger-solid` | — | — | Ação destrutiva. "solid" para a confirmação final. |
| `.btn--secondary-danger` | — | — | Destrutiva secundária, com borda vermelha. |
| `.btn--soft-info · -success · -warning · -danger` | — | — | Fundo suave colorido, para ações de status. |
| `.btn--sm · .btn--lg` | — | médio | Tamanho do botão. |
| `.btn--block` | — | — | Ocupa a largura toda do container. |
| `disabled` | atributo | — | Desabilita o botão. |

<a id="botao-icone"></a>
## Botão com ícone

`key: botao-icone` · palavras-chave: button icon icone · fonte CSS: buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<button type="button" class="btn btn--primary">
  <span class="icon" aria-hidden="true">save</span><span>Salvar</span>
</button>

<!-- só ícone: aria-label obrigatório -->
<button type="button" class="btn btn--secondary btn--icon" aria-label="Exportar">
  <span class="icon" aria-hidden="true">download</span>
</button>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `<span class="icon">nome</span>` | nome do Material Symbols | — | Ícone antes do texto. O nome vem do catálogo Material Symbols Rounded. |
| `.btn--icon` | — | — | Botão só com ícone (quadrado). Exige aria-label. |
| `aria-label` | texto | — | Obrigatório no botão só com ícone: é o que o leitor de tela fala. |

<a id="botao-carregando"></a>
## Botão carregando

`key: botao-carregando` · palavras-chave: button loading spinner · fonte CSS: buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<button type="button" class="btn btn--primary is-loading" aria-busy="true">
  <span>Salvando</span>
</button>
```

**Uso pelo JavaScript**

```js
botao.classList.add('is-loading');   // ao terminar: remove('is-loading')
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.is-loading` | — | — | Mostra o spinner no lugar do conteúdo e bloqueia novos cliques. |
| `aria-busy="true"` | — | — | Avisa o leitor de tela que a ação está em andamento. |

<a id="botao-contador"></a>
## Botão com contador

`key: botao-contador` · palavras-chave: button badge contador notificacao · fonte CSS: buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<button type="button" class="btn btn--tertiary btn--icon" aria-label="Notificações, 3 novas">
  <span class="icon" aria-hidden="true">notifications</span>
  <span class="btn__badge">3</span>
</button>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.btn__badge` | número | — | Contador no canto do botão (ex.: notificações novas). |

<a id="botao-segmentado"></a>
## Botões agrupados (segmentado)

`key: botao-segmentado` · palavras-chave: button group segmented toggle grupo · fonte CSS: buttons.css, choices.css · fonte JS: choices.js

**HTML base**

```html
<div class="btn-segmented" role="group" aria-label="Visualização">
  <button type="button" class="btn btn--secondary btn--toggle" aria-pressed="true">Lista</button>
  <button type="button" class="btn btn--secondary btn--toggle" aria-pressed="false">Cards</button>
</div>
```

**Uso pelo JavaScript**

```js
// .btn--toggle alterna aria-pressed sozinho (choices.js) e dispara nova:toggle
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.btn-segmented` | — | — | Agrupa botões lado a lado, unidos. |
| `.btn--toggle` | — | — | Botão que fica pressionado/solto. |
| `aria-pressed` | "true" \| "false" | "false" | Estado do botão. O JS alterna sozinho e dispara nova:toggle. |
| `data-toggle-group` | — | — | No grupo: desliga a alternância automática, para você controlar qual fica ativo. |

---

# Formulário

<a id="campo-texto"></a>
## Campo de texto

`key: campo-texto` · palavras-chave: input field text campo · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="field field--required">
  <div class="field__control">
    <div class="field__body">
      <label class="field__label" for="nome">Nome</label>
      <input class="field__input" id="nome" name="nome" type="text" placeholder="Nome completo">
    </div>
  </div>
  <div class="field__footer">
    <p class="field__message">Como está no documento.</p>
  </div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.field.setState({ target: '#nome', type: 'error', message: 'Informe o nome.' });
// type: 'error' | 'success' | 'warning' | null
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.field--required` | — | — | Mostra o asterisco no rótulo. |
| `.field--compact` | — | — | Versão mais baixa do campo. |
| `.field--w-xs … .field--w-xl · .field--w-full` | — | full | Largura máxima do campo. |
| `.field--error · --success · --warning` | — | — | Estado visual (o JS aplica com setState). |
| `maxlength` | número | — | Limite de caracteres. Com .field__counter mostra "12 / 60". |
| `readonly · disabled` | atributo | — | Somente leitura / desabilitado. |

**NOVAUI.field.setState(opções)**

Muda o estado visual e a mensagem do campo.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | O .field ou o input. |
| `type` | 'error' \| 'success' \| 'warning' \| null | null | Estado. null volta ao normal. |
| `message` | texto | — | Mensagem embaixo do campo. Sem mensagem, só muda a cor. |

**Outras funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.field.clear(target)` | — | — | Limpa o valor e dispara input/change. |
| `NOVAUI.field.refresh(root)` | — | document | Recalcula contador, máscaras e estado de valor em HTML novo. |

<a id="campo-busca"></a>
## Campo de busca (ícone e limpar)

`key: campo-busca` · palavras-chave: input search busca icon limpar clear · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="field">
  <div class="field__control">
    <span class="field__icon"><span class="icon" aria-hidden="true">search</span></span>
    <div class="field__body">
      <label class="field__label" for="busca">Buscar integrante</label>
      <input class="field__input" id="busca" type="search" placeholder="Nome, matrícula ou CPF">
    </div>
    <div class="field__actions">
      <button type="button" class="field__clear" aria-label="Limpar campo"><span class="icon" aria-hidden="true">close</span></button>
    </div>
  </div>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.field__icon` | — | — | Ícone à esquerda dentro do campo. |
| `.field__actions + .field__clear` | — | — | Botão "×" que aparece com valor e limpa o campo. |
| `.field__addon` | — | — | Bloco fixo antes ou depois do campo (ex.: "R$", botão de busca). |

<a id="campo-mascara"></a>
## Campo com máscara e validação

`key: campo-mascara` · palavras-chave: mask mascara cpf cnpj cep telefone placa moeda validacao · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="field">
  <div class="field__control">
    <div class="field__body">
      <label class="field__label" for="cpf">CPF</label>
      <input class="field__input" id="cpf" name="cpf" data-mask="cpf" data-validate="cpf">
    </div>
  </div>
  <div class="field__footer"><p class="field__message"></p></div>
</div>

<!-- data-mask: cpf | cnpj | cpf-cnpj | cep | phone | date | time | placa | currency
     data-validate: cpf | cnpj | email | phone | cep | date | url | required -->
```

**Uso pelo JavaScript**

```js
NOVAUI.field.validate('#cpf');   // true | false
NOVAUI.field.unmask('#cpf');    // valor sem pontos e traço
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-mask` | cpf \| cnpj \| cpf-cnpj \| cep \| phone \| date \| time \| datetime \| placa \| currency \| padrão próprio | — | Formata enquanto digita. Padrão próprio: 9 = dígito, A = letra, * = qualquer. |
| `data-decimals` | número | 2 | Casas decimais da máscara currency. |
| `data-validate` | cpf \| cnpj \| cpf-cnpj \| email \| phone \| cep \| date \| url \| required | — | Valida ao sair do campo. Pode combinar separando por espaço. |
| `data-error-message` | texto | mensagem padrão | Troca a mensagem de erro da validação. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.field.validate(target)` | — | — | Aplica data-validate agora. Devolve true/false. |
| `NOVAUI.field.unmask(target)` | — | — | Valor sem máscara. Em currency devolve número. |
| `NOVAUI.field.isCPF(v) · isCNPJ(v)` | texto | — | Confere um CPF/CNPJ sem precisar de campo. |

<a id="campo-auto"></a>
## Campo preenchido automaticamente

`key: campo-auto` · palavras-chave: automatico autofill preenchido sozinho somente leitura dataset · fonte CSS: inputs.css, ux.css · fonte JS: inputs.js, ux.js

**HTML base**

```html
<div class="field form-col-12 form-col-md-3">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="cod-operador">Código do operador</label>
    <input class="field__input" id="cod-operador" name="cod-operador">
  </div></div>
</div>

<!-- preenchido pelo sistema: .field--auto + data-auto-from (aparece no tooltip) -->
<div class="field field--auto form-col-12 form-col-md-6" data-auto-from="Código do operador">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="nome-operador">Nome</label>
    <input class="field__input" id="nome-operador" name="nome-operador" readonly placeholder="Preenchido ao informar o código">
  </div></div>
</div>
```

**Uso pelo JavaScript**

```js
// quando o dataset responder
NOVAUI.field.autofill('#nome-operador', 'Marcos Paulo Ferreira');   // preenche e destaca
NOVAUI.field.autofill('#nome-operador', '');                        // limpa
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.field--auto` | — | — | Marca o campo como preenchido pelo sistema: borda tracejada, fundo verde-água e ícone ⚡. |
| `data-auto-from` | texto | — | De onde vem o valor. Aparece no tooltip do ícone (ex.: "Código do operador"). |
| `readonly` | atributo | aplicado pelo JS | O campo fica sempre somente leitura. |

**NOVAUI.field.autofill(target, valor)**

Preenche o campo e destaca por um instante.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | O campo .field--auto ou o input. |
| `valor` | texto | — | Valor a mostrar. Texto vazio limpa o campo. |

<a id="textarea"></a>
## Área de texto com contador

`key: textarea` · palavras-chave: textarea contador maxlength · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="field field--textarea">
  <div class="field__control">
    <div class="field__body">
      <label class="field__label" for="obs">Observação</label>
      <textarea class="field__input" id="obs" name="obs" maxlength="500"></textarea>
    </div>
  </div>
  <div class="field__footer">
    <p class="field__message">Opcional.</p>
    <span class="field__counter" aria-live="polite"></span>
  </div>
</div>
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.field--textarea` | — | — | Ajusta o campo para várias linhas. |
| `maxlength` | número | — | Limite de caracteres. |
| `.field__counter` | — | — | Mostra o contador "atual / máximo". |

<a id="otp"></a>
## Código de verificação (OTP / PIN)

`key: otp` · palavras-chave: otp pin codigo verificacao · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div aria-label="Código de verificação" class="otp" data-otp="numeric" id="otp-demo" role="group">
  <input class="otp__input" type="text">
  <input class="otp__input" type="text">
  <input class="otp__input" type="text">
  <span aria-hidden="true" class="otp__sep"></span>
  <input class="otp__input" type="text">
  <input class="otp__input" type="text">
  <input class="otp__input" type="text">
  <input class="otp__value" name="codigo" type="hidden">
</div>
```

**Uso pelo JavaScript**

```js
document.querySelector('#otp-demo').addEventListener('nova:otp-complete', e => console.log(e.detail.value));
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-otp` | numeric \| alnum | numeric | Aceita só números ou letras e números. |
| `.otp__input (repetido)` | — | — | Uma caixa por dígito. A quantidade define o tamanho do código. |
| `.otp__value` | input hidden | — | Recebe o código completo (é o que o Fluig grava). |

**NOVAUI.field.otp.setState(opções)**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | O .otp. |
| `type` | 'error' \| 'success' \| null | null | Erro faz as caixas tremerem; sucesso deixa verdes. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:otp-complete` | { value } | — | Disparado quando todas as caixas estão preenchidas. |

<a id="stepper-numerico"></a>
## Campo numérico com + e −

`key: stepper-numerico` · palavras-chave: stepper numero quantidade incrementar · fonte CSS: inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="stepper-input">
  <button aria-label="Diminuir" class="stepper-input__btn" data-step="-1" type="button">
    <span aria-hidden="true" class="icon">remove</span>
  </button>
  <input class="stepper-input__value" id="t-qtd" max="10" min="1" step="1" type="number" value="2">
  <button aria-label="Aumentar" class="stepper-input__btn" data-step="1" type="button">
    <span aria-hidden="true" class="icon">add</span>
  </button>
</div>
```

**Atributos HTML**

No input .stepper-input__value.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `min · max` | número | — | Limites. Os botões + e − desativam nos extremos. |
| `step` | número | 1 | Quanto cada clique soma ou subtrai. |
| `data-step (nos botões)` | -1 \| 1 | — | Direção de cada botão. |

<a id="grid-formulario"></a>
## Grid de formulário (12 colunas)

`key: grid-formulario` · palavras-chave: grid form layout colunas form-col · fonte CSS: form.css, inputs.css · fonte JS: inputs.js

**HTML base**

```html
<div class="form-grid">
  <div class="field form-col-12 form-col-md-6">
    <div class="field__control"><div class="field__body">
      <label class="field__label" for="f1">Nome</label>
      <input class="field__input" id="f1" name="nome">
    </div></div>
  </div>
  <div class="field form-col-12 form-col-md-6">
    <div class="field__control"><div class="field__body">
      <label class="field__label" for="f2">E-mail</label>
      <input class="field__input" id="f2" name="email" type="email">
    </div></div>
  </div>
</div>

<!-- colunas: form-col-1 a 12, com prefixos -sm- -md- -lg- -xl- -->
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.form-grid` | — | — | Container de 12 colunas com espaçamento entre campos. |
| `.form-col-1 … .form-col-12` | — | 12 | Quantas colunas o campo ocupa. |
| `.form-col-sm- · -md- · -lg- · -xl-` | — | — | Largura a partir de cada tamanho de tela (576, 768, 992, 1200 px). |

<a id="fieldset"></a>
## Grupo de campos (fieldset)

`key: fieldset` · palavras-chave: fieldset legend grupo secao formulario · fonte CSS: form.css · fonte JS: — (só CSS)

**HTML base**

```html
<fieldset class="fieldset">
  <legend class="fieldset__legend">Dados do integrante</legend>
  <p class="form-description">Preenchido a partir do RM.</p>
  <div class="form-grid">
    <!-- campos -->
  </div>
</fieldset>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.fieldset__legend` | — | — | Título do grupo. |
| `.form-description` | — | — | Explicação abaixo do título. |
| `.fieldset--bordered` | — | — | Moldura em volta do grupo. |

<a id="resumo-erros"></a>
## Resumo de erros do formulário

`key: resumo-erros` · palavras-chave: erro validacao resumo summary · fonte CSS: form.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="form-error-summary" hidden id="ex-erros" role="alert" tabindex="-1">
  <span class="form-error-summary__icon"><span aria-hidden="true" class="icon">error</span></span>
  <div>
    <p class="form-error-summary__title">Corrija os campos abaixo para enviar</p>
    <ul class="form-error-summary__list" id="ex-erros-list"></ul>
  </div>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.form-error-summary` | — | hidden | Caixa de erros no topo do formulário. Mostre ao enviar com erros. |
| `.form-error-summary__list > li > a[href="#id"]` | — | — | Um link por erro, levando ao campo. |

---

# Seleção

<a id="checkbox"></a>
## Checkbox

`key: checkbox` · palavras-chave: checkbox check marcar · fonte CSS: choices.css · fonte JS: choices.js

**HTML base**

```html
<label class="check">
  <input type="checkbox" class="check__input" name="aceite">
  <span class="check__label">Li e aceito o termo</span>
</label>
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.check--sm` | — | — | Versão menor. |
| `.check--card` | — | — | Opção em formato de cartão, com título e descrição. |
| `.check__desc` | — | — | Texto de apoio abaixo do rótulo. |
| `data-check-all="grupo"` | texto | — | No checkbox "marcar todos": controla os do mesmo grupo e mostra estado parcial. |
| `data-check-group="grupo"` | texto | — | Nos checkboxes controlados. |

<a id="radio"></a>
## Radio

`key: radio` · palavras-chave: radio opcao escolha · fonte CSS: choices.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="check-group" role="radiogroup" aria-label="Tipo de acesso">
  <label class="check"><input type="radio" class="check__input" name="tipo" value="perm" checked><span class="check__label">Permanente</span></label>
  <label class="check"><input type="radio" class="check__input" name="tipo" value="temp"><span class="check__label">Temporário</span></label>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.check-group` | — | — | Agrupa as opções (use role="radiogroup"). |
| `name` | texto | — | Mesmo name em todas as opções do grupo. |
| `.check--card` | — | — | Opção em formato de cartão. |

<a id="switch"></a>
## Switch (liga/desliga)

`key: switch` · palavras-chave: switch toggle liga desliga · fonte CSS: choices.css · fonte JS: — (só CSS)

**HTML base**

```html
<label class="switch">
  <input type="checkbox" role="switch" class="switch__input" name="notificar">
  <span class="switch__text">Receber notificações</span>
</label>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.switch--sm` | — | — | Versão menor. |
| `.switch--row` | — | — | Rótulo à esquerda e switch à direita, ocupando a linha. |
| `.switch--success` | — | — | Verde quando ligado. |
| `.switch__desc` | — | — | Texto de apoio. |

<a id="select"></a>
## Select (lista suspensa)

`key: select` · palavras-chave: select dropdown lista suspensa combo · fonte CSS: inputs.css, choices.css · fonte JS: inputs.js, choices.js

**HTML base**

```html
<div class="field field--select">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="setor">Setor</label>
    <select class="field__input" id="setor" name="setor" data-enhance data-search>
      <option value="">Selecione</option>
      <option value="rh">Recursos Humanos</option>
      <option value="ti">Tecnologia da Informação</option>
    </select>
  </div></div>
</div>

<!-- sem data-enhance: select nativo com o mesmo visual -->
```

**Uso pelo JavaScript**

```js
NOVAUI.select.setValue('#setor', 'ti');
NOVAUI.select.refresh('#setor');   // depois de mudar as options via JS
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-enhance` | — | — | Troca o visual pelo select da Nova UI. O <select> original continua recebendo o valor. |
| `data-search` | — | — | Mostra campo de busca dentro da lista. |
| `data-placeholder` | texto | "Selecione" | Texto quando nada foi escolhido. |
| `data-search-placeholder` | texto | "Buscar…" | Texto do campo de busca. |
| `option data-desc · data-meta · data-keywords` | texto | — | Linha de apoio, informação à direita e palavras extras para a busca. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.select.setValue(target, valor)` | texto \| lista | — | Escolhe o valor pelo código e dispara change. |
| `NOVAUI.select.refresh(target)` | — | todos | Atualiza depois de mudar as <option> pelo JS. |
| `NOVAUI.select.close()` | — | — | Fecha a lista aberta. |

<a id="multi-select"></a>
## Multi select

`key: multi-select` · palavras-chave: multiplo select chips varios · fonte CSS: inputs.css, choices.css · fonte JS: inputs.js, choices.js

**HTML base**

```html
<div class="field field--select">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="sistemas">Sistemas</label>
    <select class="field__input" id="sistemas" name="sistemas" multiple data-enhance data-search data-max-chips="3">
      <option value="protheus">Protheus</option>
      <option value="rm">RM</option>
      <option value="fluig">Fluig</option>
    </select>
  </div></div>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `multiple` | — | — | Permite escolher vários. |
| `data-max-chips` | número | 3 | Quantos itens aparecem antes do "+N". |
| `data-search` | — | — | Mostra campo de busca dentro da lista. |
| `data-placeholder` | texto | "Selecione" | Texto quando nada foi escolhido. |
| `data-search-placeholder` | texto | "Buscar…" | Texto do campo de busca. |
| `option data-desc · data-meta · data-keywords` | texto | — | Linha de apoio, informação à direita e palavras extras para a busca. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.select.setValue(target, [valores])` | lista | — | Marca vários de uma vez. |

<a id="combobox"></a>
## Combobox (digitar para filtrar)

`key: combobox` · palavras-chave: combobox filtrar digitar · fonte CSS: inputs.css, choices.css · fonte JS: inputs.js, choices.js

**HTML base**

```html
<div class="field field--select">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="cidade">Cidade</label>
    <select class="field__input" id="cidade" name="cidade" data-combobox>
      <option value="cba">Cuiabá</option>
      <option value="vg">Várzea Grande</option>
      <option value="roo">Rondonópolis</option>
    </select>
  </div></div>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-combobox` | — | — | Transforma o select num campo de digitar com sugestões. Só aceita valores da lista. |
| `data-placeholder` | texto | "Digite para buscar" | Texto do campo vazio. |

<a id="autocomplete"></a>
## Autocomplete (busca em dataset)

`key: autocomplete` · palavras-chave: autocomplete dataset busca sugestao · fonte CSS: inputs.css, choices.css · fonte JS: inputs.js, choices.js

**HTML base**

```html
<div class="field">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="integrante">Integrante</label>
    <input class="field__input" id="integrante" placeholder="Nome ou matrícula">
    <input type="hidden" id="matricula" name="matricula">
  </div></div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.select.autocomplete('#integrante', {
  minChars: 2,
  valueInput: '#matricula',
  source: function (termo, done) {
    // ex.: DatasetFactory.getDataset(...) e depois:
    done([{ value: '004871', label: 'Ana Beatriz Souza', desc: 'Analista de RH' }]);
  }
});
```

**NOVAUI.select.autocomplete(target, opções)**

Sugestões enquanto digita, de uma lista ou de um dataset.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `source` | lista \| function(termo, done) \| function → Promise | — | De onde vêm as sugestões. Itens: { value, label, desc }. |
| `minChars` | número | 2 | Mínimo de letras para buscar. |
| `delay` | ms | 250 | Espera depois de digitar, para não consultar a cada tecla. |
| `valueInput` | elemento \| seletor | — | Campo oculto que recebe o value escolhido (o input mostra o label). |
| `onSelect` | function(item) | — | Chamada ao escolher uma sugestão. |
| `limit` | número | — | Máximo de sugestões mostradas. |
| `emptyText` | texto | "Nenhum resultado…" | Mensagem quando não encontra nada. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:autocomplete-select` | { item } | — | Disparado no input ao escolher. |

<a id="listbox"></a>
## Listbox (lista de opções visível)

`key: listbox` · palavras-chave: listbox lista opcoes · fonte CSS: choices.css · fonte JS: choices.js

**HTML base**

```html
<ul aria-label="Perfil" class="listbox" data-input="#lb1-val" role="listbox">
  <li class="listbox__option" data-value="con" role="option">Consulta</li>
  <li aria-selected="true" class="listbox__option" data-value="op" role="option">Operador</li>
  <li class="listbox__option" data-value="apr" role="option">Aprovador</li>
</ul>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `aria-multiselectable` | "true" | — | Permite selecionar vários. |
| `data-input` | seletor | — | Campo oculto que recebe os valores separados por vírgula. |
| `data-value (nas opções)` | texto | texto da opção | Valor gravado. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:listbox-change` | { values } | — | Disparado a cada mudança. |

<a id="tag"></a>
## Tag (etiqueta)

`key: tag` · palavras-chave: tag etiqueta chip label · fonte CSS: choices.css · fonte JS: — (só CSS)

**HTML base**

```html
<span class="tag">Padrão</span>
<span class="tag tag--brand">Marca</span>
<span class="tag tag--success">Aprovado</span>

<!-- removível -->
<span class="tag tag--brand">
  <span class="tag__label">Recursos Humanos</span>
  <button type="button" class="tag__remove" aria-label="Remover Recursos Humanos"><span class="icon" aria-hidden="true">close</span></button>
</span>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.tag--brand · --teal · --success · --warning · --danger` | — | neutra | Cor da etiqueta. |
| `.tag--outline` | — | — | Só borda. |
| `.tag--sm` | — | — | Versão menor. |
| `.tag__remove` | — | — | Botão "×" para remover. |

<a id="tag-filtro"></a>
## Tags de filtro

`key: tag-filtro` · palavras-chave: tag filtro chip toggle · fonte CSS: choices.css · fonte JS: choices.js

**HTML base**

```html
<div class="tag-list">
  <button type="button" class="tag" aria-pressed="true" data-value="ativos">Ativos</button>
  <button type="button" class="tag" aria-pressed="false" data-value="vencendo">Vencendo em 7 dias</button>
</div>
```

**Uso pelo JavaScript**

```js
// alterna sozinho e dispara nova:toggle { pressed, value }
```

**Atributos HTML**

Em <button class="tag">.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `aria-pressed` | "true" \| "false" | "false" | Filtro ligado ou desligado. Alterna sozinho. |
| `data-value` | texto | texto do botão | Valor enviado no evento. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:toggle` | { pressed, value } | — | Disparado ao clicar. |

<a id="campo-tags"></a>
## Campo de tags

`key: campo-tags` · palavras-chave: tags input emails varios valores · fonte CSS: inputs.css, choices.css · fonte JS: inputs.js, choices.js

**HTML base**

```html
<div class="field">
  <div class="field__control"><div class="field__body">
    <label class="field__label" for="emails">E-mails</label>
    <input class="field__input" id="emails" name="emails" data-tags data-validate="email" data-lowercase placeholder="Digite e pressione Enter">
  </div></div>
</div>

<!-- opcionais: data-max="5" · data-suggest="#datalist" · data-separator=";" -->
```

**Uso pelo JavaScript**

```js
NOVAUI.tags.get('#emails');   // ['a@x.com', ...]
NOVAUI.tags.set('#emails', ['a@x.com']);
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-tags` | — | — | Transforma o campo em campo de tags. O input original guarda os valores separados. |
| `data-separator` | texto | "," | Separador dos valores gravados e tecla que cria a tag. |
| `data-max` | número | — | Máximo de tags. |
| `data-validate` | email \| number \| matricula | — | Tags fora do formato ficam vermelhas. |
| `data-suggest` | seletor de <datalist> | — | Sugestões enquanto digita. |
| `data-lowercase` | — | — | Converte para minúsculas. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.tags.get(target)` | — | — | Lista de valores. |
| `NOVAUI.tags.set(target, lista)` | lista | — | Troca todas as tags. |
| `NOVAUI.tags.add(target, valor) · remove(target, valor)` | texto | — | Adiciona ou remove uma. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:tags-change` | { values, invalid } | — | Disparado a cada mudança. |

---

# Campos extras

<a id="editor-texto"></a>
## Editor de texto (rich text)

`key: editor-texto` · palavras-chave: rich text editor rte negrito · fonte CSS: form-extras.css, buttons.css · fonte JS: form-extras.js

**HTML base**

```html
<div class="rte" data-max-length="2000" data-rte-target="#rte-html">
  <div aria-label="Formatação" class="rte__toolbar">
    <button aria-label="Negrito (Ctrl+B)" aria-pressed="false" class="rte__btn" data-cmd="bold" title="Negrito (Ctrl+B)" type="button">
      <span aria-hidden="true" class="icon">format_bold</span>
    </button>
    <button aria-label="Itálico (Ctrl+I)" aria-pressed="false" class="rte__btn" data-cmd="italic" title="Itálico (Ctrl+I)" type="button">
      <span aria-hidden="true" class="icon">format_italic</span>
    </button>
    <button aria-label="Sublinhado (Ctrl+U)" aria-pressed="false" class="rte__btn" data-cmd="underline" title="Sublinhado (Ctrl+U)" type="button">
      <span aria-hidden="true" class="icon">format_underlined</span>
    </button>
    <button aria-label="Tachado" aria-pressed="false" class="rte__btn" data-cmd="strikeThrough" title="Tachado" type="button">
      <span aria-hidden="true" class="icon">format_strikethrough</span>
    </button>
    <span aria-hidden="true" class="rte__sep"></span>
    <button aria-label="Título" aria-pressed="false" class="rte__btn" data-cmd="formatBlock" data-value="h3" title="Título" type="button">
      <span style="font-weight:700">H</span>
    </button>
    <button aria-label="Lista" aria-pressed="false" class="rte__btn" data-cmd="insertUnorderedList" title="Lista" type="button">
      <span aria-hidden="true" class="icon">format_list_bulleted</span>
    </button>
    <button aria-label="Lista numerada" aria-pressed="false" class="rte__btn" data-cmd="insertOrderedList" title="Lista numerada" type="button">
      <span aria-hidden="true" class="icon">format_list_numbered</span>
    </button>
    <button aria-label="Citação" class="rte__btn" data-cmd="formatBlock" data-value="blockquote" title="Citação" type="button">
      <span aria-hidden="true" class="icon">format_quote</span>
    </button>
    <span aria-hidden="true" class="rte__sep"></span>
    <button aria-label="Link (Ctrl+K)" class="rte__btn" data-cmd="link" title="Link (Ctrl+K)" type="button">
      <span aria-hidden="true" class="icon">link</span>
    </button>
    <button aria-label="Limpar formatação" class="rte__btn" data-cmd="removeFormat" title="Limpar formatação" type="button">
      <span aria-hidden="true" class="icon">format_clear</span>
    </button>
    <span aria-hidden="true" class="rte__sep"></span>
    <button aria-label="Desfazer" class="rte__btn" data-cmd="undo" title="Desfazer" type="button">
      <span aria-hidden="true" class="icon">undo</span>
    </button>
    <button aria-label="Refazer" class="rte__btn" data-cmd="redo" title="Refazer" type="button">
      <span aria-hidden="true" class="icon">redo</span>
    </button>
  </div>
  <div class="rte__linkbar" hidden>
    <input aria-label="Endereço do link" placeholder="https://" type="url">
    <button class="btn btn--primary btn--sm" data-link-apply="" type="button">Aplicar</button>
    <button class="btn btn--tertiary btn--sm" data-link-cancel="" type="button">Cancelar</button>
  </div>
  <div aria-labelledby="rte-label" class="rte__content" data-placeholder="Descreva o procedimento…" id="rte-content">
    <h3>Procedimento de revogação</h3>
    <p>Quando o integrante for <strong>desligado</strong>, o Service Desk revoga os acessos no mesmo dia:</p>
    <ol>
      <li>Bloquear a conta no Active Directory</li>
      <li>Remover os perfis no Protheus e no RM</li>
      <li>Registrar a revogação no Portal</li>
    </ol>
  </div>
  <div class="rte__footer"><span data-rte-count=""></span></div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.rte.getHTML('.rte');
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-rte-target` | seletor | — | Textarea (oculto) que recebe o HTML para o Fluig gravar. |
| `data-max-length` | número | — | Limite de caracteres; acima dele o editor fica com erro. |
| `data-cmd (nos botões)` | bold \| italic \| underline \| strikeThrough \| insertUnorderedList \| insertOrderedList \| formatBlock \| link \| removeFormat | — | Ação de cada botão da barra. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.rte.getHTML(target)` | — | — | HTML atual. |
| `NOVAUI.rte.setHTML(target, html)` | texto | — | Troca o conteúdo. |
| `NOVAUI.rte.setDisabled(target, bool)` | — | — | Bloqueia a edição. |

<a id="upload"></a>
## Upload de arquivos

`key: upload` · palavras-chave: upload anexo arquivo arrastar · fonte CSS: form-extras.css, form.css · fonte JS: form-extras.js

**HTML base**

```html
<div class="upload" data-max-files="5" data-max-size="10" id="upload-demo">
  <label class="upload__zone">
    <input accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx" aria-describedby="up-hint" class="upload__input" multiple type="file">
    <span class="upload__icon"><span aria-hidden="true" class="icon">upload</span></span>
    <span class="upload__title"><strong>Clique para escolher</strong> ou arraste os arquivos aqui</span>
    <span class="upload__hint" id="up-hint">PDF, imagem, Excel ou Word · até 10 MB cada · no máximo 5 arquivos</span>
  </label>
  <p class="form-error upload__error" hidden></p>
  <ul aria-live="polite" class="upload__list"></ul>
</div>
```

**Uso pelo JavaScript**

```js
document.querySelector('#upload-demo').addEventListener('nova:upload-add', e => {
  e.detail.items.forEach(item => NOVAUI.upload.setStatus({ target: item, type: 'done' }));
});
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-max-size` | MB | — | Tamanho máximo por arquivo. |
| `data-max-files` | número | 1 (ou ilimitado com multiple) | Quantidade máxima. |
| `accept (no input)` | .pdf,.png,… | todos | Tipos aceitos. |
| `multiple (no input)` | — | — | Permite vários arquivos. |
| `.upload--button` | — | — | Versão compacta, só botão. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.upload.setProgress(item, %)` | 0–100 | — | Barra de progresso do arquivo. |
| `NOVAUI.upload.setStatus({ target, type, message })` | type: 'done' \| 'error' | — | Marca o arquivo como enviado ou com falha. |
| `NOVAUI.upload.getFiles(target) · clear(target)` | — | — | Lista os arquivos / limpa tudo. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:upload-add` | { files, items } | — | Arquivos aceitos. |
| `nova:upload-remove` | { file } | — | Arquivo removido. |
| `nova:upload-reject` | { file, reason } | — | Arquivo recusado (tipo, tamanho, limite). |

<a id="cor"></a>
## Seletor de cor

`key: cor` · palavras-chave: cor color picker hex · fonte CSS: form-extras.css · fonte JS: form-extras.js

**HTML base**

```html
<div class="color-field">
  <span class="color-field__swatch">
    <input aria-label="Escolher cor" class="color-field__native" id="cor-native" type="color" value="#2f509f">
  </span>
  <input class="color-field__hex" id="cor-hex" maxlength="7" spellcheck="false" type="text">
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.color-field__native · .color-field__hex` | — | — | Seletor do navegador e campo do código #RRGGBB, sincronizados. |
| `.color-swatch data-color data-target` | #hex · seletor | — | Cores prontas que preenchem o campo. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:color-change` | { value } | — | Nova cor escolhida. |

<a id="slider"></a>
## Slider (controle deslizante)

`key: slider` · palavras-chave: slider range faixa intervalo · fonte CSS: form-extras.css, form.css · fonte JS: form-extras.js

**HTML base**

```html
<div class="slider" data-format="percent">
  <div class="slider__head">
    <label class="form-label" for="sl-1">Limite de alerta de licenças</label>
    <output class="slider__output" data-slider-output for="sl-1"></output>
  </div>
  <div class="slider__track">
    <span class="slider__fill"></span>
    <input class="slider__input" id="sl-1" max="100" min="50" step="5" type="range" value="90">
  </div>
  <div class="slider__scale"><span>50%</span><span>100%</span></div>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `min · max · step` | número | 0 · 100 · 1 | Faixa e passo (no input). |
| `2 inputs .slider__input` | — | — | Com dois inputs vira faixa (de–até). |
| `data-format` | currency \| percent | número | Formato do valor mostrado. |
| `data-unit` | texto | — | Unidade depois do número (ex.: "km"). |
| `data-min-gap` | número | 0 | Distância mínima entre os dois pontos da faixa. |
| `.slider--success · --teal` | — | — | Cor da faixa. |

<a id="avaliacao"></a>
## Avaliação (estrelas)

`key: avaliacao` · palavras-chave: rating estrelas nota avaliacao · fonte CSS: form-extras.css · fonte JS: — (só CSS)

**HTML base**

```html
<fieldset class="rating">
  <legend class="sr-only">Nota</legend>
  <input class="rating__input" id="nota-5" name="nota" type="radio" value="5">
  <label class="rating__star" for="nota-5" title="5 de 5"><span class="sr-only">5 de 5</span></label>
  <input checked class="rating__input" id="nota-4" name="nota" type="radio" value="4">
  <label class="rating__star" for="nota-4" title="4 de 5"><span class="sr-only">4 de 5</span></label>
  <input class="rating__input" id="nota-3" name="nota" type="radio" value="3">
  <label class="rating__star" for="nota-3" title="3 de 5"><span class="sr-only">3 de 5</span></label>
  <input class="rating__input" id="nota-2" name="nota" type="radio" value="2">
  <label class="rating__star" for="nota-2" title="2 de 5"><span class="sr-only">2 de 5</span></label>
  <input class="rating__input" id="nota-1" name="nota" type="radio" value="1">
  <label class="rating__star" for="nota-1" title="1 de 5"><span class="sr-only">1 de 5</span></label>
</fieldset>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.rating--sm` | — | — | Versão menor. |
| `.rating--readonly` | — | — | Só exibe a nota. |

---

# Exibição de dados

<a id="badge"></a>
## Badge (status)

`key: badge` · palavras-chave: badge status etiqueta · fonte CSS: badges.css · fonte JS: — (só CSS)

**HTML base**

```html
<span class="badge badge--success"><span class="badge__dot"></span>Ativo</span>
<span class="badge badge--warning"><span class="badge__dot"></span>Afastado</span>
<span class="badge badge--danger"><span class="badge__dot"></span>Desligado</span>
<span class="badge badge--info">Novo</span>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.badge--success · --warning · --danger · --info · --neutral` | — | neutra | Cor do status. |
| `.badge__dot` | — | — | Ponto colorido antes do texto. |
| `.badge--outline · .badge--sm` | — | — | Só borda / menor. |
| `.badge--sys + --protheus · --rm · --fluig · --kcor · --securos · --totvs` | — | — | Badge de sistema, com a cor de cada sistema. |

<a id="tabela"></a>
## Tabela

`key: tabela` · palavras-chave: table tabela data-table ordenar paginacao · fonte CSS: badges.css, tables.css · fonte JS: tables.js

**HTML base**

```html
<div class="table-card">

  <!-- cabeçalho: título, contador, descrição e ações -->
  <div class="table-card__header">
    <div>
      <h3 class="table-card__title">Integrantes <span class="badge badge--neutral badge--sm">248</span></h3>
      <p class="table-card__subtitle">Colaboradores com acesso a pelo menos um sistema</p>
    </div>
    <div class="table-card__actions">
      <div class="field field--compact">
        <div class="field__control">
          <span class="field__icon"><span class="icon" aria-hidden="true">search</span></span>
          <div class="field__body">
            <label class="field__label" for="tabela-busca">Buscar</label>
            <input class="field__input" id="tabela-busca" type="search" placeholder="Nome ou matrícula">
          </div>
        </div>
      </div>
      <button type="button" class="btn btn--secondary"><span class="icon" aria-hidden="true">filter_alt</span><span>Filtros</span></button>
      <button type="button" class="btn btn--secondary btn--icon" aria-label="Exportar"><span class="icon" aria-hidden="true">download</span></button>
      <button type="button" class="btn btn--primary"><span class="icon" aria-hidden="true">add</span><span>Conceder acesso</span></button>
    </div>
  </div>

  <!-- ações em lote: aparece sozinha quando há linhas marcadas -->
  <div class="table-bulk" data-bulk-for="tabela-integrantes" hidden>
    <span class="table-bulk__count" data-bulk-count></span>
    <button type="button" class="btn btn--ghost btn--sm" data-bulk-clear>Limpar seleção</button>
    <div class="table-bulk__actions">
      <button type="button" class="btn btn--secondary-danger btn--sm"><span class="icon" aria-hidden="true">block</span><span>Revogar acessos</span></button>
    </div>
  </div>

  <!-- tabela -->
  <div class="table-scroll">
    <table class="data-table data-table--stack" id="tabela-integrantes">
      <thead>
        <tr>
          <th class="cell-check" scope="col"><input type="checkbox" class="data-table__check" data-select-all aria-label="Selecionar todos"></th>
          <th scope="col" aria-sort="none"><button type="button" class="data-table__sort">Integrante</button></th>
          <th scope="col" aria-sort="none"><button type="button" class="data-table__sort">Setor</button></th>
          <th scope="col" class="cell-num" aria-sort="none" data-sort-type="number"><button type="button" class="data-table__sort">Matrícula</button></th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell-check"><input type="checkbox" class="data-table__check" data-select-row aria-label="Selecionar Ana Beatriz Souza"></td>
          <td>
            <div class="cell-user">
              <span class="cell-user__avatar" aria-hidden="true">AS</span>
              <div><span class="cell-user__name">Ana Beatriz Souza</span><span class="cell-sub">Analista de RH</span></div>
            </div>
          </td>
          <td>Recursos Humanos</td>
          <td class="cell-num">004871</td>
          <td><span class="badge badge--success"><span class="badge__dot"></span>Ativo</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- vazio: mostre no lugar da tabela quando não houver resultado -->
  <div class="table-empty" hidden>
    <span class="icon-tile icon-tile--neutral table-empty__icon"><span class="icon" aria-hidden="true">search_off</span></span>
    <p class="table-empty__title">Nenhum integrante encontrado</p>
    <p class="table-empty__text">Mude o termo da busca ou os filtros.</p>
  </div>

  <!-- rodapé: contagem e paginação -->
  <div class="table-card__footer">
    <span>Mostrando <strong>1–10</strong> de <strong>248</strong></span>
    <nav aria-label="Paginação">
      <ul class="pagination">
        <li><button type="button" class="pagination__page" aria-label="Página anterior" disabled><span class="icon" aria-hidden="true">chevron_left</span></button></li>
        <li><button type="button" class="pagination__page" aria-current="page">1</button></li>
        <li><button type="button" class="pagination__page">2</button></li>
        <li><span class="pagination__gap">…</span></li>
        <li><button type="button" class="pagination__page">25</button></li>
        <li><button type="button" class="pagination__page" aria-label="Próxima página"><span class="icon" aria-hidden="true">chevron_right</span></button></li>
      </ul>
    </nav>
  </div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.table.refresh('#tabela-integrantes');      // depois de trocar as linhas
NOVAUI.table.getSelected('#tabela-integrantes');  // linhas marcadas
NOVAUI.table.clearSelection('#tabela-integrantes');
```

**Partes do card**

Use as partes que precisar; todas são opcionais menos a tabela.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.table-card` | — | — | Moldura da tabela com cabeçalho e rodapé. |
| `.table-card__header` | — | — | Título (.table-card__title), descrição (.table-card__subtitle) e ações (.table-card__actions). |
| `.table-bulk` | — | hidden | Barra de ações em lote. Ligue com data-bulk-for="idDaTabela"; aparece sozinha quando há linhas marcadas. |
| `.table-scroll` | — | — | Rolagem horizontal quando a tabela não cabe. |
| `.table-empty` | — | hidden | Mensagem quando não há resultados. |
| `.table-card__footer` | — | — | Contagem e paginação (.pagination, .pagination__page, .pagination__gap). |

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.data-table--stack` | — | — | No celular, cada linha vira um cartão com os rótulos das colunas. |
| `th aria-sort + .data-table__sort` | "none" | — | Coluna ordenável. |
| `th data-sort-type` | number \| date \| text | detecta | Como ordenar a coluna. |
| `td data-sort-value` | texto | texto da célula | Valor usado na ordenação. |
| `table data-sort="server"` | — | — | Não reordena no navegador; só dispara nova:sort (paginação no servidor). |
| `data-select-all · data-select-row` | — | — | Checkbox de marcar todos / de cada linha. |
| `.table-bulk data-bulk-for="idTabela"` | — | — | Barra de ações em lote, aparece com itens marcados. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.table.refresh(target)` | — | todas | Atualiza depois de trocar as linhas. |
| `NOVAUI.table.getSelected(target)` | — | — | Linhas marcadas. |
| `NOVAUI.table.clearSelection(target)` | — | — | Desmarca tudo. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:sort` | { column, key, direction } | — | Coluna ordenada. |
| `nova:selection` | { rows } | — | Seleção mudou. |

<a id="avatar"></a>
## Avatar

`key: avatar` · palavras-chave: avatar foto iniciais usuario · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<span class="avatar">AB</span>
<span class="avatar avatar--sm">CN</span>
<span class="avatar avatar--lg"><img src="foto.jpg" alt="Ana Beatriz Souza"></span>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.avatar--xs · --sm · --lg · --xl` | — | médio | Tamanho. |
| `.avatar--navy · --teal · --lime · --success · --danger · --neutral` | — | azul | Cor do fundo das iniciais. |
| `.avatar--solid · --square` | — | — | Cor forte / cantos quadrados. |
| `<img>` | — | — | Foto no lugar das iniciais (com alt). |

<a id="stat"></a>
## Indicador (stat / KPI)

`key: stat` · palavras-chave: stat kpi indicador metrica numero · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="stat">
  <p class="stat__label">Componentes</p>
  <p class="stat__value">69</p>
  <div class="stat__footer">com HTML base pronto para copiar</div>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.stat__label · __value · __footer` | — | — | Rótulo, número e linha de apoio. |
| `.stat--plain` | — | — | Sem moldura. |

<a id="card"></a>
## Card

`key: card` · palavras-chave: card cartao · fonte CSS: data-display.css, buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<article class="card">
  <div class="card__header">
    <div class="card__heading">
      <h4 class="card__title">Solicitação #2026-0913</h4>
      <p class="card__subtitle">Acesso ao Protheus</p>
    </div>
  </div>
  <div class="card__body">Conteúdo do card.</div>
  <div class="card__footer">
    <span>Atualizado há 5 min</span>
    <div class="card__footer-actions"><button type="button" class="btn btn--secondary btn--sm">Ver</button></div>
  </div>
</article>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.card--flat` | — | — | Sem sombra, só borda. Use dentro do formulário do Fluig (fundo branco). |
| `.card--elevated` | — | — | Sombra maior. |
| `.card--interactive + .card__link` | — | — | Cartão inteiro clicável. |
| `.card--accent · .card--compact` | — | — | Faixa colorida no topo / menos espaçamento. |
| `.card__header · __body · __footer` | — | — | Partes do cartão. |

<a id="card-produto"></a>
## Card com foto (produto)

`key: card-produto` · palavras-chave: card produto foto imagem catalogo uniforme item estoque preco · fonte CSS: data-display.css, buttons.css, choices.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="card-group">
  <article class="card card--product">
    <div class="card__media">
      <img src="camisa-gandola.jpg" alt="Camisa gandola">
      <span class="tag tag--sm card__media-tag">Tamanho PP</span>
    </div>
    <div class="card__body">
      <h4 class="card__title">Camisa gandola</h4>
      <p class="card__meta">Uniforme · Código 1.PP · NCM 61099000</p>
      <div class="card__price-row">
        <span class="card__price">R$ 56,00</span>
        <span class="card__stock">3 em estoque</span>
      </div>
    </div>
    <div class="card__footer card__footer--plain">
      <div class="card__footer-actions">
        <button type="button" class="btn btn--secondary btn--sm"><span class="icon" aria-hidden="true">edit</span><span>Editar</span></button>
        <button type="button" class="btn btn--secondary-danger btn--sm"><span class="icon" aria-hidden="true">delete</span><span>Excluir</span></button>
      </div>
    </div>
  </article>
</div>

<!-- sem foto: espaço reservado -->
<div class="card__media card__media--empty" role="img" aria-label="Espaço da foto">
  <span class="icon" aria-hidden="true">image</span>
  <span class="card__media-hint">Foto do produto</span>
</div>

<!-- carregando: esqueleto no mesmo formato -->
<div data-skeleton="product" data-count="4"></div>
```

**Uso pelo JavaScript**

```js
<!-- não usa JavaScript -->
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.card--product` | — | — | Card de item com foto: foto quadrada, preço em destaque e botões ocupando a largura. |
| `.card__media` | — | — | Área da foto. A imagem preenche e é cortada para caber (object-fit: cover). |
| `--card-media-ratio` | CSS, ex.: 4 / 3 | 1 / 1 | Proporção da foto (no .card ou no .card-group). |
| `.card__media--empty` | — | — | Sem foto: mostra o espaço reservado com ícone e um texto opcional (.card__media-hint). |
| `.tag.card__media-tag` | — | — | Etiqueta sobre a foto, no canto superior esquerdo. Com .card__media-tag--end vai para a direita. |
| `.card__meta` | — | — | Linha de dados (categoria, código, NCM). |
| `.card__price-row · .card__price · .card__stock` | — | — | Preço em destaque e estoque à direita. |
| `.card__stock--low · --out` | — | — | Estoque baixo (laranja) / esgotado (vermelho). |
| `.is-unavailable` | — | — | No card: foto em cinza para item indisponível. |
| `.card-group + --card-min` | CSS, ex.: 220px | 260px | Grade que se ajusta à largura; --card-min é a largura mínima de cada card. |

<a id="lista"></a>
## Lista (list item)

`key: lista` · palavras-chave: list lista itens · fonte CSS: data-display.css, badges.css · fonte JS: — (só CSS)

**HTML base**

```html
<ul class="list list--bordered list--divided">
  <li>
    <a class="list-item" href="#dd-list" onclick="return false">
      <span class="list-item__leading"><span class="avatar avatar--sm">AB</span></span>
      <span class="list-item__content">
        <span class="list-item__title">Ana Beatriz Souza</span>
        <span class="list-item__desc">Acesso ao Protheus · Compras</span>
      </span>
      <span class="list-item__trailing"><span class="badge badge--warning badge--sm">Em aprovação</span><span>há 12 min</span></span>
    </a>
  </li>
  <li>
    <a class="list-item" href="#dd-list" onclick="return false">
      <span class="list-item__leading"><span class="avatar avatar--sm avatar--navy">CN</span></span>
      <span class="list-item__content">
        <span class="list-item__title">Carlos Eduardo Nunes</span>
        <span class="list-item__desc">Revogação no Kcor</span>
      </span>
      <span class="list-item__trailing"><span class="badge badge--success badge--sm">Concluída</span><span>há 1 h</span></span>
    </a>
  </li>
  <li>
    <a class="list-item" href="#dd-list" onclick="return false">
      <span class="list-item__leading"><span class="avatar avatar--sm avatar--teal">FR</span></span>
      <span class="list-item__content">
        <span class="list-item__title">Fernanda Ribeiro</span>
        <span class="list-item__desc">Perfil aprovador no Fluig</span>
      </span>
      <span class="list-item__trailing"><span class="badge badge--info badge--sm">Nova</span><span>ontem</span></span>
    </a>
  </li>
</ul>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.list--divided · --bordered · --flush · --compact` | — | — | Divisórias, moldura, sem recuo, mais compacta. |
| `.list-item__leading · __content · __trailing` | — | — | Ícone/avatar, texto e informação à direita. |

<a id="lista-descricao"></a>
## Lista de descrição (dados)

`key: lista-descricao` · palavras-chave: description list dl dt dd chave valor ficha · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<dl class="desc-list desc-list--cols-2">
  <div class="desc-list__item">
    <dt>Usuários</dt>
    <dd>182</dd>
  </div>
  <div class="desc-list__item">
    <dt>Perfis</dt>
    <dd>12</dd>
  </div>
</dl>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.desc-list--horizontal` | — | — | Rótulo à esquerda e valor à direita. |
| `.desc-list--cols-2 · -3 · -4` | — | 1 | Colunas. |
| `.desc-list--divided` | — | — | Linha entre os itens. |
| `--dl-label-width` | CSS | 200px | Largura do rótulo no modo horizontal. |

<a id="accordion"></a>
## Accordion

`key: accordion` · palavras-chave: accordion sanfona expandir details · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="accordion">
  <details class="accordion__item" name="acc-demo" open>
    <summary class="accordion__trigger">
      <span class="accordion__icon"><span aria-hidden="true" class="icon">description</span></span>
      <span class="accordion__title">Dados da solicitação</span>
      <span class="accordion__meta">3 campos</span>
    </summary>
    <div class="accordion__content">
      <p>Integrante, sistema e perfil solicitado. Os dados do integrante vêm do RM pela matrícula.</p>
    </div>
  </details>
  <details class="accordion__item" name="acc-demo">
    <summary class="accordion__trigger">
      <span class="accordion__icon"><span aria-hidden="true" class="icon">group</span></span>
      <span class="accordion__title">Aprovação do gestor</span>
      <span class="accordion__meta">pendente</span>
    </summary>
    <div class="accordion__content">
      <p>
        O gestor imediato recebe a tarefa no Fluig e tem 2 dias úteis para aprovar ou recusar. Depois disso, a tarefa é escalada para a coordenação.
      </p>
    </div>
  </details>
</div>
```

**Uso pelo JavaScript**

```js
<!-- sem JS: usa <details>. Mesmo name= nos <details> abre um de cada vez -->
```

**Classes e Atributos HTML**

Usa <details> nativo, sem JS.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.accordion--separated · --flush` | — | — | Itens separados / sem moldura. |
| `open` | atributo | — | Item aberto de início. |
| `name (no <details>)` | texto | — | Mesmo name: abre um por vez. |

<a id="timeline"></a>
## Timeline (histórico)

`key: timeline` · palavras-chave: timeline historico linha do tempo · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<ol class="timeline">
  <li class="timeline__item">
    <span class="timeline__marker timeline__marker--success"><span aria-hidden="true" class="icon">check</span></span>
    <div class="timeline__content">
      <div class="timeline__header">
        <p class="timeline__title">Solicitação aberta</p>
        <span class="timeline__time">29/09 09:14</span>
      </div>
      <p class="timeline__desc">Por Lucas Lima, pelo portal Portal.</p>
    </div>
  </li>
  <li class="timeline__item">
    <span class="timeline__marker timeline__marker--success"><span aria-hidden="true" class="icon">check</span></span>
    <div class="timeline__content">
      <div class="timeline__header">
        <p class="timeline__title">Dados validados no RM</p>
        <span class="timeline__time">29/09 09:14</span>
      </div>
      <p class="timeline__desc">Integrante ativo, setor Recursos Humanos.</p>
    </div>
  </li>
  <li class="timeline__item">
    <span class="timeline__marker timeline__marker--current"><span aria-hidden="true" class="icon">schedule</span></span>
    <div class="timeline__content">
      <div class="timeline__header">
        <p class="timeline__title">Aprovação do gestor</p>
        <span class="timeline__time">prazo 01/10</span>
      </div>
      <p class="timeline__desc">Aguardando Coordenação de RH.</p>
      <div class="timeline__body">“Preciso liberar o módulo de Compras para a Ana cobrir as férias da equipe.”</div>
    </div>
  </li>
</ol>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.timeline--compact` | — | — | Menos espaçamento. |

<a id="arvore"></a>
## Árvore (tree view)

`key: arvore` · palavras-chave: tree arvore hierarquia · fonte CSS: data-display.css · fonte JS: data-display.js

**HTML base**

```html
<ul aria-label="Estrutura organizacional" class="tree" id="tree-org" role="tree">
  <li aria-expanded="true" class="tree__item" data-value="Nova Rota do Oeste" role="treeitem">
    <div class="tree__row">
      <span class="tree__toggle"></span>
      <span class="tree__icon"><span aria-hidden="true" class="icon">home</span></span>
      <span class="tree__label">Nova Rota do Oeste</span>
      <span class="tree__meta">712</span>
    </div>
    <ul class="tree__group">
      <li aria-expanded="true" class="tree__item" data-value="Diretoria de Operações" role="treeitem">
        <div class="tree__row">
          <span class="tree__toggle"></span>
          <span class="tree__icon"><span aria-hidden="true" class="icon">folder</span></span>
          <span class="tree__label">Diretoria de Operações</span>
          <span class="tree__meta">412</span>
        </div>
        <ul class="tree__group">
          <li aria-expanded="true" class="tree__item" data-value="Operações" role="treeitem">
            <div class="tree__row">
              <span class="tree__toggle"></span>
              <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
              <span class="tree__label">Operações</span>
              <span class="tree__meta">318</span>
            </div>
            <ul class="tree__group">
              <li class="tree__item" data-value="Centro de Controle Operacional" role="treeitem">
                <div class="tree__row">
                  <span class="tree__toggle"></span>
                  <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
                  <span class="tree__label">Centro de Controle Operacional</span>
                  <span class="tree__meta">64</span>
                </div>
              </li>
              <li class="tree__item" data-value="Inspeção de Tráfego" role="treeitem">
                <div class="tree__row">
                  <span class="tree__toggle"></span>
                  <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
                  <span class="tree__label">Inspeção de Tráfego</span>
                  <span class="tree__meta">96</span>
                </div>
              </li>
            </ul>
          </li>
          <li class="tree__item" data-value="Manutenção" role="treeitem">
            <div class="tree__row">
              <span class="tree__toggle"></span>
              <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
              <span class="tree__label">Manutenção</span>
              <span class="tree__meta">94</span>
            </div>
          </li>
        </ul>
      </li>
      <li aria-expanded="true" class="tree__item" data-value="Diretoria Administrativo-Financeira" role="treeitem">
        <div class="tree__row">
          <span class="tree__toggle"></span>
          <span class="tree__icon"><span aria-hidden="true" class="icon">folder</span></span>
          <span class="tree__label">Diretoria Administrativo-Financeira</span>
          <span class="tree__meta">204</span>
        </div>
        <ul class="tree__group">
          <li class="tree__item" data-value="Controladoria" role="treeitem">
            <div class="tree__row">
              <span class="tree__toggle"></span>
              <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
              <span class="tree__label">Controladoria</span>
              <span class="tree__meta">28</span>
            </div>
          </li>
          <li class="tree__item" data-value="Financeiro" role="treeitem">
            <div class="tree__row">
              <span class="tree__toggle"></span>
              <span class="tree__icon"><span aria-hidden="true" class="icon">groups</span></span>
              <span class="tree__label">Financeiro</span>
              <span class="tree__meta">36</span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `role="tree" · role="treeitem"` | — | — | Estrutura da árvore. |
| `aria-expanded` | "true" \| "false" | "false" | Item aberto ou fechado. |
| `aria-multiselectable` | "true" | — | Permite selecionar vários. |
| `data-value` | texto | — | Valor enviado no evento. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.tree.refresh(target)` | — | todas | Inicia árvores inseridas depois. |
| `NOVAUI.tree.toggle(item, abrir)` | true \| false | alterna | Abre ou fecha um item. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:tree-select` | { item, value, label } | — | Item selecionado. |
| `nova:tree-toggle` | { item, expanded } | — | Item aberto/fechado. |

<a id="kanban"></a>
## Kanban

`key: kanban` · palavras-chave: kanban quadro colunas arrastar · fonte CSS: data-display.css, badges.css, buttons.css · fonte JS: data-display.js

**HTML base**

```html
<div class="kanban" id="kanban-demo" style="--kanban-max-height:560px;--kanban-col:232px">
  <section aria-label="Solicitado" class="kanban__column" data-status="solicitado">
    <header class="kanban__header">
      <span class="kanban__dot" style="--kanban-accent:var(--nova-color-text-muted)"></span>
      <h4 class="kanban__title">Solicitado</h4>
      <span class="kanban__count" data-kanban-count="">0</span>
      <div class="kanban__actions">
        <button aria-label="Opções da coluna Solicitado" class="btn btn--tertiary btn--sm btn--icon" type="button">
          <span aria-hidden="true" class="icon">more_vert</span>
        </button>
      </div>
    </header>
    <div class="kanban__list">
      <div class="kanban__empty">Arraste um card para cá</div>
    </div>
    <div class="kanban__footer">
      <button class="btn btn--tertiary btn--sm btn--block" type="button">
        <span aria-hidden="true" class="icon">add</span>
        <span>Adicionar</span>
      </button>
    </div>
  </section>
  <section aria-label="Em aprovação" class="kanban__column" data-limit="3" data-status="aprovacao">
    <header class="kanban__header">
      <span class="kanban__dot" style="--kanban-accent:var(--nova-warning-text)"></span>
      <h4 class="kanban__title">Em aprovação</h4>
      <span class="kanban__count" data-kanban-count="">0</span>
      <span class="kanban__limit" title="Limite da coluna">máx. 3</span>
      <div class="kanban__actions">
        <button aria-label="Opções da coluna Em aprovação" class="btn btn--tertiary btn--sm btn--icon" type="button">
          <span aria-hidden="true" class="icon">more_vert</span>
        </button>
      </div>
    </header>
    <div class="kanban__list">
      <div class="kanban__empty">Arraste um card para cá</div>
    </div>
    <div class="kanban__footer">
      <button class="btn btn--tertiary btn--sm btn--block" type="button">
        <span aria-hidden="true" class="icon">add</span>
        <span>Adicionar</span>
      </button>
    </div>
  </section>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.kanban__column data-status` | texto | — | Identifica a coluna no evento. |
| `data-limit` | número | — | Limite de cards; acima dele a coluna fica em alerta. |
| `.kanban-card data-id` | texto | — | Identifica o card. |
| `.kanban-card--high · --medium · --low` | — | — | Prioridade (cor da borda). |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.kanban.refresh(target)` | — | todos | Inicia/atualiza contadores. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:kanban-move` | { card, id, from, to, index } | — | Card movido (mouse ou Shift + setas). |

<a id="calendario"></a>
## Calendário

`key: calendario` · palavras-chave: calendar calendario agenda eventos · fonte CSS: data-display.css, buttons.css · fonte JS: data-display.js

**HTML base**

```html
<div id="calendario"></div>
```

**Uso pelo JavaScript**

```js
NOVAUI.calendar.create({
  target: '#calendario',
  events: [{ id: 1, title: 'Plantão TI', start: '2026-10-05', color: 'brand' }],
  onEventClick: ev => console.log(ev)
});
```

**NOVAUI.calendar.create(opções)**

Monta o calendário dentro do elemento.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | Onde o calendário aparece. |
| `date` | "aaaa-mm-dd" | hoje | Mês inicial. |
| `events` | lista | [] | Eventos: { id, title, start, end, time, color }. color: brand \| teal \| success \| warning \| danger. |
| `weekStart` | 0 \| 1 | 0 | Primeiro dia da semana (0 = domingo). |
| `maxPerDay` | número | 3 | Eventos por dia antes do "+N mais". |
| `selected` | "aaaa-mm-dd" | — | Dia marcado. |
| `onEventClick` | function(evento, elemento) | — | Clique num evento. |
| `onDayClick` | function({ date, events }) | — | Clique num dia. |

**Retorno**

Objeto do calendário.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `next() · prev() · today()` | — | — | Navega entre meses. |
| `setEvents(lista)` | — | — | Troca os eventos. |
| `setDate(data) · select(data)` | — | — | Vai para uma data / seleciona um dia. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:calendar-event` | { event } | — | Evento clicado. |
| `nova:calendar-day` | { date, events } | — | Dia clicado. |
| `nova:calendar-change` | { month } | — | Mês mudou. |

<a id="data-grid"></a>
## Data grid (tabela editável)

`key: data-grid` · palavras-chave: grid editavel planilha data grid · fonte CSS: tables.css, data-display.css · fonte JS: data-display.js

**HTML base**

```html
<table class="data-grid" id="grid-demo" style="--table-min-width:860px">
  <thead>
    <tr>
      <th class="data-grid__rownum" scope="col">#</th>
      <th data-key="codigo" scope="col" style="width:110px">Código</th>
      <th class="is-required" data-key="descricao" scope="col">Descrição</th>
      <th data-key="responsavel" scope="col" style="width:150px">Responsável</th>
      <th class="cell-num is-required" data-key="licencas" scope="col" style="width:100px">Licenças</th>
      <th class="cell-num" data-key="custo" scope="col" style="width:140px">Custo unitário</th>
      <th class="cell-num" data-key="inicio" scope="col" style="width:120px">Início</th>
    </tr>
  </thead>
  <tbody>
    <tr data-id="1.01.001">
      <th class="data-grid__rownum" scope="row">1</th>
      <td>1.01.001</td>
      <td data-editable="">Administração Central</td>
      <td data-editable="" data-options="Controladoria|Operações|Manutenção|Engenharia|TI|RH">Controladoria</td>
      <td class="cell-num" data-editable="" data-min="0" data-type="number">4</td>
      <td class="cell-num" data-editable="" data-type="currency" data-value="1850">1850</td>
      <td class="cell-num" data-editable="" data-type="date" data-value="2026-10-01">2026-10-01</td>
    </tr>
    <tr data-id="1.02.004">
      <th class="data-grid__rownum" scope="row">2</th>
      <td>1.02.004</td>
      <td data-editable="">Operação de Rodovia</td>
      <td data-editable="" data-options="Controladoria|Operações|Manutenção|Engenharia|TI|RH">Operações</td>
      <td class="cell-num" data-editable="" data-min="0" data-type="number">12</td>
      <td class="cell-num" data-editable="" data-type="currency" data-value="2340.5">2340.5</td>
      <td class="cell-num" data-editable="" data-type="date" data-value="2026-10-01">2026-10-01</td>
    </tr>
  </tbody>
</table>
```

**Uso pelo JavaScript**

```js
NOVAUI.grid.getChanges('.data-grid');   // só o que mudou
```

**Atributos HTML**

Nas células <td>.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-editable` | — | — | Célula editável (duplo clique, Enter ou digitar). |
| `data-type` | text \| number \| currency \| date | text | Tipo do valor e formatação. |
| `data-decimals` | número | 2 (moeda) | Casas decimais. |
| `data-options` | "A\|B\|C" | — | Edita com uma lista de opções. |
| `data-required · data-min` | — · número | — | Validação da célula. |
| `th data-key` | texto | — | Nome da coluna em getData/getChanges. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.grid.getChanges(target)` | — | — | Só o que mudou: { rowIndex, id, key, oldValue, value }. |
| `NOVAUI.grid.getData(target)` | — | — | Todas as linhas como objetos. |
| `NOVAUI.grid.hasErrors(target)` | — | — | true se há célula inválida. |
| `NOVAUI.grid.commit(target) · discard(target)` | — | — | Marca como salvo / desfaz alterações. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:grid-change` | { cell, row, key, oldValue, value, error } | — | Célula alterada. |

<a id="progresso"></a>
## Barra de progresso

`key: progresso` · palavras-chave: progress progresso barra · fonte CSS: data-display.css · fonte JS: — (só CSS)

**HTML base**

```html
<div aria-label="Licenças Protheus" aria-valuemax="100" aria-valuemin="0" aria-valuenow="91" class="progress progress--warning" role="progressbar">
  <span class="progress__bar" style="--progress-value:91%"></span>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `--progress-value` | CSS, ex.: 40% | 0% | Quanto está preenchido (na .progress__bar). |
| `.progress--sm` | — | — | Mais fina. |
| `.progress--success · --warning · --danger · --teal` | — | azul | Cor. |

---

# Navegação

<a id="breadcrumb"></a>
## Breadcrumb (trilha)

`key: breadcrumb` · palavras-chave: breadcrumb trilha caminho · fonte CSS: navigation.css · fonte JS: — (só CSS)

**HTML base**

```html
<nav aria-label="Você está aqui" class="breadcrumb">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="#exemplo">Início</a></li>
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="#exemplo">Processos</a></li>
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="#exemplo">Iniciar solicitações</a></li>
    <li class="breadcrumb__item"><span aria-current="page" class="breadcrumb__current">Solicitação de abono</span></li>
  </ol>
</nav>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.breadcrumb--slash` | — | — | Separador "/" em vez de seta. |
| `.breadcrumb--responsive` | — | — | No celular mostra só o nível anterior, como "voltar". |
| `aria-current="page"` | — | — | No item atual. |

<a id="abas"></a>
## Abas (tabs)

`key: abas` · palavras-chave: tabs abas · fonte CSS: navigation.css, form.css · fonte JS: navigation.js

**HTML base**

```html
<div class="tabs">
  <div aria-label="abas1" class="tabs__list" role="tablist">
    <button aria-controls="abas1-p0" aria-selected="true" class="tabs__tab" id="abas1-t0" role="tab" type="button">
      Dados gerais
    </button>
    <button aria-controls="abas1-p1" aria-selected="false" class="tabs__tab" id="abas1-t1" role="tab" type="button">
      Acessos
      <span class="tabs__count">6</span>
    </button>
    <button aria-controls="abas1-p2" aria-selected="false" class="tabs__tab" id="abas1-t2" role="tab" type="button">Histórico</button>
  </div>
  <div aria-labelledby="abas1-t0" class="tabs__panel" id="abas1-p0" role="tabpanel">
    <div class="form-description" style="max-width:none">Matrícula, cargo, setor e gestor do integrante.</div>
  </div>
  <div aria-labelledby="abas1-t1" class="tabs__panel" hidden id="abas1-p1" role="tabpanel">
    <div class="form-description" style="max-width:none">Os sistemas e perfis que o integrante tem hoje.</div>
  </div>
  <div aria-labelledby="abas1-t2" class="tabs__panel" hidden id="abas1-p2" role="tabpanel">
    <div class="form-description" style="max-width:none">Todas as solicitações e revogações do integrante.</div>
  </div>
  <div aria-labelledby="abas1-t3" class="tabs__panel" hidden id="abas1-p3" role="tabpanel">
    <div class="form-description" style="max-width:none">Termos assinados e documentos da solicitação.</div>
  </div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.tabs.select(document.querySelector('#minha-aba'));
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.tabs--bar` | — | — | Abas em trilho segmentado. |
| `.tabs--fill` | — | — | Abas dividem a largura toda. |
| `.tabs--vertical + aria-orientation="vertical"` | — | — | Abas na lateral. |
| `aria-selected` | "true" | primeira | Aba aberta de início. |
| `aria-controls` | id do painel | — | Liga a aba ao seu painel. |
| `.has-error` | — | — | Marca a aba que tem campo com erro. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.tabs.select(aba)` | elemento \| seletor | — | Abre uma aba pelo código. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:tab-change` | { tab, index, panel } | — | Aba trocada. |

<a id="paginacao"></a>
## Paginação

`key: paginacao` · palavras-chave: pagination paginacao pager paginas · fonte CSS: navigation.css, buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="pager">
  <button class="btn btn--secondary btn--sm" type="button">
    <span aria-hidden="true" class="icon">chevron_left</span>
    <span>Anterior</span>
  </button>
  <span class="pager__info">Página <strong>2</strong> de <strong>25</strong></span>
  <button class="btn btn--secondary btn--sm" type="button">
    <span>Próxima</span>
    <span aria-hidden="true" class="icon">chevron_right</span>
  </button>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.pager` | — | — | Anterior / próxima com texto da posição. A paginação completa de tabela fica em tables.css. |

<a id="stepper"></a>
## Stepper (etapas)

`key: stepper` · palavras-chave: stepper etapas passos wizard · fonte CSS: navigation.css · fonte JS: navigation.js

**HTML base**

```html
<ol class="stepper" id="ex-stepper">
  <li aria-current="step" class="stepper__step is-current">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text"><span class="stepper__title">Início</span><span class="stepper__desc">Solicitante</span></span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text"><span class="stepper__title">Reajuste</span><span class="stepper__desc">Solicitante</span></span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text">
        <span class="stepper__title">Avaliação Supervisão</span>
        <span class="stepper__desc">Supervisor</span>
      </span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text">
        <span class="stepper__title">Avaliação CCA</span>
        <span class="stepper__desc">Analista CCA</span>
      </span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text">
        <span class="stepper__title">Avaliação Coordenação</span>
        <span class="stepper__desc">Coordenador</span>
      </span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text">
        <span class="stepper__title">Avaliação Gerência</span>
        <span class="stepper__desc">Gerente</span>
      </span>
    </span>
  </li>
  <li class="stepper__step">
    <span class="stepper__link">
      <span aria-hidden="true" class="stepper__marker"></span>
      <span class="stepper__text"><span class="stepper__title">Concluído</span><span class="stepper__desc"></span></span>
    </span>
  </li>
</ol>
```

**Uso pelo JavaScript**

```js
NOVAUI.stepper.set('.stepper', 2, { errors: [1] });
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.stepper--compact` | — | — | Mais baixo, nomes curtos. |
| `.stepper--vertical` | — | — | Etapas na vertical. |
| `.is-current · .is-complete · .is-error` | — | — | Estado de cada etapa. |

**NOVAUI.stepper.set(target, índice, opções)**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | O .stepper. |
| `índice` | número (começa em 0) | — | Etapa atual. As anteriores ficam concluídas. |
| `opções.errors` | lista de índices | [] | Etapas com erro. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:step-change` | { index } | — | Etapa mudou. |
| `nova:step-click` | { index, step } | — | Clique numa etapa (quando é link/botão). |

<a id="menu"></a>
## Menu suspenso (dropdown)

`key: menu` · palavras-chave: menu dropdown acoes opcoes · fonte CSS: navigation.css, buttons.css · fonte JS: navigation.js

**HTML base**

```html
<button type="button" class="btn btn--secondary" data-menu="menu-acoes" aria-haspopup="menu" aria-expanded="false">
  <span>Ações</span><span class="icon" aria-hidden="true">expand_more</span>
</button>

<div class="menu" id="menu-acoes" hidden>
  <button type="button" class="menu__item" data-value="editar"><span class="icon" aria-hidden="true">edit</span><span class="menu__label">Editar</span></button>
  <button type="button" class="menu__item" data-value="copiar"><span class="icon" aria-hidden="true">content_copy</span><span class="menu__label">Duplicar</span></button>
  <div class="menu__separator" role="separator"></div>
  <button type="button" class="menu__item menu__item--danger" data-value="excluir"><span class="icon" aria-hidden="true">delete</span><span class="menu__label">Excluir</span></button>
</div>
```

**Uso pelo JavaScript**

```js
document.querySelector('#menu-acoes').addEventListener('nova:menu-select', e => console.log(e.detail.value));
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-menu="id"` | id do .menu | — | No botão: abre o menu. |
| `data-menu-placement` | bottom-start \| bottom-end \| top-start \| top-end | bottom-start | Posição. |
| `data-value` | texto | texto do item | Valor do item. |
| `data-submenu="id"` | id | — | Item que abre outro menu. |
| `role="menuitemcheckbox" · "menuitemradio"` | — | — | Itens marcáveis (aria-checked). |
| `data-keep-open` | — | — | Não fecha ao clicar. |
| `.menu__item--danger` | — | — | Item destrutivo. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.menu.open(menu, { trigger, anchor, placement })` | — | — | Abre pelo código. |
| `NOVAUI.menu.close()` | — | — | Fecha. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:menu-select` | { item, value, checked, target } | — | Item escolhido. |

<a id="menu-contexto"></a>
## Menu de contexto (botão direito)

`key: menu-contexto` · palavras-chave: context menu botao direito · fonte CSS: navigation.css · fonte JS: navigation.js

**HTML base**

```html
<div data-context-menu="menu-linha">… área que abre o menu com o botão direito …</div>

<div class="menu" id="menu-linha" hidden>
  <button type="button" class="menu__item" data-value="abrir"><span class="menu__label">Abrir</span></button>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-context-menu="id"` | id do .menu | — | Área que abre o menu com o botão direito (ou Shift+F10). |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:context-menu` | { target, menu } | — | Menu aberto. |
| `nova:menu-select` | { item, value, target } | — | target = elemento onde clicou. |

---

# Experiência

<a id="estado-vazio"></a>
## Estado vazio / erro / sucesso

`key: estado-vazio` · palavras-chave: empty state vazio erro sucesso nada encontrado · fonte CSS: ux.css, buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="empty-state">
  <span class="icon-tile empty-state__icon"><span class="icon" aria-hidden="true">inbox</span></span>
  <p class="empty-state__title">Nenhuma solicitação ainda</p>
  <p class="empty-state__text">Quando você pedir acesso a um sistema, ela aparece aqui.</p>
  <div class="empty-state__actions"><button type="button" class="btn btn--primary">Nova solicitação</button></div>
</div>

<!-- variações: empty-state--error · --success · --compact · --bordered
     cor do ícone: icon-tile--danger · --success · --warning · --neutral -->
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.empty-state--error · --success` | — | — | Erro / sucesso. |
| `.empty-state--compact · --bordered` | — | — | Menor / com moldura tracejada. |
| `.icon-tile--danger · --success · --warning · --neutral` | — | azul | Cor do ícone. |

<a id="alerta"></a>
## Alerta (aviso na página)

`key: alerta` · palavras-chave: alert alerta aviso warning mensagem · fonte CSS: ux.css, buttons.css · fonte JS: ux.js

**HTML base**

```html
<div class="alert alert--warning" role="status">
  <span class="alert__icon"><span class="icon" aria-hidden="true">warning</span></span>
  <div class="alert__content">
    <p class="alert__title">Acesso expira em 5 dias</p>
    <p class="alert__text">Renove se ainda for necessário.</p>
  </div>
  <button type="button" class="btn btn--tertiary btn--sm btn--icon alert__close" data-dismiss aria-label="Fechar aviso"><span class="icon" aria-hidden="true">close</span></button>
</div>

<!-- variantes: alert--success · --warning · --danger · --neutral · --compact
     data-dismiss-key="chave" lembra que foi fechado -->
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.alert--success · --warning · --danger · --neutral` | — | info | Tipo do aviso. |
| `.alert--compact` | — | — | Uma linha só. |
| `data-dismiss` | — | — | No botão: fecha o aviso. |
| `data-dismiss-key` | texto | — | Lembra que foi fechado (não volta a aparecer). |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:dismiss` | { key } | — | Aviso fechado. |

<a id="banner"></a>
## Banner (faixa no topo)

`key: banner` · palavras-chave: banner faixa aviso topo manutencao · fonte CSS: ux.css, buttons.css · fonte JS: ux.js

**HTML base**

```html
<div class="banner banner--warning" role="status">
  <span class="banner__text"><span class="icon" aria-hidden="true">warning</span><span><strong>Manutenção programada:</strong> hoje, das 22h às 2h.</span></span>
  <button type="button" class="btn btn--tertiary btn--sm btn--icon banner__close" data-dismiss aria-label="Fechar aviso"><span class="icon" aria-hidden="true">close</span></button>
</div>
```

**Classes e Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.banner--warning · --danger · --neutral · --env` | — | info | Tipo. --env marca ambiente de teste. |
| `data-dismiss · data-dismiss-key` | — | — | Fechar e lembrar. |

<a id="confirmacao"></a>
## Confirmação

`key: confirmacao` · palavras-chave: confirm confirmacao excluir dialog pergunta · fonte CSS: ux.css, buttons.css, overlays.css · fonte JS: ux.js, overlays.js

**HTML base**

```html
<!-- não precisa de HTML: o diálogo é criado pelo JS -->
```

**Uso pelo JavaScript**

```js
NOVAUI.dialog.confirm({
  type: 'danger',          // 'danger' | 'warning' | 'primary' | 'success'
  title: 'Revogar 3 acessos?',
  message: 'O integrante perde o acesso agora.',
  consequences: ['Kcor · Operador', 'Fluig · Usuário'],
  confirmText: 'Revogar acessos'
  // requireText: 'EXCLUIR'   → exige digitar a palavra
}).then(ok => { if (ok) revogar(); });
```

**NOVAUI.dialog.confirm(opções) → Promise<boolean>**

Pergunta antes de uma ação. true = confirmou.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `type` | 'danger' \| 'warning' \| 'primary' \| 'success' | primary | Cor, ícone e botão. danger começa com o foco em "Cancelar". |
| `title` | texto | "Confirmar" | Pergunta. |
| `message` | texto | — | O que vai acontecer. |
| `consequences` | lista de textos | — | Itens afetados, em lista. |
| `confirmText · cancelText` | texto | "Confirmar" · "Cancelar" | Texto dos botões. |
| `requireText` | texto | — | Exige digitar a palavra para liberar o botão (ações irreversíveis). |
| `icon` | HTML | do type | Troca o ícone. |

**NOVAUI.dialog.alert(opções) → Promise**

Só informa, com um botão.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `type · title · message · confirmText` | — | "Entendi" | Mesmos parâmetros do confirm. |

<a id="tooltip"></a>
## Tooltip e ajuda (?)

`key: tooltip` · palavras-chave: tooltip dica ajuda help · fonte CSS: ux.css, buttons.css, inputs.css · fonte JS: ux.js

**HTML base**

```html
<label class="field__label" for="cc">Centro de custo
  <button type="button" class="help-tip" data-tip="Código de 6 dígitos do holerite." aria-label="Ajuda sobre centro de custo">?</button>
</label>

<!-- qualquer elemento: data-tip="texto" (data-tip-placement="bottom") -->
<button type="button" class="btn btn--secondary btn--icon" data-tip="Exportar" aria-label="Exportar"><span class="icon" aria-hidden="true">download</span></button>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-tip` | texto | — | Texto do tooltip (hover, foco e toque). |
| `data-tip-placement` | top \| bottom \| left \| right | top | Posição preferida. |
| `.help-tip` | — | — | Botão "?" redondo para ajuda de campo. |

<a id="coachmark"></a>
## Coachmark (novidade)

`key: coachmark` · palavras-chave: coachmark novidade dica ponto · fonte CSS: ux.css, buttons.css · fonte JS: ux.js

**HTML base**

```html
<span style="position:relative;display:inline-flex">
  <button type="button" class="btn btn--secondary">Exportar</button>
  <button type="button" class="coachmark coachmark--corner" data-coachmark="export-pdf" data-title="Exportar em PDF" data-text="Agora dá para exportar em PDF." data-placement="bottom"></button>
</span>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-coachmark` | chave | — | Identifica a novidade. Ao clicar em "Entendi" não aparece mais. |
| `data-title · data-text` | texto | — | Título e texto do balão. |
| `data-placement` | top \| bottom \| left \| right | bottom | Posição. |
| `.coachmark--corner` | — | — | Ponto no canto de outro elemento. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:coachmark-dismiss` | { key } | — | Novidade dispensada. |

<a id="tour"></a>
## Tour guiado

`key: tour` · palavras-chave: tour guia passo a passo onboarding · fonte CSS: ux.css, buttons.css · fonte JS: ux.js

**HTML base**

```html
<!-- não precisa de HTML extra: os passos apontam para elementos que já existem -->
```

**Uso pelo JavaScript**

```js
NOVAUI.tour({
  key: 'tour-portal',   // não repete para quem já viu
  steps: [
    { target: '#busca', title: 'Busca', text: 'Encontre integrantes por nome ou matrícula.' },
    { target: '#nova-solicitacao', title: 'Nova solicitação', text: 'Comece por aqui.', placement: 'top' }
  ]
});
```

**NOVAUI.tour(opções)**

Passo a passo destacando partes da tela.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `steps` | lista | — | Passos: { target, title, text, placement, padding }. Sem target, o passo fica no centro. |
| `key` | texto | — | Lembra que a pessoa já viu (não repete). |
| `doneText` | texto | "Concluir" | Texto do botão do último passo. |
| `onFinish` | function(concluiu) | — | Chamada ao terminar ou fechar. |

**Outras funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.tour.end()` | — | — | Encerra. |
| `NOVAUI.tour.hasSeen(key) · reset(key)` | — | — | Já viu? / esquece. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:tour-start · nova:tour-end` | { key, completed } | — | Início e fim. |

<a id="painel-ajuda"></a>
## Painel de ajuda

`key: painel-ajuda` · palavras-chave: help panel ajuda lateral artigos · fonte CSS: ux.css, buttons.css, inputs.css, data-display.css, form.css · fonte JS: ux.js

**HTML base**

```html
<aside aria-labelledby="help-demo-t" class="help-panel" id="help-demo">
  <div class="help-panel__header">
    <button aria-label="Voltar" class="btn btn--tertiary btn--sm btn--icon" data-help-back hidden type="button">
      <span aria-hidden="true" class="icon">chevron_left</span>
    </button>
    <h2 class="help-panel__title" id="help-demo-t">Ajuda do Portal</h2>
    <button aria-label="Fechar ajuda" class="btn btn--tertiary btn--sm btn--icon" data-help-close type="button">
      <span aria-hidden="true" class="icon">close</span>
    </button>
  </div>
  <div class="help-panel__search">
    <div class="field field--compact">
      <div class="field__control">
        <span class="field__icon"><span aria-hidden="true" class="icon">search</span></span>
        <div class="field__body">
          <label class="field__label" for="help-q">Buscar na ajuda</label>
          <input class="field__input" data-help-search id="help-q" placeholder="Buscar na ajuda" type="search">
        </div>
      </div>
    </div>
  </div>
  <div class="help-panel__body">
    <div class="help-panel__home">
      <div class="help-panel__section">
        <p class="help-panel__section-title">Mais acessados</p>
        <ul class="list list--divided">
          <li data-help-keywords="solicitar pedir novo acesso protheus rm fluig">
            <button class="list-item" data-help-article="art-solicitar" type="button">
              <span class="list-item__leading"><span aria-hidden="true" class="icon">description</span></span>
              <span class="list-item__content"><span class="list-item__title">Como pedir acesso a um sistema</span></span>
              <span class="list-item__trailing"><span aria-hidden="true" class="icon">chevron_right</span></span>
            </button>
          </li>
          <li data-help-keywords="prazo tempo sla demora">
            <button class="list-item" data-help-article="art-prazo" type="button">
              <span class="list-item__leading"><span aria-hidden="true" class="icon">description</span></span>
              <span class="list-item__content"><span class="list-item__title">Quanto tempo leva a liberação</span></span>
              <span class="list-item__trailing"><span aria-hidden="true" class="icon">chevron_right</span></span>
            </button>
          </li>
        </ul>
        <p class="form-helper" data-help-empty="" hidden="" style="padding:12px 0">Nenhum artigo encontrado. Fale com o Service Desk.</p>
      </div>
      <div class="help-panel__section">
        <p class="help-panel__section-title">Primeiros passos</p>
        <button class="btn btn--secondary btn--sm btn--block" id="help-tour" type="button">
          <span aria-hidden="true" class="icon">flag</span>
          <span>Fazer o tour da tela</span>
        </button>
      </div>
    </div>
  </div>
  <div class="help-panel__footer">
    <strong style="color:var(--nova-color-text-primary)">Não achou o que precisava?</strong>
    <span style="display:flex;flex-wrap:wrap;align-items:center;gap:8px" style="gap:16px">
      <span style="display:flex;flex-wrap:wrap;align-items:center;gap:8px" style="gap:6px"><span aria-hidden="true" class="icon">call</span>Ramal 2000</span>
      <span style="display:flex;flex-wrap:wrap;align-items:center;gap:8px" style="gap:6px"><span aria-hidden="true" class="icon">mail</span>servicedesk@novarotadooeste.com.br</span>
    </span>
  </div>
</aside>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-help-open="id"` | id do painel | — | Abre o painel. |
| `data-help-article="id"` | id do artigo | — | Abre direto num artigo. |
| `data-help-search` | — | — | Campo de busca dos artigos. |
| `data-help-keywords` | texto | — | Palavras extras de cada artigo. |
| `data-no-backdrop` | — | — | Painel sem escurecer a tela. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.help.open(id, artigo)` | — | — | Abre pelo código. |
| `NOVAUI.help.close()` | — | — | Fecha. |

<a id="faq"></a>
## FAQ (perguntas frequentes)

`key: faq` · palavras-chave: faq perguntas frequentes · fonte CSS: ux.css, data-display.css, inputs.css, buttons.css, form.css · fonte JS: ux.js

**HTML base**

```html
<div class="faq">
  <div class="faq__toolbar">
    <div class="field field--compact">
      <div class="field__control">
        <span class="field__icon"><span aria-hidden="true" class="icon">search</span></span>
        <div class="field__body">
          <label class="field__label" for="faq-q">Buscar pergunta</label>
          <input class="field__input" data-faq-search id="faq-q" placeholder="Buscar pergunta" type="search">
        </div>
      </div>
    </div>
    <div aria-label="Categoria" class="btn-segmented" role="group">
      <button aria-pressed="true" class="btn btn--secondary btn--sm" data-faq-filter="all" type="button">Todas</button>
      <button aria-pressed="false" class="btn btn--secondary btn--sm" data-faq-filter="acesso" type="button">Acessos</button>
      <button aria-pressed="false" class="btn btn--secondary btn--sm" data-faq-filter="senha" type="button">Senha</button>
      <button aria-pressed="false" class="btn btn--secondary btn--sm" data-faq-filter="aprovacao" type="button">Aprovação</button>
    </div>
    <span class="form-helper" data-faq-count></span>
  </div>
  <div class="accordion accordion--separated">
    <details class="accordion__item faq__item" data-category="acesso" data-keywords="pedir solicitar" name="faq-demo">
      <summary class="accordion__trigger"><span class="accordion__title">Como peço acesso a um sistema?</span></summary>
      <div class="accordion__content">
        <p>Pelo Portal, em <strong>Nova solicitação</strong>. Escolha o integrante, o sistema e o perfil; o gestor aprova pelo Fluig.</p>
        <div class="faq__feedback">
          <span class="faq__feedback-label">Isso ajudou?</span>
          <button class="btn btn--secondary btn--sm" data-faq-feedback="sim" type="button">Sim</button>
          <button class="btn btn--secondary btn--sm" data-faq-feedback="nao" type="button">Não</button>
        </div>
      </div>
    </details>
    <details class="accordion__item faq__item" data-category="acesso" data-keywords="terceiros equipe" name="faq-demo">
      <summary class="accordion__trigger"><span class="accordion__title">Posso pedir acesso para outra pessoa?</span></summary>
      <div class="accordion__content">
        <p>Sim, se você for gestor ou coordenador dela. Outros integrantes precisam pedir ao próprio gestor.</p>
        <div class="faq__feedback">
          <span class="faq__feedback-label">Isso ajudou?</span>
          <button class="btn btn--secondary btn--sm" data-faq-feedback="sim" type="button">Sim</button>
          <button class="btn btn--secondary btn--sm" data-faq-feedback="nao" type="button">Não</button>
        </div>
      </div>
    </details>
  </div>
  <div class="faq__empty" hidden>
    <div class="empty-state empty-state--compact empty-state--bordered">
      <span class="icon-tile icon-tile--neutral"><span aria-hidden="true" class="icon">search</span></span>
      <div>
        <p class="empty-state__title">Nenhuma pergunta sobre “<span data-faq-term=""></span>”</p>
        <p class="empty-state__text">Abra um chamado e a equipe responde em até 1 dia útil.</p>
      </div>
      <div class="empty-state__actions"><button class="btn btn--secondary btn--sm" type="button">Abrir chamado</button></div>
    </div>
  </div>
</div>
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-faq-search` | — | — | Campo de busca. |
| `data-faq-filter` | categoria \| all | — | Botões de filtro. |
| `.faq__item data-category · data-keywords` | texto | — | Categoria e palavras extras. |
| `data-faq-feedback` | sim \| nao | — | Botões "Ajudou?". |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:faq-feedback` | { helpful, item } | — | Resposta do "Ajudou?". |

<a id="onboarding"></a>
## Onboarding (primeiros passos)

`key: onboarding` · palavras-chave: onboarding checklist primeiros passos · fonte CSS: ux.css, buttons.css · fonte JS: ux.js

**HTML base**

```html
<div class="onboarding" id="onb-demo">
  <div class="onboarding__header">
    <div>
      <p class="onboarding__title">Primeiros passos no Portal</p>
      <p class="onboarding__subtitle" data-onboarding-count></p>
    </div>
    <div class="onboarding__ring"><span>0%</span></div>
  </div>
  <ol class="onboarding__steps">
    <li class="onboarding__step is-done" data-step="perfil">
      <span aria-hidden="true" class="onboarding__check"><span aria-hidden="true" class="icon">check</span></span>
      <div class="onboarding__step-body">
        <p class="onboarding__step-title">Confira seus dados</p>
        <p class="onboarding__step-text">Veja se cargo, setor e gestor estão certos no seu perfil.</p>
        <div class="onboarding__step-action">
          <button class="btn btn--primary btn--sm" data-onboarding-done="" type="button">Abrir perfil</button>
        </div>
      </div>
    </li>
    <li class="onboarding__step" data-step="notif">
      <span aria-hidden="true" class="onboarding__check"><span aria-hidden="true" class="icon">check</span></span>
      <div class="onboarding__step-body">
        <p class="onboarding__step-title">Escolha como ser avisado</p>
        <p class="onboarding__step-text">Defina se quer e-mail quando uma solicitação mudar.</p>
        <div class="onboarding__step-action">
          <button class="btn btn--primary btn--sm" data-onboarding-done="" type="button">Configurar</button>
        </div>
      </div>
    </li>
  </ol>
  <div class="onboarding__footer">
    <span>Leva cerca de 3 minutos</span>
    <button class="btn btn--ghost btn--sm" id="onb-reset" type="button">Recomeçar</button>
  </div>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.onboarding.complete('#onb-demo', 'perfil');
```

**Atributos HTML**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-onboarding-key` | texto | — | Guarda o progresso no navegador. |
| `.onboarding__step data-step` | id | — | Identifica cada passo. |
| `data-onboarding-done` | id do passo | — | Botão que conclui o passo. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.onboarding.complete(target, passo)` | — | — | Marca um passo como feito. |
| `NOVAUI.onboarding.reset(target)` | — | — | Volta ao início. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:onboarding-step` | { step } | — | Passo concluído. |
| `nova:onboarding-complete` | — | — | Todos concluídos. |

<a id="pagina-erro"></a>
## Página 404 / 403 / 500 / manutenção

`key: pagina-erro` · palavras-chave: 404 403 500 erro pagina manutencao · fonte CSS: ux.css, buttons.css · fonte JS: — (só CSS)

**HTML base**

```html
<div class="status-page" style="--status-page-height:600px">
  <div class="status-page__top">
    <img alt="Nova Rota do Oeste" class="status-page__logo only-light" src="nova-ui/logos/nova-rota-do-oeste.png">
    <img alt class="status-page__logo only-dark" src="nova-ui/logos/nova-rota-do-oeste.png">
  </div>
  <main class="status-page__main">
    <div class="status-page__card">
      <div>
        <p class="status-page__code">Erro 404</p>
        <h1 class="status-page__title">Não encontramos esta página</h1>
        <p class="status-page__text">O endereço pode ter mudado ou a página foi removida. Confira o link ou volte para o início.</p>
        <div class="status-page__actions">
          <a class="btn btn--primary" href="#ux-pages"><span aria-hidden="true" class="icon">home</span><span>Ir para o início</span></a>
          <button class="btn btn--secondary" onclick="history.back()" type="button">
            <span aria-hidden="true" class="icon">chevron_left</span>
            <span>Voltar</span>
          </button>
        </div>
        <ul class="status-page__links">
          <li><a href="#ux-pages">Página inicial</a></li>
          <li><a href="#ux-pages">Minhas solicitações</a></li>
          <li><a href="#ux-help">Central de ajuda</a></li>
          <li><a href="#ux-pages">Service Desk · ramal 2000</a></li>
        </ul>
      </div>
      <span class="icon-tile status-page__icon"><span aria-hidden="true" class="icon">explore_off</span></span>
    </div>
  </main>
  <footer class="status-page__footer">© 2026 Nova Rota do Oeste · Portal de Acessos</footer>
</div>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.status-page--warning · --danger` | — | info | Tom da página (manutenção, erro). |

---

# Sobreposições

<a id="toast"></a>
## Toast (aviso rápido)

`key: toast` · palavras-chave: toast notificacao snackbar aviso rapido · fonte CSS: overlays.css, buttons.css · fonte JS: overlays.js

**HTML base**

```html
<!-- não precisa de HTML: o toast é criado pelo JS -->
```

**Uso pelo JavaScript**

```js
NOVAUI.toast({
  type: 'success',        // 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'loading'
  message: 'Solicitação enviada.',
  timeout: 5000           // ms; 0 = fica até fechar
});

NOVAUI.toast({
  type: 'error',
  title: 'Não foi possível salvar',
  message: 'O RM não respondeu.',
  action: { label: 'Tentar de novo', onClick: salvar }
});

NOVAUI.toast.promise(salvar(), { loading: 'Salvando…', success: 'Salvo.', error: 'Falha ao salvar.' });
```

**NOVAUI.toast(opções) → toast**

Aviso rápido no canto da tela.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `type` | 'info' \| 'success' \| 'warning' \| 'error' \| 'neutral' \| 'loading' | info | Cor e ícone. loading mostra um spinner e não some sozinho. |
| `message` | texto | — | Texto principal. |
| `title` | texto | — | Título em negrito acima da mensagem. |
| `timeout` | ms | 5000 (error: 8000; loading: 0) | Tempo na tela. 0 = fica até fechar. Pausa com o mouse em cima. |
| `action` | { label, onClick(toast), keepOpen } | — | Botão de ação (ex.: "Desfazer"). |
| `actions` | lista de action | — | Mais de um botão. |
| `id` | texto | — | Mesmo id atualiza o toast em vez de criar outro. |
| `dismissible` | true \| false | true | Mostra o "×". |
| `inverse` | true \| false | false | Versão escura, discreta. |
| `icon` | nome do ícone | do type | Troca o ícone. |
| `onClose` | function(motivo) | — | Chamada ao fechar. |

**Retorno**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `toast.update(opções)` | mesmas opções | — | Atualiza o toast aberto. |
| `toast.close()` | — | — | Fecha. |

**Outras funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.toast.promise(promise, { loading, success, error })` | textos ou funções | — | Carregando → sucesso ou erro, conforme a promise. |
| `NOVAUI.toast.clear()` | — | — | Fecha todos. |
| `NOVAUI.toast.config({ position, max, timeout })` | position: bottom-right \| bottom-left \| bottom-center \| top-right \| top-center | bottom-right · 4 · 5000 | Padrões para a página. |

<a id="modal"></a>
## Modal

`key: modal` · palavras-chave: modal dialog janela popup · fonte CSS: ux.css, overlays.css, buttons.css · fonte JS: overlays.js

**HTML base**

```html
<button type="button" class="btn btn--primary" data-dialog-open="modal-editar">Editar</button>

<dialog class="dialog" id="modal-editar" aria-labelledby="modal-editar-titulo">
  <div class="dialog__header">
    <div class="dialog__heading">
      <h2 class="dialog__title" id="modal-editar-titulo">Editar integrante</h2>
      <p class="dialog__subtitle">Ana Beatriz Souza · 004871</p>
    </div>
    <button type="button" class="btn btn--tertiary btn--sm btn--icon dialog__close" data-dialog-close aria-label="Fechar"><span class="icon" aria-hidden="true">close</span></button>
  </div>
  <div class="dialog__body">
    <!-- conteúdo -->
  </div>
  <div class="dialog__footer">
    <button type="button" class="btn btn--secondary" data-dialog-close="cancel">Cancelar</button>
    <button type="button" class="btn btn--primary" data-dialog-close="confirm">Salvar</button>
  </div>
</dialog>

<!-- tamanhos: dialog--sm · --lg · --xl · --full · rolagem: dialog--scroll
     data-guard: pergunta antes de descartar alterações · data-static: não fecha pelo fundo/Esc -->
```

**Uso pelo JavaScript**

```js
NOVAUI.modal.open('modal-editar');
NOVAUI.modal.close('modal-editar', 'confirm');
document.getElementById('modal-editar').addEventListener('nova:modal-close', e => console.log(e.detail.value));
```

**Classes e Atributos HTML**

No <dialog class="dialog">.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.dialog--sm · --lg · --xl · --full` | — | md | Tamanho. |
| `.dialog--scroll` | — | — | Cabeçalho e rodapé fixos, corpo com rolagem. |
| `data-static` | — | — | Não fecha pelo fundo nem pelo Esc. |
| `data-guard` | — | — | Pergunta antes de descartar alterações. |
| `data-dialog-open="id"` | id | — | No botão: abre. |
| `data-dialog-close="valor"` | texto | — | No botão: fecha e devolve o valor. |

**Funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.modal.open(id)` | — | — | Abre. |
| `NOVAUI.modal.close(id, valor)` | — | — | Fecha devolvendo o valor. |
| `NOVAUI.modal.setLoading(id, bool)` | — | — | Loader no corpo do modal. |

**NOVAUI.modal.create(opções)**

Monta um modal ou drawer sem HTML prévio e remove ao fechar.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `type` | 'modal' \| 'drawer' | modal | Janela no centro ou painel lateral. |
| `side` | 'right' \| 'left' \| 'bottom' | right | Lado do drawer. |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | md | Tamanho (drawer: sm, md, lg). |
| `title · subtitle` | texto | — | Cabeçalho. |
| `content` | HTML \| elemento | — | Conteúdo do corpo. |
| `footer` | lista de { label, variant, value, onClick } | — | Botões. onClick que devolve Promise mostra loading; false impede fechar. |
| `scroll · guard · static` | true \| false | false | Mesmo efeito das classes/atributos. |
| `onClose` | function(valor) | — | Chamada ao fechar. |

**Eventos**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `nova:modal-open · nova:modal-close` | { value } | — | Abriu / fechou. |

<a id="drawer"></a>
## Drawer (painel lateral)

`key: drawer` · palavras-chave: drawer gaveta painel lateral · fonte CSS: ux.css, overlays.css, buttons.css · fonte JS: overlays.js

**HTML base**

```html
<button type="button" class="btn btn--secondary" data-dialog-open="drawer-detalhes">Detalhes</button>

<dialog class="dialog dialog--drawer" id="drawer-detalhes" aria-labelledby="drawer-detalhes-titulo">
  <div class="dialog__header">
    <div class="dialog__heading"><h2 class="dialog__title" id="drawer-detalhes-titulo">Detalhes</h2></div>
    <button type="button" class="btn btn--tertiary btn--sm btn--icon dialog__close" data-dialog-close aria-label="Fechar"><span class="icon" aria-hidden="true">close</span></button>
  </div>
  <div class="dialog__body"><!-- conteúdo --></div>
  <div class="dialog__footer"><button type="button" class="btn btn--primary" data-dialog-close>Fechar</button></div>
</dialog>

<!-- lado: dialog--left · dialog--bottom · largura: dialog--drawer-sm · --drawer-lg -->
```

**Classes**

No <dialog class="dialog dialog--drawer">.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.dialog--left · --bottom` | — | direita | Lado. |
| `.dialog--drawer-sm · --drawer-lg` | — | médio | Largura. |

**Funções**

Mesmas do modal: NOVAUI.modal.open/close/setLoading e create({ type: "drawer", side }).

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|

---

# Carregamento

<a id="loader-overlay"></a>
## Loader sobre um elemento

`key: loader-overlay` · palavras-chave: loader carregando overlay jquery · fonte CSS: loaders.css · fonte JS: loaders.js

**HTML base**

```html
<!-- não precisa de HTML: o loader é colocado sobre o elemento -->
```

**Uso pelo JavaScript**

```js
$('#form').loader();            // com jQuery
$('#form').loader('unload');

NOVAUI.loader.wrap({ target: '#form', promise: buscarDados(), message: 'Buscando no RM…' });
```

**NOVAUI.loader.show(opções)**

Cobre o elemento com o loader.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | página inteira | O que fica coberto. |
| `message` | texto | — | Texto abaixo da animação. |
| `card` | true \| false | false | Caixa em volta da animação. |
| `blur` | true \| false | false | Desfoca o conteúdo por trás. |
| `size` | 'sm' \| 'md' \| 'lg' | md | Tamanho da animação. |
| `delay` | ms | 150 | Espera antes de aparecer (carga rápida nem pisca). |
| `minTime` | ms | 400 | Tempo mínimo na tela depois que aparece. |

**Outras funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.loader.hide(target) ou hide({ target, force })` | — | — | Esconde. Chamadas aninhadas contam; force fecha de vez. |
| `NOVAUI.loader.wrap({ target, promise, … })` | mesmas opções + promise | — | Mostra até a promise terminar. |
| `NOVAUI.loader.message(target, texto)` | — | — | Troca o texto com o loader aberto. |
| `NOVAUI.loader.isLoading(target)` | — | — | Está carregando? |
| `$(el).loader() · .loader('unload')` | — | — | Plugin jQuery. |

<a id="tela-abertura"></a>
## Tela de abertura (widget)

`key: tela-abertura` · palavras-chave: loader tela abertura widget splash · fonte CSS: loaders.css, buttons.css · fonte JS: loaders.js

**HTML base**

```html
<div class="meu-widget" style="position:relative;min-height:320px">
  <!-- conteúdo do widget -->
  <div class="loader-screen loader-screen--brand" role="status">
    <p class="loader-screen__title">Abono</p>
    <p class="loader-screen__subtitle">Relatório de Abono</p>
    <div class="loader-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    <p class="loader-screen__message" aria-live="polite"></p>
    <p class="loader-screen__footer">Nova Rota do Oeste</p>
  </div>
</div>
```

**Uso pelo JavaScript**

```js
const tela = NOVAUI.loader.screen('.meu-widget');
tela.message('Buscando abonos no RM…');
carregar().then(() => tela.hide()).catch(() => tela.error('O RM não respondeu.', recarregar));
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.loader-screen--brand` | — | — | Fundo azul da marca. |
| `.loader-screen--fixed` | — | — | Cobre a página inteira. |

**NOVAUI.loader.screen(target) → controle**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.message(texto)` | — | — | Texto de andamento. |
| `.progress(0–100)` | — | — | Barra de progresso (null esconde). |
| `.error(texto, aoTentar)` | function | — | Mostra erro com botão "Tentar de novo". |
| `.hide() · .show()` | — | — | Esconde / mostra de novo. |

<a id="spinner"></a>
## Spinner e pontos

`key: spinner` · palavras-chave: spinner carregando pontos dots · fonte CSS: loaders.css · fonte JS: — (só CSS)

**HTML base**

```html
<span class="spinner" aria-hidden="true"></span>
<span class="loader-dots" aria-hidden="true"><span></span><span></span><span></span></span>
<span class="loading-inline" role="status"><span class="spinner spinner--sm" aria-hidden="true"></span>Buscando…</span>
```

**Classes**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `.spinner--sm · --lg` | — | médio | Tamanho. |
| `.spinner--current` | — | — | Usa a cor do texto em volta. |
| `.loader-dots` | — | — | Três pontos animados. |
| `.loader--mono` | — | — | Loader da marca em uma cor só. |

<a id="skeleton"></a>
## Skeleton

`key: skeleton` · palavras-chave: skeleton carregamento placeholder · fonte CSS: loaders.css, data-display.css · fonte JS: loaders.js

**HTML base**

```html
<!-- modelo pronto -->
<div data-skeleton="list" data-rows="4"></div>

<!-- no próprio layout: data-sk + .is-loading no container -->
<div class="card is-loading" id="ficha">
  <h4 class="card__title" data-sk></h4>
  <p data-sk></p>
</div>
```

**Uso pelo JavaScript**

```js
NOVAUI.skeleton.wrap({ target: '#tbody', promise: carregar(), type: 'table', rows: 5, cols: 4 });
NOVAUI.skeleton.loading('#ficha', false);   // modo data-sk
```

**Tipos (valor de data-skeleton ou de type)**

Um valor fora da lista vira text.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `text` | — | data-lines: 3 | Parágrafo com várias linhas de texto. |
| `list` | — | data-rows: 4 | Lista com avatar, duas linhas de texto e um badge. data-avatar="false" tira o avatar. |
| `card` | — | data-count: 1 | Card com título, texto e botões. data-media põe uma área de imagem no topo. |
| `product` | — | data-count: 1 | Card com foto (produto): foto quadrada com etiqueta, título, linha de dados, preço e estoque, e dois botões. Mesmo formato do .card--product; com data-count > 1 vira uma grade. |
| `stat` | — | data-count: 4 | Indicadores: rótulo e número grande. |
| `form` | — | data-fields: 4 · data-cols: 2 | Campos de formulário em grade. |
| `table` | — | data-rows: 5 · data-cols: 4 | Linhas de tabela. Use num <tbody>. data-avatar põe avatar na 1ª coluna. |
| `chart` | — | data-bars: 8 | Gráfico de barras. |

**Atributos HTML**

Modo automático: o elemento precisa estar vazio. Em HTML inserido depois, chame NOVAUI.refresh(root).

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `data-skeleton` | text \| list \| card \| product \| stat \| form \| table \| chart | text | Transforma o elemento vazio no esqueleto do tipo escolhido. |
| `data-rows` | número | list: 4 · table: 5 | Quantidade de linhas. |
| `data-cols` | número | table: 4 · form: 2 | Quantidade de colunas. |
| `data-lines` | número | 3 | Linhas do tipo text. |
| `data-count` | número | card: 1 · product: 1 · stat: 4 | Quantidade de cards, cards com foto ou indicadores. |
| `data-fields` | número | 4 | Campos do tipo form. |
| `data-bars` | número | 8 | Barras do tipo chart. |
| `data-avatar` | true \| false | list: com avatar · table: sem | Mostra ou tira o círculo de avatar. |
| `data-media` | — | — | No tipo card: área de imagem no topo. |
| `data-sk` | — | — | Outro modo: o elemento do próprio layout vira barra cinza enquanto o container tem .is-loading. |

**NOVAUI.skeleton.show(opções)**

Troca o conteúdo por um esqueleto enquanto carrega.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `target` | elemento \| seletor | — | Onde aparece. Em <tbody> gera linhas de tabela. |
| `type` | text \| list \| card \| product \| stat \| form \| table \| chart | text | Formato do esqueleto (veja a tabela de tipos). |
| `rows · cols · lines · count · fields · bars` | número | depende do tipo | Mesmos ajustes dos atributos data-* (veja a tabela de tipos). |
| `avatar · media` | true \| false | depende do tipo | Avatar (list, table) / imagem no card. |
| `minTime` | ms | 300 | Tempo mínimo na tela, para não piscar. |

**Outras funções**

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `NOVAUI.skeleton.wrap({ target, promise, type, … })` | — | — | Mostra até a promise terminar. |
| `NOVAUI.skeleton.hide(target)` | — | — | Esconde. |
| `NOVAUI.skeleton.loading(target, bool)` | — | — | Modo data-sk: liga/desliga .is-loading no container. |
| `NOVAUI.skeleton.html({ type, … })` | — | — | Só o HTML. |

<a id="barra-topo"></a>
## Barra de carregamento no topo

`key: barra-topo` · palavras-chave: barra topo progresso carregamento · fonte CSS: loaders.css · fonte JS: loaders.js

**HTML base**

```html
<!-- não precisa de HTML -->
```

**Uso pelo JavaScript**

```js
NOVAUI.loader.bar.start();
// ...
NOVAUI.loader.bar.done();
```

**NOVAUI.loader.bar**

Barra fina no topo da página.

| Parâmetro / classe | Tipo / valores | Padrão | Para quê |
|---|---|---|---|
| `start()` | — | — | Começa (avança devagar sozinha). |
| `set(0–100)` | número | — | Define o progresso. |
| `done()` | — | — | Completa e some. Chamadas aninhadas contam. |
