# Nova UI dentro do Fluig

## Onde dá para mexer

Na tela de processo, só a **área do formulário** é editável. Breadcrumbs, abas e o botão "Enviar" nativo são do Fluig e ficam fixos. Essa área tem fundo branco: não use cards com sombra sobre fundo cinza para "emoldurar" o formulário; separe as partes com divisórias e use painéis de fundo suave. A lateral é da sidebar do Fluig: navegação da tela vai no topo (abas, stepper, anchor nav, breadcrumbs).

## Esqueleto de formulário de processo

```html
<html>
  <head>
    <script type="text/javascript" src="/portal/resources/js/jquery/jquery.js"></script>
    <script type="text/javascript" src="/portal/resources/js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="/portal/resources/js/mustache/mustache-min.js"></script>
    <!-- só se algum campo usar zoom nativo ou FLUIGC.* -->
    <script type="text/javascript" src="/style-guide/js/fluig-style-guide.min.js" charset="utf-8"></script>
    <!-- só se o formulário consultar datasets ou usar NOVAUI.integration.* -->
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>

    <!-- Nova UI -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" />
    <!-- só se o formulário tiver anexo com layout 'drop' -->
    <link rel="stylesheet" href="https://unpkg.com/filepond/dist/filepond.min.css" />
    <link type="text/css" rel="stylesheet" href="https://nova-ui.novarotadooeste.com.br/v1/min/nova-ui.min.css" />

    <!-- CSS próprio deste formulário -->
    <link type="text/css" rel="stylesheet" href="nome-do-formulario.css" />
  </head>
  <body>
    <form name="form" role="form">
      <!-- campos ocultos de controle (atividade, solicitante…) podem ficar aqui -->
      <div class="nova-design-system">
        <!-- conteúdo com componentes da Nova UI -->
      </div>
    </form>

    <!-- só se tiver anexo com layout 'drop' (carregue ANTES da Nova UI) -->
    <script src="https://unpkg.com/filepond/dist/filepond.min.js"></script>
    <!-- só se o anexo mostrar prévia de PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

    <script src="https://nova-ui.novarotadooeste.com.br/v1/min/nova-ui.min.js"></script>
    <script src="nome-do-formulario.js"></script>
  </body>
</html>
```

Inclua FilePond e pdf.js **só** quando a tela usar anexo com área de arrastar e soltar (`layout: 'drop'`) ou prévia de PDF. Anexo com `layout: 'button'` não precisa do FilePond.

## Regras práticas

- **Gravação**: o Fluig grava os campos com `name` dentro do `form`. Modal (`<dialog>`) e drawer montados no HTML ficam dentro do form, então os campos deles também são gravados. Campo só de filtro/auxiliar: sem `name`.
- **Select com busca, tags, editor, OTP, datepicker e timepicker** mantêm um campo nativo com `name`; o valor chega ao Fluig normalmente. No `<input type="date" data-datepicker>`, o campo mostra dd/mm/aaaa e um oculto com o mesmo `name` grava aaaa-mm-dd.
- **Autocomplete**: o input visível mostra o rótulo; o `input type="hidden"` com `name` recebe o código (`valueInput`). Grave o código, não o texto.
- **Anexo**: o nome do arquivo é gravado no campo indicado em `nameField` (as próximas etapas acham o anexo por ele). Com `fluig: true` o arquivo vai para a aba Anexos do processo.
- **Botões**: sempre `type="button"`.
- **Sem o style guide do Fluig**: o formulário não carrega o `fluig-style-guide.min.css` nem usa o wrapper `.fluig-style-guide`. A área do formulário fica dentro de `<div class="nova-design-system">` (fonte, cor e `box-sizing` da Nova UI). O `fluig-style-guide.min.js` só entra se algum campo usar zoom nativo ou `FLUIGC.*`.
- **Classes que não colidem com o Fluig**: a Nova UI evita as do Bootstrap 3 e as do `wcm_global.css`. Use `.form-col-*` (não `.col-*`), `.data-table` (não `.table`), `.page-container` (não `.container`), `.form-layout` (não `.form`), `.form-inline-row` (não `.form-inline`), `.form-error-text` (não `.form-error`), `.breadcrumbs` (não `.breadcrumb`).
- **Sem CSS inline**: nada de `style=""` nem `<style>` no HTML. Use utilitários da Nova UI (`.margin-top-4`, `.table--min-md`, `.col-width-120`, `data-value`…) ou crie a classe no `.css` do processo. Única exceção: template de e-mail (ver abaixo).
- **Sem internet no servidor**: se o Google Fonts estiver bloqueado, os ícones aparecem como texto ("search"). Hospede Open Sans e Material Symbols junto com a biblioteca.
- **Cache**: a URL tem versão (`/v1/`). Mudança que quebra algo sai em `/v2/`.
- **Logins**: no Fluig da NRO o login é o nome junto, sem ponto (ex.: `marcosferreira`). Use esse formato em exemplos de usuário, destinatário de e-mail e `user` do histórico de alterações.

