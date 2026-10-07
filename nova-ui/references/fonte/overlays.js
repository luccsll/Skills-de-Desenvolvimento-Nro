/* =========================================================================
   NOVA UI — TOASTS, MODAIS E DRAWERS (comportamento) · requer jQuery e core.js

   NOVAUI.toast({ type, title, message, timeout, action, actions, id,
                  dismissible, inverse, icon, onClose }) → toast
     type:    'info' (padrão) | 'success' | 'warning' | 'error' | 'neutral' | 'loading'
     timeout: ms (0 = fica até fechar). Padrão 5 s; error 8 s; loading 0.
     action:  { label, onClick(toast), keepOpen }
     id:      mesmo id atualiza o toast em vez de criar outro
   toast.update({ … }) · toast.close()
   NOVAUI.toast.promise(promise, { loading, success, error })
   NOVAUI.toast.clear() · NOVAUI.toast.config({ position, max, timeout })
     position: 'bottom-right' (padrão) | 'bottom-left' | 'bottom-center'
               | 'top-right' | 'top-center'

   Modal e drawer usam <dialog class="dialog">:
     [data-dialog-open="id"] abre, [data-dialog-close="valor"] fecha
     data-static       não fecha pelo fundo nem pelo Esc
     data-guard        pergunta antes de fechar se algo foi alterado
   NOVAUI.modal.open(id) · .close(id, valor) · .setLoading(id, bool)
   NOVAUI.modal.create({ type: 'modal'|'drawer', side: 'right'|'left'|'bottom',
                         size: 'sm'|'md'|'lg'|'xl'|'full', title, subtitle, content,
                         scroll, footer: [{ label, variant, value, onClick }],
                         guard, static, onClose })
     → { el, body, close, setLoading, setTitle, closed: Promise<valor> }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;
    var supportsPopover = typeof HTMLElement !== 'undefined' && HTMLElement.prototype.hasOwnProperty('popover');

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

    /* =====================================================================
       TOAST
       ===================================================================== */
    var NovaToast = (function () {
        var cfg = { position: 'bottom-right', max: 4, duration: 5000 };
        var $region = null, $polite, $assertive, toasts = [];
        var ICONS = { info: 'info', success: 'check_circle', warning: 'warning', danger: 'error', neutral: 'notifications' };

        function ensure() {
            if (!$region) {
                $region = $('<section class="toast-region" aria-label="Notificações">').attr('popover', supportsPopover ? 'manual' : null).appendTo(document.body);
                $polite = $('<div class="sr-only" role="status">').appendTo(document.body);
                $assertive = $('<div class="sr-only" role="alert">').appendTo(document.body);
            }
            $region.attr('data-position', cfg.position);
            toTop();
        }

        /* modais ficam na "camada do topo"; o toast é reposto por cima deles */
        function toTop() {
            if (!$region || !supportsPopover) return;
            try {
                if ($region[0].matches(':popover-open')) $region[0].hidePopover();
                $region[0].showPopover();
            } catch (e) { /* sem suporte */ }
        }

        function announce(t) {
            var $live = t.variant === 'danger' ? $assertive : $polite;
            var text = $.grep([t.opts.title, t.opts.message], Boolean).join('. ');
            $live.text('');
            setTimeout(function () { $live.text(text); }, 60);
        }

        function durationFor(variant) {
            return variant === 'loading' ? 0 : variant === 'danger' ? 8000 : cfg.duration;
        }

        function actionsOf(o) { return o.actions || (o.action ? [o.action] : []); }

        function render(t) {
            var o = t.opts, v = t.variant, count = t.count > 1 ? '<span class="toast__count">×' + t.count + '</span>' : '';
            var ic = v === 'loading' ? '<span class="spinner" aria-hidden="true"></span>' : icon(o.icon || ICONS[v] || 'info');
            t.$el.attr('class', 'toast toast--' + v + (o.inverse ? ' toast--inverse' : '')).html(
                (o.inverse && !o.showIcon ? '' : '<span class="toast__icon">' + ic + '</span>') +
                '<div class="toast__content"><p class="toast__title">' + (o.title ? esc(o.title) + count : '') + '</p>' +
                '<p class="toast__message">' + esc(o.message || '') + (o.title ? '' : ' ' + count) + '</p>' +
                '<div class="toast__actions">' + $.map(actionsOf(o), function (a, i) {
                    return '<button type="button" class="btn btn--' + (a.variant || (i === 0 ? 'secondary' : 'ghost')) + ' btn--sm" data-toast-action="' + i + '">' + esc(a.label) + '</button>';
                }).join('') + '</div></div>' +
                (o.dismissible === false ? '' : '<button type="button" class="btn btn--tertiary btn--sm btn--icon toast__close" data-toast-close aria-label="Fechar notificação">' + icon('close') + '</button>') +
                (t.duration > 0 ? '<span class="toast__timer" aria-hidden="true"></span>' : ''));
            t.$el[0].style.setProperty('--toast-duration', t.duration + 'ms');
        }

        function startTimer(t) {
            clearTimeout(t.timeout);
            t.paused = false;
            t.$el.removeClass('is-paused');
            if (!(t.duration > 0)) return;
            t.remaining = t.duration;
            t.started = Date.now();
            t.timeout = setTimeout(function () { close(t, 'timeout'); }, t.remaining);
            var $bar = t.$el.find('.toast__timer').css('animation', 'none');
            if ($bar.length) { void $bar[0].offsetWidth; $bar.css('animation', ''); }
        }

        function pause(t) {
            if (!(t.duration > 0) || t.paused) return;
            t.paused = true;
            clearTimeout(t.timeout);
            t.remaining -= Date.now() - t.started;
            t.$el.addClass('is-paused');
        }

        function resume(t) {
            if (!t.paused || t.closed) return;
            t.paused = false;
            t.started = Date.now();
            t.$el.removeClass('is-paused');
            t.timeout = setTimeout(function () { close(t, 'timeout'); }, Math.max(800, t.remaining));
        }

        function close(t, reason) {
            if (!t || t.closed) return;
            t.closed = true;
            clearTimeout(t.timeout);
            toasts = $.grep(toasts, function (x) { return x !== t; });
            t.$el.addClass('is-leaving');
            setTimeout(function () {
                t.$el.remove();
                if ($region && !$region.children().length && supportsPopover) {
                    try { $region[0].hidePopover(); } catch (e) { /* ignora */ }
                }
            }, C.reducedMotion() ? 0 : 200);
            if (t.opts.onClose) t.opts.onClose(reason || 'close');
            C.emit(document, 'nova:toast-close', { id: t.id, reason: reason || 'close' });
        }

        function update(t, o) {
            if (t.closed) return;
            var prev = t.variant;
            $.extend(t.opts, o);
            t.variant = t.opts.variant || 'info';
            if (o.duration != null) t.duration = o.duration;
            else if (t.variant !== prev) t.duration = durationFor(t.variant);
            render(t);
            startTimer(t);
            announce(t);
        }

        function handle(t) {
            return {
                id: t.id,
                el: t.$el[0],
                update: function (o) { update(t, o); return this; },
                close: function () { close(t, 'api'); }
            };
        }

        function bind(t) {
            var $el = t.$el, startX = null, dx = 0;
            $el.on('mouseenter focusin', function () { pause(t); })
                .on('mouseleave', function () { resume(t); })
                .on('focusout', function (e) { if (!$.contains($el[0], e.relatedTarget)) resume(t); })
                .on('click', '[data-toast-close]', function () { close(t, 'user'); })
                .on('click', '[data-toast-action]', function () {
                    var a = actionsOf(t.opts)[+$(this).attr('data-toast-action')];
                    if (a && a.onClick) a.onClick(handle(t));
                    if (!a || !a.keepOpen) close(t, 'action');
                })
                // arrastar para o lado fecha (toque)
                .on('pointerdown', function (e) {
                    var oe = e.originalEvent;
                    if (oe.pointerType === 'mouse' || $(e.target).closest('button, a').length) return;
                    startX = oe.clientX; dx = 0;
                    $el.addClass('is-dragging');
                    try { this.setPointerCapture(oe.pointerId); } catch (x) { /* ignora */ }
                })
                .on('pointermove', function (e) {
                    if (startX == null) return;
                    dx = e.originalEvent.clientX - startX;
                    $el.css({ transform: 'translateX(' + dx + 'px)', opacity: Math.max(0, 1 - Math.abs(dx) / 200) });
                })
                .on('pointerup pointercancel', function () {
                    if (startX == null) return;
                    startX = null;
                    $el.removeClass('is-dragging');
                    if (Math.abs(dx) > 80 && t.opts.dismissible !== false) return close(t, 'swipe');
                    $el.css({ transform: '', opacity: '' });
                });
        }

        function show(opts) {
            opts = typeof opts === 'string' ? { message: opts } : $.extend({}, opts);
            ensure();
            var variant = opts.variant || 'info';
            // mesmo id: atualiza; mesma mensagem: soma um contador
            var key = opts.id || variant + '|' + (opts.title || '') + '|' + (opts.message || '');
            var same = $.grep(toasts, function (x) { return x.key === key; })[0];
            if (same) {
                if (opts.id) update(same, opts);
                else { same.count++; render(same); startTimer(same); announce(same); }
                toTop();
                return handle(same);
            }
            var t = { id: opts.id || C.uid('toast'), key: key, opts: opts, variant: variant, count: 1 };
            t.duration = opts.duration != null ? opts.duration : durationFor(variant);
            t.$el = $('<div>').attr('data-toast-id', t.id);
            render(t);
            bind(t);
            $region.append(t.$el);
            toasts.push(t);
            // limite na tela: fecha o mais antigo (que não esteja carregando)
            if (toasts.length > cfg.max) {
                var old = $.grep(toasts, function (x) { return x.variant !== 'loading' && x !== t; })[0];
                if (old) close(old, 'overflow');
            }
            startTimer(t);
            announce(t);
            return handle(t);
        }

        function shortcut(variant) {
            return function (message, opts) {
                opts = typeof message === 'object' ? message : $.extend({}, opts, { message: message });
                return show($.extend(opts, { variant: variant }));
            };
        }

        function promise(p, msgs) {
            msgs = msgs || {};
            var t = show({ variant: 'loading', message: msgs.loading || 'Processando…', dismissible: false, id: msgs.id });
            var pick = function (m, v) { return typeof m === 'function' ? m(v) : m; };
            return Promise.resolve(p).then(function (v) {
                t.update({ variant: 'success', message: pick(msgs.success, v) || 'Concluído.', dismissible: true, duration: cfg.duration });
                return v;
            }, function (err) {
                t.update({ variant: 'danger', message: pick(msgs.error, err) || 'Não foi possível concluir.', dismissible: true, duration: 8000 });
                throw err;
            });
        }

        $(document)
            .on('visibilitychange', function () { $.each(toasts, function (i, t) { if (document.hidden) pause(t); else resume(t); }); })
            .on('keydown', function (e) {
                // Esc fecha o último toast quando o foco está nele
                if (e.key !== 'Escape' || !$region || !$.contains($region[0], document.activeElement)) return;
                var t = toasts[toasts.length - 1];
                if (t && t.opts.dismissible !== false) close(t, 'escape');
            });

        return {
            show: show,
            success: shortcut('success'),
            error: shortcut('danger'),
            warning: shortcut('warning'),
            info: shortcut('info'),
            loading: shortcut('loading'),
            promise: promise,
            clear: function () { $.each(toasts.slice(), function (i, t) { close(t, 'clear'); }); },
            config: function (o) { $.extend(cfg, o); if ($region) $region.attr('data-position', cfg.position); return cfg; },
            _toTop: toTop
        };
    })();

    /* =====================================================================
       MODAL E DRAWER
       ===================================================================== */
    var NovaModal = (function () {
        function focusFirst(d) {
            var $d = $(d), target = $d.find('[autofocus]')[0] ||
                $d.find('.dialog__body input:not([type="hidden"]):not([disabled]), .dialog__body select, .dialog__body textarea, .dialog__body [contenteditable="true"]')[0] ||
                $d.find('.dialog__footer .btn--primary, .dialog__footer .btn--danger')[0] || $d.find('.dialog__close')[0] || d;
            if (target === d && !d.hasAttribute('tabindex')) d.tabIndex = -1;
            setTimeout(function () { C.focus(target); }, 0);
        }

        function open(id) {
            var d = C.get(id);
            if (!d) return null;
            if (d.open) return d;
            d._novaTrigger = document.activeElement;
            d._novaDirty = false;
            d.returnValue = '';
            if (typeof d.showModal === 'function') d.showModal(); else $(d).attr('open', '');
            focusFirst(d);
            NovaToast._toTop();
            C.emit(d, 'nova:modal-open', {});
            return d;
        }

        function guard(proceed) {
            var ask = NOVAUI.dialog
                ? NOVAUI.dialog.confirm({ type: 'warning', title: 'Descartar alterações?', message: 'O que você preencheu nesta janela será perdido.', confirmText: 'Descartar', cancelText: 'Continuar editando' })
                : Promise.resolve(window.confirm('Descartar as alterações feitas nesta janela?'));
            ask.then(function (ok) { if (ok) proceed(); });
        }

        function close(id, value, force) {
            var d = C.get(id);
            if (!d || !d.open) return;
            var submit = value === 'confirm' || value === 'submit' || value === 'save';
            if (!force && !submit && d.hasAttribute('data-guard') && d._novaDirty) return guard(function () { close(d, value, true); });
            if (typeof d.close === 'function') d.close(value || '');
            else { $(d).removeAttr('open'); d.returnValue = value || ''; C.emit(d, 'close', {}); }
        }

        function setLoading(id, on) {
            $(C.get(id)).toggleClass('is-loading', !!on).find('.dialog__body').attr('aria-busy', String(!!on));
        }

        /* marca alteração em modais com data-guard (fase de captura) */
        $.each(['input', 'change'], function (i, type) {
            document.addEventListener(type, function (e) {
                var d = $(e.target).closest('dialog.dialog[data-guard]')[0];
                if (d && e.isTrusted !== false) d._novaDirty = true;
            }, true);
        });

        /* abrir e fechar por atributo; clique no fundo fecha */
        $(document).on('click', function (e) {
            var $t = $(e.target), o = $t.closest('[data-dialog-open]')[0], c = $t.closest('[data-dialog-close]')[0];
            if (o) { e.preventDefault(); return open($(o).attr('data-dialog-open')); }
            if (c) {
                var dd = $(c).closest('dialog')[0];
                if (dd) { e.preventDefault(); close(dd, $(c).attr('data-dialog-close') || c.value || ''); }
                return;
            }
            var t = e.target;
            if (t.tagName === 'DIALOG' && $(t).hasClass('dialog') && t.open && !t.hasAttribute('data-static')) {
                var r = t.getBoundingClientRect();
                if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(t, 'cancel');
            }
        });

        /* Esc: respeita data-static e data-guard */
        document.addEventListener('cancel', function (e) {
            var d = e.target;
            if (!$(d).hasClass('dialog')) return;
            if (d.hasAttribute('data-static')) return e.preventDefault();
            if (d.hasAttribute('data-guard') && d._novaDirty) {
                e.preventDefault();
                guard(function () { close(d, 'cancel', true); });
            }
        }, true);

        /* ao fechar: devolve o foco e avisa */
        document.addEventListener('close', function (e) {
            var d = e.target;
            if (!$(d).hasClass('dialog')) return;
            if (d._novaTrigger && $.contains(document.body, d._novaTrigger)) C.focus(d._novaTrigger);
            C.emit(d, 'nova:modal-close', { value: d.returnValue });
            if (d._novaTemp) setTimeout(function () { $(d).remove(); }, 350);
        }, true);

        function create(opts) {
            opts = opts || {};
            var id = C.uid('modal'), drawer = opts.drawer;
            var cls = drawer
                ? ['dialog--drawer', drawer === 'left' ? 'dialog--left' : '', drawer === 'bottom' ? 'dialog--bottom' : '',
                    opts.size === 'sm' ? 'dialog--drawer-sm' : '', opts.size === 'lg' ? 'dialog--drawer-lg' : '']
                : [opts.size && opts.size !== 'md' ? 'dialog--' + opts.size : '', opts.scroll ? 'dialog--scroll' : ''];
            var footer = $.map(opts.footer || [], function (b, i) {
                return '<button type="button" class="btn btn--' + (b.variant || 'secondary') + '" data-modal-btn="' + i + '">' + esc(b.label) + '</button>';
            }).join('');
            var $d = $('<dialog class="dialog">').addClass(cls.join(' ')).attr({
                id: id, 'aria-labelledby': id + '-t', 'data-static': opts.static ? '' : null, 'data-guard': opts.guard ? '' : null
            }).html('<div class="dialog__header"><div class="dialog__heading"><h2 class="dialog__title" id="' + id + '-t">' + esc(opts.title || '') + '</h2>' +
                (opts.subtitle ? '<p class="dialog__subtitle">' + esc(opts.subtitle) + '</p>' : '') + '</div>' +
                '<button type="button" class="btn btn--tertiary btn--sm btn--icon dialog__close" data-dialog-close="cancel" aria-label="Fechar">' + icon('close') + '</button></div>' +
                '<div class="dialog__body"></div>' + (footer ? '<div class="dialog__footer">' + footer + '</div>' : '')).appendTo(document.body);
            var d = $d[0], $body = $d.find('.dialog__body').append(opts.content || '');
            d._novaTemp = true;

            var api;
            var closed = new Promise(function (resolve) {
                $d.on('close', function () {
                    if (opts.onClose) opts.onClose(d.returnValue);
                    resolve(d.returnValue);
                });
            });
            $d.on('click', '[data-modal-btn]', function (e) {
                var $b = $(this), conf = opts.footer[+$b.attr('data-modal-btn')];
                var value = conf.value || (conf.variant === 'primary' || conf.variant === 'danger' ? 'confirm' : 'cancel');
                var result = conf.onClick ? conf.onClick(api, e) : undefined;
                if (result === false) return;
                if (result && typeof result.then === 'function') { // promise: botão carregando até terminar
                    $b.addClass('is-loading');
                    return result.then(function (r) {
                        $b.removeClass('is-loading');
                        if (r !== false) close(d, conf.value || 'confirm', true);
                    }, function () { $b.removeClass('is-loading'); });
                }
                close(d, value, conf.value === 'confirm');
            });
            api = {
                el: d,
                body: $body[0],
                closed: closed,
                close: function (v) { close(d, v, true); },
                setLoading: function (on) { setLoading(d, on); },
                setTitle: function (t) { $d.find('.dialog__title').text(t); }
            };
            open(d);
            return api;
        }

        return { open: open, close: close, setLoading: setLoading, create: create };
    })();

    /* toast: type (info|success|warning|error|neutral|loading) e timeout (ms; 0 = fica) */
    function toastOpts(o) {
        o = typeof o === 'string' ? { message: o } : $.extend({}, o);
        if (o.type) o.variant = o.type === 'error' ? 'danger' : o.type;
        if (o.timeout != null) o.duration = +o.timeout;
        delete o.type;
        delete o.timeout;
        return o;
    }

    function wrapHandle(h) {
        var update = h.update;
        h.update = function (o) { update.call(h, toastOpts(o)); return h; };
        return h;
    }

    // NOVAUI.toast({ type, title, message, timeout, action, actions, id, dismissible, inverse, icon, onClose })
    var toast = function (o) { return wrapHandle(NovaToast.show(toastOpts(o))); };
    // NOVAUI.toast.promise(promise, { loading, success, error })
    toast.promise = NovaToast.promise;
    toast.clear = NovaToast.clear;
    // NOVAUI.toast.config({ position, max, timeout })
    toast.config = function (o) {
        o = $.extend({}, o);
        if (o.timeout != null) { o.duration = +o.timeout; delete o.timeout; }
        return NovaToast.config(o);
    };
    NOVAUI.toast = toast;

    NOVAUI.modal = {
        open: NovaModal.open,
        close: NovaModal.close,
        setLoading: NovaModal.setLoading,
        // NOVAUI.modal.create({ type: 'modal'|'drawer', side: 'right'|'left'|'bottom', size, title, subtitle,
        //                       content, scroll, footer, guard, static, onClose })
        create: function (o) {
            o = $.extend({}, o);
            if (o.type === 'drawer') o.drawer = o.side || 'right';
            return NovaModal.create(o);
        }
    };
})(window.jQuery, window, document);
