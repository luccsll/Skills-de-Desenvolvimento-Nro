/* =========================================================================
   NOVA UI — TABELAS (comportamento) · requer jQuery e core.js
   Delegação de eventos: funciona com linhas adicionadas depois (dataset do
   Fluig, paginação via AJAX). Depois de trocar o tbody, chame
   NOVAUI.table.refresh(tabela).
   Marcação:
     <th aria-sort="none"><button class="data-table__sort">Nome</button></th>
       data-sort-type="number|date|text" no th (opcional; padrão detecta)
       data-sort-value="..." no td para ordenar por um valor diferente do texto
     <table data-sort="server">  -> não reordena; só dispara 'nova:sort'
     <input class="data-table__check" data-select-all>   (no thead)
     <input class="data-table__check" data-select-row>   (em cada linha)
     <div class="table-bulk" data-bulk-for="idDaTabela" data-bulk-label="item selecionado|itens selecionados" hidden>
       <span data-bulk-count></span>
       <button data-bulk-action="aprovar" data-bulk-confirm="Aprovar {n} itens?">…
     </div>
     .table-bulk--floating   barra flutuante presa embaixo da tela
     Shift + clique marca um intervalo de linhas. Esc limpa a seleção.
   Eventos (na <table>): nova:sort { column, key, direction }
                         nova:selection { rows: [tr, ...], ids }
                         nova:bulk-action { action, rows, ids }
   API: NOVAUI.table.refresh(tabela?) · getSelected(tabela) · getSelectedIds(tabela)
        select(tabela, ids) · clearSelection(tabela)

   PAI X FILHO (tabela do Fluig com tablename)
     <div class="child-table" data-min="1" data-max="10" data-confirm-remove>
       <button data-child-add>Adicionar</button>
       <table class="data-table" tablename="tbItens" noaddbutton="true" nodeletebutton="true">
         <tbody><tr data-child-template> … <button data-child-remove> … </tr></tbody>
     No Fluig usa wdkAddChild / fnWdkRemoveChild; fora dele, clona a linha modelo
     e renomeia os campos (campo___1, campo___2…), igual ao Fluig.
     API: NOVAUI.childTable.create({ target, min, max, confirmRemove, editable, addText, onAdd, onRemove })
          .add(target, valores) · .remove(target, linha|índice) · .rows(target)
          .clear(target) · .validate(target) · .refresh(target)
     Eventos (no .child-table): nova:child-add { row, index } · nova:child-remove { index }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util;

    function table(el) {
        var $t = $(C.get(el));
        return $t.is('table') ? $t : $t.closest('table');
    }

    /* rótulos do modo empilhado (celular) */
    function applyLabels($t) {
        if (!$t.hasClass('data-table--stack')) return;
        var labels = $t.find('thead th').map(function () {
            return ($(this).attr('data-label') || $(this).text()).trim();
        }).get();
        $t.children('tbody').first().children('tr').each(function () {
            var $cells = $(this).children('td, th');
            if ($cells.length === 1 && $cells[0].colSpan > 1) return;
            $cells.each(function (i) {
                if (!this.hasAttribute('data-label') && labels[i]) $(this).attr('data-label', labels[i]);
            });
        });
    }

    /* ordenação */
    function parseValue(text, type) {
        text = $.trim(text);
        if (type === 'text') return text.toLowerCase();
        var d = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (d && (type === 'date' || !type)) return Number(d[3] + d[2] + d[1]);
        if (type === 'number' || !type) {
            var n = text.replace(/[^\d,.-]/g, '');
            if (/\d/.test(n)) {
                if (n.indexOf(',') > -1) n = n.replace(/\./g, '').replace(',', '.'); // 1.234,56
                var num = parseFloat(n);
                if (!isNaN(num) && (type === 'number' || /^[\sR$%\d.,-]+$/.test(text))) return num;
            }
        }
        return text.toLowerCase();
    }

    function sortBy($th) {
        var $t = $th.closest('table');
        var index = $th[0].cellIndex;
        var direction = $th.attr('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        $t.find('thead th[aria-sort]').attr('aria-sort', 'none');
        $th.attr('aria-sort', direction);
        C.emit($t, 'nova:sort', { column: index, key: $th.attr('data-key'), direction: direction });
        if ($t.attr('data-sort') === 'server') return;

        var $body = $t.children('tbody').first();
        var type = $th.attr('data-sort-type');
        var factor = direction === 'ascending' ? 1 : -1;
        var value = function (tr) {
            var cell = tr.cells[index];
            return parseValue(cell.getAttribute('data-sort-value') || cell.textContent, type);
        };
        var rows = $body.children('tr').filter(function () { return this.cells.length > index; }).get();
        rows.sort(function (a, b) {
            var va = value(a), vb = value(b);
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
            return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true }) * factor;
        });
        $body.append(rows);
    }

    /* seleção */
    function rowChecks($t) {
        return $t.find('tbody [data-select-row]').not(':disabled');
    }

    function getSelected(el) {
        return rowChecks(table(el)).filter(':checked').closest('tr').get();
    }

    function idsOf(rows) {
        return $.map(rows, function (tr) { var id = $(tr).attr('data-id'); return id === undefined ? null : id; });
    }

    function plural(label, n) {
        var p = String(label || 'selecionado|selecionados').split('|');
        return n === 1 ? p[0] : (p[1] || p[0]);
    }

    function sync($t, silent) {
        var $checks = rowChecks($t);
        var selected = $checks.filter(':checked').length;
        $checks.each(function () {
            $(this).closest('tr').toggleClass('is-selected', this.checked).attr('aria-selected', String(this.checked));
        });
        $t.find('[data-select-all]').prop({
            checked: $checks.length > 0 && selected === $checks.length,
            indeterminate: selected > 0 && selected < $checks.length
        });
        if ($t.attr('id')) {
            var $bulk = $('[data-bulk-for="' + $t.attr('id') + '"]');
            $bulk.prop('hidden', selected === 0).toggleClass('is-visible', selected > 0);
            $bulk.each(function () {
                var label = $(this).attr('data-bulk-label');
                // data-bulk-label="solicitação selecionada|solicitações selecionadas"
                $(this).find('[data-bulk-count]').text(selected + ' ' + plural(label, selected));
            });
        }
        if (!silent) C.emit($t, 'nova:selection', { rows: getSelected($t), ids: idsOf(getSelected($t)) });
    }

    function clearSelection(el) {
        var $t = table(el);
        rowChecks($t).prop('checked', false);
        sync($t);
    }

    function refresh(el) {
        (el ? table(el) : $('table.data-table')).each(function () {
            applyLabels($(this));
            sync($(this), true);
        });
    }

    function select(el, ids) {
        var $t = table(el), want = $.map($.isArray(ids) ? ids : [ids], String);
        rowChecks($t).each(function () { this.checked = $.inArray(String($(this).closest('tr').attr('data-id')), want) > -1; });
        sync($t);
    }

    /* ações em massa: data-bulk-action (com confirmação opcional) */
    function bulkAction(btn) {
        var $b = $(btn), $bar = $b.closest('[data-bulk-for]'), $t = $('#' + $bar.attr('data-bulk-for'));
        var rows = getSelected($t), n = rows.length, action = $b.attr('data-bulk-action');
        if (!n) return;
        var go = function () { C.emit($t, 'nova:bulk-action', { action: action, rows: rows, ids: idsOf(rows) }); };
        var ask = $b.attr('data-bulk-confirm');
        if (!ask || !NOVAUI.dialog) return go();
        var danger = /danger/.test(btn.className);
        NOVAUI.dialog.confirm({
            type: danger ? 'danger' : 'warning',
            title: ask.replace(/\{n\}/g, n),
            message: $b.attr('data-bulk-message') ? $b.attr('data-bulk-message').replace(/\{n\}/g, n) : '',
            confirmText: $.trim($b.text()) || 'Confirmar'
        }).then(function (ok) { if (ok) go(); });
    }

    /* eventos */
    var lastCheck = null;
    $(document)
        .on('click', '.data-table__sort', function () { sortBy($(this).closest('th')); })
        .on('click', '[data-bulk-clear]', function () {
            var id = $(this).closest('[data-bulk-for]').attr('data-bulk-for');
            if (id) { clearSelection('#' + id); $('#' + id).find('[data-select-all]').trigger('focus'); }
        })
        .on('click', '[data-bulk-for] [data-bulk-action]', function () { bulkAction(this); })
        // Shift + clique: marca o intervalo desde a última linha clicada
        .on('click', '.data-table__check[data-select-row]', function (e) {
            var $t = $(this).closest('table'), $all = rowChecks($t).filter(function () { return !$(this).closest('tr').prop('hidden'); });
            if (e.shiftKey && lastCheck && $.contains($t[0], lastCheck)) {
                var a = $all.index(lastCheck), b = $all.index(this), on = this.checked;
                if (a > -1 && b > -1) $all.slice(Math.min(a, b), Math.max(a, b) + 1).prop('checked', on);
            }
            lastCheck = this;
        })
        .on('change', '.data-table__check', function () {
            var $t = $(this).closest('table');
            if (this.hasAttribute('data-select-all')) rowChecks($t).filter(function () { return !$(this).closest('tr').prop('hidden'); }).prop('checked', this.checked);
            sync($t);
        })
        .on('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var $bar = $('.table-bulk--floating:not([hidden])').first();
            if ($bar.length && !$('.modal.is-open, dialog[open]').length) clearSelection('#' + $bar.attr('data-bulk-for'));
        });

    $(function () { refresh(); });

    NOVAUI._onRefresh(function () { refresh(); });

    NOVAUI.table = {
        refresh: refresh,
        getSelected: getSelected,
        getSelectedIds: function (el) { return idsOf(getSelected(el)); },
        select: select,
        clearSelection: clearSelection
    };

    /* =====================================================================
       PAI X FILHO (tabelas com tablename do Fluig)
       ===================================================================== */
    var SEP = '___';

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

    function childWrap(el) {
        var $e = $(C.get(el));
        return $e.hasClass('child-table') ? $e : $e.closest('.child-table').length ? $e.closest('.child-table') : $e.find('.child-table').first();
    }

    function childTable($w) {
        var $t = $w.find('table[tablename]').first();
        return $t.length ? $t : $w.find('table').first();
    }

    function template($t) {
        var $tb = $t.children('tbody').first(), $tpl = $tb.children('[data-child-template]').first();
        if (!$tpl.length) $tpl = $tb.children('tr').first().attr('data-child-template', '');
        return $tpl;
    }

    function dataRows($t) {
        return $t.children('tbody').first().children('tr').not('[data-child-template], .filter-bar__empty-row, .child-table__empty-row');
    }

    function rowIndex(tr) {
        var idx = null;
        $(tr).find('[name*="' + SEP + '"]').each(function () {
            var m = this.name.match(/___(\d+)$/);
            if (m) { idx = +m[1]; return false; }
        });
        return idx;
    }

    function childOpts($w) {
        var o = $.extend({ min: 0, max: 0, confirmRemove: false, editable: true, addText: 'Adicionar linha', removeText: 'Remover linha', empty: 'Nenhuma linha adicionada.' },
            $w.data('novaChildOpts') || {});
        var d = $w[0];
        if (d.hasAttribute('data-min') && !('min' in ($w.data('novaChildOpts') || {}))) o.min = +$w.attr('data-min') || 0;
        if (d.hasAttribute('data-max') && !('max' in ($w.data('novaChildOpts') || {}))) o.max = +$w.attr('data-max') || 0;
        if (d.hasAttribute('data-confirm-remove') && !('confirmRemove' in ($w.data('novaChildOpts') || {}))) o.confirmRemove = $w.attr('data-confirm-remove') || true;
        if ($w.attr('data-editable') === 'false') o.editable = false;
        if ($w.attr('data-empty')) o.empty = $w.attr('data-empty');
        return o;
    }

    function childRender($w) {
        var $t = childTable($w), o = childOpts($w), $rows = dataRows($t), n = $rows.length;
        template($t).prop('hidden', true);
        $rows.each(function (i) {
            $(this).find('[data-child-index]').text(i + 1);
            $(this).find('[data-child-remove]').prop('disabled', !o.editable || (o.min && n <= o.min)).prop('hidden', !o.editable);
        });
        $w.find('[data-child-count]').text(n);
        $w.find('[data-child-add]').prop('disabled', !!(o.max && n >= o.max)).prop('hidden', !o.editable)
            .attr('title', o.max && n >= o.max ? 'Limite de ' + o.max + ' linhas' : null);
        // estado vazio dentro da tabela
        var $tb = $t.children('tbody').first(), $e = $tb.children('.child-table__empty-row');
        if (!n) {
            if (!$e.length) {
                var cols = $t.find('thead tr').first().children().length || 1;
                $e = $('<tr class="child-table__empty-row"><td colspan="' + cols + '"><span class="child-table__empty">' + icon('playlist_add') + '<span></span></span></td></tr>').appendTo($tb);
            }
            $e.find('.child-table__empty > span:last-child').text(o.empty);
        } else $e.remove();
        $w.toggleClass('is-empty', !n).toggleClass('is-readonly', !o.editable);
        if (n >= (o.min || 0)) childError($w, '');
        if (NOVAUI.table) refresh($t);
    }

    function childError($w, msg) {
        var $m = $w.children('.child-table__error');
        if (!$m.length) $m = $('<p class="child-table__error" role="alert" hidden>').appendTo($w);
        $m.text(msg || '').prop('hidden', !msg);
        $w.toggleClass('has-error', !!msg);
    }

    // fora do Fluig: clona a linha modelo e renomeia como o Fluig faz
    function cloneRow($t) {
        var $tpl = template($t), max = 0;
        dataRows($t).each(function () { var i = rowIndex(this); if (i > max) max = i; });
        var idx = max + 1, $row = $tpl.clone(false).removeAttr('data-child-template').prop('hidden', false);
        $row.find('[name]').each(function () { this.name = this.name + SEP + idx; });
        $row.find('[id]').each(function () {
            var old = this.id;
            this.id = old + SEP + idx;
            $row.find('label[for="' + old + '"]').attr('for', this.id);
        });
        $row.find('input:not([type="checkbox"]):not([type="radio"]), textarea').val('');
        $row.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
        $row.find('select').each(function () { this.selectedIndex = 0; });
        $t.children('tbody').first().append($row);
        return idx;
    }

    function childAdd(target, values) {
        var $w = childWrap(target), $t = childTable($w), o = childOpts($w);
        if (!$t.length || !o.editable) return null;
        if (o.max && dataRows($t).length >= o.max) return null;
        var name = $t.attr('tablename'), idx;
        if (name && typeof window.wdkAddChild === 'function') idx = window.wdkAddChild(name);
        else idx = cloneRow($t);
        var $row = $t.find('[name$="' + SEP + idx + '"]').first().closest('tr');
        // o Fluig clona a linha modelo: tira o que só vale para ela
        $row.removeAttr('data-child-template').prop('hidden', false);
        $.each(values || {}, function (k, v) {
            var $f = $row.find('[name="' + k + SEP + idx + '"]');
            if ($f.is(':checkbox, :radio')) $f.prop('checked', !!v); else $f.val(v);
            $f.each(function () { C.fire(this, 'input'); C.fire(this, 'change'); });
        });
        if (NOVAUI.refresh) NOVAUI.refresh($row[0]);
        childRender($w);
        C.emit($w, 'nova:child-add', { row: $row[0], index: idx });
        if (o.onAdd) o.onAdd($row[0], idx);
        return idx;
    }

    function childRemove(target, rowOrIndex, skipConfirm) {
        var $w = childWrap(target), $t = childTable($w), o = childOpts($w), tr;
        if (typeof rowOrIndex === 'number') tr = $t.find('[name$="' + SEP + rowOrIndex + '"]').first().closest('tr')[0];
        else tr = $(C.get(rowOrIndex)).closest('tr')[0];
        if (!tr || $(tr).is('[data-child-template]')) return;
        if (o.min && dataRows($t).length <= o.min) return;
        var go = function () {
            var idx = rowIndex(tr), $next = $(tr).next('tr').add($(tr).prev('tr').not('[data-child-template]')).first();
            var el = $(tr).find('[name]')[0] || $(tr).find('[data-child-remove]')[0];
            if (typeof window.fnWdkRemoveChild === 'function' && el && $t.attr('tablename')) window.fnWdkRemoveChild(el);
            if ($.contains(document, tr)) $(tr).remove();
            childRender($w);
            C.emit($w, 'nova:child-remove', { index: idx });
            if (o.onRemove) o.onRemove(idx);
            ($next.length && $.contains(document, $next[0]) ? $next.find('[data-child-remove], input, select').first() : $w.find('[data-child-add]').first()).trigger('focus');
        };
        if (!o.confirmRemove || skipConfirm || !NOVAUI.dialog) return go();
        NOVAUI.dialog.confirm({
            type: 'danger',
            title: typeof o.confirmRemove === 'string' && o.confirmRemove !== 'true' && o.confirmRemove !== '' ? o.confirmRemove : 'Remover esta linha?',
            message: 'Os dados preenchidos nela serão apagados.',
            confirmText: 'Remover'
        }).then(function (ok) { if (ok) go(); });
    }

    function childRows(target) {
        var $t = childTable(childWrap(target));
        return dataRows($t).map(function () {
            var idx = rowIndex(this), values = {};
            $(this).find('[name]').each(function () {
                var base = this.name.replace(/___\d+$/, '');
                if ($(this).is(':checkbox')) values[base] = this.checked;
                else if ($(this).is(':radio')) { if (this.checked) values[base] = this.value; }
                else values[base] = $(this).val();
            });
            return { index: idx, row: this, values: values };
        }).get();
    }

    function childInit(w) {
        var $w = $(w);
        if (!$w.data('novaChild')) {
            $w.data('novaChild', true);
            template(childTable($w)).prop('hidden', true);
        }
        childRender($w);
    }

    $(document)
        .on('click', '.child-table [data-child-add]', function () {
            var idx = childAdd(this);
            if (idx == null) return;
            var $w = childWrap(this);
            childTable($w).find('[name$="' + SEP + idx + '"]').filter(':visible').first().trigger('focus');
        })
        .on('click', '.child-table [data-child-remove]', function () { childRemove(this, this); });

    function childRefresh(root) {
        var $r = $(C.get(root) || document);
        ($r.hasClass('child-table') ? $r : $r.find('.child-table')).each(function () { childInit(this); });
    }

    $(function () { childRefresh(); });
    NOVAUI._onRefresh(function (root) {
        // linha recém-criada não reinicia a tabela inteira
        if (root && $(C.get(root)).is('tr')) return;
        childRefresh(root);
    });

    NOVAUI.childTable = {
        // NOVAUI.childTable.create({ target, min, max, confirmRemove, editable, addText, empty, onAdd, onRemove })
        create: function (o) {
            var $w = childWrap(o.target);
            if (!$w.length) return null;
            $w.data('novaChildOpts', $.extend({}, $w.data('novaChildOpts'), o));
            childInit($w[0]);
            return $w[0];
        },
        add: childAdd,
        remove: function (target, rowOrIndex) { childRemove(target, rowOrIndex, true); },
        rows: childRows,
        clear: function (target) {
            var $w = childWrap(target), $t = childTable($w);
            var keep = childOpts($w).min;
            $w.data('novaChildOpts', $.extend({}, $w.data('novaChildOpts'), { min: 0 }));
            dataRows($t).each(function () { childRemove($w, this, true); });
            $w.data('novaChildOpts', $.extend({}, $w.data('novaChildOpts'), { min: keep }));
            childRender($w);
        },
        validate: function (target) {
            var $ws = target ? childWrap(target) : $('.child-table'), ok = true;
            $ws.each(function () {
                var $w = $(this), o = childOpts($w), n = dataRows(childTable($w)).length;
                if (o.min && n < o.min) {
                    ok = false;
                    childError($w, o.min === 1 ? 'Adicione pelo menos uma linha.' : 'Adicione pelo menos ' + o.min + ' linhas.');
                } else childError($w, '');
            });
            return ok;
        },
        refresh: childRefresh
    };
})(window.jQuery, window, document);