## Campos melhorados só com atributo ou classe

Regra da Nova UI: campo que ganha comportamento (máscara, validação, select com busca, data, hora, contador, tags) funciona **só com atributo ou classe**, sem instanciar no JS. Use JS apenas quando a regra for dinâmica (ex.: feriados vindos de um dataset no `NOVAUI.datepicker.create`). Componentes maiores (modal criado por JS, toast, tour, anexo, histórico de alterações, calendário) continuam sendo criados pelo JS.

| Quero | Só com HTML |
|---|---|
| Máscara | `data-mask="cpf|cnpj|cep|phone|placa|currency|…"` |
| Validação | `data-validate="cpf email …"` + `required` |
| Select com busca | `<select data-enhance data-search>` |
| Data / período | `data-datepicker` (+ `data-range-end="#fim"` / `data-range-start="#inicio"`, `data-min`, `data-max`, `data-disable="weekends"`) |
| Hora | `data-timepicker` (+ `data-step`, `data-min`, `data-max`, `data-range-*`) |
| Contador | `maxlength` + `.field__counter` |
| Tabela pai x filho | `.child-table` + `table[tablename]` + `tr[data-child-template]` |
| Filtro de tabela | `.filter-bar[data-filter-for="#tabela"]` + `data-filter="chave"` |
| Ações em massa | `.table-bulk[data-bulk-for]` + `data-bulk-action` |

## Validação no envio (beforeSendValidate)

O Fluig chama `beforeSendValidate` antes de enviar. Lance uma string para bloquear com mensagem.

```js
var beforeSendValidate = function (numState, nextState) {
  var ok = true;
  $('form .field__input[required], form .field__input[data-validate]').each(function () {
    if (!NOVAUI.field.validate(this)) ok = false;   // marca o erro no campo
  });
  if (!NOVAUI.attachment.validate()) ok = false;    // anexos obrigatórios (se houver)
  if (!NOVAUI.childTable.validate('#itens')) ok = false; // mínimo de linhas (se houver)
  if (!ok) throw 'Corrija os campos destacados.';
};
```

Inclua no `beforeSendValidate` só as validações dos componentes que a tela tem.

## Regras por etapa (atividade)

Campos e componentes mudam por etapa. Leia a atividade com `getWKNumState()` (ou um campo oculto) e use listas de atividades:

```js
var atividade = getWKNumState();
var INICIO = ['0', '4'], REAJUSTE = ['10'];

$(function () {
  NOVAUI.attachment.create({
    target: '#anexo-cnh',
    nameField: '#anexoCnhNome',
    editable: INICIO.concat(REAJUSTE).indexOf(atividade) > -1,
    removable: REAJUSTE.indexOf(atividade) > -1
  });
  NOVAUI.childTable.create({ target: '#itens', editable: INICIO.indexOf(atividade) > -1 });
});
```

## Página de processo (sem CSS próprio)

Tela de escolha, cabeçalho, partes numeradas e resumo são componentes (`componentes.md`, grupo **Processo**). Estrutura:

```html
<form name="form" role="form">
  <div class="nova-design-system">
    <div id="tela-escolha"> .process-choice com .choice-card </div>
    <div id="tela-formulario" hidden>
      <header class="process-header"> … </header>
      <div class="process-layout">
        <div class="process-layout__main">
          <section class="process-section" id="parte-x" data-process-auto> … </section>
        </div>
        <aside class="process-layout__aside">
          <div class="process-summary"> … [data-process-sections] … </div>
        </aside>
      </div>
    </div>
  </div>
</form>
```

