/* =========================================================================
   NOVA UI — SELETOR DE DATA E DE HORA · requer jQuery e core.js
   Os campos continuam sendo texto (dd/mm/aaaa e hh:mm), como o Fluig grava.
   Dá para digitar ou escolher no calendário / na lista de horários.
   Inicia sozinho; para conteúdo novo chame NOVAUI.refresh(root).

   Só atributo, sem JS: o campo vira o seletor ao carregar a página.

   DATA
     <input class="field__input" id="dataAbono" name="dataAbono" data-datepicker>
     Também funciona com o campo nativo de data:
       <input type="date" class="field__input" id="dataAbono" name="dataAbono" min="2026-01-01" data-datepicker>
       O campo mostra dd/mm/aaaa e um oculto com o mesmo name grava aaaa-mm-dd,
       igual ao type="date". min e max nativos viram os limites.
     Período (dois campos ligados):
       <input id="dataInicio" data-datepicker data-range-end="#dataFim">
       <input id="dataFim"    data-datepicker data-range-start="#dataInicio">
     data-min · data-max     'hoje', '+30' / '-7' (dias a partir de hoje),
                             'dd/mm/aaaa' ou '#outroCampo'
     data-disable="weekends" sem sábado e domingo
     data-disabled-dates     '25/12/2026,01/01/2027'
     data-max-range="30"     período de no máximo 30 dias (no campo inicial)
     data-presets            atalhos (Hoje, Últimos 7 dias, Este mês…)
     JS: NOVAUI.datepicker.create({ target, min, max, disable, disabledDates,
                                    maxRange, presets, onChange })
         NOVAUI.datepicker.open(target) · close() · setValue(target, valor)
         NOVAUI.datepicker.getDate(target)   // Date ou null
     Evento (no input): nova:date-change { value, date, start, end }

   HORA (também com <input type="time" data-timepicker>; min, max e step nativos valem)
     <input class="field__input" id="horaInicio" data-timepicker data-step="30"
            data-min="07:00" data-max="19:00" data-range-end="#horaFim">
     JS: NOVAUI.timepicker.create({ target, step, min, max, onChange })
         NOVAUI.timepicker.open(target) · close() · setValue(target, 'hh:mm')
     Evento (no input): nova:time-change { value, minutes }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;
    var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    var WEEK_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function opt(o, el, key, attr) { return o[key] !== undefined ? o[key] : $(el).attr(attr); }
    function sheet() { return window.matchMedia && window.matchMedia('(max-width: 575.98px)').matches; }

    /* ---------------------------------------------------------------------
       DATAS
       --------------------------------------------------------------------- */
    function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
    function same(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
    function fmt(d) { return d ? pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() : ''; }
    function longDate(d) { return d.getDate() + ' de ' + MONTHS[d.getMonth()] + ' de ' + d.getFullYear() + ', ' + WEEK_LONG[d.getDay()]; }
    function days(a, b) { return Math.round((b - a) / 86400000); }

    function parseDate(v) {
        if (!v) return null;
        if (v instanceof Date) return isNaN(v) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
        v = $.trim(String(v));
        var m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || v.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return null;
        var y, mo, d;
        if (m[1].length === 4) { y = +m[1]; mo = +m[2]; d = +m[3]; } else { d = +m[1]; mo = +m[2]; y = +m[3]; }
        var dt = new Date(y, mo - 1, d);
        return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
    }

    // 'hoje', '+30', '-7', 'dd/mm/aaaa', '#campo'
    function resolveLimit(v) {
        if (!v) return null;
        if (v instanceof Date) return parseDate(v);
        v = $.trim(String(v));
        if (v === 'hoje' || v === 'today') return today();
        if (/^[+-]\d+$/.test(v)) return addDays(today(), parseInt(v, 10));
        if (v.charAt(0) === '#') { var el = C.get(v); return el ? parseDate(el.value) : null; }
        return parseDate(v);
    }

    /* ---------------------------------------------------------------------
       POSIÇÃO DO POPUP (abaixo do campo; vira para cima sem espaço)
       --------------------------------------------------------------------- */
    function position($pop, anchor) {
        // dentro de um modal, o popup precisa estar no modal (camada do topo),
        // senão abre atrás dele; lá dentro a posição é fixa (relativa à tela)
        var host = $(anchor).closest('dialog[open]')[0] || document.body;
        if ($pop[0].parentNode !== host) host.appendChild($pop[0]);
        var inDialog = host !== document.body;
        if (sheet()) { $pop.addClass('is-sheet').css({ position: '', top: '', left: '' }); return; }
        $pop.removeClass('is-sheet');
        var r = anchor.getBoundingClientRect(), w = $pop.outerWidth(), h = $pop.outerHeight();
        var vw = document.documentElement.clientWidth, vh = window.innerHeight;
        var top = r.bottom + 6, left = r.left;
        if (top + h > vh - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
        left = Math.max(8, Math.min(left, vw - w - 8));
        if (inDialog) $pop.css({ position: 'fixed', top: top, left: left });
        else $pop.css({ position: '', top: top + window.pageYOffset, left: left + window.pageXOffset });
    }

    function anchorOf(input) { return $(input).closest('.field__control')[0] || input; }

    /* botão no fim do campo */
    function addTrigger(input, iconName, label) {
        var $ctl = $(input).closest('.field__control');
        if (!$ctl.length || $ctl.find('.field__trigger').length) return;
        var $act = $ctl.children('.field__actions');
        if (!$act.length) $act = $('<div class="field__actions">').appendTo($ctl);
        $('<button type="button" class="field__trigger">').attr('aria-label', label).attr('aria-haspopup', 'dialog').html(icon(iconName)).appendTo($act);
    }

    /* type="date": oculto com o mesmo name guarda aaaa-mm-dd (o valor do type="date") */
    function isoField(input) { return $(input).next('input[data-date-value]')[0] || null; }
    function toIso(d) { return d ? d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) : ''; }
    function syncIso(input) {
        var h = isoField(input);
        if (!h) return;
        var v = toIso(parseDate(input.value));
        if (h.value !== v) { h.value = v; C.fire(h, 'change'); }
    }
    // aceita o campo oculto (name) e devolve o campo visível
    function visibleOf(el) {
        el = C.get(el);
        return el && el.hasAttribute && el.hasAttribute('data-date-value') ? $(el).prev('[data-datepicker]')[0] || el : el;
    }

    function setInput(input, value) {
        if (input.value === value) return;
        input.value = value;
        C.fire(input, 'input');
        C.fire(input, 'change');
    }

    var current = null;   // popup aberto { kind, close() }

    function closeCurrent(focusBack) { if (current) current.close(focusBack); }

    $(document).on('mousedown touchstart', function (e) {
        if (!current) return;
        if ($(e.target).closest(current.$pop).length || $(e.target).closest(current.anchor).length) return;
        current.close(false);
    });
    $(window).on('resize', function () { if (current) current.reposition(); });
    $(window).on('scroll', function () { if (current && !sheet()) current.reposition(); });

    /* =====================================================================
       SELETOR DE DATA
       ===================================================================== */
    var DP_DEFAULTS = { presets: false };

    function dpOptions(input) {
        var o = $.extend({}, DP_DEFAULTS, input._novaDateOpts || {});
        var dis = opt(o, input, 'disable', 'data-disable');
        var list = opt(o, input, 'disabledDates', 'data-disabled-dates');
        return {
            min: opt(o, input, 'min', 'data-min'),
            max: opt(o, input, 'max', 'data-max'),
            disable: dis,
            disabledDates: $.map(typeof list === 'string' ? list.split(',') : (list || []), function (d) { var x = parseDate(d); return x ? x.getTime() : null; }),
            maxRange: parseInt(opt(o, input, 'maxRange', 'data-max-range'), 10) || 0,
            presets: $.isArray(o.presets) ? o.presets : (o.presets || input.hasAttribute('data-presets')),
            onChange: o.onChange
        };
    }

    // par do período: { start, end } (inputs) ou null
    function rangeOf(input) {
        var s, e;
        if (input.hasAttribute('data-range-end')) { s = input; e = C.get($(input).attr('data-range-end')); }
        else if (input.hasAttribute('data-range-start')) { e = input; s = C.get($(input).attr('data-range-start')); }
        return s && e ? { start: s, end: e } : null;
    }

    function Calendar(input) {
        var self = this;
        this.input = input;
        this.range = rangeOf(input);
        this.main = this.range ? this.range.start : input;
        this.o = dpOptions(this.main);
        this.picking = this.range && input === this.range.end ? 'end' : 'start';
        this.view = 'days';
        this.anchor = anchorOf(input);
        var sel = this.selected();
        this.focusDate = sel || this.clampDate(today());
        this.month = new Date(this.focusDate.getFullYear(), this.focusDate.getMonth(), 1);
        this.hover = null;
        var title = this.range ? 'Escolher período' : 'Escolher data';
        this.$pop = $('<div class="datepicker" role="dialog" aria-modal="false">').attr('aria-label', title).appendTo('body');
        this.$pop.on('click', '[data-dp-nav]', function () { self.nav(+$(this).attr('data-dp-nav')); })
            .on('click', '[data-dp-view]', function () { self.view = self.view === 'days' ? 'months' : self.view === 'months' ? 'years' : 'days'; self.render(); self.$pop.find('[data-dp-view]').trigger('focus'); })
            .on('click', '[data-dp-day]', function () { if (!$(this).is(':disabled')) self.pick(parseDate($(this).attr('data-dp-day'))); })
            .on('click', '[data-dp-month]', function () { self.month = new Date(self.month.getFullYear(), +$(this).attr('data-dp-month'), 1); self.view = 'days'; self.render(); self.focusGrid(); })
            .on('click', '[data-dp-year]', function () { self.month = new Date(+$(this).attr('data-dp-year'), self.month.getMonth(), 1); self.view = 'months'; self.render(); self.$pop.find('[data-dp-month].is-selected, [data-dp-month]').first().trigger('focus'); })
            .on('click', '[data-dp-preset]', function () { self.preset($(this).attr('data-dp-preset')); })
            .on('click', '[data-dp-today]', function () { var t = today(); if (!self.isDisabled(t)) self.pick(t); else { self.month = new Date(t.getFullYear(), t.getMonth(), 1); self.render(); } })
            .on('click', '[data-dp-clear]', function () { self.clear(); })
            .on('mouseover', '[data-dp-day]', function () { if (self.range && self.picking === 'end') { self.hover = parseDate($(this).attr('data-dp-day')); self.paintRange(); } })
            .on('keydown', function (e) { self.key(e); });
        this.render();
        this.reposition();
    }

    $.extend(Calendar.prototype, {
        kind: 'date',
        selected: function () { return parseDate((this.picking === 'end' && this.range ? this.range.end : this.range ? this.range.start : this.input).value); },
        start: function () { return this.range ? parseDate(this.range.start.value) : parseDate(this.input.value); },
        end: function () { return this.range ? parseDate(this.range.end.value) : null; },
        min: function () {
            var m = resolveLimit(this.o.min);
            // no fim do período, não antes do início
            if (this.range && this.picking === 'end' && this.start() && (!m || this.start() > m)) m = this.start();
            return m;
        },
        max: function () {
            var m = resolveLimit(this.o.max);
            if (this.range && this.picking === 'end' && this.o.maxRange && this.start()) {
                var r = addDays(this.start(), this.o.maxRange - 1);
                if (!m || r < m) m = r;
            }
            return m;
        },
        clampDate: function (d) { var a = this.min(), b = this.max(); if (a && d < a) return a; if (b && d > b) return b; return d; },
        isDisabled: function (d) {
            var a = this.min(), b = this.max(), o = this.o;
            if (a && d < a) return true;
            if (b && d > b) return true;
            if (o.disable === 'weekends' && (d.getDay() === 0 || d.getDay() === 6)) return true;
            if (typeof o.disable === 'function' && o.disable(d)) return true;
            return $.inArray(d.getTime(), o.disabledDates) > -1;
        },

        render: function () {
            var html = '<div class="datepicker__main"><div class="datepicker__head">' +
                '<button type="button" class="datepicker__nav" data-dp-nav="-1" aria-label="' + (this.view === 'days' ? 'Mês anterior' : this.view === 'months' ? 'Ano anterior' : 'Anos anteriores') + '">' + icon('chevron_left') + '</button>' +
                '<button type="button" class="datepicker__title" data-dp-view aria-live="polite">' + this.title() + icon('expand_more') + '</button>' +
                '<button type="button" class="datepicker__nav" data-dp-nav="1" aria-label="' + (this.view === 'days' ? 'Próximo mês' : this.view === 'months' ? 'Próximo ano' : 'Próximos anos') + '">' + icon('chevron_right') + '</button></div>';
            if (this.range) html += '<p class="datepicker__hint">' + (this.picking === 'start' ? 'Escolha a data inicial' : 'Escolha a data final') + '</p>';
            html += this.view === 'days' ? this.daysHtml() : this.view === 'months' ? this.monthsHtml() : this.yearsHtml();
            html += '<div class="datepicker__foot"><button type="button" class="btn btn--tertiary btn--sm" data-dp-clear>Limpar</button>' +
                '<button type="button" class="btn btn--secondary btn--sm" data-dp-today>Hoje</button></div></div>';
            var presets = this.presetList();
            if (presets.length) {
                html = '<div class="datepicker__presets" role="group" aria-label="Atalhos">' + $.map(presets, function (p) {
                    return '<button type="button" class="datepicker__preset" data-dp-preset="' + p[0] + '">' + p[1] + '</button>';
                }).join('') + '</div>' + html;
            }
            this.$pop.toggleClass('has-presets', presets.length > 0).html(html);
            if (this.view === 'days') this.paintRange();
        },

        title: function () {
            if (this.view === 'days') return '<span>' + MONTHS[this.month.getMonth()] + ' de ' + this.month.getFullYear() + '</span>';
            if (this.view === 'months') return '<span>' + this.month.getFullYear() + '</span>';
            var y0 = this.month.getFullYear() - (this.month.getFullYear() % 12);
            return '<span>' + y0 + ' – ' + (y0 + 11) + '</span>';
        },

        daysHtml: function () {
            var first = new Date(this.month.getFullYear(), this.month.getMonth(), 1);
            var d = addDays(first, -first.getDay()), t = today(), sel = this.selected();
            var html = '<table class="datepicker__grid" role="grid"><thead><tr>';
            $.each(WEEK, function (i, w) { html += '<th scope="col" abbr="' + WEEK_LONG[i] + '">' + w + '</th>'; });
            html += '</tr></thead><tbody>';
            for (var w = 0; w < 6; w++) {
                html += '<tr>';
                for (var i = 0; i < 7; i++, d = addDays(d, 1)) {
                    var out = d.getMonth() !== this.month.getMonth(), dis = this.isDisabled(d), isSel = same(d, sel) || (this.range && (same(d, this.start()) || same(d, this.end())));
                    var cls = 'datepicker__day' + (out ? ' is-outside' : '') + (same(d, t) ? ' is-today' : '') + (isSel ? ' is-selected' : '');
                    html += '<td role="gridcell"><button type="button" class="' + cls + '" data-dp-day="' + fmt(d) + '" tabindex="' + (same(d, this.focusDate) ? 0 : -1) + '"' +
                        ' aria-label="' + longDate(d) + (same(d, t) ? ' (hoje)' : '') + '" aria-pressed="' + (isSel ? 'true' : 'false') + '"' + (dis ? ' disabled' : '') + '>' + d.getDate() + '</button></td>';
                }
                html += '</tr>';
            }
            return html + '</tbody></table>';
        },

        monthsHtml: function () {
            var y = this.month.getFullYear(), sel = this.selected(), self = this;
            return '<div class="datepicker__picks">' + $.map(MONTHS_SHORT, function (m, i) {
                var on = sel && sel.getFullYear() === y && sel.getMonth() === i;
                var last = new Date(y, i + 1, 0), dis = (self.min() && last < self.min()) || (self.max() && new Date(y, i, 1) > self.max());
                return '<button type="button" class="datepicker__pick' + (on ? ' is-selected' : '') + '" data-dp-month="' + i + '" aria-label="' + MONTHS[i] + ' de ' + y + '"' + (dis ? ' disabled' : '') + '>' + m + '</button>';
            }).join('') + '</div>';
        },

        yearsHtml: function () {
            var y0 = this.month.getFullYear() - (this.month.getFullYear() % 12), sel = this.selected(), out = [], a = this.min(), b = this.max();
            for (var y = y0; y < y0 + 12; y++) {
                var dis = (a && y < a.getFullYear()) || (b && y > b.getFullYear());
                out.push('<button type="button" class="datepicker__pick' + (sel && sel.getFullYear() === y ? ' is-selected' : '') + '" data-dp-year="' + y + '"' + (dis ? ' disabled' : '') + '>' + y + '</button>');
            }
            return '<div class="datepicker__picks">' + out.join('') + '</div>';
        },

        // pinta o período (início, meio, fim; com prévia ao passar o mouse)
        paintRange: function () {
            if (!this.range) return;
            var s = this.start(), e = this.picking === 'end' && this.hover && s && this.hover >= s ? this.hover : this.end();
            this.$pop.find('[data-dp-day]').each(function () {
                var d = parseDate($(this).attr('data-dp-day'));
                var inside = s && e && d > s && d < e;
                $(this).toggleClass('is-in-range', !!inside)
                    .toggleClass('is-range-start', !!(s && e && same(d, s)))
                    .toggleClass('is-range-end', !!(s && e && same(d, e)));
            });
        },

        presetList: function () {
            var p = this.o.presets;
            if (!p) return [];
            if ($.isArray(p)) return p;
            return this.range ?
                [['hoje', 'Hoje'], ['7', 'Últimos 7 dias'], ['30', 'Últimos 30 dias'], ['mes', 'Este mês'], ['mes-passado', 'Mês passado']] :
                [['hoje', 'Hoje'], ['ontem', 'Ontem'], ['+7', 'Daqui a 7 dias'], ['+30', 'Daqui a 30 dias']];
        },

        preset: function (k) {
            var t = today(), s, e;
            if (k === 'hoje') { s = t; e = t; }
            else if (k === 'ontem') { s = e = addDays(t, -1); }
            else if (k === 'mes') { s = new Date(t.getFullYear(), t.getMonth(), 1); e = new Date(t.getFullYear(), t.getMonth() + 1, 0); }
            else if (k === 'mes-passado') { s = new Date(t.getFullYear(), t.getMonth() - 1, 1); e = new Date(t.getFullYear(), t.getMonth(), 0); }
            else if (/^\+\d+$/.test(k)) { s = e = addDays(t, +k.slice(1)); }
            else if (/^\d+$/.test(k)) { s = addDays(t, -(+k - 1)); e = t; }
            if (!s) return;
            if (this.range) {
                setInput(this.range.start, fmt(s));
                setInput(this.range.end, fmt(e));
                this.changed();
                this.close(true);
            } else this.pick(s);
        },

        nav: function (n) {
            if (this.view === 'days') this.month = new Date(this.month.getFullYear(), this.month.getMonth() + n, 1);
            else if (this.view === 'months') this.month = new Date(this.month.getFullYear() + n, this.month.getMonth(), 1);
            else this.month = new Date(this.month.getFullYear() + 12 * n, this.month.getMonth(), 1);
            if (this.view === 'days') this.focusDate = new Date(this.month.getFullYear(), this.month.getMonth(), Math.min(this.focusDate.getDate(), new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0).getDate()));
            this.render();
            this.reposition();
        },

        pick: function (d) {
            if (!d || this.isDisabled(d)) return;
            if (!this.range) {
                setInput(this.input, fmt(d));
                this.changed();
                return this.close(true);
            }
            var r = this.range;
            if (this.picking === 'start') {
                setInput(r.start, fmt(d));
                var e = this.end();
                // fim antes do início, ou passou do limite: limpa o fim e pede o fim
                if (e && (e < d || (this.o.maxRange && days(d, e) + 1 > this.o.maxRange))) setInput(r.end, '');
                this.picking = 'end';
                this.hover = null;
                this.focusDate = d;
                this.render();
                this.focusGrid();
                return;
            }
            var s = this.start();
            if (s && d < s) { setInput(r.start, fmt(d)); this.render(); this.focusGrid(); return; }
            setInput(r.end, fmt(d));
            this.changed();
            this.close(true, r.end);
        },

        clear: function () {
            if (this.range) { setInput(this.range.start, ''); setInput(this.range.end, ''); this.picking = 'start'; }
            else setInput(this.input, '');
            this.changed();
            this.close(true);
        },

        changed: function () {
            var main = this.main, s = this.start(), e = this.end();
            var detail = this.range ? { value: this.range.start.value + (this.range.end.value ? ' a ' + this.range.end.value : ''), date: s, start: s, end: e } : { value: this.input.value, date: s, start: s, end: null };
            C.emit(main, 'nova:date-change', detail);
            if (this.o.onChange) this.o.onChange(detail);
            if (this.range) $([this.range.start, this.range.end]).each(function () { validateDate(this); });
            else validateDate(this.input);
        },

        focusGrid: function () {
            var $b = this.$pop.find('[data-dp-day][tabindex="0"]');
            if (!$b.length || $b.is(':disabled')) $b = this.$pop.find('[data-dp-day]:not(:disabled):not(.is-outside)').first();
            $b.trigger('focus');
        },

        moveFocus: function (d) {
            var a = this.min(), b = this.max();
            if ((a && d < a) || (b && d > b)) return;
            this.focusDate = d;
            if (d.getMonth() !== this.month.getMonth() || d.getFullYear() !== this.month.getFullYear()) {
                this.month = new Date(d.getFullYear(), d.getMonth(), 1);
                this.render();
            } else {
                this.$pop.find('[data-dp-day]').attr('tabindex', -1);
                this.$pop.find('[data-dp-day="' + fmt(d) + '"]').attr('tabindex', 0);
            }
            this.$pop.find('[data-dp-day="' + fmt(d) + '"]').trigger('focus');
            if (this.range && this.picking === 'end') { this.hover = d; this.paintRange(); }
        },

        key: function (e) {
            var k = e.key, $t = $(e.target);
            if (k === 'Escape') { e.preventDefault(); return this.close(true); }
            if (k === 'Tab') {
                // mantém o foco dentro do calendário
                var $f = this.$pop.find('button:not(:disabled)').filter(function () { return this.tabIndex !== -1; });
                if (!$f.length) return;
                if (e.shiftKey && e.target === $f[0]) { e.preventDefault(); $f.last().trigger('focus'); }
                else if (!e.shiftKey && e.target === $f[$f.length - 1]) { e.preventDefault(); $f.first().trigger('focus'); }
                return;
            }
            if (!$t.is('[data-dp-day]')) return;
            var d = parseDate($t.attr('data-dp-day')), map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
            if (map[k] !== undefined) { e.preventDefault(); this.moveFocus(addDays(d, map[k])); }
            else if (k === 'Home') { e.preventDefault(); this.moveFocus(addDays(d, -d.getDay())); }
            else if (k === 'End') { e.preventDefault(); this.moveFocus(addDays(d, 6 - d.getDay())); }
            else if (k === 'PageUp' || k === 'PageDown') {
                e.preventDefault();
                var n = k === 'PageUp' ? -1 : 1;
                if (e.shiftKey) n *= 12;
                var m = new Date(d.getFullYear(), d.getMonth() + n, 1);
                this.moveFocus(new Date(m.getFullYear(), m.getMonth(), Math.min(d.getDate(), new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate())));
            }
        },

        reposition: function () { position(this.$pop, this.anchor); },

        close: function (focusBack, to) {
            this.$pop.remove();
            $(this.range ? [this.range.start, this.range.end] : this.input).attr('aria-expanded', 'false');
            $(this.anchor).closest('.field').removeClass('is-open');
            if (current === this) current = null;
            if (focusBack) $(to || this.input).trigger('focus');
        }
    });

    function openDate(input, focusGrid) {
        input = C.get(input);
        if (!input || input.disabled || input.readOnly) return;
        if (current && current.input === input && current.kind === 'date') return;
        closeCurrent(false);
        current = new Calendar(input);
        $(input).attr('aria-expanded', 'true');
        $(current.anchor).closest('.field').addClass('is-open');
        if (focusGrid || sheet()) current.focusGrid();
        return current;
    }

    // confere limites ao digitar (o formato a máscara e o data-validate cuidam)
    function validateDate(input) {
        if (!input.value) return NOVAUI.field.setState({ target: input, type: null });
        var d = parseDate(input.value);
        if (!d) return;
        var r = rangeOf(input), main = r ? r.start : input, o = dpOptions(main);
        var a = resolveLimit(o.min), b = resolveLimit(o.max), msg = null;
        if (r && input === r.end && parseDate(r.start.value) && d < parseDate(r.start.value)) msg = 'A data final não pode ser antes da inicial.';
        else if (r && input === r.end && o.maxRange && parseDate(r.start.value) && days(parseDate(r.start.value), d) + 1 > o.maxRange) msg = 'O período pode ter no máximo ' + o.maxRange + ' dias.';
        else if (a && d < a) msg = 'Escolha uma data a partir de ' + fmt(a) + '.';
        else if (b && d > b) msg = 'Escolha uma data até ' + fmt(b) + '.';
        else if (o.disable === 'weekends' && (d.getDay() === 0 || d.getDay() === 6)) msg = 'Escolha um dia útil.';
        else if ($.inArray(d.getTime(), o.disabledDates) > -1) msg = 'Esta data não está disponível.';
        NOVAUI.field.setState({ target: input, type: msg ? 'error' : null, message: msg || '' });
        return !msg;
    }

    function initDate(input) {
        if (input._novaDate) return;
        input._novaDate = true;
        var $i = $(input);
        if (input.type === 'date') {
            var iso = input.value, name = input.name;
            if (!$i.attr('data-min') && $i.attr('min')) $i.attr('data-min', $i.attr('min'));
            if (!$i.attr('data-max') && $i.attr('max')) $i.attr('data-max', $i.attr('max'));
            $i.removeAttr('min max step');
            var $h = $('<input type="hidden" data-date-value>').val(iso);
            if (name) { $h.attr('name', name); $i.removeAttr('name').attr('data-name', name); }
            $h.insertAfter(input);
            input.type = 'text';
            input.value = fmt(parseDate(iso));
            if (input.value) C.fire(input, 'input');
        }
        if (!$i.attr('data-mask')) $i.attr('data-mask', 'date');
        if (!$i.attr('placeholder')) $i.attr('placeholder', 'dd/mm/aaaa');
        $i.attr({ inputmode: 'numeric', autocomplete: 'off', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
        addTrigger(input, 'calendar_month', rangeOf(input) ? 'Escolher período' : 'Escolher data');
    }

    /* =====================================================================
       SELETOR DE HORA
       ===================================================================== */
    function toMin(v) {
        var m = String(v || '').match(/^(\d{1,2}):(\d{2})$/);
        if (!m || +m[1] > 23 || +m[2] > 59) return null;
        return +m[1] * 60 + +m[2];
    }
    function fromMin(n) { return pad(Math.floor(n / 60)) + ':' + pad(n % 60); }
    function dur(n) { var h = Math.floor(n / 60), m = n % 60; return h ? h + 'h' + (m ? pad(m) : '') : m + ' min'; }

    function timeOptions(input) {
        var o = input._novaTimeOpts || {};
        var start = C.get($(input).attr('data-range-start'));
        return {
            step: parseInt(opt(o, input, 'step', 'data-step'), 10) || 30,
            min: toMin(opt(o, input, 'min', 'data-min')),
            max: toMin(opt(o, input, 'max', 'data-max')),
            start: start,
            onChange: o.onChange
        };
    }

    function TimeList(input) {
        var self = this, o = timeOptions(input);
        this.input = input;
        this.o = o;
        this.anchor = anchorOf(input);
        var from = o.min != null ? o.min : 0, to = o.max != null ? o.max : 24 * 60 - 1;
        var base = o.start ? toMin(o.start.value) : null;
        // horário final: só depois do início
        if (base != null && base + o.step > from) from = base + o.step;
        var cur = toMin(input.value), items = [];
        for (var m = from; m <= to; m += o.step) items.push(m);
        if (cur != null && $.inArray(cur, items) < 0 && cur >= from && cur <= to) { items.push(cur); items.sort(function (a, b) { return a - b; }); }
        this.items = items;
        var id = C.uid('tp');
        this.$pop = $('<div class="timepicker" role="listbox">').attr({ id: id, 'aria-label': 'Escolher horário' }).appendTo('body');
        if (!items.length) this.$pop.html('<p class="timepicker__empty">Nenhum horário disponível.</p>');
        else this.$pop.html($.map(items, function (m) {
            return '<button type="button" class="timepicker__option' + (m === cur ? ' is-selected' : '') + '" role="option" aria-selected="' + (m === cur) + '" data-tp="' + fromMin(m) + '" tabindex="-1">' +
                '<span>' + fromMin(m) + '</span>' + (base != null ? '<span class="timepicker__dur">' + dur(m - base) + '</span>' : '') + '</button>';
        }).join(''));
        this.$pop.on('click', '[data-tp]', function () { self.pick($(this).attr('data-tp')); })
            .on('keydown', function (e) { self.key(e); });
        this.reposition();
        // rola até o horário escolhido (ou o mais perto de agora)
        var target = cur != null ? cur : base != null ? base + o.step : (function () { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
        var $near = this.$pop.find('[data-tp]').filter(function () { return toMin($(this).attr('data-tp')) >= target; }).first();
        if (!$near.length) $near = this.$pop.find('[data-tp]').last();
        this.$active = $near;
        if ($near.length) this.$pop.scrollTop($near[0].offsetTop - this.$pop.innerHeight() / 2 + $near.outerHeight() / 2);
    }

    $.extend(TimeList.prototype, {
        kind: 'time',
        pick: function (v) {
            setInput(this.input, v);
            var detail = { value: v, minutes: toMin(v) };
            C.emit(this.input, 'nova:time-change', detail);
            if (this.o.onChange) this.o.onChange(detail);
            validateTime(this.input);
            var end = C.get($(this.input).attr('data-range-end'));
            this.close(true);
            // escolheu o início: abre o fim
            if (end && !end.value) setTimeout(function () { openTime(end); }, 0);
        },
        key: function (e) {
            var $o = this.$pop.find('[data-tp]'), i = $o.index(document.activeElement);
            if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); return this.close(true); }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                i = Math.max(0, Math.min($o.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
                $o.eq(i).trigger('focus');
            } else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); $o.eq(e.key === 'Home' ? 0 : $o.length - 1).trigger('focus'); }
        },
        focusList: function () { if (this.$active && this.$active.length) this.$active.trigger('focus'); },
        reposition: function () { position(this.$pop, this.anchor); },
        close: function (focusBack) {
            this.$pop.remove();
            $(this.input).attr('aria-expanded', 'false');
            $(this.anchor).closest('.field').removeClass('is-open');
            if (current === this) current = null;
            if (focusBack) $(this.input).trigger('focus');
        }
    });

    function openTime(input, focusList) {
        input = C.get(input);
        if (!input || input.disabled || input.readOnly) return;
        if (current && current.input === input && current.kind === 'time') return;
        closeCurrent(false);
        current = new TimeList(input);
        $(input).attr('aria-expanded', 'true');
        $(current.anchor).closest('.field').addClass('is-open');
        if (focusList || sheet()) current.focusList();
        return current;
    }

    function validateTime(input) {
        if (!input.value) return NOVAUI.field.setState({ target: input, type: null });
        var m = toMin(input.value);
        if (m == null) return;
        var o = timeOptions(input), msg = null, s = o.start ? toMin(o.start.value) : null;
        if (s != null && m <= s) msg = 'O horário final precisa ser depois de ' + o.start.value + '.';
        else if (o.min != null && m < o.min) msg = 'Escolha um horário a partir de ' + fromMin(o.min) + '.';
        else if (o.max != null && m > o.max) msg = 'Escolha um horário até ' + fromMin(o.max) + '.';
        NOVAUI.field.setState({ target: input, type: msg ? 'error' : null, message: msg || '' });
        return !msg;
    }

    function initTime(input) {
        if (input._novaTime) return;
        input._novaTime = true;
        var $i = $(input);
        if (input.type === 'time') {
            var st = parseInt($i.attr('step'), 10);
            if (!$i.attr('data-min') && $i.attr('min')) $i.attr('data-min', $i.attr('min'));
            if (!$i.attr('data-max') && $i.attr('max')) $i.attr('data-max', $i.attr('max'));
            if (!$i.attr('data-step') && st >= 60) $i.attr('data-step', Math.round(st / 60));   // step nativo é em segundos
            $i.removeAttr('min max step');
            var v = String(input.value || '').slice(0, 5);
            input.type = 'text';
            input.value = v;
        }
        if (!$i.attr('data-mask')) $i.attr('data-mask', 'time');
        if (!$i.attr('placeholder')) $i.attr('placeholder', 'hh:mm');
        $i.attr({ inputmode: 'numeric', autocomplete: 'off', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' });
        addTrigger(input, 'schedule', 'Escolher horário');
    }

    /* =====================================================================
       EVENTOS E INICIALIZAÇÃO
       ===================================================================== */
    function inputOf(btn) { return $(btn).closest('.field__control').find('[data-datepicker], [data-timepicker]')[0]; }

    $(document)
        .on('click', '.field__trigger', function () {
            var input = inputOf(this);
            if (!input) return;
            if (current && current.input === input) return closeCurrent(true);
            if (input.hasAttribute('data-datepicker')) openDate(input, true);
            else openTime(input, true);
        })
        .on('click', '[data-datepicker]', function () { openDate(this); })
        .on('click', '[data-timepicker]', function () { openTime(this); })
        .on('keydown', '[data-datepicker], [data-timepicker]', function (e) {
            var isDate = this.hasAttribute('data-datepicker');
            if (e.key === 'ArrowDown' || (e.altKey && e.key === 'ArrowDown')) {
                e.preventDefault();
                if (current && current.input === this) return isDate ? current.focusGrid() : current.focusList();
                return isDate ? openDate(this, true) : openTime(this, true);
            }
            if (e.key === 'Escape' && current && current.input === this) { e.preventDefault(); closeCurrent(true); }
            if (e.key === 'Tab' && current && current.input === this) closeCurrent(false);
        })
        .on('input change', '[data-datepicker]', function () { syncIso(this); })
        .on('input', '[data-datepicker], [data-timepicker]', function () {
            // digitou uma data completa: o calendário acompanha
            if (current && current.input === this && current.kind === 'date') {
                var d = parseDate(this.value);
                if (d) { current.month = new Date(d.getFullYear(), d.getMonth(), 1); current.focusDate = d; current.render(); }
            }
        })
        .on('change', '[data-datepicker]', function () {
            if (current && current.kind === 'date') return;   // o calendário avisa sozinho
            validateDate(this);
            var r = rangeOf(this), main = r ? r.start : this, s = parseDate((r ? r.start : this).value);
            C.emit(main, 'nova:date-change', { value: this.value, date: parseDate(this.value), start: s, end: r ? parseDate(r.end.value) : null });
        })
        .on('change', '[data-timepicker]', function () {
            if (current && current.kind === 'time') return;
            validateTime(this);
        });

    function refresh(root) {
        var $root = $(C.get(root) || document);
        $root.find('[data-datepicker]').each(function () { initDate(this); });
        $root.find('[data-timepicker]').each(function () { initTime(this); });
    }

    $(function () { refresh(); });
    NOVAUI._onRefresh(refresh);

    NOVAUI.datepicker = {
        // NOVAUI.datepicker.create({ target, min, max, disable, disabledDates, maxRange, presets, onChange })
        create: function (o) {
            var el = C.get(o.target);
            if (!el) return null;
            el._novaDateOpts = o;
            if (!el.hasAttribute('data-datepicker')) el.setAttribute('data-datepicker', '');
            initDate(el);
            return el;
        },
        open: function (target) { openDate(visibleOf(target), true); },
        close: function () { closeCurrent(false); },
        setValue: function (target, v) {
            var el = visibleOf(target);
            if (!el) return;
            var d = parseDate(v);
            setInput(el, d ? fmt(d) : '');
            validateDate(el);
        },
        getDate: function (target) { var el = visibleOf(target); return el ? parseDate(el.value) : null; },
        parse: parseDate,
        format: fmt
    };

    NOVAUI.timepicker = {
        // NOVAUI.timepicker.create({ target, step, min, max, onChange })
        create: function (o) {
            var el = C.get(o.target);
            if (!el) return null;
            el._novaTimeOpts = o;
            if (!el.hasAttribute('data-timepicker')) el.setAttribute('data-timepicker', '');
            initTime(el);
            return el;
        },
        open: function (target) { openTime(target, true); },
        close: function () { closeCurrent(false); },
        setValue: function (target, v) {
            var el = C.get(target);
            if (!el) return;
            setInput(el, toMin(v) != null ? fromMin(toMin(v)) : '');
            validateTime(el);
        }
    };
})(window.jQuery, window, document);
