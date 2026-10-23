# Nova UI — Índice da API JavaScript (NOVAUI)

Tudo o que se chama pelo JS começa por `NOVAUI`. Componentes com variações recebem **um objeto** com a variação em `type`. Detalhes de cada parâmetro: `componentes.md`, na seção do componente indicado.

**Eventos `nova:*` com jQuery:** os dados ficam em `e.originalEvent.detail`:

```js
$('#anexo-cnh').on('nova:attachment-add', function (e) {
  console.log(e.originalEvent.detail.name);
});
```

Componentes que vão para o `<body>` quando abrem (menu) são escutados pelo `document`: `$(document).on('nova:menu-select', '#menu-acoes', function (e) { … })`.

| Função / evento | Componente (seção em componentes.md) | Para quê |
|---|---|---|
| `NOVAUI.field.setState(opções)` | Campo de texto (`#campo-texto`) | Muda o estado visual e a mensagem do campo. |
| `NOVAUI.field.clear(target)` | Campo de texto (`#campo-texto`) | Limpa o valor e dispara input/change. |
| `NOVAUI.field.refresh(root)` | Campo de texto (`#campo-texto`) | Recalcula contador, máscaras e estado de valor em HTML novo. |
| `NOVAUI.field.validate(target)` | Estado do campo via JavaScript (`#campo-estado-js`) | Aplica required e data-validate agora. Marca o erro e devolve true/false. |
| `NOVAUI.field.unmask(target)` | Campo com máscara e validação (`#campo-mascara`) | Valor sem máscara. Em currency devolve número. |
| `NOVAUI.field.isCPF(v) · isCNPJ(v)` | Campo com máscara e validação (`#campo-mascara`) | Confere um CPF/CNPJ sem precisar de campo. |
| `NOVAUI.datepicker.create(opções)` | Seletor de data e período (`#data-periodo`) | Regras pelo JS. disable pode ser uma função (data) → true para bloquear. |
| `NOVAUI.datepicker.open(target) · close()` | Seletor de data e período (`#data-periodo`) | Abre e fecha o calendário. |
| `NOVAUI.datepicker.setValue(target, valor) · getDate(target)` | Seletor de data e período (`#data-periodo`) | Muda o valor / devolve a data como Date. |
| `nova:date-change` | Seletor de data e período (`#data-periodo`) | No campo (no período, no campo inicial). |
| `NOVAUI.timepicker.create(opções)` | Seletor de hora (`#hora`) | Regras pelo JS. |
| `NOVAUI.timepicker.open(target) · close() · setValue(target, 'hh:mm')` | Seletor de hora (`#hora`) | Abre, fecha e muda o valor. |
| `nova:time-change` | Seletor de hora (`#hora`) | No campo, ao escolher na lista. |
| `NOVAUI.field.autofill(target, valor)` | Campo preenchido automaticamente (`#campo-auto`) | Preenche o campo e destaca por um instante. |
| `NOVAUI.field.otp.setState(opções)` | Código de verificação (OTP / PIN) (`#otp`) |  |
| `nova:otp-complete` | Código de verificação (OTP / PIN) (`#otp`) | Disparado quando todas as caixas estão preenchidas. |
| `NOVAUI.select.setValue(target, valor)` | Select (lista suspensa) (`#select`) | Escolhe o valor pelo código e dispara change. |
| `NOVAUI.select.refresh(target)` | Select (lista suspensa) (`#select`) | Atualiza depois de mudar as <option> pelo JS. |
| `NOVAUI.select.close()` | Select (lista suspensa) (`#select`) | Fecha a lista aberta. |
| `NOVAUI.select.setValue(target, [valores])` | Multi select (`#multi-select`) | Marca vários de uma vez. |
| `NOVAUI.select.autocomplete(target, opções)` | Autocomplete (busca em dataset) (`#autocomplete`) | Sugestões enquanto digita, de uma lista ou de um dataset. |
| `nova:autocomplete-select` | Autocomplete (busca em dataset) (`#autocomplete`) | Disparado no input ao escolher. |
| `nova:listbox-change` | Listbox (lista de opções visível) (`#listbox`) | Disparado a cada mudança. |
| `nova:toggle` | Tags de filtro (`#tag-filtro`) | Disparado ao clicar. |
| `NOVAUI.tags.get(target)` | Campo de tags (`#campo-tags`) | Lista de valores. |
| `NOVAUI.tags.set(target, lista)` | Campo de tags (`#campo-tags`) | Troca todas as tags. |
| `NOVAUI.tags.add(target, valor) · remove(target, valor)` | Campo de tags (`#campo-tags`) | Adiciona ou remove uma. |
| `nova:tags-change` | Campo de tags (`#campo-tags`) | Disparado a cada mudança. |
| `NOVAUI.rte.getHTML(target)` | Editor de texto (rich text) (`#editor-texto`) | HTML atual. |
| `NOVAUI.rte.setHTML(target, html)` | Editor de texto (rich text) (`#editor-texto`) | Troca o conteúdo. |
| `NOVAUI.rte.setDisabled(target, bool)` | Editor de texto (rich text) (`#editor-texto`) | Bloqueia a edição. |
| `NOVAUI.attachment.create(opções)` | Anexo (upload de arquivos) (`#anexo`) | Cria o campo. Devolve o controle (remove, clear, files, names, validate, destroy). As opções também podem vir no HTML: data-layout, data-fluig="false", data-multiple, data-max-files, data-max-size, data-accept, data-prefix, data-required. |
| `NOVAUI.attachment.validate(target?)` | Anexo (upload de arquivos) (`#anexo`) | Confere os obrigatórios e marca o erro. Use no beforeSendValidate. |
| `NOVAUI.attachment.get(target)` | Anexo (upload de arquivos) (`#anexo`) | Controle de um campo já criado (.remove(nome), .clear(), .names(), .validate(), .destroy()). |
| `NOVAUI.attachment.getFiles(target) · clear(target)` | Anexo (upload de arquivos) (`#anexo`) | Arquivos anexados nesta etapa (File[]) / tira todos. |
| `NOVAUI.attachment.setProgress({ target, value })` | Anexo (upload de arquivos) (`#anexo`) | Barra de progresso do arquivo (target = item do evento). |
| `NOVAUI.attachment.setStatus({ target, type, message })` | Anexo (upload de arquivos) (`#anexo`) | Marca o arquivo como enviado ou com falha. |
| `nova:attachment-add` | Anexo (upload de arquivos) (`#anexo`) | Arquivo anexado. sent = true quando foi para a aba Anexos. |
| `nova:attachment-remove` | Anexo (upload de arquivos) (`#anexo`) | Arquivo removido. |
| `nova:attachment-error` | Anexo (upload de arquivos) (`#anexo`) | Arquivo recusado (tipo, tamanho, limite, repetido ou etapa). |
| `NOVAUI.signature.validate · isEmpty · get · set · clear · toFile` | Assinatura (`#assinatura`) | Assinatura desenhada; validate no beforeSendValidate. |
| `nova:signature-change` | Assinatura (`#assinatura`) | Assinatura mudou `{ value, empty }`. |
| `nova:color-change` | Seletor de cor (`#cor`) | Nova cor escolhida. |
| `NOVAUI.table.refresh(target)` | Tabela (`#tabela`) | Atualiza depois de trocar as linhas. |
| `NOVAUI.table.getSelected(target)` | Tabela (`#tabela`) | Linhas marcadas. |
| `NOVAUI.table.clearSelection(target)` | Tabela (`#tabela`) | Desmarca tudo. |
| `nova:sort` | Tabela (`#tabela`) | Coluna ordenada. |
| `nova:selection` | Tabela (`#tabela`) | Seleção mudou. |
| `NOVAUI.filterBar.get(target)` | Barra de filtros (`#barra-filtros`) | { search, filters }. |
| `NOVAUI.filterBar.set(target, chave, valor)` | Barra de filtros (`#barra-filtros`) | Muda um filtro ('search' para a busca; { from, to } para intervalo). |
| `NOVAUI.filterBar.clear(target) · apply(target)` | Barra de filtros (`#barra-filtros`) | Limpa tudo / aplica de novo (depois de trocar as linhas). |
| `nova:filter-change` | Barra de filtros (`#barra-filtros`) | Na .filter-bar, a cada mudança (busca com 250ms de espera). |
| `NOVAUI.table.getSelected(t) · getSelectedIds(t)` | Ações em massa na tabela (`#acoes-massa`) | Linhas (tr) / data-id das marcadas. |
| `NOVAUI.table.select(t, ids) · clearSelection(t)` | Ações em massa na tabela (`#acoes-massa`) | Marca pelos ids / desmarca tudo. |
| `nova:bulk-action` | Ações em massa na tabela (`#acoes-massa`) | Na tabela, ao clicar numa ação (depois da confirmação). |
| `NOVAUI.childTable.create(opções)` | Tabela pai x filho (`#pai-filho`) | Regras pelo JS. |
| `NOVAUI.childTable.add(target, valores)` | Tabela pai x filho (`#pai-filho`) | Adiciona uma linha (wdkAddChild) e preenche. Devolve o índice. |
| `NOVAUI.childTable.remove(target, linha \| índice)` | Tabela pai x filho (`#pai-filho`) | Remove sem perguntar (fnWdkRemoveChild). |
| `NOVAUI.childTable.rows(target)` | Tabela pai x filho (`#pai-filho`) | Linhas com índice e valores pelo nome sem ___N. |
| `NOVAUI.childTable.clear · validate · refresh` | Tabela pai x filho (`#pai-filho`) | Remove todas · confere o mínimo · atualiza depois que o Fluig carregar linhas. |
| `nova:child-add · nova:child-remove` | Tabela pai x filho (`#pai-filho`) | No .child-table. |
| `NOVAUI.changeHistory.track(opções)` | Histórico de alterações (antes x depois) (`#historico-alteracoes`) | Começa a registrar. Guarda os valores quando o usuário entra no primeiro campo e, a cada change, grava a diferença no campo oculto. Cada entrada no formulário vira uma sessão por usuário. |
| `NOVAUI.changeHistory.render(opções)` | Histórico de alterações (antes x depois) (`#historico-alteracoes`) | Monta o histórico a partir do JSON. Use nas etapas que só mostram. |
| `NOVAUI.changeHistory.reset(target?)` | Histórico de alterações (antes x depois) (`#historico-alteracoes`) | Nova comparação: os valores atuais viram o "antes" (ex.: trocou o produto). |
| `NOVAUI.changeHistory.parse(valor)` | Histórico de alterações (antes x depois) (`#historico-alteracoes`) | Lê o JSON (formato novo ou antigo) e devolve a lista por usuário. |
| `nova:change-history` | Histórico de alterações (antes x depois) (`#historico-alteracoes`) | No campo oculto, a cada alteração gravada. |
| `NOVAUI.tree.refresh(target)` | Árvore (tree view) (`#arvore`) | Inicia árvores inseridas depois. |
| `NOVAUI.tree.toggle(item, abrir)` | Árvore (tree view) (`#arvore`) | Abre ou fecha um item. |
| `nova:tree-select` | Árvore (tree view) (`#arvore`) | Item selecionado. |
| `nova:tree-toggle` | Árvore (tree view) (`#arvore`) | Item aberto/fechado. |
| `NOVAUI.kanban.refresh(target)` | Kanban (`#kanban`) | Inicia/atualiza contadores. |
| `nova:kanban-move` | Kanban (`#kanban`) | Card movido (mouse ou Shift + setas). |
| `NOVAUI.calendar.create(opções)` | Calendário (`#calendario`) | Monta o calendário dentro do elemento. |
| `nova:calendar-event` | Calendário (`#calendario`) | Evento clicado. |
| `nova:calendar-day` | Calendário (`#calendario`) | Dia clicado. |
| `nova:calendar-change` | Calendário (`#calendario`) | Mês mudou. |
| `NOVAUI.grid.getChanges(target)` | Data grid (tabela editável) (`#data-grid`) | Só o que mudou: { rowIndex, id, key, oldValue, value }. |
| `NOVAUI.grid.getData(target)` | Data grid (tabela editável) (`#data-grid`) | Todas as linhas como objetos. |
| `NOVAUI.grid.hasErrors(target)` | Data grid (tabela editável) (`#data-grid`) | true se há célula inválida. |
| `NOVAUI.grid.commit(target) · discard(target)` | Data grid (tabela editável) (`#data-grid`) | Marca como salvo / desfaz alterações. |
| `nova:grid-change` | Data grid (tabela editável) (`#data-grid`) | Célula alterada. |
| `NOVAUI.tabs.select(aba)` | Abas (tabs) (`#abas`) | Abre uma aba pelo código. |
| `nova:tab-change` | Abas (tabs) (`#abas`) | Aba trocada. |
| `NOVAUI.stepper.set(target, índice, opções)` | Stepper (etapas) (`#stepper`) |  |
| `nova:step-change` | Stepper (etapas) (`#stepper`) | Etapa mudou. |
| `nova:step-click` | Stepper (etapas) (`#stepper`) | Clique numa etapa (quando é link/botão). |
| `NOVAUI.menu.open(menu, { trigger, anchor, placement })` | Menu suspenso (dropdown) (`#menu`) | Abre pelo código. |
| `NOVAUI.menu.close()` | Menu suspenso (dropdown) (`#menu`) | Fecha. |
| `nova:menu-select` | Menu suspenso (dropdown) (`#menu`) | Item escolhido. |
| `nova:context-menu` | Menu de contexto (botão direito) (`#menu-contexto`) | Menu aberto. |
| `nova:dismiss` | Alerta (aviso na página) (`#alerta`) | Aviso fechado. |
| `NOVAUI.dialog.confirm(opções) → Promise<boolean>` | Confirmação (`#confirmacao`) | Pergunta antes de uma ação. true = confirmou. |
| `NOVAUI.dialog.alert(opções) → Promise` | Confirmação (`#confirmacao`) | Só informa, com um botão. |
| `nova:coachmark-dismiss` | Coachmark (novidade) (`#coachmark`) | Novidade dispensada. |
| `NOVAUI.tour(opções)` | Tour guiado (`#tour`) | Passo a passo destacando partes da tela. |
| `NOVAUI.tour.end()` | Tour guiado (`#tour`) | Encerra. |
| `NOVAUI.tour.hasSeen(key) · reset(key)` | Tour guiado (`#tour`) | Já viu? / esquece. |
| `nova:tour-start · nova:tour-end` | Tour guiado (`#tour`) | Início e fim. |
| `NOVAUI.help.open(id, artigo)` | Painel de ajuda (`#painel-ajuda`) | Abre pelo código. |
| `NOVAUI.help.close()` | Painel de ajuda (`#painel-ajuda`) | Fecha. |
| `nova:faq-feedback` | FAQ (perguntas frequentes) (`#faq`) | Resposta do "Ajudou?". |
| `NOVAUI.onboarding.complete(target, passo)` | Onboarding (primeiros passos) (`#onboarding`) | Marca um passo como feito. |
| `NOVAUI.onboarding.reset(target)` | Onboarding (primeiros passos) (`#onboarding`) | Volta ao início. |
| `nova:onboarding-step` | Onboarding (primeiros passos) (`#onboarding`) | Passo concluído. |
| `nova:onboarding-complete` | Onboarding (primeiros passos) (`#onboarding`) | Todos concluídos. |
| `NOVAUI.toast(opções) → toast` | Toast (aviso rápido) (`#toast`) | Aviso rápido no canto da tela. |
| `NOVAUI.toast.promise(promise, { loading, success, error })` | Toast (aviso rápido) (`#toast`) | Carregando → sucesso ou erro, conforme a promise. |
| `NOVAUI.toast.clear()` | Toast (aviso rápido) (`#toast`) | Fecha todos. |
| `NOVAUI.toast.config({ position, max, timeout })` | Toast (aviso rápido) (`#toast`) | Padrões para a página. |
| `NOVAUI.modal.open(id)` | Modal (`#modal`) | Abre. |
| `NOVAUI.modal.close(id, valor)` | Modal (`#modal`) | Fecha devolvendo o valor. |
| `NOVAUI.modal.setLoading(id, bool)` | Modal (`#modal`) | Loader no corpo do modal. |
| `NOVAUI.modal.create(opções)` | Modal (`#modal`) | Monta um modal ou drawer sem HTML prévio e remove ao fechar. |
| `nova:modal-open · nova:modal-close` | Modal (`#modal`) | Abriu / fechou. |
| `NOVAUI.loader.show(opções)` | Loader sobre um elemento (`#loader-overlay`) | Cobre o elemento com o loader. |
| `NOVAUI.loader.hide(target) ou hide({ target, force })` | Loader sobre um elemento (`#loader-overlay`) | Esconde. Chamadas aninhadas contam; force fecha de vez. |
| `NOVAUI.loader.wrap({ target, promise, … })` | Loader sobre um elemento (`#loader-overlay`) | Mostra até a promise terminar. |
| `NOVAUI.loader.message(target, texto)` | Loader sobre um elemento (`#loader-overlay`) | Troca o texto com o loader aberto. |
| `NOVAUI.loader.isLoading(target)` | Loader sobre um elemento (`#loader-overlay`) | Está carregando? |
| `$(el).loader() · .loader('unload')` | Loader sobre um elemento (`#loader-overlay`) | Plugin jQuery. |
| `NOVAUI.loader.screen(target) → controle` | Tela de abertura (widget) (`#tela-abertura`) |  |
| `NOVAUI.skeleton.show(opções)` | Skeleton (`#skeleton`) | Troca o conteúdo por um esqueleto enquanto carrega. |
| `NOVAUI.skeleton.wrap({ target, promise, type, … })` | Skeleton (`#skeleton`) | Mostra até a promise terminar. |
| `NOVAUI.skeleton.hide(target)` | Skeleton (`#skeleton`) | Esconde. |
| `NOVAUI.skeleton.loading(target, bool)` | Skeleton (`#skeleton`) | Modo data-sk: liga/desliga .is-loading no container. |
| `NOVAUI.skeleton.html({ type, … })` | Skeleton (`#skeleton`) | Só o HTML. |
| `NOVAUI.loader.bar` | Barra de carregamento no topo (`#barra-topo`) | Barra fina no topo da página. |

