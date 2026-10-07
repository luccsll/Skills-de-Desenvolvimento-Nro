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
     <div class="table-bulk" data-bulk-for="idDaTabela" hidden>
       <span data-bulk-count></span> ... </div>
   Eventos (na <table>): nova:sort { column, key, direction }
                         nova:selection { rows: [tr, ...] }
   API: NOVAUI.table.refresh(tabela?) · getSelected(tabela) · clearSelection(tabela)
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
            $bulk.prop('hidden', selected === 0);
            $bulk.find('[data-bulk-count]').text(selected === 1 ? '1 selecionado' : selected + ' selecionados');
        }
        if (!silent) C.emit($t, 'nova:selection', { rows: getSelected($t) });
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

    /* eventos */
    $(document)
        .on('click', '.data-table__sort', function () { sortBy($(this).closest('th')); })
        .on('click', '[data-bulk-clear]', function () {
            var id = $(this).closest('[data-bulk-for]').attr('data-bulk-for');
            if (id) clearSelection('#' + id);
        })
        .on('change', '.data-table__check', function () {
            var $t = $(this).closest('table');
            if (this.hasAttribute('data-select-all')) rowChecks($t).prop('checked', this.checked);
            sync($t);
        });

    $(function () { refresh(); });

    NOVAUI._onRefresh(function () { refresh(); });

    NOVAUI.table = { refresh: refresh, getSelected: getSelected, clearSelection: clearSelection };
})(window.jQuery, window, document);
