/* =========================================================================
   NOVA UI — HISTÓRICO DE ALTERAÇÕES (comparar antes x depois no formulário)
   Registra o que cada usuário mudou nos campos do formulário num campo oculto
   (JSON, gravado pelo Fluig) e mostra o histórico: quem, quando e cada campo
   com o valor de antes e o de depois.

   HTML
     <input type="hidden" name="modificationLog" id="modificationLog">
     <div class="change-history" id="historico"></div>

   JS
     NOVAUI.changeHistory.track({ target, field, user, history, fields,
                                  enabled, when, useText, valueLabels, people })
     NOVAUI.changeHistory.render({ target, field, valueLabels, people, title,
                                   order, hideEmpty, emptyText })
     NOVAUI.changeHistory.reset(target)       // nova sessão (ex.: trocou o produto)
     NOVAUI.changeHistory.parse(valor)        // JSON → lista de usuários
   Evento (no campo oculto): nova:change-history { changes, log }

   Formato gravado (igual ao modificationLog dos processos):
     [{ "updatedBy": "login", "data": [{ "isEditable": true, "isModified": true,
        "clickedAt": ISO, "updatedAt": ISO,
        "hasPreviousData": { "Rótulo": { "old": "N", "new": "S" } } }] }]
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;
    var FIELDS = 'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="file"]):not([readonly]), select, textarea';
    var trackers = [];
    var people = {};

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function fmtDate(iso) {
        var d = new Date(iso);
        if (!iso || isNaN(d)) return '';
        return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' às ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function initials(name) {
        var p = $.trim(name || '').split(/\s+/);
        return ((p[0] || '').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase() || '?';
    }

    /* ---------------------------------------------------------------------
       FORMATO: aceita o formato atual e o antigo (lista solta de sessões)
       --------------------------------------------------------------------- */
    function parse(value) {
        var list = value;
        if (typeof value === 'string') {
            if (!$.trim(value)) return [];
            try { list = JSON.parse(value); } catch (e) { return []; }
        }
        if (!$.isArray(list)) return [];
        if (!list.length || list[0].data) return list;
        var out = [];
        $.each(list, function (i, item) {
            var by = item.updatedBy || '', group = $.grep(out, function (g) { return g.updatedBy === by; })[0];
            var entry = {
                isEditable: item.isEditable,
                isModified: item.isModified,
                clickedAt: item.clickedAt || item.updatedAt || null,
                updatedAt: item.updatedAt,
                hasPreviousData: item.hasPreviousData
            };
            if (group) group.data.push(entry);
            else out.push({ updatedBy: by, data: [entry] });
        });
        return out;
    }

    /* ---------------------------------------------------------------------
       RÓTULO E VALOR DE CADA CAMPO
       --------------------------------------------------------------------- */
    function labelOf(el) {
        var $el = $(el), t = $el.attr('data-change-label');
        if (t) return $.trim(t);
        if ($el.is(':radio')) {
            var $g = $el.closest('fieldset, [role="radiogroup"], .form-group');
            t = $g.find('legend, .form-label').first().text() || $g.attr('aria-label');
            if (t) return $.trim(t);
        }
        if (el.id) {
            t = $('label[for="' + el.id + '"]').first().text();
            if ($.trim(t)) return $.trim(t);
        }
        t = $el.closest('.field, .form-group').find('label, .form-label, .field__label').first().text();
        if ($.trim(t)) return $.trim(t);
        return $.trim($el.attr('aria-label') || el.name || '');
    }

    function valueOf(el, useText) {
        var $el = $(el);
        if ($el.is(':checkbox')) return el.checked ? ($el.attr('data-change-on') || 'Sim') : ($el.attr('data-change-off') || 'Não');
        if ($el.is('select')) {
            if (!useText) return $el.val() == null ? '' : $.isArray($el.val()) ? $el.val().join(', ') : String($el.val());
            return $.map($el.find('option:selected'), function (o) { return o.value ? $.trim($(o).text()) : null; }).join(', ');
        }
        return $el.val() == null ? '' : String($el.val());
    }

    function snapshot(t) {
        var data = {}, seen = {};
        $(t.target).find(t.fields).each(function () {
            if ($(this).is(':radio')) {
                if (seen[this.name]) return;
                seen[this.name] = true;
                var label = labelOf(this), $on = $(t.target).find('input[type="radio"][name="' + this.name + '"]:checked');
                if (label) data[label] = $on.length ? (t.useText ? $.trim($('label[for="' + $on[0].id + '"]').text() || $on.closest('label').text()) || $on.val() : $on.val()) : '';
                return;
            }
            var l = labelOf(this);
            if (l) data[l] = valueOf(this, t.useText);
        });
        return data;
    }

    function diff(a, b) {
        var out = {};
        $.each(b, function (k, v) {
            var o = a[k] == null ? '' : a[k];
            if (o !== (v == null ? '' : v)) out[k] = { old: a[k] == null ? '' : a[k], 'new': v };
        });
        return out;
    }

    /* ---------------------------------------------------------------------
       REGISTRO (track)
       --------------------------------------------------------------------- */
    function Tracker(o) {
        var self = this;
        this.o = o;
        this.target = C.get(o.target);
        this.field = C.get(o.field);
        this.fields = o.fields || FIELDS;
        this.useText = !!o.useText;
        this.original = null;
        this.startedAt = null;
        var sel = this.fields;
        $(this.target)
            .on('focusin.novaChanges', sel, function () {
                if (!self.active() || self.original) return;
                self.original = snapshot(self);
                self.startedAt = new Date().toISOString();
            })
            .on('change.novaChanges', sel, function () {
                // sem o "antes" (o campo mudou sem receber foco) não há o que comparar
                if (!self.active() || !self.original) return;
                self.save();
            });
    }

    $.extend(Tracker.prototype, {
        active: function () {
            var o = this.o;
            if (o.enabled === false) return false;
            return typeof o.when === 'function' ? !!o.when() : true;
        },

        user: function () {
            var u = this.o.user;
            u = typeof u === 'function' ? u() : u;
            if (!u && window.WCMAPI && WCMAPI.userCode) u = WCMAPI.userCode;
            return u || '';
        },

        save: function () {
            var now = new Date().toISOString();
            var changes = diff(this.original, snapshot(this));
            var modified = !$.isEmptyObject(changes);
            var log = parse(this.field.value), by = this.user();
            var entry = { isEditable: true, isModified: modified, clickedAt: this.startedAt, updatedAt: now, hasPreviousData: modified ? changes : false };
            var group = $.grep(log, function (g) { return g.updatedBy === by; })[0];
            if (!group) log.push({ updatedBy: by, data: [entry] });
            else {
                var self = this, same = $.grep(group.data, function (d) { return d.clickedAt === self.startedAt; })[0];
                if (same) $.extend(same, entry);
                else group.data.push(entry);
            }
            this.field.value = JSON.stringify(log);
            C.fire(this.field, 'change');
            C.emit(this.field, 'nova:change-history', { changes: changes, log: log });
            if (this.o.history) render($.extend({}, this.o, { target: this.o.history, field: this.field }));
        },

        reset: function () { this.original = null; this.startedAt = null; },

        destroy: function () {
            $(this.target).off('.novaChanges');
            var self = this;
            trackers = $.grep(trackers, function (t) { return t !== self; });
        }
    });

    /* ---------------------------------------------------------------------
       QUEM ALTEROU (nome e foto). No Fluig busca no dataset colleague.
       --------------------------------------------------------------------- */
    function person(login, custom) {
        if (custom) {
            var r = custom(login);
            if (r) return $.extend({ name: login, photo: null }, typeof r === 'string' ? { name: r } : r);
        }
        if (people[login]) return people[login];
        var p = { name: login || 'Usuário', photo: null };
        if (login && window.DatasetFactory && window.ConstraintType) {
            try {
                var c = DatasetFactory.createConstraint('colleaguePK.colleagueId', login, login, ConstraintType.MUST);
                var ds = DatasetFactory.getDataset('colleague', null, [c], null);
                var v = ds && ds.values && ds.values.length ? ds.values[ds.values.length - 1] : null;
                if (v) p = { name: v.colleagueName || login, photo: '/social/api/rest/social/image/profile/' + (v.login || login) + '/MEDIUM_PICTURE' };
            } catch (e) { /* fora do Fluig: fica o login */ }
        }
        people[login] = p;
        return p;
    }

    /* ---------------------------------------------------------------------
       DESENHO (render)
       --------------------------------------------------------------------- */
    function show(field, value, map) {
        var m = map && map[field];
        if (value == null || value === '') return '';
        return m && m[String(value)] !== undefined ? m[String(value)] : String(value);
    }

    function valueBox(kind, label, text) {
        var empty = text === '';
        return '<div class="change-history__value change-history__value--' + kind + '" data-tip="' + (kind === 'old' ? 'Antes' : 'Depois') + '" data-tip-placement="top">' +
            '<span class="sr-only">' + (kind === 'old' ? 'Antes' : 'Depois') + ': </span>' +
            '<span class="change-history__label">' + esc(label) + '</span>' +
            '<span class="change-history__text' + (empty ? ' is-empty' : '') + '">' + (empty ? 'Vazio' : esc(text)) + '</span></div>';
    }

    function render(o) {
        var $t = $(C.get(o.target)), field = C.get(o.field);
        if (!$t.length) return 0;
        o = $.extend({ title: 'Histórico do formulário editado', order: 'desc', hideEmpty: true, emptyText: 'Nenhuma alteração registrada.' }, o);
        var entries = [];
        $.each(parse(field ? field.value : o.value), function (i, g) {
            $.each(g.data || [], function (k, d) {
                if (d.isModified && d.hasPreviousData && !$.isEmptyObject(d.hasPreviousData)) entries.push({ by: g.updatedBy, d: d });
            });
        });
        entries.sort(function (a, b) {
            var x = a.d.updatedAt || a.d.clickedAt || '', y = b.d.updatedAt || b.d.clickedAt || '';
            return o.order === 'asc' ? (x > y ? 1 : -1) : (x < y ? 1 : -1);
        });
        $t.addClass('change-history').prop('hidden', !entries.length && o.hideEmpty);
        var html = o.title ? '<p class="change-history__title">' + esc(o.title) + '</p>' : '';
        if (!entries.length) {
            $t.html(html + '<p class="change-history__empty">' + esc(o.emptyText) + '</p>');
            return 0;
        }
        html += '<ol class="change-history__list">';
        $.each(entries, function (i, e) {
            var p = person(e.by, o.people);
            html += '<li class="change-history__entry"><div class="change-history__head">' +
                '<span class="avatar avatar--sm" aria-hidden="true">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" data-initials="' + esc(initials(p.name)) + '">' : esc(initials(p.name))) + '</span>' +
                '<span class="change-history__who"><span class="change-history__name">' + esc(p.name) + '</span>' +
                '<time class="change-history__date" datetime="' + esc(e.d.clickedAt || e.d.updatedAt || '') + '">' + fmtDate(e.d.clickedAt || e.d.updatedAt) + '</time></span>' +
                '<span class="badge badge--neutral change-history__count">' + Object.keys(e.d.hasPreviousData).length + (Object.keys(e.d.hasPreviousData).length > 1 ? ' campos' : ' campo') + '</span></div>' +
                '<div class="change-history__rows">';
            $.each(e.d.hasPreviousData, function (label, v) {
                html += '<div class="change-history__row">' +
                    valueBox('old', label, show(label, v.old, o.valueLabels)) +
                    '<span class="change-history__arrow">' + icon('arrow_forward') + '</span>' +
                    valueBox('new', label, show(label, v['new'], o.valueLabels)) + '</div>';
            });
            html += '</div></li>';
        });
        $t.html(html + '</ol>');
        // foto que não carrega vira iniciais
        $t.find('.avatar img').on('error', function () { var $a = $(this).parent(); $a.text($(this).attr('data-initials')); });
        return entries.length;
    }

    NOVAUI.changeHistory = {
        // NOVAUI.changeHistory.track({ target, field, user, history, fields, enabled, when, useText, valueLabels, people })
        track: function (o) {
            if (!C.get(o.target) || !C.get(o.field)) return null;
            var t = new Tracker(o);
            trackers.push(t);
            if (o.history) render($.extend({}, o, { target: o.history }));
            return t;
        },
        // NOVAUI.changeHistory.render({ target, field, valueLabels, people, title, order, hideEmpty, emptyText })
        render: render,
        // começa uma nova comparação (os valores atuais viram o "antes")
        reset: function (target) {
            var el = C.get(target);
            $.each(trackers, function (i, t) { if (!el || t.target === el || t.field === el) t.reset(); });
        },
        parse: parse
    };
})(window.jQuery, window, document);
