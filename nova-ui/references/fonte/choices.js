/* =========================================================================
   NOVA UI — SELEÇÃO (comportamento) · requer jQuery e core.js
   O <select> nativo continua no DOM e recebe os valores (evento change),
   então os campos seguem funcionando no Fluig.
   Toggle        .btn--toggle e button.tag[aria-pressed] alternam; evento nova:toggle
   Marcar todos  <input data-check-all="grupo"> controla
                 <input data-check-group="grupo">; mostra estado parcial
   Select        <select data-enhance [multiple] [data-search]
                   [data-placeholder] [data-max-chips="3"]> dentro de .field
   Combobox      <select data-combobox> — digita para filtrar, valor da lista
   Autocomplete  NOVAUI.select.autocomplete(input, { source, minChars, onSelect,
                   valueInput }) — source(termo, done) pode consultar dataset
                 ou <input data-autocomplete data-source="#datalist">
   Listbox       <ul class="listbox" role="listbox" [aria-multiselectable]
                   [data-input="#hidden"]>; evento nova:listbox-change
   Tags          <input class="field__input" data-tags [data-separator]
                   [data-max] [data-validate="email|number|matricula"]
                   [data-suggest="#datalist"] [data-lowercase]>
                 evento nova:tags-change · NOVAUI.tags.get/set/add/remove(el)
   API: NOVAUI.select.refresh(select?) · NOVAUI.select.setValue(select, valor | [valores])
        NOVAUI.select.autocomplete(input, opções) · NOVAUI.select.close()
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc, norm = C.norm;
    var ICON_X = '<span class="icon" aria-hidden="true">close</span>';
    var ICON_SEARCH = '<span class="icon" aria-hidden="true">search</span>';

    function highlight(label, query) {
        var q = $.trim(norm(query)), i = q ? norm(label).indexOf(q) : -1;
        if (i < 0) return esc(label);
        return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + q.length)) + '</mark>' + esc(label.slice(i + q.length));
    }

    /* =====================================================================
       TOGGLE E MARCAR TODOS
       ===================================================================== */
    $(document).on('click', 'button.tag[aria-pressed], .btn--toggle', function () {
        var $b = $(this);
        if ($b.hasClass('btn--toggle') && $b.closest('[data-toggle-group]').length) return;
        var on = $b.attr('aria-pressed') !== 'true';
        $b.attr('aria-pressed', String(on));
        C.emit(this, 'nova:toggle', $b.is('button.tag') ? { pressed: on, value: $b.attr('data-value') || $.trim($b.text()) } : { pressed: on });
    });

    function syncCheckAll(group) {
        var $items = $('[data-check-group="' + group + '"]').not(':disabled');
        var n = $items.filter(':checked').length;
        $('[data-check-all="' + group + '"]').prop({ checked: n > 0 && n === $items.length, indeterminate: n > 0 && n < $items.length });
    }

    $(document)
        .on('change', '[data-check-all]', function () {
            var on = this.checked;
            $('[data-check-group="' + $(this).attr('data-check-all') + '"]').not(':disabled').each(function () {
                if (this.checked !== on) { this.checked = on; C.fire(this, 'change'); }
            });
            syncCheckAll($(this).attr('data-check-all'));
        })
        .on('change', '[data-check-group]', function () { syncCheckAll($(this).attr('data-check-group')); });

    /* =====================================================================
       PAINEL DE OPÇÕES (compartilhado por select, combobox, autocomplete e tags)
       ===================================================================== */
    function Panel(opts) {
        this.id = C.uid('nova-listbox');
        this.multi = !!opts.multi;
        var html = '';
        if (opts.search) {
            html += '<div class="select-panel__search">' + ICON_SEARCH + '<input type="text" autocomplete="off" spellcheck="false" placeholder="' +
                esc(opts.searchPlaceholder || 'Buscar…') + '" aria-label="Buscar opção" aria-controls="' + this.id + '"></div>';
        }
        html += '<ul class="select-panel__list" role="listbox" id="' + this.id + '"' + (this.multi ? ' aria-multiselectable="true"' : '') + '></ul>';
        if (this.multi) {
            html += '<div class="select-panel__footer"><span data-panel-count></span><span><button type="button" class="select-panel__link" data-panel-all>Todos</button> ' +
                '<button type="button" class="select-panel__link" data-panel-clear>Limpar</button></span></div>';
        }
        this.$el = $('<div class="select-panel" hidden>').toggleClass('select-panel--multi', this.multi).html(html).appendTo(document.body);
        this.el = this.$el[0];
        this.$list = this.$el.find('.select-panel__list');
        this.search = this.$el.find('.select-panel__search input')[0] || null;
        this.items = [];
        this.active = -1;
        // não tira o foco do campo ao clicar no painel (exceto na busca)
        this.$el.on('mousedown', function (e) {
            if (!$(e.target).closest('.select-panel__search').length) e.preventDefault();
        });
    }

    Panel.prototype.render = function (items, state) {
        state = state || {};
        var self = this, html = '', lastGroup = null;
        this.items = items;
        if (state.status === 'loading') {
            html = '<li class="select-panel__status" role="presentation"><span class="select-panel__spinner"></span>Buscando…</li>';
        } else if (!items.length) {
            html = '<li class="select-panel__status" role="presentation">' + esc(state.emptyText || 'Nenhuma opção encontrada') + '</li>';
        } else {
            $.each(items, function (i, it) {
                if (it.group && it.group !== lastGroup) {
                    html += '<li class="select-panel__group" role="presentation">' + esc(it.group) + '</li>';
                    lastGroup = it.group;
                }
                var sel = state.selected && state.selected.indexOf(it.value) > -1;
                html += '<li class="select-option" role="option" id="' + self.id + '-o' + i + '" data-index="' + i + '" aria-selected="' + !!sel + '"' +
                    (it.disabled ? ' aria-disabled="true"' : '') + '><span class="select-option__check" aria-hidden="true"></span>' +
                    '<span class="select-option__text"><span class="select-option__label">' + highlight(it.label, state.query) + '</span>' +
                    (it.desc ? '<span class="select-option__desc">' + esc(it.desc) + '</span>' : '') + '</span>' +
                    (it.meta ? '<span class="select-option__meta">' + esc(it.meta) + '</span>' : '') + '</li>';
            });
        }
        this.$list.html(html);
        if (this.multi) {
            var n = (state.selected || []).length;
            this.$el.find('[data-panel-count]').text(n ? n + (n > 1 ? ' selecionados' : ' selecionado') : 'Nenhum selecionado');
        }
        this.active = -1;
    };

    Panel.prototype.position = function (anchor) {
        // dentro de um modal, o painel precisa estar no modal (camada do topo)
        var host = $(anchor).closest('dialog[open]')[0] || document.body;
        if (this.el.parentNode !== host) host.appendChild(this.el);
        var r = anchor.getBoundingClientRect(), m = 8;
        var vh = window.innerHeight, vw = document.documentElement.clientWidth;
        this.$el.css({ visibility: 'hidden', width: Math.min(Math.max(r.width, 220), vw - 2 * m) }).prop('hidden', false);
        var below = vh - r.bottom - m - 4, above = r.top - m - 4;
        var up = below < Math.min(Math.min(this.el.scrollHeight, 300), 200) && above > below;
        var maxH = Math.max(120, Math.min(300, up ? above : below));
        this.$el.css('max-height', maxH);
        var h = Math.min(this.el.offsetHeight, maxH);
        this.$el.css({
            left: Math.round(Math.min(Math.max(m, r.left), vw - m - this.el.offsetWidth)),
            top: Math.round(up ? r.top - h - 4 : r.bottom + 4),
            visibility: ''
        });
    };

    Panel.prototype.setActive = function (i) {
        this.$list.find('.select-option.is-active').removeClass('is-active');
        this.active = i;
        var li = this.$list.find('[data-index="' + i + '"]').addClass('is-active')[0];
        if (!li) return null;
        if (li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
        return li.id;
    };

    Panel.prototype.move = function (delta) {
        var n = this.items.length, i = this.active;
        for (var k = 0; k < n; k++) {
            i = i < 0 ? (delta > 0 ? 0 : n - 1) : (i + delta + n) % n;
            if (!this.items[i].disabled) return this.setActive(i);
        }
        return null;
    };

    Panel.prototype.edge = function (last) {
        this.active = -1;
        return this.move(last ? -1 : 1);
    };

    Panel.prototype.hide = function () { this.$el.prop('hidden', true); };
    Panel.prototype.isOpen = function () { return !this.el.hidden; };

    /* um painel aberto por vez */
    var openCtrl = null;

    function closeOpen() {
        if (openCtrl) openCtrl.close();
    }

    $(document).on('mousedown', function (e) {
        if (openCtrl && !openCtrl.contains(e.target)) openCtrl.close();
    });
    $(window).on('resize', closeOpen);
    document.addEventListener('scroll', function (e) {
        if (openCtrl && !$(e.target).closest('.select-panel').length) openCtrl.close();
    }, true);

    function readOptions(select) {
        return $(select).find('option').filter(function () {
            return this.value !== '' || this.hasAttribute('data-selectable');
        }).map(function () {
            var $o = $(this), $g = $o.parent('optgroup');
            return {
                value: this.value,
                label: $.trim($o.text()),
                desc: $o.attr('data-desc') || '',
                meta: $o.attr('data-meta') || '',
                keywords: $o.attr('data-keywords') || '',
                group: $g.length ? $g.attr('label') : null,
                disabled: this.disabled || $g.prop('disabled') === true,
                option: this
            };
        }).get();
    }

    function filterItems(items, query) {
        var q = $.trim(norm(query));
        if (!q) return items;
        var tokens = q.split(/\s+/);
        return $.grep(items, function (it) {
            var hay = norm([it.label, it.desc, it.meta, it.keywords, it.group].join(' '));
            return tokens.every(function (t) { return hay.indexOf(t) > -1; });
        });
    }

    function datalistItems(sel) {
        return $(sel).find('option').map(function () {
            return { value: this.value, label: $.trim($(this).text()) || this.value, desc: $(this).attr('data-desc') || '' };
        }).get();
    }

    // métodos comuns a quem tem painel
    var base = {
        contains: function (node) {
            return !!node && ($.contains(this.panel.el, node) || node === this.panel.el ||
                (this.field ? $.contains(this.field, node) || node === this.field : $.contains(this.$anchor()[0], node)));
        },
        isOpen: function () { return this.panel.isOpen(); },
        $anchor: function () { return this.field ? $(this.field).find('.field__control').first() : $(this.input || this.trigger); },
        syncActive: function () {
            var $t = $(this.panel.search || this.input || this.trigger);
            if (this.panel.active > -1) $t.attr('aria-activedescendant', this.panel.id + '-o' + this.panel.active);
            else $t.removeAttr('aria-activedescendant');
        },
        closePanel: function () {
            this.panel.hide();
            $(this.input || this.trigger).attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
            if (openCtrl === this) openCtrl = null;
        },
        showPanel: function (items, state) {
            if (openCtrl && openCtrl !== this) openCtrl.close();
            this.panel.render(items, state);
            this.panel.position(this.$anchor()[0]);
            $(this.input || this.trigger).attr('aria-expanded', 'true');
            openCtrl = this;
        }
    };

    function hideNative(select) {
        $(select).addClass('select-native').attr({ tabindex: -1, 'aria-hidden': 'true' });
    }

    /* =====================================================================
       SELECT PERSONALIZADO (single e multi)
       ===================================================================== */
    function EnhancedSelect(select) {
        var self = this, $s = $(select);
        this.select = select;
        this.multi = select.multiple;
        this.field = $s.closest('.field')[0] || null;
        this.placeholder = $s.attr('data-placeholder') || $s.find('option[value=""]').text() || 'Selecione';
        this.maxChips = parseInt($s.attr('data-max-chips'), 10) || 3;
        this.panel = new Panel({ multi: this.multi, search: select.hasAttribute('data-search'), searchPlaceholder: $s.attr('data-search-placeholder') });

        $(this.field).addClass('field--select-custom');
        hideNative(select);
        var $t = $('<div class="select-trigger" tabindex="0" role="combobox" aria-haspopup="listbox" aria-expanded="false">')
            .attr({ id: (select.id || C.uid('nova-select')) + '-trigger', 'aria-controls': this.panel.id })
            .insertAfter(select);
        this.trigger = $t[0];

        var $label = $(this.field).find('.field__label').first();
        if ($label.length) {
            if (!$label.attr('id')) $label.attr('id', C.uid('nova-label'));
            $t.attr('aria-labelledby', $label.attr('id'));
            this.panel.$list.attr('aria-labelledby', $label.attr('id'));
            $label.removeAttr('for').on('click', function () { $t.trigger('focus'); });
        }

        $s.on('focus', function () { $t.trigger('focus'); }).on('change', function () { self.renderTrigger(); });
        this.$anchor().on('click', function (e) {
            if ($(e.target).closest('.field__clear, .field__addon, .select-chip__remove').length || self.select.disabled) return;
            if (self.isOpen()) self.close(); else self.open();
            if (!self.isOpen() || !self.panel.search) $t.trigger('focus');
        });
        $t.on('click', '.select-chip__remove', function (e) {
            e.stopPropagation();
            self.toggleValue($(this).attr('data-value'), false);
        }).on('keydown', function (e) { self.onKey(e, false); })
            .on('focusout', function (e) {
                if (!self.contains(e.relatedTarget)) setTimeout(function () { if (!self.contains(document.activeElement)) self.close(); }, 0);
            });
        $(this.panel.search).on('keydown', function (e) { self.onKey(e, true); })
            .on('input', function () { self.renderPanel(); self.panel.edge(false); self.syncActive(); })
            .on('focusout', function (e) { if (!self.contains(e.relatedTarget)) self.close(); });
        this.panel.$list.on('click', '.select-option', function () { self.choose(+$(this).attr('data-index')); });
        this.panel.$el.on('click', '[data-panel-all]', function () { self.setAll(true); })
            .on('click', '[data-panel-clear]', function () { self.setAll(false); });

        select._novaSelect = this;
        this.refresh();
    }

    $.extend(EnhancedSelect.prototype, base, {
        values: function () {
            return $(this.select).find('option:selected').map(function () { return this.value; }).get().filter(Boolean);
        },
        refresh: function () {
            this.items = readOptions(this.select);
            $(this.trigger).attr({ 'aria-disabled': String(this.select.disabled), tabindex: this.select.disabled ? -1 : 0 });
            this.renderTrigger();
            if (this.isOpen()) this.renderPanel();
        },
        label: function (v) {
            var it = $.grep(this.items, function (i) { return i.value === v; })[0];
            return it ? it.label : v;
        },
        renderTrigger: function () {
            var self = this, vals = this.values(), html;
            if (!vals.length) html = '<span class="select-trigger__placeholder">' + esc(this.placeholder) + '</span>';
            else if (!this.multi) html = '<span class="select-trigger__value">' + esc(this.label(vals[0])) + '</span>';
            else {
                html = $.map(vals.slice(0, this.maxChips), function (v) {
                    var l = self.label(v);
                    return '<span class="select-chip"><span class="select-chip__label">' + esc(l) + '</span><span class="select-chip__remove" data-value="' +
                        esc(v) + '" aria-hidden="true" title="Remover ' + esc(l) + '">' + ICON_X + '</span></span>';
                }).join('');
                if (vals.length > this.maxChips) html += '<span class="select-chip select-chip--more">+' + (vals.length - this.maxChips) + '</span>';
            }
            $(this.trigger).html(html).attr('aria-description', $.map(vals, function (v) { return self.label(v); }).join(', '));
            $(this.field).toggleClass('has-value', vals.length > 0);
        },
        query: function () { return this.panel.search ? this.panel.search.value : ''; },
        renderPanel: function () {
            this.filtered = filterItems(this.items, this.query());
            this.panel.render(this.filtered, { selected: this.values(), query: this.query() });
        },
        open: function () {
            if (this.select.disabled || this.isOpen()) return;
            closeOpen();
            if (this.panel.search) this.panel.search.value = '';
            this.renderPanel();
            this.panel.position(this.$anchor()[0]);
            $(this.trigger).attr('aria-expanded', 'true');
            var vals = this.values(), idx = -1;
            $.each(this.filtered, function (i, it) { if (vals.indexOf(it.value) > -1) { idx = i; return false; } });
            if (idx > -1) this.panel.setActive(idx); else this.panel.edge(false);
            this.syncActive();
            openCtrl = this;
            if (this.panel.search) this.panel.search.focus();
        },
        close: function (focusTrigger) {
            if (!this.isOpen()) return;
            this.closePanel();
            if (focusTrigger) this.trigger.focus();
        },
        toggleValue: function (value, on) {
            var opt = $(this.select).find('option').filter(function () { return this.value === value; })[0];
            if (!opt) return;
            if (this.multi) opt.selected = on === undefined ? !opt.selected : on;
            else this.select.value = value;
            C.fire(this.select, 'input');
            C.fire(this.select, 'change');
            this.renderTrigger();
            if (this.isOpen()) {
                var active = this.panel.active;
                this.renderPanel();
                if (active > -1) this.panel.setActive(active);
                this.syncActive();
            }
        },
        setAll: function (on) {
            var visible = $.map($.grep(this.filtered || this.items, function (i) { return !i.disabled; }), function (i) { return i.value; });
            $(this.select).find('option').each(function () { if (visible.indexOf(this.value) > -1) this.selected = on; });
            C.fire(this.select, 'change');
            this.renderTrigger();
            this.renderPanel();
        },
        choose: function (i) {
            var it = this.filtered && this.filtered[i];
            if (!it || it.disabled) return;
            if (this.multi) {
                this.panel.setActive(i);
                this.toggleValue(it.value);
                this.panel.setActive(i);
            } else {
                this.toggleValue(it.value, true);
                this.close(true);
            }
        },
        onKey: function (e, fromSearch) {
            var k = e.key;
            if (!this.isOpen()) {
                if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); this.open(); }
                else if (k === 'Backspace' && this.multi && this.values().length) { e.preventDefault(); this.toggleValue(this.values().pop(), false); }
                else if (k === 'Delete' && !this.multi && this.values().length && $(this.select).find('option[value=""]').length) {
                    e.preventDefault(); this.select.value = ''; C.fire(this.select, 'change'); this.renderTrigger();
                }
                return;
            }
            var p = this.panel;
            switch (k) {
                case 'ArrowDown': e.preventDefault(); p.move(1); break;
                case 'ArrowUp': e.preventDefault(); p.move(-1); break;
                case 'Home': if (!fromSearch) { e.preventDefault(); p.edge(false); } break;
                case 'End': if (!fromSearch) { e.preventDefault(); p.edge(true); } break;
                case 'Enter': e.preventDefault(); if (p.active > -1) this.choose(p.active); break;
                case ' ': if (!fromSearch) { e.preventDefault(); if (p.active > -1) this.choose(p.active); } break;
                case 'Escape': e.preventDefault(); this.close(true); break;
                case 'Tab': this.close(); break;
                default:
                    // sem campo de busca: pula para a opção que começa com a letra
                    if (!fromSearch && k.length === 1 && !e.ctrlKey && !e.metaKey) {
                        for (var n = 1; n <= this.filtered.length; n++) {
                            var j = (p.active + n) % this.filtered.length;
                            if (norm(this.filtered[j].label).indexOf(norm(k)) === 0) { p.setActive(j); break; }
                        }
                    }
            }
            this.syncActive();
        }
    });

    /* =====================================================================
       COMBOBOX (select[data-combobox])
       ===================================================================== */
    function Combobox(select) {
        var self = this, $s = $(select);
        this.select = select;
        this.field = $s.closest('.field')[0] || null;
        this.panel = new Panel({});
        $(this.field).addClass('field--combobox');
        hideNative(select);
        var $i = $('<input type="text" class="field__input" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false">')
            .attr({ id: (select.id || C.uid('nova-combo')) + '-input', placeholder: $s.attr('data-placeholder') || 'Digite para buscar', 'aria-controls': this.panel.id })
            .insertAfter(select);
        this.input = $i[0];
        $(this.field).find('.field__label').first().attr('for', this.input.id);

        $s.on('focus', function () { $i.trigger('focus'); }).on('change', function () { self.syncText(); });
        $i.on('input', function () { self.show(this.value); self.panel.edge(false); self.syncActive(); })
            .on('keydown', function (e) { self.onKey(e); })
            .on('blur', function () { setTimeout(function () { self.commitText(); }, 0); })
            .on('click', function () { if (!self.isOpen()) self.show(''); });
        this.$anchor().on('mousedown', function (e) {
            if (e.target === self.input || $(e.target).closest('.field__clear').length) return;
            if (!self.isOpen()) setTimeout(function () { self.show(''); $i.trigger('focus'); }, 0);
        });
        this.panel.$list.on('click', '.select-option', function () { self.choose(+$(this).attr('data-index')); });
        select._novaSelect = this;
        this.refresh();
    }

    $.extend(Combobox.prototype, base, {
        close: base.closePanel,
        refresh: function () {
            this.items = readOptions(this.select);
            this.input.disabled = this.select.disabled;
            this.syncText();
        },
        selectedItem: function () {
            var v = this.select.value;
            return v === '' ? null : $.grep(this.items, function (i) { return i.value === v; })[0] || null;
        },
        syncText: function () {
            var it = this.selectedItem();
            this.input.value = it ? it.label : '';
            $(this.field).toggleClass('has-value', !!it);
        },
        show: function (query) {
            if (this.input.disabled) return;
            var it = this.selectedItem();
            this.filtered = filterItems(this.items, query);
            this.showPanel(this.filtered, { selected: it ? [it.value] : [], query: query, emptyText: 'Nenhuma opção corresponde a "' + query + '"' });
        },
        setValue: function (v) {
            this.select.value = v;
            C.fire(this.select, 'change');
        },
        choose: function (i) {
            var it = this.filtered && this.filtered[i];
            if (!it || it.disabled) return;
            this.setValue(it.value);
            this.syncText();
            this.close();
        },
        /* ao sair do campo: aceita o texto se for igual a uma opção; senão volta */
        commitText: function () {
            if (document.activeElement === this.input) return;
            this.close();
            var text = $.trim(norm(this.input.value)), cur = this.selectedItem();
            if (!text) { if (cur) this.setValue(''); }
            else if (!cur || norm(cur.label) !== text) {
                var match = $.grep(this.items, function (i) { return norm(i.label) === text && !i.disabled; })[0];
                if (match) this.setValue(match.value);
            }
            this.syncText();
        },
        onKey: function (e) {
            var open = this.isOpen(), p = this.panel;
            switch (e.key) {
                case 'ArrowDown': e.preventDefault(); if (!open) { this.show(''); p.edge(false); } else p.move(1); break;
                case 'ArrowUp': e.preventDefault(); if (open) p.move(-1); break;
                case 'Enter': if (open && p.active > -1) { e.preventDefault(); this.choose(p.active); } break;
                case 'Escape': if (open) { e.preventDefault(); this.close(); this.syncText(); } break;
                case 'Tab': if (open && p.active > -1 && this.input.value) this.choose(p.active); break;
            }
            this.syncActive();
        }
    });

    /* =====================================================================
       AUTOCOMPLETE (texto livre + sugestões, fonte síncrona ou assíncrona)
       ===================================================================== */
    function Autocomplete(input, opts) {
        var self = this;
        opts = opts || {};
        this.input = input;
        this.opts = opts;
        this.field = $(input).closest('.field')[0] || null;
        this.minChars = opts.minChars != null ? opts.minChars : 2;
        this.delay = opts.delay != null ? opts.delay : 250;
        this.panel = new Panel({});
        this.seq = 0;
        this.valueInput = C.get(opts.valueInput);
        $(this.field).addClass('field--combobox field--autocomplete');
        $(input).attr({ autocomplete: 'off', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': this.panel.id })
            .on('input', function () {
                if (self.valueInput) self.valueInput.value = '';
                clearTimeout(self.timer);
                var term = $.trim(input.value);
                if (term.length < self.minChars) return self.close();
                self.timer = setTimeout(function () { self.search(term); }, self.delay);
            })
            .on('keydown', function (e) { self.onKey(e); })
            .on('blur', function () { setTimeout(function () { if (document.activeElement !== input) self.close(); }, 0); });
        this.panel.$list.on('click', '.select-option', function () { self.choose(+$(this).attr('data-index')); });
        input._novaAutocomplete = this;
    }

    $.extend(Autocomplete.prototype, base, {
        close: base.closePanel,
        contains: function (node) {
            return node === this.input || base.contains.call(this, node);
        },
        search: function (term) {
            var self = this, seq = ++this.seq, src = this.opts.source;
            var done = function (items) {
                if (seq !== self.seq || document.activeElement !== self.input) return;
                $(self.field).removeClass('is-loading');
                items = $.map(items || [], function (it) { return typeof it === 'string' ? { value: it, label: it } : it; });
                if (self.opts.limit) items = items.slice(0, self.opts.limit);
                self.items = items;
                self.showPanel(items, { query: term, emptyText: self.opts.emptyText || 'Nenhum resultado para "' + term + '"' });
                self.panel.edge(false);
                self.syncActive();
            };
            if ($.isArray(src)) return done(filterItems($.map(src, function (s) { return typeof s === 'string' ? { value: s, label: s } : s; }), term));
            if (typeof src !== 'function') return;
            $(this.field).addClass('is-loading');
            this.showPanel([], { status: 'loading' });
            try {
                var r = src(term, done);
                if (r && typeof r.then === 'function') r.then(done, function () { done([]); });
            } catch (err) {
                done([]);
            }
        },
        choose: function (i) {
            var it = this.items && this.items[i];
            if (!it || it.disabled) return;
            this.input.value = it.label;
            if (this.valueInput) { this.valueInput.value = it.value; C.fire(this.valueInput, 'change'); }
            C.fire(this.input, 'change');
            this.close();
            if (this.opts.onSelect) this.opts.onSelect(it);
            C.emit(this.input, 'nova:autocomplete-select', { item: it });
        },
        onKey: function (e) {
            var p = this.panel;
            if (!this.isOpen()) {
                if (e.key === 'ArrowDown' && $.trim(this.input.value).length >= this.minChars) {
                    e.preventDefault();
                    this.search($.trim(this.input.value));
                }
                return;
            }
            switch (e.key) {
                case 'ArrowDown': e.preventDefault(); p.move(1); break;
                case 'ArrowUp': e.preventDefault(); p.move(-1); break;
                case 'Enter': if (p.active > -1) { e.preventDefault(); this.choose(p.active); } break;
                case 'Escape': e.preventDefault(); this.close(); break;
                case 'Tab': this.close(); break;
            }
            this.syncActive();
        }
    });

    /* =====================================================================
       LISTBOX
       ===================================================================== */
    function lbOptions($lb) {
        return $lb.find('[role="option"]').not('[aria-disabled="true"]');
    }

    function lbActive($lb, opt) {
        $lb.find('.listbox__option.is-active').removeClass('is-active');
        if (!opt) return;
        if (!opt.id) opt.id = C.uid('nova-lbo');
        $(opt).addClass('is-active');
        $lb.attr('aria-activedescendant', opt.id);
        if (opt.scrollIntoView) opt.scrollIntoView({ block: 'nearest' });
    }

    function lbChanged($lb) {
        var values = $lb.find('[role="option"][aria-selected="true"]').map(function () {
            return $(this).attr('data-value') || $.trim($(this).text());
        }).get();
        var $target = $($lb.attr('data-input') || []);
        if ($target.length) { $target.val(values.join(',')); C.fire($target, 'change'); }
        C.emit($lb, 'nova:listbox-change', { values: values });
    }

    function lbSelect($lb, opt, mode) {
        var $o = $(opt);
        if (!$o.length || $o.attr('aria-disabled') === 'true') return;
        if ($lb.attr('aria-multiselectable') === 'true') {
            $o.attr('aria-selected', String(mode === 'on' || $o.attr('aria-selected') !== 'true'));
        } else {
            $lb.find('[role="option"]').attr('aria-selected', 'false');
            $o.attr('aria-selected', 'true');
        }
        lbChanged($lb);
    }

    $(document)
        .on('click', '.listbox [role="option"]', function () {
            var $lb = $(this).closest('.listbox');
            lbSelect($lb, this);
            lbActive($lb, this);
            $lb.trigger('focus');
        })
        .on('focusin', '.listbox', function (e) {
            var $lb = $(this);
            if (e.target === this && !$lb.find('.listbox__option.is-active').length) {
                lbActive($lb, $lb.find('[role="option"][aria-selected="true"]')[0] || lbOptions($lb)[0]);
            }
        })
        .on('keydown', '.listbox', function (e) {
            if (e.target !== this) return;
            var $lb = $(this), $opts = lbOptions($lb), opts = $opts.get();
            var cur = $lb.find('.listbox__option.is-active')[0], i = opts.indexOf(cur);
            var multi = $lb.attr('aria-multiselectable') === 'true', next = null;
            if (e.key === 'ArrowDown') next = opts[Math.min(opts.length - 1, i + 1)];
            else if (e.key === 'ArrowUp') next = opts[Math.max(0, i - 1)];
            else if (e.key === 'Home') next = opts[0];
            else if (e.key === 'End') next = opts[opts.length - 1];
            if (next) {
                e.preventDefault();
                lbActive($lb, next);
                if (!multi) lbSelect($lb, next);
                else if (e.shiftKey) lbSelect($lb, next, 'on');
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                lbSelect($lb, cur);
            } else if (multi && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                var allOn = $opts.filter('[aria-selected="true"]').length === opts.length;
                $opts.attr('aria-selected', String(!allOn));
                lbChanged($lb);
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                for (var k = 1; k <= opts.length; k++) {
                    var o = opts[(i + k) % opts.length];
                    if (norm($.trim($(o).text())).indexOf(norm(e.key)) === 0) {
                        lbActive($lb, o);
                        if (!multi) lbSelect($lb, o);
                        break;
                    }
                }
            }
        });

    function lbInit(lb) {
        if (lb._novaListbox) return;
        lb._novaListbox = true;
        if (!lb.hasAttribute('tabindex')) lb.tabIndex = 0;
        $(lb).find('[role="option"]').not('[aria-selected]').attr('aria-selected', 'false');
    }

    /* =====================================================================
       TAGS (campo de tags)
       O input original vira oculto e guarda os valores separados.
       ===================================================================== */
    var TAG_VALIDATORS = {
        email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
        number: function (v) { return /^-?\d+([.,]\d+)?$/.test(v); },
        matricula: function (v) { return /^\d{6}$/.test(v); }
    };

    function TagInput(src) {
        var self = this, $src = $(src);
        this.src = src;
        this.field = $src.closest('.field')[0] || null;
        this.sep = $src.attr('data-separator') || ',';
        this.max = parseInt($src.attr('data-max'), 10) || 0;
        this.rule = $src.attr('data-validate');
        this.lower = src.hasAttribute('data-lowercase');
        this.values = [];
        $(this.field).addClass('field--tags');

        var id = (src.id || C.uid('nova-tags')) + '-editor';
        var $ed = $('<input type="text" class="tag-input__field" autocomplete="off" spellcheck="false">')
            .attr({ id: id, placeholder: $src.attr('placeholder') || 'Digite e pressione Enter', 'aria-describedby': id + '-hint', inputmode: $src.attr('inputmode') })
            .prop('disabled', src.disabled);
        this.$wrap = $('<div class="tag-input">').append($ed, $('<span class="sr-only">').attr('id', id + '-hint')
            .text('Enter ou vírgula adiciona. Backspace no campo vazio remove a última.')).insertAfter(src);
        src.type = 'hidden';
        this.editor = $ed[0];
        this.input = this.editor;
        $(this.field).find('.field__label').first().attr('for', id);

        // sugestões de um <datalist>
        if ($src.attr('data-suggest') && $($src.attr('data-suggest')).length) {
            this.suggestions = datalistItems($src.attr('data-suggest'));
            this.panel = new Panel({});
            $ed.attr({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': this.panel.id });
            this.panel.$list.on('click', '.select-option', function () {
                self.add(self.filtered[+$(this).attr('data-index')].value);
                self.close();
                $ed.trigger('focus');
            });
        }

        $.each(String(src.value || '').split(this.sep), function (i, v) { self.add(v, true); });
        this.render();

        $ed.on('keydown', function (e) { self.onKey(e); })
            .on('input', function () {
                if (this.value.indexOf(self.sep) > -1) {
                    var parts = this.value.split(self.sep);
                    this.value = parts.pop();
                    $.each(parts, function (i, p) { self.add(p); });
                }
                self.clearSelected();
                self.suggest();
            })
            .on('paste', function (e) {
                var text = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
                if (!/[,;\n\t]/.test(text) && text.indexOf(self.sep) < 0) return;
                e.preventDefault();
                $.each(text.split(/[,;\n\t]+/), function (i, p) { self.add(p); });
            })
            .on('blur', function () {
                setTimeout(function () {
                    if (document.activeElement === self.editor || (self.panel && $.contains(self.panel.el, document.activeElement))) return;
                    self.close();
                    if ($.trim(self.editor.value)) { self.add(self.editor.value); self.editor.value = ''; }
                    self.clearSelected();
                }, 120);
            });
        this.$wrap.on('click', function (e) {
            var $rm = $(e.target).closest('.tag__remove');
            if ($rm.length) { self.remove(+$rm.attr('data-index')); $ed.trigger('focus'); }
            else if (e.target === this) $ed.trigger('focus');
        });
        this.$anchor().on('click', function (e) {
            if (!$(e.target).closest('.tag, button, a, input').length) $ed.trigger('focus');
        });
        src._novaTags = this;
    }

    $.extend(TagInput.prototype, base, {
        isOpen: function () { return !!this.panel && this.panel.isOpen(); },
        close: function () { if (this.panel) this.closePanel(); },
        contains: function (node) {
            return !!node && ((this.panel && $.contains(this.panel.el, node)) || $.contains(this.field || this.$wrap[0], node));
        },
        suggest: function () {
            if (!this.panel) return;
            var q = $.trim(this.editor.value), have = $.map(this.values, norm);
            var items = $.grep(this.suggestions, function (s) { return have.indexOf(norm(s.value)) < 0; });
            this.filtered = filterItems(items, q).slice(0, 8);
            if (!q || !this.filtered.length) return this.close();
            this.showPanel(this.filtered, { query: q });
        },
        isValid: function (v) {
            var fn = TAG_VALIDATORS[this.rule];
            return !fn || fn(v);
        },
        add: function (raw, silent) {
            var v = $.trim(raw);
            if (!v) return false;
            if (this.lower) v = v.toLowerCase();
            var i = $.map(this.values, norm).indexOf(norm(v));
            if (i > -1) {
                var $dup = this.$wrap.find('.tag').eq(i).removeClass('is-flash');
                if ($dup.length) { void $dup[0].offsetWidth; $dup.addClass('is-flash'); }
                return false;
            }
            if (this.max && this.values.length >= this.max) return false;
            this.values.push(v);
            if (!silent) { this.render(); this.sync(); }
            return true;
        },
        remove: function (i) {
            if (i < 0 || i >= this.values.length) return;
            this.values.splice(i, 1);
            this.render();
            this.sync();
        },
        set: function (vals) {
            var self = this;
            this.values = [];
            $.each(vals || [], function (i, v) { self.add(v, true); });
            this.render();
            this.sync();
        },
        clearSelected: function () { this.$wrap.find('.tag.is-selected').removeClass('is-selected'); },
        render: function () {
            var self = this;
            this.$wrap.find('.tag').remove();
            $.each(this.values, function (i, v) {
                var ok = self.isValid(v);
                $('<span class="tag">').toggleClass('is-invalid', !ok).attr('title', ok ? null : 'Valor inválido')
                    .append($('<span class="tag__label">').text(v),
                        $('<button type="button" class="tag__remove" tabindex="-1">').attr({ 'data-index': i, 'aria-label': 'Remover ' + v }).html(ICON_X))
                    .insertBefore(self.editor);
            });
            $(this.field).toggleClass('is-full', !!(this.max && this.values.length >= this.max)).toggleClass('has-value', this.values.length > 0);
            this.editor.placeholder = this.values.length ? '' : ($(this.src).attr('placeholder') || 'Digite e pressione Enter');
        },
        sync: function () {
            var self = this;
            this.src.value = this.values.join(this.sep);
            C.fire(this.src, 'change');
            C.emit(this.src, 'nova:tags-change', { values: this.values.slice(), invalid: $.grep(this.values, function (v) { return !self.isValid(v); }) });
            if (this.max) $(this.field).find('.field__counter').html('<span class="field__counter-current">' + this.values.length + '</span> / ' + this.max);
        },
        onKey: function (e) {
            var ed = this.editor, open = this.isOpen(), k = e.key;
            if (open && (k === 'ArrowDown' || k === 'ArrowUp')) {
                e.preventDefault();
                this.panel.move(k === 'ArrowDown' ? 1 : -1);
                return this.syncActive();
            }
            if (k === 'Escape' && open) { e.preventDefault(); return this.close(); }
            if (k === 'Enter' || (k === 'Tab' && $.trim(ed.value)) || k === this.sep) {
                if (open && this.panel.active > -1 && k !== this.sep) {
                    e.preventDefault();
                    this.add(this.filtered[this.panel.active].value);
                    ed.value = '';
                    return this.close();
                }
                if ($.trim(ed.value)) {
                    e.preventDefault();
                    if (this.add(ed.value) || (this.max && this.values.length >= this.max)) ed.value = '';
                    this.close();
                } else if (k === 'Enter') e.preventDefault();
                return;
            }
            if (k === 'Backspace' && !ed.value && this.values.length) {
                var $last = this.$wrap.find('.tag').last();
                if ($last.hasClass('is-selected')) this.remove(this.values.length - 1);
                else $last.addClass('is-selected');
                e.preventDefault();
            }
        }
    });

    /* =====================================================================
       INICIALIZAÇÃO E API
       ===================================================================== */
    function refresh(el) {
        el = C.get(el);
        if (el && el._novaSelect) return el._novaSelect.refresh();
        var $root = $(el || document);
        $root.find('select[data-enhance]').each(function () { if (this._novaSelect) this._novaSelect.refresh(); else new EnhancedSelect(this); });
        $root.find('select[data-combobox]').each(function () { if (this._novaSelect) this._novaSelect.refresh(); else new Combobox(this); });
        $root.find('input[data-autocomplete][data-source]').each(function () {
            if (!this._novaAutocomplete) new Autocomplete(this, { source: datalistItems($(this).attr('data-source')), minChars: parseInt($(this).attr('data-min-chars'), 10) || 1 });
        });
        $root.find('.listbox').each(function () { lbInit(this); });
        $root.find('input[data-tags]').each(function () { if (!this._novaTags) new TagInput(this); });
        $root.find('[data-check-all]').each(function () { syncCheckAll($(this).attr('data-check-all')); });
    }

    function setValue(select, value) {
        select = C.get(select);
        if (!select) return;
        var vals = $.map($.isArray(value) ? value : [value], String);
        $(select).find('option').each(function () { this.selected = vals.indexOf(this.value) > -1; });
        C.fire(select, 'change');
        if (select._novaSelect) select._novaSelect.refresh();
    }

    function autocomplete(input, opts) {
        input = C.get(input);
        if (!input) return null;
        if (input._novaAutocomplete) {
            input._novaAutocomplete.opts = opts || {};
            return input._novaAutocomplete;
        }
        return new Autocomplete(input, opts);
    }

    function tags(el) {
        el = C.get(el);
        return el && el._novaTags;
    }

    $(function () { refresh(); });

    NOVAUI._onRefresh(function (root) { refresh(root); });

    NOVAUI.select = { refresh: refresh, setValue: setValue, autocomplete: autocomplete, close: closeOpen };
    NOVAUI.tags = {
        get: function (el) { var t = tags(el); return t ? t.values.slice() : []; },
        set: function (el, vals) { var t = tags(el); if (t) t.set(vals); },
        add: function (el, v) { var t = tags(el); if (t) t.add(v); },
        remove: function (el, v) { var t = tags(el); if (t) t.remove(t.values.indexOf(v)); },
        validators: TAG_VALIDATORS
    };
})(window.jQuery, window, document);
