/* =========================================================================
   NOVA UI — EXPERIÊNCIA (comportamento) · requer jQuery e core.js
   Inicializa sozinho; para conteúdo novo chame NOVAUI.refresh(root).
   Fechar       [data-dismiss] fecha o .alert/.banner mais próximo;
                data-dismiss-key="x" lembra a escolha no navegador
   Copiar       [data-copy="#id"] copia o texto do elemento
   Tooltip      [data-tip="texto"] (hover, foco e toque); .help-tip é o "?"
   Confirmação  NOVAUI.dialog.confirm({ type, title, message, consequences,
                  confirmText, cancelText, requireText }) → Promise<boolean>
                NOVAUI.dialog.alert({ type, title, message, confirmText }) → Promise
                type: 'danger' | 'warning' | 'primary' | 'success'
   Tour         NOVAUI.tour({ steps: [{ target, title, text, placement }], key,
                  doneText, onFinish })
                NOVAUI.tour.end() · NOVAUI.tour.hasSeen(key) · NOVAUI.tour.reset(key)
   Coachmark    <button class="coachmark" data-coachmark="chave" data-title data-text data-placement>
   Ajuda        NOVAUI.help.open(id, artigo?) · NOVAUI.help.close()
                [data-help-open="id" data-help-article="artigo?"],
                [data-help-close], [data-help-back], [data-help-search]
   FAQ          .faq com [data-faq-search], [data-faq-filter="categoria"],
                .faq__item[data-category], [data-faq-feedback="sim|nao"]
   Onboarding   NOVAUI.onboarding.complete(el, idDoPasso) · .reset(el) · [data-onboarding-done]
                .welcome com [data-welcome-next] / [data-welcome-prev]
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc, norm = C.norm;
    var ICON = {
        x: '<span class="icon" aria-hidden="true">close</span>',
        alert: '<span class="icon" aria-hidden="true">warning</span>',
        trash: '<span class="icon" aria-hidden="true">delete</span>',
        info: '<span class="icon" aria-hidden="true">info</span>',
        check: '<span class="icon" aria-hidden="true">check</span>'
    };

    function store(key, value) { return C.store('nova-ux:' + key, value); }

    function focusable(root) {
        return $(root).find('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary')
            .filter(function () { return this.offsetParent !== null || this === document.activeElement; }).get();
    }

    // mantém o Tab dentro de um painel
    function trapTab(e, root) {
        var f = focusable(root), i = f.indexOf(document.activeElement);
        if (!f.length) return;
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
    }

    /* =====================================================================
       FECHAR AVISOS E COPIAR
       ===================================================================== */
    $(document)
        .on('click', '[data-dismiss]', function () {
            var $box = $(this).closest('.alert, .banner, [data-dismissible]');
            if (!$box.length) return;
            var key = $(this).attr('data-dismiss-key') || $box.attr('data-dismiss-key');
            $box.prop('hidden', true);
            if (key) store('dismiss:' + key, '1');
            C.emit($box, 'nova:dismiss', { key: key });
        })
        .on('click', '[data-copy]', function () {
            var $c = $(this), $src = $(C.get($c.attr('data-copy')));
            var text = $src.length ? $.trim($src.val() || $src.text()) : $c.attr('data-copy');
            var done = function () {
                var $label = $c.find('span').last().length ? $c.find('span').last() : $c, old = $label.text();
                $label.text('Copiado');
                $c.attr('aria-live', 'polite');
                setTimeout(function () { $label.text(old); }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(done, done);
            var $ta = $('<textarea>').val(text).appendTo(document.body).trigger('select');
            try { document.execCommand('copy'); } catch (x) { /* sem suporte */ }
            $ta.remove();
            done();
        });

    function restoreDismissed(root) {
        $(root).find('[data-dismiss-key]').each(function () {
            if (store('dismiss:' + $(this).attr('data-dismiss-key')) === '1') {
                $(this).closest('.alert, .banner, [data-dismissible]').prop('hidden', true);
            }
        });
    }

    /* =====================================================================
       POSICIONAMENTO (tooltip, popover)
       ===================================================================== */
    function place(el, rect, pref, gap) {
        gap = gap == null ? 8 : gap;
        var $el = $(el).css({ left: 0, top: 0 }), m = 8, w = el.offsetWidth, h = el.offsetHeight;
        var vw = document.documentElement.clientWidth, vh = window.innerHeight;
        var space = { top: rect.top, bottom: vh - rect.bottom, left: rect.left, right: vw - rect.right };
        var need = { top: h + gap, bottom: h + gap, left: w + gap, right: w + gap };
        var side = $.grep([pref || 'bottom', 'bottom', 'top', 'right', 'left'], function (s) { return space[s] >= need[s] + m; })[0] ||
            (space.bottom > space.top ? 'bottom' : 'top');
        var vertical = side === 'top' || side === 'bottom';
        var x = vertical ? rect.left + rect.width / 2 - w / 2 : side === 'left' ? rect.left - w - gap : rect.right + gap;
        var y = vertical ? (side === 'top' ? rect.top - h - gap : rect.bottom + gap) : rect.top + rect.height / 2 - h / 2;
        x = Math.max(m, Math.min(x, vw - w - m));
        y = Math.max(m, Math.min(y, vh - h - m));
        $el.css({ left: Math.round(x), top: Math.round(y) }).attr('data-placement', side);
        var $arrow = $el.find('.popover__arrow');
        if (vertical) {
            var ax = Math.max(14, Math.min(w - 14, rect.left + rect.width / 2 - x));
            el.style.setProperty('--arrow-x', ax + 'px');
            $arrow.css({ left: ax - 6, top: '' });
        } else {
            $arrow.css({ top: Math.max(14, Math.min(h - 14, rect.top + rect.height / 2 - y)) - 6, left: '' });
        }
        return side;
    }

    function makePopover(cls) {
        return $('<div class="popover" role="dialog" hidden>').addClass(cls || '').appendTo(document.body)[0];
    }

    /* =====================================================================
       TOOLTIP / HELP TOOLTIP
       ===================================================================== */
    var $tip = null, tipOwner = null, tipTimer = null;

    function showTip(el, immediate) {
        clearTimeout(tipTimer);
        var run = function () {
            var text = $(el).attr('data-tip');
            if (!text) return;
            if (!$tip) $tip = $('<div class="tooltip" id="nova-tooltip" role="tooltip">');
            // dentro de um modal, o tooltip precisa estar no modal (camada do topo)
            $tip.appendTo($(el).closest('dialog[open]')[0] || document.body).text(text).prop('hidden', false);
            tipOwner = el;
            $(el).attr('aria-describedby', 'nova-tooltip');
            if ($(el).hasClass('help-tip')) $(el).attr('aria-expanded', 'true');
            place($tip[0], el.getBoundingClientRect(), $(el).attr('data-tip-placement') || 'top', 8);
        };
        if (immediate) run(); else tipTimer = setTimeout(run, 250);
    }

    function hideTip() {
        clearTimeout(tipTimer);
        if ($tip) $tip.prop('hidden', true);
        if (tipOwner) {
            $(tipOwner).removeAttr('aria-describedby');
            if ($(tipOwner).hasClass('help-tip')) $(tipOwner).attr('aria-expanded', 'false');
        }
        tipOwner = null;
    }

    $(document)
        .on('mouseover', '[data-tip]', function () { if (this !== tipOwner) showTip(this, $(this).hasClass('help-tip')); })
        .on('mouseout', '[data-tip]', function (e) { if (!e.relatedTarget || !$.contains(this, e.relatedTarget)) hideTip(); })
        .on('focusin', function (e) {
            var el = $(e.target).closest('[data-tip]')[0];
            if (el) showTip(el, true); else if (tipOwner) hideTip();
        })
        .on('focusout', '[data-tip]', hideTip)
        .on('click', function (e) {
            var el = $(e.target).closest('.help-tip[data-tip]')[0];
            if (el) { e.preventDefault(); showTip(el, true); }
            else if (tipOwner && $(tipOwner).hasClass('help-tip')) hideTip();
        })
        .on('keydown', function (e) { if (e.key === 'Escape' && tipOwner) hideTip(); });
    document.addEventListener('scroll', function () { if (tipOwner) hideTip(); }, true);

    /* =====================================================================
       DIALOG E CONFIRMATION
       Abrir/fechar fica com overlays.js (NovaModal) quando ele está na página.
       ===================================================================== */
    var NovaDialog = (function () {
        function open(id) {
            if (NOVAUI.modal) return NOVAUI.modal.open(id);
            var d = C.get(id);
            if (!d) return null;
            if (typeof d.showModal !== 'function') return $(d).attr('open', '')[0];
            if (!d.open) d.showModal();
            d.returnValue = '';
            var $af = $(d).find('[autofocus]');
            if (!$af.length) setTimeout(function () { $(d).find('.dialog__footer .btn--primary, .dialog__footer .btn--danger, .dialog__footer .btn').first().trigger('focus'); }, 0);
            C.emit(d, 'nova:dialog-open', {});
            return d;
        }

        function close(id, value) {
            if (NOVAUI.modal) return NOVAUI.modal.close(id, value, true);
            var d = C.get(id);
            if (!d) return;
            if (typeof d.close === 'function' && d.open) d.close(value || '');
            else $(d).removeAttr('open');
        }

        // sem overlays.js: abrir/fechar por atributo e pelo fundo
        $(document).on('click', function (e) {
            if (NOVAUI.modal) return;
            var $t = $(e.target), o = $t.closest('[data-dialog-open]')[0], c = $t.closest('[data-dialog-close]')[0];
            if (o) { e.preventDefault(); return open($(o).attr('data-dialog-open')); }
            if (c) return close($(c).closest('dialog')[0], $(c).attr('data-dialog-close') || c.value || '');
            var t = e.target;
            if (t.tagName === 'DIALOG' && $(t).hasClass('dialog') && !t.hasAttribute('data-static')) {
                var r = t.getBoundingClientRect();
                if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(t, 'cancel');
            }
        });
        document.addEventListener('cancel', function (e) {
            if (e.target.hasAttribute && e.target.hasAttribute('data-static')) e.preventDefault();
        }, true);

        var VARIANTS = {
            danger: { tile: 'danger', icon: ICON.trash, btn: 'btn--danger' },
            warning: { tile: 'warning', icon: ICON.alert, btn: 'btn--primary' },
            primary: { tile: '', icon: ICON.info, btn: 'btn--primary' },
            success: { tile: 'success', icon: ICON.check, btn: 'btn--success' }
        };

        function build(opts, isAlert) {
            var v = VARIANTS[opts.variant] || VARIANTS.primary, id = C.uid('dlg');
            var cons = $.map(opts.consequences || [], function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
            var $d = $('<dialog class="dialog dialog--sm">').attr({
                'aria-labelledby': id + '-t',
                'aria-describedby': id + '-d',
                role: opts.variant === 'danger' || opts.variant === 'warning' ? 'alertdialog' : null
            }).html(
                '<div class="dialog__header dialog__header--icon"><span class="icon-tile dialog__icon' + (v.tile ? ' icon-tile--' + v.tile : '') + '">' + (opts.icon || v.icon) + '</span>' +
                '<div class="dialog__heading"><h2 class="dialog__title" id="' + id + '-t">' + esc(opts.title || 'Confirmar') + '</h2></div></div>' +
                '<div class="dialog__body" id="' + id + '-d"><p>' + esc(opts.message || '') + '</p>' +
                (cons ? '<ul class="consequences' + (opts.variant === 'danger' ? ' consequences--danger' : '') + '">' + cons + '</ul>' : '') +
                (opts.requireText ? '<div class="confirm-input"><label for="' + id + '-i">Para confirmar, digite <code>' + esc(opts.requireText) + '</code></label>' +
                    '<input id="' + id + '-i" type="text" autocomplete="off" spellcheck="false" autofocus></div>' : '') +
                '</div><div class="dialog__footer">' +
                (isAlert ? '' : '<button type="button" class="btn btn--secondary" data-dialog-close="cancel">' + esc(opts.cancelText || 'Cancelar') + '</button>') +
                '<button type="button" class="btn ' + v.btn + '" data-dialog-close="confirm"' + (opts.requireText ? ' disabled' : '') + '>' +
                esc(opts.confirmText || (isAlert ? 'Entendi' : 'Confirmar')) + '</button></div>'
            ).appendTo(document.body);
            if (opts.requireText) {
                $d.find('.confirm-input input').on('input', function () {
                    $d.find('[data-dialog-close="confirm"]').prop('disabled', $.trim(this.value) !== opts.requireText);
                });
            } else if (!isAlert && opts.variant === 'danger') {
                $d.find('[data-dialog-close="cancel"]').attr('autofocus', ''); // ação destrutiva: o foco começa em "Cancelar"
            }
            return $d[0];
        }

        // type: 'danger' | 'warning' | 'primary' | 'success'
        function withType(o) {
            o = $.extend({}, o);
            o.variant = o.type || o.variant;
            return o;
        }

        function ask(opts, isAlert) {
            opts = opts || {};
            return new Promise(function (resolve) {
                var d = build(opts, isAlert), trigger = document.activeElement;
                $(d).on('close', function () {
                    setTimeout(function () { $(d).remove(); }, 250);
                    if (trigger && trigger.focus) trigger.focus();
                    resolve(isAlert ? true : d.returnValue === 'confirm');
                });
                open(d);
                setTimeout(function () { $(d).find('[autofocus]').first().trigger('focus'); }, 0);
            });
        }

        return {
            open: open,
            close: close,
            confirm: function (opts) { return ask(withType(opts), false); },
            alert: function (opts) { return ask(withType(opts), true); }
        };
    })();

    /* =====================================================================
       TOUR
       ===================================================================== */
    var NovaTour = (function () {
        var state = null;

        function end(completed) {
            if (!state) return;
            var s = state;
            state = null;
            $([s.pop, s.spot, s.block]).remove();
            window.removeEventListener('resize', s.onMove);
            window.removeEventListener('scroll', s.onMove, true);
            document.removeEventListener('keydown', s.onKey, true);
            if (s.opts.key && completed !== null) store('tour:' + s.opts.key, completed ? 'done' : 'skipped');
            if (s.prevFocus && s.prevFocus.focus) s.prevFocus.focus();
            if (s.opts.onFinish) s.opts.onFinish(!!completed);
            C.emit(document, 'nova:tour-end', { key: s.opts.key, completed: !!completed });
        }

        function position() {
            if (!state) return;
            var step = state.steps[state.i], target = C.get(step.target), pad = step.padding != null ? step.padding : 6;
            var $spot = $(state.spot).prop('hidden', false);
            if (target) {
                var r = target.getBoundingClientRect();
                $spot.css({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });
                place(state.pop, { top: r.top - pad, bottom: r.bottom + pad, left: r.left - pad, right: r.right + pad, width: r.width + pad * 2, height: r.height + pad * 2 }, step.placement || 'bottom', 12);
            } else { // passo sem alvo: centralizado
                $spot.css({ width: 0, height: 0, top: '50%', left: '50%' });
                $(state.pop).css({
                    left: Math.round((document.documentElement.clientWidth - state.pop.offsetWidth) / 2),
                    top: Math.round((window.innerHeight - state.pop.offsetHeight) / 2)
                }).removeAttr('data-placement');
            }
        }

        function show(i) {
            if (!state) return;
            state.i = Math.max(0, Math.min(i, state.steps.length - 1));
            var step = state.steps[state.i], n = state.steps.length, last = state.i === n - 1, target = C.get(step.target), dots = '';
            for (var k = 0; k < n; k++) dots += '<span' + (k === state.i ? ' class="is-active"' : '') + '></span>';
            $(state.pop).html(
                (target ? '<span class="popover__arrow" aria-hidden="true"></span>' : '') +
                '<div class="popover__header"><h3 class="popover__title" id="nova-tour-title">' + esc(step.title || '') + '</h3>' +
                '<button type="button" class="btn btn--tertiary btn--sm btn--icon popover__close" data-tour="skip" aria-label="Encerrar tour">' + ICON.x + '</button></div>' +
                '<div class="popover__body" id="nova-tour-text">' + esc(step.text || '') + '</div>' +
                '<div class="popover__footer"><span class="popover__dots" aria-hidden="true">' + dots + '</span><span class="sr-only">Passo ' + (state.i + 1) + ' de ' + n + '</span>' +
                (state.i > 0 ? '<button type="button" class="btn btn--ghost btn--sm" data-tour="prev">Voltar</button>' : '') +
                '<button type="button" class="btn btn--primary btn--sm" data-tour="' + (last ? 'done' : 'next') + '">' + (last ? (state.opts.doneText || 'Concluir') : 'Próximo') + '</button></div>'
            ).attr({ 'aria-labelledby': 'nova-tour-title', 'aria-describedby': 'nova-tour-text' }).prop('hidden', false);
            if (target && target.scrollIntoView) {
                var r = target.getBoundingClientRect();
                if (r.top < 60 || r.bottom > window.innerHeight - 60) {
                    target.scrollIntoView({ block: 'center', behavior: C.reducedMotion() ? 'auto' : 'smooth' });
                    setTimeout(position, C.reducedMotion() ? 0 : 350);
                }
            }
            position();
            C.focus($(state.pop).find('[data-tour="next"], [data-tour="done"]'));
            if (step.onShow) step.onShow(target);
        }

        function start(steps, opts) {
            if (state) end(null);
            steps = $.grep(steps || [], function (s) { return !s.target || C.get(s.target); });
            if (!steps.length) return;
            var block = $('<div class="tour-blocker">').appendTo(document.body)[0];
            var spot = $('<div class="tour-spotlight" hidden>').appendTo(document.body)[0];
            var pop = makePopover('popover--tour');
            $(pop).attr('aria-modal', 'true').on('click', '[data-tour]', function () {
                var a = $(this).attr('data-tour');
                if (a === 'next') show(state.i + 1);
                else if (a === 'prev') show(state.i - 1);
                else end(a === 'done');
            });
            state = { steps: steps, i: 0, opts: opts || {}, pop: pop, spot: spot, block: block, prevFocus: document.activeElement };
            state.onMove = function () { window.requestAnimationFrame(position); };
            state.onKey = function (e) {
                if (!state) return;
                var inside = $.contains(state.pop, document.activeElement);
                if (e.key === 'Escape') { e.preventDefault(); end(false); }
                else if (e.key === 'ArrowRight' && inside) { e.preventDefault(); if (state.i < state.steps.length - 1) show(state.i + 1); }
                else if (e.key === 'ArrowLeft' && inside) { e.preventDefault(); show(state.i - 1); }
                else if (e.key === 'Tab') trapTab(e, state.pop);
            };
            window.addEventListener('resize', state.onMove);
            window.addEventListener('scroll', state.onMove, true);
            document.addEventListener('keydown', state.onKey, true);
            C.emit(document, 'nova:tour-start', { key: state.opts.key });
            show(0);
        }

        return {
            start: start,
            end: function () { end(false); },
            hasSeen: function (key) { return !!store('tour:' + key); },
            reset: function (key) { store('tour:' + key, null); }
        };
    })();

    /* =====================================================================
       COACHMARK
       ===================================================================== */
    var coach = { pop: null, owner: null };

    function closeCoach(dismiss) {
        if (!coach.pop || coach.pop.hidden) return;
        coach.pop.hidden = true;
        var owner = coach.owner;
        coach.owner = null;
        if (!owner) return;
        $(owner).attr('aria-expanded', 'false');
        if (!dismiss) return owner.focus();
        var key = $(owner).prop('hidden', true).attr('data-coachmark');
        if (key) store('coach:' + key, '1');
        C.emit(owner, 'nova:coachmark-dismiss', { key: key });
        $(owner).parent().find('button, a, input').not(owner).first().trigger('focus');
    }

    function openCoach(btn) {
        if (!coach.pop) {
            coach.pop = makePopover('popover--brand');
            coach.pop.style.setProperty('--popover-width', '280px');
            $(coach.pop)
                .on('click', '[data-coach]', function () { closeCoach($(this).attr('data-coach') === 'ok'); })
                .on('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeCoach(false); } });
        }
        coach.owner = btn;
        var $b = $(btn).attr('aria-expanded', 'true');
        $(coach.pop).html('<span class="popover__arrow" aria-hidden="true"></span>' +
            '<div class="popover__header"><span class="badge badge--sm" style="--badge-bg:rgba(19,178,172,.2);--badge-fg:#5fd4ce;--badge-border:transparent">Novidade</span></div>' +
            '<div class="popover__header" style="padding-top:8px"><h3 class="popover__title">' + esc($b.attr('data-title') || '') + '</h3></div>' +
            '<div class="popover__body">' + esc($b.attr('data-text') || '') + '</div>' +
            '<div class="popover__footer"><button type="button" class="btn btn--ghost btn--sm" data-coach="later" style="margin-right:auto">Depois</button>' +
            '<button type="button" class="btn btn--primary btn--sm" data-coach="ok">Entendi</button></div>').prop('hidden', false);
        place(coach.pop, btn.getBoundingClientRect(), $b.attr('data-placement') || 'bottom', 10);
        C.focus($(coach.pop).find('[data-coach="ok"]'));
    }

    $(document).on('click', function (e) {
        var b = $(e.target).closest('.coachmark[data-coachmark]')[0];
        if (b) {
            e.preventDefault();
            return coach.owner === b ? closeCoach(false) : openCoach(b);
        }
        if (coach.pop && !coach.pop.hidden && !$.contains(coach.pop, e.target)) closeCoach(false);
    });
    $(window).on('resize', function () { closeCoach(false); });

    function initCoachmarks(root) {
        $(root).find('.coachmark[data-coachmark]').each(function () {
            var $b = $(this).attr({ 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
            if (store('coach:' + $b.attr('data-coachmark')) === '1') $b.prop('hidden', true);
            if (!$b.attr('aria-label')) $b.attr('aria-label', 'Novidade: ' + ($b.attr('data-title') || ''));
        });
    }

    /* =====================================================================
       HELP PANEL
       ===================================================================== */
    var help = { $panel: null, $backdrop: null, trigger: null };

    function helpView($panel, articleId) {
        $panel.find('.help-panel__article[id]').each(function () { this.hidden = this.id !== articleId; });
        $panel.find('.help-panel__home, .help-panel__search').prop('hidden', !!articleId);
        $panel.find('[data-help-back]').prop('hidden', !articleId);
        $panel.find('.help-panel__body').scrollTop(0);
        if (articleId) $('#' + articleId).find('h4').first().attr('tabindex', -1).trigger('focus');
    }

    function closeHelp(silent) {
        if (!help.$panel) return;
        help.$panel.removeClass('is-open');
        if (help.$backdrop) help.$backdrop.removeClass('is-visible');
        $(help.trigger).attr('aria-expanded', 'false');
        if (!silent && help.trigger && help.trigger.focus) help.trigger.focus();
        help.$panel = null;
    }

    function openHelp(id, articleId, trigger) {
        var $panel = $(C.get(id));
        if (!$panel.length) return;
        closeHelp(true);
        if (!help.$backdrop) help.$backdrop = $('<div class="help-panel-backdrop">').on('click', function () { closeHelp(); }).appendTo(document.body);
        help.$panel = $panel.attr({ role: 'dialog', 'aria-modal': 'true' }).addClass('is-open');
        help.trigger = trigger || document.activeElement;
        help.$backdrop.toggleClass('is-visible', !$panel.is('[data-no-backdrop]'));
        helpView($panel, articleId || null);
        if (!articleId) {
            var f = $panel.find('[data-help-search]')[0] || focusable($panel)[0];
            if (f) setTimeout(function () { f.focus(); }, 60);
        }
        $(trigger).attr('aria-expanded', 'true');
        C.emit($panel, 'nova:help-open', { article: articleId });
    }

    $(document)
        .on('click', '[data-help-open]', function (e) {
            e.preventDefault();
            openHelp($(this).attr('data-help-open'), $(this).attr('data-help-article'), this);
        })
        .on('click', '[data-help-close]', function () { closeHelp(); })
        .on('click', '[data-help-back]', function () { if (help.$panel) helpView(help.$panel, null); })
        .on('click', '.help-panel [data-help-article]:not([data-help-open])', function (e) {
            if (!help.$panel || !$.contains(help.$panel[0], this)) return;
            e.preventDefault();
            helpView(help.$panel, $(this).attr('data-help-article'));
        })
        .on('keydown', function (e) {
            if (!help.$panel) return;
            if (e.key === 'Escape') { e.preventDefault(); closeHelp(); }
            else if (e.key === 'Tab' && !help.$panel.is('[data-no-backdrop]')) trapTab(e, help.$panel);
        })
        .on('input', '[data-help-search]', function () {
            var $panel = $(this).closest('.help-panel'), q = $.trim(norm(this.value)), shown = 0;
            $panel.find('[data-help-keywords]').each(function () {
                var ok = !q || norm($(this).text() + ' ' + $(this).attr('data-help-keywords')).indexOf(q) > -1;
                this.hidden = !ok;
                shown += ok;
            });
            $panel.find('[data-help-empty]').prop('hidden', shown > 0);
        });

    /* =====================================================================
       FAQ
       ===================================================================== */
    function faqFilter(faq) {
        var $faq = $(faq), $input = $faq.find('[data-faq-search]'), q = $.trim(norm($input.val() || ''));
        var cat = $faq.find('[data-faq-filter][aria-pressed="true"]').attr('data-faq-filter') || '', shown = 0, first = q.split(/\s+/)[0];
        $faq.find('.faq__item').each(function () {
            var $it = $(this), $title = $it.find('.accordion__title').first();
            if ($title.length && !$title.attr('data-text')) $title.attr('data-text', $title.text());
            var text = norm($it.text() + ' ' + ($it.attr('data-keywords') || ''));
            var ok = (!cat || cat === 'all' || $it.attr('data-category') === cat) && (!q || q.split(/\s+/).every(function (t) { return text.indexOf(t) > -1; }));
            this.hidden = !ok;
            shown += ok;
            if ($title.length) {
                var raw = $title.attr('data-text'), idx = first ? norm(raw).indexOf(first) : -1;
                $title.html(idx > -1 ? esc(raw.slice(0, idx)) + '<mark>' + esc(raw.slice(idx, idx + first.length)) + '</mark>' + esc(raw.slice(idx + first.length)) : esc(raw));
            }
            if (ok && q && this.tagName === 'DETAILS' && shown <= 1) this.open = true;
        });
        $faq.find('.faq__empty').prop('hidden', shown > 0).find('[data-faq-term]').text($input.val() || '');
        $faq.find('[data-faq-count]').text(shown + (shown === 1 ? ' pergunta' : ' perguntas'));
    }

    $(document)
        .on('input', '[data-faq-search]', function () { faqFilter($(this).closest('.faq')); })
        .on('click', '[data-faq-filter]', function () {
            var $faq = $(this).closest('.faq');
            $faq.find('[data-faq-filter]').attr('aria-pressed', 'false');
            $(this).attr('aria-pressed', 'true');
            faqFilter($faq);
        })
        .on('click', '[data-faq-feedback]', function () {
            var $box = $(this).closest('.faq__feedback').addClass('is-answered'), yes = $(this).attr('data-faq-feedback') === 'sim';
            $box.find('.faq__feedback-label').text(yes ? 'Obrigado pelo retorno.' : 'Obrigado. Se precisar, abra um chamado no Service Desk.');
            C.emit($box, 'nova:faq-feedback', { helpful: yes, item: $box.closest('.faq__item')[0] });
        });

    /* =====================================================================
       ONBOARDING
       ===================================================================== */
    var NovaOnboarding = (function () {
        function update(el) {
            var $el = $(el), $steps = $el.find('.onboarding__step'), done = $steps.filter('.is-done').length;
            var total = $steps.length, pct = total ? Math.round(done / total * 100) : 0;
            var $ring = $el.find('.onboarding__ring');
            if ($ring.length) {
                $ring[0].style.setProperty('--pct', pct);
                $ring.attr({ role: 'img', 'aria-label': done + ' de ' + total + ' passos concluídos' }).find('span').text(pct + '%');
            }
            $el.find('[data-onboarding-count]').text(done + ' de ' + total + ' concluídos');
            $steps.removeClass('is-current').not('.is-done').first().addClass('is-current');
            if (total && done === total) C.emit(el, 'nova:onboarding-complete', {});
        }

        function key(el) { return $(el).attr('data-onboarding-key'); }
        function saved(el) { return key(el) ? (store('onb:' + key(el)) || '').split(',').filter(Boolean) : []; }

        function complete(el, id) {
            el = C.get(el);
            var $step = $(el).find('.onboarding__step[data-step="' + id + '"]');
            if (!$step.length || $step.hasClass('is-done')) return;
            $step.addClass('is-done');
            if (key(el)) {
                var list = saved(el);
                if (list.indexOf(id) < 0) list.push(id);
                store('onb:' + key(el), list.join(','));
            }
            C.emit(el, 'nova:onboarding-step', { step: id });
            update(el);
        }

        function reset(el) {
            el = C.get(el);
            if (!el) return;
            $(el).find('.onboarding__step').removeClass('is-done');
            if (key(el)) store('onb:' + key(el), null);
            update(el);
        }

        function init(root) {
            $(root).find('.onboarding').each(function () {
                var el = this;
                $.each(saved(el), function (i, id) { $(el).find('.onboarding__step[data-step="' + id + '"]').addClass('is-done'); });
                update(el);
            });
        }

        $(document).on('click', '[data-onboarding-done]', function () {
            complete($(this).closest('.onboarding')[0], $(this).attr('data-onboarding-done') || $(this).closest('.onboarding__step').attr('data-step'));
        });

        return { complete: complete, reset: reset, refresh: init };
    })();

    /* boas-vindas em etapas */
    function welcomeGo(w, i) {
        var $w = $(w), $slides = $w.find('.welcome__slide'), last = $slides.length - 1;
        i = Math.max(0, Math.min(i, last));
        $slides.each(function (k) { this.hidden = k !== i; });
        $w.attr('data-index', i).find('.popover__dots span').each(function (k) { $(this).toggleClass('is-active', k === i); });
        $w.find('[data-welcome-prev]').css('visibility', i === 0 ? 'hidden' : '');
        var $next = $w.find('[data-welcome-next]');
        $next.text(i === last ? ($next.attr('data-done-text') || 'Começar') : 'Próximo');
        $w.find('[data-welcome-status]').text('Etapa ' + (i + 1) + ' de ' + $slides.length);
    }

    $(document).on('click', '[data-welcome-next], [data-welcome-prev]', function () {
        var $w = $(this).closest('.welcome'), i = parseInt($w.attr('data-index') || '0', 10), next = $(this).is('[data-welcome-next]');
        if (next && i === $w.find('.welcome__slide').length - 1) {
            var d = $w.closest('dialog')[0];
            if (d) NovaDialog.close(d, 'done');
            C.emit($w, 'nova:welcome-done', {});
            return setTimeout(function () { welcomeGo($w, 0); }, 300);
        }
        welcomeGo($w, i + (next ? 1 : -1));
    });

    /* =====================================================================
       INICIALIZAÇÃO
       ===================================================================== */
    function refresh(root) {
        root = C.get(root) || document;
        restoreDismissed(root);
        initCoachmarks(root);
        NovaOnboarding.refresh(root);
        $(root).find('.welcome').each(function () { welcomeGo(this, 0); });
        $(root).find('.faq').each(function () { faqFilter(this); });
    }

    $(function () { refresh(); });

    NOVAUI._onRefresh(refresh);

    // NOVAUI.dialog.confirm({ type, title, message, consequences, confirmText, cancelText, requireText })
    // NOVAUI.dialog.alert({ type, title, message, confirmText })
    NOVAUI.dialog = { confirm: NovaDialog.confirm, alert: NovaDialog.alert };

    // NOVAUI.tour({ steps: [{ target, title, text, placement }], key, doneText, onFinish })
    var tour = function (o) { NovaTour.start(o.steps, o); };
    tour.end = NovaTour.end;
    tour.hasSeen = NovaTour.hasSeen;
    tour.reset = NovaTour.reset;
    NOVAUI.tour = tour;

    NOVAUI.onboarding = NovaOnboarding;
    NOVAUI.help = {
        open: function (id, article) { openHelp(id, article); },
        close: function () { closeHelp(); }
    };
})(window.jQuery, window, document);
