/* =========================================================================
   NOVA UI — BARRA DE FILTROS · requer jQuery e core.js
   Busca, filtros, "chips" dos filtros ativos e "Limpar tudo". Pode filtrar
   sozinha uma tabela da página (data-filter-for) ou só avisar o que mudou
   (data-filter-mode="server") para você buscar no dataset.

   HTML
     <div class="filter-bar" data-filter-for="#tabela" data-filter-noun="solicitação|solicitações">
       <div class="filter-bar__main">
         ... <input class="field__input" type="search" data-filter-search>
         ... <select class="field__input" data-filter="status">…</select>
         <button type="button" class="btn btn--secondary" data-filter-toggle>Mais filtros</button>
       </div>
       <div class="filter-bar__panel" hidden> mais campos com data-filter </div>
     </div>
   Cada campo de filtro:
     data-filter="chave"            nome do filtro (o mesmo do data-chave na <tr>)
     data-filter-label="Status"     rótulo do chip (padrão: o label do campo)
     data-filter-match="from|to"    início/fim de um intervalo (datas)
   Na tabela, cada <tr> traz os valores: <tr data-status="aprovado" data-data="05/10/2026">

   JS
     NOVAUI.filterBar.get(target)            // { search, filters }
     NOVAUI.filterBar.set(target, chave, valor)
     NOVAUI.filterBar.clear(target)
     NOVAUI.filterBar.apply(target)          // depois de trocar as linhas
   Evento (na .filter-bar): nova:filter-change { search, filters, visible, total }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc, norm = C.norm;

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

    function parseDate(v) {
        if (NOVAUI.datepicker) return NOVAUI.datepicker.parse(v);
        var m = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
    }

    function labelOf(el) {
        var $el = $(el), t = $el.attr('data-filter-label');
        if (t) return t;
        if (el.id) t = $('label[for="' + el.id + '"]').first().text();
        if (!$.trim(t || '')) t = $el.closest('.field, .form-group, fieldset').find('.field__label, .form-label, legend, label').first().text();
        return $.trim(t || $el.attr('data-filter'));
    }

    function plural(noun, n) {
        var p = String(noun || 'item|itens').split('|');
        return n === 1 ? p[0] : (p[1] || p[0]);
    }

    /* ---------------------------------------------------------------------
       LEITURA DOS CAMPOS
       --------------------------------------------------------------------- */
    function read(bar) {
        var $b = $(bar), filters = {}, order = [];
        var search = $.trim($b.find('[data-filter-search]').val() || '');
        $b.find('[data-filter]').each(function () {
            var $el = $(this), key = $el.attr('data-filter'), match = $el.attr('data-filter-match');
            var f = filters[key];
            if (!f) { f = filters[key] = { key: key, label: labelOf(this), values: [], texts: [], from: null, to: null }; order.push(key); }
            if (match === 'from' || match === 'to') {
                if ($.trim(this.value)) f[match] = $.trim(this.value);
                return;
            }
            if ($el.is(':checkbox, :radio')) {
                if (!this.checked) return;
                f.values.push(this.value);
                f.texts.push($.trim($el.attr('data-filter-text') || $('label[for="' + this.id + '"]').text() || $el.closest('label').text() || this.value));
                if (!$el.attr('data-filter-label')) f.label = $.trim($el.closest('fieldset, [role="group"], .form-group').find('legend, .form-label').first().text()) || f.label;
                return;
            }
            if ($el.is('select')) {
                $el.find('option:selected').each(function () {
                    if (!this.value) return;
                    f.values.push(this.value);
                    f.texts.push($.trim($(this).text()));
                });
                return;
            }
            var v = $.trim(this.value || '');
            if (v) { f.values.push(v); f.texts.push(v); }
        });
        var active = [];
        $.each(order, function (i, k) { var f = filters[k]; if (f.values.length || f.from || f.to) active.push(f); });
        return { search: search, active: active };
    }

    // { status: 'aprovado' | ['a','b'], periodo: { from, to } }
    function simple(state) {
        var out = {};
        $.each(state.active, function (i, f) {
            if (f.from || f.to) out[f.key] = { from: f.from, to: f.to };
            else out[f.key] = f.values.length > 1 ? f.values.slice() : f.values[0];
        });
        return out;
    }

    /* ---------------------------------------------------------------------
       FILTRO NA TABELA (data-filter-for)
       --------------------------------------------------------------------- */
    function rowsOf(table) {
        return $(table).children('tbody').children('tr').not('.filter-bar__empty-row, .is-template, [data-child-template]');
    }

    function matches(tr, state) {
        var $tr = $(tr);
        if (state.search) {
            var text = norm($tr.text()), ok = true;
            $.each(norm(state.search).split(/\s+/), function (i, w) { if (w && text.indexOf(w) < 0) { ok = false; return false; } });
            if (!ok) return false;
        }
        var pass = true;
        $.each(state.active, function (i, f) {
            var raw = $tr.attr('data-' + f.key);
            if (raw === undefined) return;                    // linha sem o dado: não filtra por ele
            if (f.from || f.to) {
                var d = parseDate(raw), a = parseDate(f.from), b = parseDate(f.to);
                if (!d || (a && d < a) || (b && d > b)) { pass = false; return false; }
                return;
            }
            var have = $.map(String(raw).split(','), function (x) { return norm($.trim(x)); });
            var hit = $.grep(f.values, function (v) { return $.inArray(norm(v), have) > -1; }).length;
            if (!hit) { pass = false; return false; }
        });
        return pass;
    }

    function filterTable(bar, state) {
        var table = C.get($(bar).attr('data-filter-for'));
        if (!table) return null;
        var $rows = rowsOf(table), visible = 0;
        $rows.each(function () {
            var ok = matches(this, state);
            $(this).prop('hidden', !ok).toggleClass('is-filtered-out', !ok);
            if (ok) visible++;
        });
        // linha "nenhum resultado"
        var $tb = $(table).children('tbody').first(), $empty = $tb.children('.filter-bar__empty-row');
        if (!visible && $rows.length) {
            if (!$empty.length) {
                var cols = $(table).find('thead tr').first().children().length || 1;
                $empty = $('<tr class="filter-bar__empty-row"><td colspan="' + cols + '"><span class="filter-bar__empty">' + icon('filter_alt_off') +
                    '<span>Nenhum resultado com estes filtros.</span><button type="button" class="btn btn--tertiary btn--sm" data-filter-clear>Limpar filtros</button></span></td></tr>').appendTo($tb);
            }
            $empty.prop('hidden', false);
        } else $empty.remove();
        if (NOVAUI.table && $(table).find('[data-select-row]').length) {
            // linha escondida não fica selecionada
            $rows.filter('[hidden]').find('[data-select-row]:checked').prop('checked', false).trigger('change');
        }
        return { visible: visible, total: $rows.length };
    }

    /* ---------------------------------------------------------------------
       CHIPS E CONTADORES
       --------------------------------------------------------------------- */
    function chipsHtml(state) {
        var html = '';
        $.each(state.active, function (i, f) {
            if (f.from || f.to) {
                var t = f.from && f.to ? f.from + ' a ' + f.to : f.from ? 'a partir de ' + f.from : 'até ' + f.to;
                html += chip(f.key, '', f.label, t);
                return;
            }
            $.each(f.values, function (k, v) { html += chip(f.key, v, f.label, f.texts[k]); });
        });
        return html;
    }

    function chip(key, value, label, text) {
        return '<span class="tag tag--brand filter-bar__chip"><span class="tag__label"><span class="filter-bar__chip-key">' + esc(label) + ':</span> ' + esc(text) + '</span>' +
            '<button type="button" class="tag__remove" data-filter-remove="' + esc(key) + '" data-value="' + esc(value) + '" aria-label="Remover filtro ' + esc(label + ': ' + text) + '">' + icon('close') + '</button></span>';
    }

    function render(bar, state, counts) {
        var $b = $(bar), n = state.active.length + (state.search ? 1 : 0);
        var $act = $b.children('.filter-bar__active');
        if (!$act.length) {
            $act = $('<div class="filter-bar__active" aria-live="polite"><span class="filter-bar__result" data-filter-result></span><div class="filter-bar__chips"></div>' +
                '<button type="button" class="btn btn--tertiary btn--sm filter-bar__clear" data-filter-clear>' + icon('filter_alt_off') + '<span>Limpar tudo</span></button></div>').appendTo($b);
        }
        $act.find('.filter-bar__chips').html(chipsHtml(state));
        $act.find('.filter-bar__clear').prop('hidden', !n);
        var noun = $b.attr('data-filter-noun');
        var txt = counts ? (n ? counts.visible + ' de ' + counts.total + ' ' + plural(noun, counts.total) : counts.total + ' ' + plural(noun, counts.total)) : '';
        $b.find('[data-filter-result]').text(txt);
        $act.prop('hidden', !n && !txt);
        $b.toggleClass('has-filters', n > 0);
        // contador no botão "Mais filtros": filtros ativos que estão no painel
        var inPanel = 0, $panel = $b.find('.filter-bar__panel');
        $.each(state.active, function (i, f) { if ($panel.find('[data-filter="' + f.key + '"]').length) inPanel += f.values.length || 1; });
        $b.find('[data-filter-count]').text(inPanel).prop('hidden', !inPanel);
    }

    /* ---------------------------------------------------------------------
       APLICAR
       --------------------------------------------------------------------- */
    function apply(bar, silent) {
        bar = C.get(bar);
        if (!bar) return null;
        var state = read(bar);
        var counts = $(bar).attr('data-filter-mode') === 'server' ? null : filterTable(bar, state);
        render(bar, state, counts);
        var detail = { search: state.search, filters: simple(state), visible: counts ? counts.visible : null, total: counts ? counts.total : null };
        if (!silent) C.emit(bar, 'nova:filter-change', detail);
        return detail;
    }

    function setField(el, value) {
        var $el = $(el);
        if ($el.is(':checkbox, :radio')) $el.prop('checked', value === true || (value !== false && value != null && el.value === String(value)));
        else if ($el.is('select[multiple]')) $el.val($.isArray(value) ? value : value ? [value] : []);
        else $el.val(value == null ? '' : value);
        C.fire(el, 'input');
        C.fire(el, 'change');
    }

    function removeValue(bar, key, value) {
        var $f = $(bar).find('[data-filter="' + key + '"]');
        $f.each(function () {
            var $el = $(this);
            if ($el.is(':checkbox, :radio')) { if (this.value === value && this.checked) setField(this, false); }
            else if ($el.is('select[multiple]')) setField(this, $.grep($el.val() || [], function (v) { return v !== value; }));
            else setField(this, '');
        });
    }

    function clear(bar) {
        bar = C.get(bar);
        if (!bar) return;
        var $b = $(bar);
        bar._novaSilent = true;
        $b.find('[data-filter-search]').each(function () { setField(this, ''); });
        $b.find('[data-filter]').each(function () { setField(this, $(this).is(':checkbox, :radio') ? false : $(this).is('select[multiple]') ? [] : ''); });
        bar._novaSilent = false;
        apply(bar);
    }

    /* ---------------------------------------------------------------------
       EVENTOS
       --------------------------------------------------------------------- */
    var timers = {};
    $(document)
        .on('input', '.filter-bar [data-filter-search]', function () {
            var bar = $(this).closest('.filter-bar')[0], id = bar.id || (bar.id = C.uid('filtros'));
            if (bar._novaSilent) return;
            clearTimeout(timers[id]);
            timers[id] = setTimeout(function () { apply(bar); }, 250);
        })
        .on('change', '.filter-bar [data-filter]', function () {
            var bar = $(this).closest('.filter-bar')[0];
            if (!bar._novaSilent) apply(bar);
        })
        .on('click', '.filter-bar [data-filter-remove]', function () {
            var bar = $(this).closest('.filter-bar')[0], key = $(this).attr('data-filter-remove');
            bar._novaSilent = true;
            removeValue(bar, key, $(this).attr('data-value'));
            bar._novaSilent = false;
            apply(bar);
            var $next = $(bar).find('.filter-bar__chips .tag__remove').first();
            ($next.length ? $next : $(bar).find('[data-filter-search]')).trigger('focus');
        })
        .on('click', '[data-filter-clear]', function () {
            var bar = $(this).closest('.filter-bar')[0];
            if (!bar) {
                // linha "nenhum resultado" dentro da tabela
                var t = $(this).closest('table')[0];
                if (t && t.id) bar = $('.filter-bar[data-filter-for="#' + t.id + '"]')[0];
            }
            if (bar) { clear(bar); $(bar).find('[data-filter-search]').trigger('focus'); }
        })
        .on('click', '.filter-bar [data-filter-toggle]', function () {
            var $b = $(this).closest('.filter-bar'), $p = $b.find('.filter-bar__panel').first(), open = $p.prop('hidden');
            $p.prop('hidden', !open);
            $(this).attr('aria-expanded', String(open));
            if (open) $p.find('input, select, button').filter(':visible').first().trigger('focus');
        });

    function init(bar) {
        if (bar._novaFilter) return;
        bar._novaFilter = true;
        var $b = $(bar), $p = $b.find('.filter-bar__panel').first(), $t = $b.find('[data-filter-toggle]');
        if ($p.length && $t.length) {
            if (!$p.attr('id')) $p.attr('id', C.uid('filtros-painel'));
            $t.attr({ 'aria-controls': $p.attr('id'), 'aria-expanded': String(!$p.prop('hidden')) });
            if (!$t.find('[data-filter-count]').length) $t.append('<span class="badge badge--brand badge--sm" data-filter-count hidden></span>');
        }
        apply(bar, true);
    }

    function refresh(root) {
        $(C.get(root) || document).find('.filter-bar').each(function () { init(this); });
    }

    $(function () { refresh(); });
    NOVAUI._onRefresh(refresh);

    NOVAUI.filterBar = {
        get: function (target) {
            var bar = C.get(target);
            if (!bar) return null;
            var s = read(bar);
            return { search: s.search, filters: simple(s) };
        },
        set: function (target, key, value) {
            var bar = C.get(target);
            if (!bar) return;
            bar._novaSilent = true;
            if (key === 'search') $(bar).find('[data-filter-search]').each(function () { setField(this, value); });
            else $(bar).find('[data-filter="' + key + '"]').each(function () {
                var m = $(this).attr('data-filter-match');
                if (m && value && typeof value === 'object') setField(this, value[m] || '');
                else if ($(this).is(':checkbox, :radio')) setField(this, $.isArray(value) ? $.inArray(this.value, value) > -1 : this.value === String(value));
                else setField(this, value);
            });
            bar._novaSilent = false;
            apply(bar);
        },
        clear: clear,
        apply: function (target) { return apply(target); }
    };
})(window.jQuery, window, document);
