# Nova UI — Índice da API JavaScript (NOVAUI)

Tudo o que se chama pelo JS começa por `NOVAUI`. Componentes com variações recebem **um objeto** com a variação em `type`. Detalhes de cada parâmetro: `componentes.md`, na seção do componente indicado.

| Função / evento | Componente (seção em componentes.md) | Para quê |
|---|---|---|
| `NOVAUI.field.setState(opções)` | Campo de texto (`#campo-texto`) | Muda o estado visual e a mensagem do campo. |
| `NOVAUI.field.clear(target)` | Campo de texto (`#campo-texto`) | Limpa o valor e dispara input/change. |
| `NOVAUI.field.refresh(root)` | Campo de texto (`#campo-texto`) | Recalcula contador, máscaras e estado de valor em HTML novo. |
| `NOVAUI.field.validate(target)` | Campo com máscara e validação (`#campo-mascara`) | Aplica data-validate agora. Devolve true/false. |
| `NOVAUI.field.unmask(target)` | Campo com máscara e validação (`#campo-mascara`) | Valor sem máscara. Em currency devolve número. |
| `NOVAUI.field.isCPF(v) · isCNPJ(v)` | Campo com máscara e validação (`#campo-mascara`) | Confere um CPF/CNPJ sem precisar de campo. |
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
| `NOVAUI.upload.setProgress(item, %)` | Upload de arquivos (`#upload`) | Barra de progresso do arquivo. |
| `NOVAUI.upload.setStatus({ target, type, message })` | Upload de arquivos (`#upload`) | Marca o arquivo como enviado ou com falha. |
| `NOVAUI.upload.getFiles(target) · clear(target)` | Upload de arquivos (`#upload`) | Lista os arquivos / limpa tudo. |
| `nova:upload-add` | Upload de arquivos (`#upload`) | Arquivos aceitos. |
| `nova:upload-remove` | Upload de arquivos (`#upload`) | Arquivo removido. |
| `nova:upload-reject` | Upload de arquivos (`#upload`) | Arquivo recusado (tipo, tamanho, limite). |
| `nova:color-change` | Seletor de cor (`#cor`) | Nova cor escolhida. |
| `NOVAUI.table.refresh(target)` | Tabela (`#tabela`) | Atualiza depois de trocar as linhas. |
| `NOVAUI.table.getSelected(target)` | Tabela (`#tabela`) | Linhas marcadas. |
| `NOVAUI.table.clearSelection(target)` | Tabela (`#tabela`) | Desmarca tudo. |
| `nova:sort` | Tabela (`#tabela`) | Coluna ordenada. |
| `nova:selection` | Tabela (`#tabela`) | Seleção mudou. |
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
| `NOVAUI.refresh(root)` | Inicia componentes inseridos depois no HTML (pai x filho, AJAX, modal criado por JS). |
| `NOVAUI.util.emit · esc · norm · store` | Disparar evento, escapar HTML, normalizar texto (sem acento/minúsculo), ler/gravar localStorage. |
| `NOVAUI.integration.datasets · protheus · rm · fluig · util` | Funções de integração da equipe (`integrations.js`). Ver `integracoes.md`. |
| `NOVAUI.version` | Versão carregada. |