## Gerais

| Função | Para quê |
|---|---|
| `NOVAUI.refresh(root)` | Inicia componentes inseridos depois no HTML (AJAX, conteúdo de `NOVAUI.modal.create`). Na tabela pai x filho use `NOVAUI.childTable`, que já faz isso. |
| `NOVAUI.util.emit · esc · norm · store` | Disparar evento, escapar HTML, normalizar texto (sem acento/minúsculo), ler/gravar localStorage. |
| `NOVAUI.integration.datasets · protheus · rm · fluig · util` | Funções de integração da equipe (`integrations.js`, já dentro do `nova-ui.min.js`; exige `vcXMLRPC.js` no formulário). Ver `integracoes.md`. |
| `NOVAUI.integration.rm.searchLeader(searchParam, request)` | Solicitante + hierarquia de liderança. Devolve **string JSON**. |
| `NOVAUI.integration.rm.searchTeam(chapa, request)` | Equipe de um líder (diretos ou árvore). Devolve **objeto**. |
| `NOVAUI.progress.set({ target, value })` | Muda o preenchimento da barra de progresso (0 a 100). No HTML, use `data-value` no `.progress`. |
| `NOVAUI.rating.set({ target, value })` | Muda a nota exibida no `.rating-display` (ex.: 4.3). No HTML, use `data-value`. |
| `NOVAUI.anchorNav.refresh()` | Recalcula a navegação por âncoras depois de mudar as seções. |
| `NOVAUI.process.setComplete({ target, complete })` | Marca a parte (`.process-section`) como completa: selo, número verde e item do resumo. (`#process-section`) |
| `NOVAUI.process.isComplete(target)` | true se a parte está completa. |
| `NOVAUI.process.refresh(root?)` | Recalcula partes automáticas (`data-process-auto`) e o resumo. Raramente necessário. |
| `nova:process-change` | `{ done, total }` no `.process-summary`, a cada mudança. |
| `NOVAUI.version` | Versão carregada. |
