/* =========================================================================
   NOVA UI — DATA DISPLAY (comportamento) · requer jQuery e core.js
   Inicializa sozinho; para conteúdo inserido depois, chame NOVAUI.refresh(root).
   Árvore      role="tree": teclado, expandir/recolher, seleção
               eventos: nova:tree-select, nova:tree-toggle · NOVAUI.tree.refresh(el?)
   Kanban      arrastar e soltar; Shift+setas move o card focado
               evento: nova:kanban-move { card, id, from, to, index } · NOVAUI.kanban.refresh(el?)
   Calendário  NOVAUI.calendar.create({ target, date, events, weekStart, maxPerDay,
                 onEventClick, onDayClick })
               eventos: nova:calendar-event, nova:calendar-day, nova:calendar-change
   Data grid   td[data-editable] em table.data-grid · evento: nova:grid-change
               NOVAUI.grid.getChanges(t), getData(t), commit(t), discard(t),
               hasErrors(t), refresh(t?)
   Accordion não precisa de JS (<details>/<summary>).
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;

    /* =====================================================================
       TREE VIEW
       ===================================================================== */
    var NovaTree = (function () {
        function parentItem(it) { return $(it).parent().closest('[role="treeitem"]')[0] || null; }

        function isVisible(tree, it) {
            for (var p = parentItem(it); p && $.contains(tree, p); p = parentItem(p)) {
                if ($(p).attr('aria-expanded') === 'false') return false;
            }
            return true;
        }

        function visibleItems(tree) {
            return $(tree).find('[role="treeitem"]').filter(function () { return isVisible(tree, this); }).get();
        }

        function init(tree) {
            $(tree).find('[role="treeitem"]').each(function () {
                var $it = $(this), level = $it.parentsUntil(tree, '[role="treeitem"]').length + 1;
                $it.attr('aria-level', level).prop('tabIndex', -1);
                $it.children('.tree__row').each(function () { this.style.setProperty('--tree-level', level); });
                var $g = $it.children('.tree__group');
                if ($g.find('[role="treeitem"]').length) {
                    $g.attr('role', 'group')[0].style.setProperty('--tree-level', level);
                    if (!$it.attr('aria-expanded')) $it.attr('aria-expanded', 'false');
                } else {
                    $it.removeAttr('aria-expanded');
                }
                if (!$it.attr('aria-selected')) $it.attr('aria-selected', 'false');
            });
            var current = $(tree).find('[role="treeitem"][aria-selected="true"]')[0];
            if (!current || !isVisible(tree, current)) current = visibleItems(tree)[0];
            if (current) current.tabIndex = 0;
        }

        function focusItem(tree, it) {
            if (!it) return;
            $(tree).find('[role="treeitem"]').prop('tabIndex', -1);
            it.tabIndex = 0;
            it.focus();
        }

        function toggle(it, open) {
            var $it = $(it);
            if (!$it.attr('aria-expanded')) return;
            var was = $it.attr('aria-expanded') === 'true', next = open === undefined ? !was : open;
            if (was === next) return;
            $it.attr('aria-expanded', String(next));
            C.emit(it, 'nova:tree-toggle', { item: it, expanded: next });
        }

        function select(tree, it) {
            var $it = $(it);
            if ($(tree).attr('aria-multiselectable') !== 'true') {
                $(tree).find('[role="treeitem"]').attr('aria-selected', 'false');
                $it.attr('aria-selected', 'true');
            } else {
                $it.attr('aria-selected', String($it.attr('aria-selected') !== 'true'));
            }
            var $label = $it.children('.tree__row').find('.tree__label');
            C.emit(tree, 'nova:tree-select', { item: it, value: $it.attr('data-value'), label: $.trim(($label.length ? $label : $it).first().text()) });
        }

        $(document)
            .on('click', '.tree__row', function (e) {
                var it = this.parentElement, tree = $(it).closest('[role="tree"]')[0];
                if (!tree) return;
                if (!$(e.target).closest('.tree__toggle').length) select(tree, it);
                toggle(it);
                focusItem(tree, it);
            })
            .on('keydown', '[role="treeitem"]', function (e) {
                if (e.target !== this) return;
                var it = this, tree = $(it).closest('[role="tree"]')[0];
                if (!tree) return;
                var vis = visibleItems(tree), i = vis.indexOf(it), exp = $(it).attr('aria-expanded');
                switch (e.key) {
                    case 'ArrowDown': focusItem(tree, vis[i + 1]); break;
                    case 'ArrowUp': focusItem(tree, vis[i - 1]); break;
                    case 'Home': focusItem(tree, vis[0]); break;
                    case 'End': focusItem(tree, vis[vis.length - 1]); break;
                    case 'ArrowRight':
                        if (exp === 'false') toggle(it, true);
                        else if (exp === 'true') focusItem(tree, vis[i + 1]);
                        break;
                    case 'ArrowLeft':
                        if (exp === 'true') toggle(it, false);
                        else if (parentItem(it) && $.contains(tree, parentItem(it))) focusItem(tree, parentItem(it));
                        break;
                    case 'Enter':
                    case ' ':
                        select(tree, it);
                        if (e.key === 'Enter') toggle(it);
                        break;
                    default: return;
                }
                e.preventDefault();
            });

        function refresh(el) {
            $(el ? C.get(el) : '[role="tree"].tree').each(function () { init(this); });
        }

        return { refresh: refresh, toggle: toggle };
    })();

    /* =====================================================================
       KANBAN
       ===================================================================== */
    var NovaKanban = (function () {
        var dragging = null, origin = null;

        function cards(list) { return $(list).children('.kanban-card'); }

        function columnOf(el) {
            var $col = $(el).closest('.kanban__column');
            return $col.attr('data-status') || $col.attr('id') || '';
        }

        function updateCounts(board) {
            $(board).find('.kanban__column').each(function () {
                var $col = $(this), $list = $col.find('.kanban__list');
                if (!$list.length) return;
                var n = cards($list).length, limit = parseInt($col.attr('data-limit'), 10);
                $col.find('[data-kanban-count]').text(n);
                $list.find('.kanban__empty').prop('hidden', n > 0);
                $col.toggleClass('is-over-limit', limit > 0 && n > limit);
            });
        }

        function init(board) {
            $(board).find('.kanban-card').each(function () {
                var $c = $(this).attr('draggable', 'true');
                if (!$c.attr('tabindex')) $c.attr('tabindex', 0);
                if (!$c.attr('aria-roledescription')) $c.attr('aria-roledescription', 'card arrastável');
            });
            updateCounts(board);
        }

        function afterElement(list, y) {
            return cards(list).not(dragging).filter(function () {
                var box = this.getBoundingClientRect();
                return y < box.top + box.height / 2;
            })[0] || null;
        }

        function place(list, card, before) {
            if (before) $(card).insertBefore(before); else $(list).append(card);
        }

        function notify(card) {
            var board = $(card).closest('.kanban')[0];
            if (!board) return;
            updateCounts(board);
            var list = card.parentElement, index = cards(list).index(card);
            if (origin && origin.list === list && origin.index === index) return;
            C.emit(board, 'nova:kanban-move', {
                card: card,
                id: $(card).attr('data-id') || card.id,
                from: origin ? columnOf(origin.list) : '',
                to: columnOf(list),
                index: index
            });
        }

        $(document)
            .on('dragstart', '.kanban-card', function (e) {
                var dt = e.originalEvent.dataTransfer;
                dragging = this;
                origin = { list: this.parentElement, index: cards(this.parentElement).index(this) };
                $(this).addClass('is-dragging');
                dt.effectAllowed = 'move';
                try { dt.setData('text/plain', $(this).attr('data-id') || 'card'); } catch (x) { /* navegador antigo */ }
            })
            .on('dragover', '.kanban__list', function (e) {
                if (!dragging || !$.contains($(this).closest('.kanban')[0], dragging)) return;
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';
                $('.kanban__list.is-over').not(this).removeClass('is-over');
                $(this).addClass('is-over');
                var after = afterElement(this, e.originalEvent.clientY);
                if (after !== dragging.nextElementSibling || dragging.parentElement !== this) place(this, dragging, after);
            })
            .on('drop', function (e) { if (dragging) e.preventDefault(); })
            .on('dragend', function () {
                if (!dragging) return;
                var card = dragging;
                $(card).removeClass('is-dragging');
                $('.kanban__list.is-over').removeClass('is-over');
                dragging = null;
                notify(card);
                origin = null;
            })
            /* teclado: Shift + setas */
            .on('keydown', '.kanban-card', function (e) {
                if (!e.shiftKey || e.target !== this) return;
                var card = this, list = card.parentElement, $lists = $(card).closest('.kanban').find('.kanban__list');
                var li = $lists.index(list), prev = $(card).prev('.kanban-card')[0], next = $(card).next()[0];
                origin = { list: list, index: cards(list).index(card) };
                var target = e.key === 'ArrowLeft' ? $lists[li - 1] : e.key === 'ArrowRight' ? $lists[li + 1] : null;
                if (e.key === 'ArrowUp' && prev) $(card).insertBefore(prev);
                else if (e.key === 'ArrowDown' && next) $(next).insertBefore(card);
                else if (target) place(target, card, cards(target)[origin.index] || null);
                else { origin = null; return; }
                e.preventDefault();
                card.focus();
                notify(card);
                origin = null;
            });

        function refresh(el) {
            $(el ? C.get(el) : '.kanban').each(function () { init(this); });
        }

        return { refresh: refresh };
    })();

    /* =====================================================================
       CALENDAR
       ===================================================================== */
    var NovaCalendar = (function () {
        var WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        var ICON_PREV = '<span class="icon" aria-hidden="true">chevron_left</span>';
        var ICON_NEXT = '<span class="icon" aria-hidden="true">chevron_right</span>';
        var fmtMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
        var fmtFull = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        function pad(n) { return n < 10 ? '0' + n : String(n); }
        function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
        function parse(s) {
            if (s instanceof Date) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
            var p = String(s).split('-');
            return new Date(+p[0], +p[1] - 1, +(p[2] || 1));
        }
        function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
        function firstOf(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

        function Calendar(el, opts) {
            this.el = el;
            this.$el = $(el).addClass('calendar');
            this.opts = opts || {};
            this.id = C.uid('cal');
            this.weekStart = this.opts.weekStart || 0;
            this.maxPerDay = this.opts.maxPerDay || 3;
            this.events = this.opts.events || [];
            this.selected = this.opts.selected || null;
            var d = this.opts.date ? parse(this.opts.date) : new Date();
            this.month = firstOf(d);
            this.focusDate = iso(d);
            this._bind();
            this.render();
        }

        $.extend(Calendar.prototype, {
            // eventos por dia; os de vários dias primeiro, depois os sem hora
            _index: function () {
                var map = {};
                $.each(this.events, function (i, ev) {
                    var start = parse(ev.start), end = ev.end ? parse(ev.end) : start, multi = end > start;
                    for (var d = new Date(start); d <= end; d = addDays(d, 1)) {
                        (map[iso(d)] = map[iso(d)] || []).push({ ev: ev, multi: multi, isStart: iso(d) === iso(start), isEnd: iso(d) === iso(end) });
                    }
                });
                $.each(map, function (k, list) {
                    list.sort(function (a, b) {
                        if (a.multi !== b.multi) return a.multi ? -1 : 1;
                        if (!a.ev.time !== !b.ev.time) return a.ev.time ? 1 : -1;
                        return String(a.ev.time || '').localeCompare(String(b.ev.time || ''));
                    });
                });
                return map;
            },
            _eventHtml: function (item) {
                var ev = item.ev, timed = ev.time && !item.multi;
                var cls = 'cal-event cal-event--' + (ev.color || 'brand') + (timed ? ' cal-event--timed' : '') +
                    (item.multi ? ' is-multi' + (item.isStart ? ' is-start' : '') + (item.isEnd ? ' is-end' : '') : '');
                return '<button type="button" class="' + cls + '" data-event-id="' + esc(ev.id) + '" title="' + esc((ev.time ? ev.time + ' ' : '') + ev.title) + '">' +
                    (timed ? '<span class="cal-event__time">' + esc(ev.time) + '</span>' : '') + '<span class="cal-event__title">' + esc(ev.title) + '</span></button>';
            },
            render: function () {
                var self = this, m = this.month.getMonth(), today = iso(new Date());
                var offset = (this.month.getDay() - this.weekStart + 7) % 7, first = addDays(this.month, -offset);
                var weeks = Math.ceil((offset + new Date(this.month.getFullYear(), m + 1, 0).getDate()) / 7);
                var map = this._index(), titleId = this.id + '-title';
                var focus = parse(this.focusDate).getMonth() === m ? this.focusDate : iso(this.month);
                var html = '<div class="calendar__header"><h3 class="calendar__title" id="' + titleId + '" aria-live="polite">' + fmtMonth.format(this.month) + '</h3>' +
                    '<div class="calendar__nav"><button type="button" class="btn btn--secondary btn--sm" data-cal="today">Hoje</button>' +
                    '<button type="button" class="btn btn--tertiary btn--sm btn--icon" data-cal="prev" aria-label="Mês anterior">' + ICON_PREV + '</button>' +
                    '<button type="button" class="btn btn--tertiary btn--sm btn--icon" data-cal="next" aria-label="Próximo mês">' + ICON_NEXT + '</button></div></div>' +
                    '<div class="calendar__grid" role="grid" aria-labelledby="' + titleId + '"><div class="calendar__weekdays" role="row">';
                for (var w = 0; w < 7; w++) html += '<div class="calendar__weekday" role="columnheader">' + WEEKDAYS[(w + this.weekStart) % 7] + '</div>';
                html += '</div>';
                for (var r = 0; r < weeks; r++) {
                    html += '<div class="calendar__week" role="row">';
                    for (var c = 0; c < 7; c++) {
                        var d = addDays(first, r * 7 + c), key = iso(d), list = map[key] || [];
                        var cls = 'calendar__day' + (d.getMonth() !== m ? ' is-outside' : '') + (d.getDay() % 6 === 0 ? ' is-weekend' : '') +
                            (key === today ? ' is-today' : '') + (key === this.selected ? ' is-selected' : '');
                        var label = fmtFull.format(d) + (list.length ? ', ' + list.length + (list.length > 1 ? ' eventos' : ' evento') : '');
                        html += '<div class="' + cls + '" role="gridcell" data-date="' + key + '" tabindex="' + (key === focus ? 0 : -1) + '"' +
                            (key === this.selected ? ' aria-selected="true"' : '') + ' aria-label="' + esc(label) + '"><span class="calendar__date" aria-hidden="true">' + d.getDate() + '</span>';
                        if (list.length) {
                            var shown = list.length > self.maxPerDay ? self.maxPerDay - 1 : list.length;
                            html += '<div class="calendar__events">' + $.map(list.slice(0, shown), function (it) { return self._eventHtml(it); }).join('') + '</div>';
                            if (list.length > shown) html += '<button type="button" class="calendar__more" data-date="' + key + '">+' + (list.length - shown) + ' mais</button>';
                        }
                        html += '</div>';
                    }
                    html += '</div>';
                }
                this.$el.html(html + '</div>');
            },
            _findEvent: function (id) {
                return $.grep(this.events, function (ev) { return String(ev.id) === String(id); })[0] || null;
            },
            eventsOn: function (date) {
                return $.map(this._index()[date] || [], function (x) { return x.ev; });
            },
            _change: function () { C.emit(this.el, 'nova:calendar-change', { month: iso(this.month).slice(0, 7) }); },
            select: function (date, silent) {
                var d = parse(date);
                this.selected = this.focusDate = date;
                this.month = firstOf(d);
                this.render();
                if (silent) return;
                var detail = { date: date, events: this.eventsOn(date) };
                if (this.opts.onDayClick) this.opts.onDayClick(detail);
                C.emit(this.el, 'nova:calendar-day', detail);
            },
            go: function (months) {
                this.month = new Date(this.month.getFullYear(), this.month.getMonth() + months, 1);
                this.focusDate = iso(this.month);
                this.render();
                this._change();
            },
            next: function () { this.go(1); },
            prev: function () { this.go(-1); },
            today: function () {
                var t = new Date();
                this.month = firstOf(t);
                this.focusDate = iso(t);
                this.render();
                this._change();
            },
            setDate: function (date) {
                var d = parse(date);
                this.month = firstOf(d);
                this.focusDate = iso(d);
                this.render();
            },
            setEvents: function (events) {
                this.events = events || [];
                this.render();
            },
            _focus: function (date) {
                var d = parse(date);
                this.focusDate = iso(d);
                if (d.getMonth() !== this.month.getMonth() || d.getFullYear() !== this.month.getFullYear()) {
                    this.month = firstOf(d);
                    this.render();
                } else {
                    this.$el.find('.calendar__day').prop('tabIndex', -1);
                }
                this.$el.find('.calendar__day[data-date="' + this.focusDate + '"]').prop('tabIndex', 0).trigger('focus');
            },
            _bind: function () {
                var self = this;
                this.$el
                    .on('click', '[data-cal]', function () { self[$(this).attr('data-cal')](); })
                    .on('click', '.cal-event', function (e) {
                        e.stopPropagation();
                        var id = $(this).attr('data-event-id'), ev = self._findEvent(id);
                        self.$el.find('.cal-event.is-active').removeClass('is-active');
                        self.$el.find('.cal-event[data-event-id="' + id + '"]').addClass('is-active');
                        if (self.opts.onEventClick) self.opts.onEventClick(ev, this);
                        C.emit(self.el, 'nova:calendar-event', { event: ev, element: this });
                    })
                    .on('click', '.calendar__more', function (e) { e.stopPropagation(); self.select($(this).attr('data-date')); })
                    .on('click', '.calendar__day', function () { self.select($(this).attr('data-date')); })
                    .on('keydown', '.calendar__day', function (e) {
                        if (e.target !== this) return;
                        var d = parse($(this).attr('data-date')), step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
                        if (step) {
                            e.preventDefault();
                            self._focus(addDays(d, step));
                        } else if (e.key === 'PageUp' || e.key === 'PageDown') {
                            e.preventDefault();
                            self._focus(new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), Math.min(d.getDate(), 28)));
                        } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            self.select(iso(d));
                            self.$el.find('.calendar__day[data-date="' + iso(d) + '"]').trigger('focus');
                        }
                    });
            }
        });

        return {
            create: function (el, opts) {
                el = C.get(el);
                return el ? new Calendar(el, opts) : null;
            }
        };
    })();

    /* =====================================================================
       DATA GRID
       ===================================================================== */
    var NovaGrid = (function () {
        var fmtCache = {};
        var isNum = function (type) { return type === 'number' || type === 'currency'; };

        function numberFmt(decimals, currency) {
            var k = decimals + '|' + currency;
            return fmtCache[k] || (fmtCache[k] = new Intl.NumberFormat('pt-BR', currency
                ? { style: 'currency', currency: 'BRL', minimumFractionDigits: decimals, maximumFractionDigits: decimals }
                : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
        }

        function type(td) { return $(td).attr('data-type') || 'text'; }
        function getValue(td) { return td.hasAttribute('data-value') ? $(td).attr('data-value') : $.trim($(td).text()); }

        function display(td, value) {
            var t = type(td);
            if (value === '' || value == null) return '';
            if (isNum(t)) {
                var n = parseFloat(value), dec = parseInt($(td).attr('data-decimals'), 10);
                if (isNaN(n)) return value;
                return numberFmt(isNaN(dec) ? (t === 'currency' ? 2 : 0) : dec, t === 'currency').format(n);
            }
            if (t === 'date') {
                var p = String(value).split('-');
                return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : value;
            }
            return value;
        }

        function render(td) { $(td).text(display(td, getValue(td))); }

        function headerOf(td) {
            var head = $(td).closest('table')[0].tHead;
            return head && head.rows[0] ? head.rows[0].cells[td.cellIndex] : null;
        }

        function keyOf(td) {
            var th = headerOf(td);
            return th ? ($(th).attr('data-key') || $.trim($(th).text())) : td.cellIndex;
        }

        function validate(td, value) {
            var th = headerOf(td), min = $(td).attr('data-min');
            var required = td.hasAttribute('data-required') || $(th).hasClass('is-required');
            if (value === '') return required ? 'Campo obrigatório.' : '';
            if (isNum(type(td)) && !/^-?\d+(\.\d+)?$/.test(value)) return 'Informe um número válido.';
            if (min !== undefined && parseFloat(value) < parseFloat(min)) return 'Valor mínimo: ' + min + '.';
            return '';
        }

        function initTable(table) {
            $(table).attr('role', 'grid').find('tbody td').each(function () {
                this.tabIndex = -1;
                if (this.hasAttribute('data-initial')) return;
                if (!this.hasAttribute('data-value')) $(this).attr('data-value', $.trim($(this).text()));
                $(this).attr('data-initial', getValue(this));
                render(this);
            }).filter('[data-editable]').first().prop('tabIndex', 0);
            updateStatus(table);
        }

        function focusCell(td) {
            if (!td) return;
            $(td).closest('table').find('tbody td[tabindex="0"]').prop('tabIndex', -1);
            td.tabIndex = 0;
            td.focus();
        }

        function neighbor(td, dr, dc) {
            var tr = td.parentElement, rows = $(tr.parentElement).children('tr').get();
            var r = rows.indexOf(tr) + dr;
            if (r < 0 || r >= rows.length) return null;
            var c = $(tr).children('td').index(td) + dc, $target = $(rows[r]).children('td');
            if (c >= 0 && c < $target.length) return $target[c];
            if (dr !== 0) return null;
            // Tab no fim da linha: próxima/anterior linha
            var $other = $(rows[r + (c < 0 ? -1 : 1)]).children('td');
            return $other.length ? (c < 0 ? $other.last()[0] : $other[0]) : null;
        }

        function startEdit(td, initial) {
            var $td = $(td);
            if (!td || !td.hasAttribute('data-editable') || $td.hasClass('is-editing')) return;
            var t = type(td), value = getValue(td), options = $td.attr('data-options'), $ed;
            if (options) {
                $ed = $('<select>').append($.map(options.split('|'), function (o) {
                    return $('<option>').val(o).text(o || '—').prop('selected', o === value);
                }));
            } else {
                $ed = $('<input>').attr('type', t === 'date' ? 'date' : 'text').attr('inputmode', isNum(t) ? 'decimal' : null)
                    .val(initial != null ? initial : isNum(t) ? String(value).replace('.', ',') : value);
            }
            var th = headerOf(td);
            $ed.addClass('data-grid__editor').attr('aria-label', th ? $.trim($(th).text()) : 'Editar célula');
            $td.attr('data-editing-from', value).empty().append($ed).addClass('is-editing');
            $ed.trigger('focus');
            if (initial == null && $ed[0].select) $ed[0].select();
        }

        function normalize(td, raw) {
            raw = $.trim(raw);
            if (isNum(type(td)) && raw !== '') {
                raw = raw.replace(/[R$\s]/g, '');
                if (raw.indexOf(',') > -1) raw = raw.replace(/\./g, '').replace(',', '.');
            }
            return raw;
        }

        function setCell(td, value, oldValue) {
            var $td = $(td), error = validate(td, value), table = $td.closest('table')[0];
            $td.attr('data-value', value).removeClass('is-editing').removeAttr('data-editing-from');
            render(td);
            $td.toggleClass('is-dirty', value !== $td.attr('data-initial')).toggleClass('is-invalid', !!error)
                .attr({ title: error || null, 'aria-invalid': error ? 'true' : null });
            updateStatus(table);
            if (value !== oldValue) {
                C.emit(table, 'nova:grid-change', {
                    cell: td, row: td.parentElement, rowIndex: td.parentElement.sectionRowIndex,
                    key: keyOf(td), oldValue: oldValue, value: value, error: error
                });
            }
        }

        function commit(td) {
            if (!$(td).hasClass('is-editing')) return;
            setCell(td, normalize(td, $(td).find('.data-grid__editor').val() || ''), $(td).attr('data-editing-from'));
        }

        function cancel(td) {
            var $td = $(td);
            if (!$td.hasClass('is-editing')) return;
            $td.removeClass('is-editing').attr('data-value', $td.attr('data-editing-from')).removeAttr('data-editing-from');
            render(td);
        }

        function updateStatus(table) {
            if (!table || !table.id) return;
            var $status = $('[data-grid-status-for="' + table.id + '"]');
            if (!$status.length) return;
            var dirty = $(table).find('tbody td.is-dirty').length, errors = $(table).find('tbody td.is-invalid').length;
            $status.find('.data-grid-status__count').text(errors
                ? errors + (errors > 1 ? ' células com erro' : ' célula com erro')
                : dirty ? dirty + (dirty > 1 ? ' alterações não salvas' : ' alteração não salva') : 'Tudo salvo');
            $status.toggleClass('has-changes', dirty > 0).toggleClass('has-errors', errors > 0)
                .find('[data-grid-requires-changes]').prop('disabled', dirty === 0);
        }

        var MOVES = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

        $(document)
            .on('focusin', '.data-grid tbody td', function (e) {
                if (e.target !== this) return;
                $(this).closest('table').find('tbody td[tabindex="0"]').not(this).prop('tabIndex', -1);
                this.tabIndex = 0;
            })
            .on('focusout', '.data-grid__editor', function () {
                var ed = this, td = $(ed).closest('td')[0];
                setTimeout(function () { if ($.contains(td, ed)) commit(td); }, 0);
            })
            .on('dblclick', '.data-grid tbody td[data-editable]', function () { startEdit(this); })
            .on('keydown', '.data-grid__editor', function (e) {
                var cell = $(this).closest('td')[0];
                if (e.key === 'Enter') {
                    e.preventDefault(); commit(cell);
                    focusCell(neighbor(cell, e.shiftKey ? -1 : 1, 0) || cell);
                } else if (e.key === 'Tab') {
                    e.preventDefault(); commit(cell);
                    focusCell(neighbor(cell, 0, e.shiftKey ? -1 : 1) || cell);
                } else if (e.key === 'Escape') {
                    e.preventDefault(); cancel(cell); focusCell(cell);
                }
            })
            .on('keydown', '.data-grid tbody td', function (e) {
                if (e.target !== this) return;
                var td = this, editable = td.hasAttribute('data-editable') && !td.hasAttribute('data-options');
                if (MOVES[e.key]) {
                    e.preventDefault();
                    focusCell(neighbor(td, MOVES[e.key][0], MOVES[e.key][1]));
                } else if (e.key === 'Tab') {
                    var n = neighbor(td, 0, e.shiftKey ? -1 : 1);
                    if (n) { e.preventDefault(); focusCell(n); }
                } else if (e.key === 'Enter' || e.key === 'F2') {
                    e.preventDefault(); startEdit(td);
                } else if ((e.key === 'Delete' || e.key === 'Backspace') && editable) {
                    e.preventDefault(); setCell(td, '', getValue(td));
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && editable && type(td) !== 'date') {
                    e.preventDefault(); startEdit(td, e.key);
                }
            });

        /* API */
        function cells(el) { return $(C.get(el)).find('tbody td'); }

        function getChanges(el) {
            return cells(el).filter('.is-dirty').map(function () {
                return { rowIndex: this.parentElement.sectionRowIndex, id: $(this.parentElement).attr('data-id'), key: keyOf(this), oldValue: $(this).attr('data-initial'), value: getValue(this) };
            }).get();
        }

        function getData(el) {
            var table = C.get(el), keys = $(table.tHead ? table.tHead.rows[0] : []).children('th').map(function () { return $(this).attr('data-key'); }).get();
            return $(table.tBodies[0]).children('tr').map(function () {
                var row = {};
                if ($(this).attr('data-id')) row.id = $(this).attr('data-id');
                $(this.cells).each(function (i) { if (keys[i] && this.tagName === 'TD') row[keys[i]] = getValue(this); });
                return row;
            }).get();
        }

        /* marca os valores atuais como salvos */
        function commitAll(el) {
            cells(el).each(function () {
                if ($(this).hasClass('is-editing')) commit(this);
                $(this).attr('data-initial', getValue(this)).removeClass('is-dirty');
            });
            updateStatus(C.get(el));
        }

        /* volta aos últimos valores salvos */
        function discard(el) {
            cells(el).each(function () {
                if ($(this).hasClass('is-editing')) cancel(this);
                if (!this.hasAttribute('data-initial')) return;
                $(this).attr('data-value', $(this).attr('data-initial')).removeClass('is-dirty is-invalid').removeAttr('title aria-invalid');
                render(this);
            });
            updateStatus(C.get(el));
        }

        return {
            refresh: function (el) { $(el ? C.get(el) : 'table.data-grid').each(function () { initTable(this); }); },
            getChanges: getChanges,
            getData: getData,
            hasErrors: function (el) { return cells(el).filter('.is-invalid').length > 0; },
            commit: commitAll,
            discard: discard
        };
    })();

    $(function () {
        NovaTree.refresh();
        NovaKanban.refresh();
        NovaGrid.refresh();
    });

    NOVAUI._onRefresh(function () {
        NovaTree.refresh();
        NovaKanban.refresh();
        NovaGrid.refresh();
    });

    NOVAUI.tree = NovaTree;
    NOVAUI.kanban = NovaKanban;
    // NOVAUI.calendar.create({ target, date, events, weekStart, maxPerDay, onEventClick, onDayClick })
    NOVAUI.calendar = { create: function (o) { return NovaCalendar.create(o.target, o); } };
    NOVAUI.grid = NovaGrid;
})(window.jQuery, window, document);