- Parte de outra etapa: `hidden` na `.process-section` (numeração e resumo se ajustam).
- Parte completa: `data-process-auto` (obrigatórios preenchidos) ou `NOVAUI.process.setComplete({ target, complete })`.
- Etapa atual: `NOVAUI.stepper.set('#etapas', índice)` no `.stepper--scroll` do cabeçalho.
- Não escreva CSS para cabeçalho, partes, resumo ou tela de escolha. Se precisar de algo que esses componentes não fazem, proponha incluir na Nova UI.

## Pai x filho

Use o componente `.child-table` (`#pai-filho` em `componentes.md`). Ele usa `wdkAddChild` e `fnWdkRemoveChild` do Fluig, numera as linhas, mostra estado vazio, respeita mínimo/máximo e inicia os componentes da linha nova sozinho. Na `<table>`: `tablename`, `noaddbutton="true"` e `nodeletebutton="true"`. Não chame `wdkAddChild` na mão: use `NOVAUI.childTable.add(target, valores)`.

## Datasets no formulário

```js
/**
 * Lista os setores ativos.
 * @returns {Array<{value:string,label:string}>}
 */
function listarSetores() {
  try {
    var c = [DatasetFactory.createConstraint('ativo', 'true', 'true', ConstraintType.MUST)];
    var ds = DatasetFactory.getDataset('ds_global_listaSetores', null, c, null);
    return $.map(ds && ds.values ? ds.values : [], function (r) {
      return { value: r.codigo, label: r.descricao };
    });
  } catch (e) {
    NOVAUI.toast({ type: 'error', title: 'Não foi possível carregar os setores', message: e.message });
    return [];
  }
}
```

Para popular um select com busca: crie as `<option>` e chame `NOVAUI.select.refresh('#setor')`. Para busca enquanto digita: `NOVAUI.select.autocomplete` com `source: function (termo, done) { … done(lista); }`.

Nome do dataset segue `nomenclatura.md`. Função reutilizada em vários projetos vai para `NOVAUI.integration` (ver `integracoes.md`).

## E-mail de notificação

Template em `componentes.md` (`#email-fluig`). É a **única exceção** à regra sem CSS inline: e-mail não carrega `.css` e o Outlook não entende flex, então o layout é em `<table>` com `style` direto nos elementos. Cadastro: Painel de Controle › Templates de e-mail, código `tpl_notificacao`. Envio no evento do processo com `notifier.notify`, mandando **todas** as 12 variáveis (mesmo vazias) e o `subject`.

## Responsividade (obrigatória)

Aprovações e solicitações são feitas pelo celular.

- Celular (~390 px) sem rolagem horizontal.
- Campos em `form-col-12`, dividindo só a partir de `form-col-md-*`.
- Tabelas com `data-table--stack` (viram cartões) ou dentro de `.table-scroll` (com `.table--min-*` para a largura mínima).
- Sem larguras fixas em px no layout.
- Área de toque confortável; nada escondido atrás de hover.
- Testar com a extensão **Responsive Viewer** (Chrome): 390 px, 820 px e desktop.

## Convenções de código da equipe

- Nada de CSS inline; todo CSS no `.css` do formulário, com classes de nome claro (pode ser em inglês).
- JS **sempre com jQuery**: `$(function () { … })`, `$('#id').on('evento', function (e) { … })`, `$.map`, `$.each`. Nada de JS puro (`document.querySelector`, `addEventListener`), arrow functions, `const`/`let` ou template strings: use `var` e `function`.
- Eventos `nova:*`: os dados ficam em `e.originalEvent.detail`.
- Funções com JSDoc; chamadas externas com `try/catch`.
- Sem `onclick=` no HTML.
- Toda chamada à biblioteca começa por `NOVAUI.` (os nomes antigos `NovaToast`, `NovaModal`… e `NOVAUI.upload` não existem mais).
- Componentes com variação recebem objeto com `type`.
