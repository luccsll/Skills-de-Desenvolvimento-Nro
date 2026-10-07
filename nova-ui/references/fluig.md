# Nova UI dentro do Fluig

## Onde dá para mexer

Na tela de processo, só a **área do formulário** é editável. Breadcrumb, abas e o botão "Enviar" nativo são do Fluig e ficam fixos. Essa área tem fundo branco. A lateral é da sidebar do Fluig: navegação da tela vai no topo (abas, stepper, anchor nav, breadcrumb).

## Esqueleto de formulário de processo

```html
<html>
  <head>
    <link type="text/css" rel="stylesheet" href="/style-guide/css/fluig-style-guide.min.css" />
    <script type="text/javascript" src="/portal/resources/js/jquery/jquery.js"></script>
    <script type="text/javascript" src="/portal/resources/js/jquery/jquery-ui.min.js"></script>
    <script type="text/javascript" src="/portal/resources/js/mustache/mustache-min.js"></script>
    <script type="text/javascript" src="/style-guide/js/fluig-style-guide.min.js" charset="utf-8"></script>
    <!-- só se o formulário consultar datasets -->
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>

    <!-- Nova UI (depois do CSS do Fluig) -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" />
    <link type="text/css" rel="stylesheet" href="https://nova-ui.novarotadooeste.com.br/v1/min/nova-ui.min.css" />

    <!-- CSS próprio deste formulário -->
    <link type="text/css" rel="stylesheet" href="nome-do-formulario.css" />
  </head>
  <body>
    <div class="fluig-style-guide">
      <form name="form" role="form">
        <!-- conteúdo com componentes da Nova UI -->
      </form>
    </div>

    <script src="https://nova-ui.novarotadooeste.com.br/v1/min/nova-ui.min.js"></script>
    <script src="nome-do-formulario.js"></script>
  </body>
</html>
```

## Regras práticas

- **Gravação**: o Fluig grava os campos com `name` dentro do `form`. Modal (`<dialog>`) e drawer montados no HTML ficam dentro do form, então os campos deles também são gravados. Campo que é só filtro/auxiliar e não deve ir para o processo: sem `name`.
- **Select com busca, tags, editor de texto e OTP** mantêm um campo nativo com `name`; o valor chega ao Fluig normalmente.
- **Autocomplete**: o input visível mostra o rótulo; o `input type="hidden"` com `name` recebe o código (`valueInput`). Grave o código, não o texto.
- **Botões**: sempre `type="button"`.
- **Ordem do CSS**: Nova UI depois do `fluig-style-guide.min.css`.
- **Classes**: a Nova UI evita as do Bootstrap 3 do Fluig — `.form-col-*` (não `.col-*`), `.data-table` (não `.table`), `.page-container` (não `.container`).
- **Sem internet no servidor**: se o Google Fonts estiver bloqueado, os ícones aparecem como texto ("search"). Solução: hospedar Inter e Material Symbols junto com a biblioteca.
- **Cache**: a URL tem versão (`/v1/`). Mudança que quebra algo sai em `/v2/`.

## Pai x filho (tabelas de itens do Fluig)

A Nova UI usa delegação de eventos do jQuery, então cliques funcionam em linhas novas. Máscaras, selects com busca e contadores precisam ser iniciados depois de inserir a linha:

```js
$('#adicionar-item').on('click', function () {
  var indice = wdkAddChild('itens');           // nome da tabela pai x filho
  NOVAUI.refresh('#itens');                     // inicia componentes da linha nova
});
```

Use `NOVAUI.refresh(container)` sempre que inserir HTML depois do carregamento (AJAX, linha filha, conteúdo de `NOVAUI.modal.create`).

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
    return (ds && ds.values ? ds.values : []).map(function (r) {
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

## Responsividade (obrigatória)

Aprovações e solicitações são feitas pelo celular.

- Celular (~390 px) sem rolagem horizontal.
- Campos em `form-col-12`, dividindo só a partir de `form-col-md-*`.
- Tabelas com `data-table--stack` (viram cartões) ou dentro de `.table-scroll`.
- Sem larguras fixas em px no layout.
- Área de toque confortável; nada escondido atrás de hover.
- Testar com a extensão **Responsive Viewer** (Chrome): 390 px, 820 px e desktop.

## Convenções de código da equipe

- Nada de CSS inline; todo CSS no `.css` do formulário, com classes de nome claro (pode ser em inglês).
- JS com jQuery, em `$(function () { … })`, funções com JSDoc, chamadas externas com `try/catch`.
- Sem `onclick=` no HTML.
- Toda chamada à biblioteca começa por `NOVAUI.` (os nomes antigos `NovaToast`, `NovaModal`… não existem mais).
- Componentes com variação recebem objeto com `type`.
