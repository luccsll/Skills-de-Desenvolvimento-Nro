/* =========================================================================
   NOVA UI — LOADERS (comportamento) · requer jQuery e core.js
   Plugin jQuery:
     $('#form').loader();            // mostra
     $('#form').loader('unload');    // esconde
     $('#form').loader({ message: 'Salvando…' });

   NOVAUI.loader.show({ target, message, card, blur, size, delay, minTime })
     target   elemento ou seletor; sem target = página inteira
     message  texto abaixo da animação
     delay    ms antes de aparecer (evita piscar em carga rápida; 150)
     minTime  ms mínimos na tela depois de aparecer (400)
     size     'sm' | 'md' | 'lg' · card: caixa em volta · blur: desfoca o fundo
   NOVAUI.loader.hide('#form') ou hide({ target, force })
   NOVAUI.loader.message(target, texto) → troca o texto com o loader aberto
   NOVAUI.loader.wrap({ target, promise, message, … }) → mostra até a promise terminar
   NOVAUI.loader.isLoading(target)
   NOVAUI.loader.screen(target) → controla um .loader-screen:
     .message(texto) .progress(0–100) .error(texto, aoTentarDeNovo) .hide() .show()
   NOVAUI.loader.bar.start() .set(0–100) .done() → barra no topo da página

   NOVAUI.skeleton.show({ target, type, rows, cols, lines, count, fields, bars, avatar, media, minTime })
     type: 'text' | 'list' | 'card' | 'product' | 'stat' | 'form' | 'table' | 'chart'
     'table' vai num <tbody>: gera linhas no lugar das reais
   NOVAUI.skeleton.hide(target)
   NOVAUI.skeleton.wrap({ target, promise, type, … }) → promise
   NOVAUI.skeleton.loading(target, true|false) → modo data-sk (.is-loading)
   NOVAUI.skeleton.html({ type, … }) → só o HTML
   <div data-skeleton="list" data-rows="4"></div> vazio é preenchido sozinho
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util;

    // aceita elemento, jQuery ou seletor; documento/html viram o body
    function target(el) {
        el = C.get(el);
        return el === document || el === document.documentElement ? document.body : el;
    }

    // promessa que, ao terminar (bem ou mal), chama done
    function after(promise, done) {
        return Promise.resolve(promise).then(function (v) { done(); return v; }, function (e) { done(); throw e; });
    }

    /* =====================================================================
       OVERLAY
       ===================================================================== */
    function setMessage(st, text) {
        st.$ov.find('.loader-overlay__text').text(text || '');
        if (text && st.$ov.hasClass('loader-overlay--fixed')) st.$ov.addClass('loader-overlay--card');
    }

    function show(el, opts) {
        el = target(el);
        if (!el) return null;
        opts = opts || {};
        var st = el._novaLoader;
        if (st) { // chamada aninhada: só conta e, se veio texto, atualiza
            st.count++;
            if (opts.message != null) setMessage(st, opts.message);
            return st.$ov[0];
        }
        var $el = $(el), page = el === document.body;
        st = el._novaLoader = { count: 1, shownAt: 0, timer: null, minTime: opts.minTime != null ? opts.minTime : 400 };
        if (!page && $el.css('position') === 'static') {
            $el.css('position', 'relative');
            st.restorePos = true;
        }
        var size = opts.size === 'sm' || opts.size === 'lg' ? ' loader--' + opts.size : '';
        st.$ov = $('<div class="loader-overlay" role="status" aria-live="polite">')
            .toggleClass('loader-overlay--fixed', page).toggleClass('loader-overlay--card', !!opts.card).toggleClass('loader-overlay--blur', !!opts.blur)
            .html('<div class="loader-overlay__box"><span class="loader' + size + '" aria-hidden="true"></span><p class="loader-overlay__text"></p><span class="sr-only">Carregando</span></div>');
        setMessage(st, opts.message);
        $el.attr('aria-busy', 'true').append(st.$ov);

        // tira o foco de campos cobertos, para não digitar "por baixo"
        if ($.contains(el, document.activeElement)) {
            st.prevFocus = document.activeElement;
            try { document.activeElement.blur(); } catch (e) { /* ignora */ }
        }
        var reveal = function () {
            st.timer = null;
            st.shownAt = Date.now();
            st.$ov.addClass('is-visible');
        };
        var delay = opts.delay != null ? opts.delay : 150;
        if (delay > 0) st.timer = setTimeout(reveal, delay);
        else { void st.$ov[0].offsetWidth; reveal(); }
        C.emit(el, 'nova:loader-show', {});
        return st.$ov[0];
    }

    function hide(el, opts) {
        el = target(el);
        var st = el && el._novaLoader;
        if (!st) return;
        st.count = opts && opts.force ? 0 : st.count - 1;
        if (st.count > 0) return;

        var finish = function () {
            if (el._novaLoader !== st) return;
            el._novaLoader = null;
            st.$ov.removeClass('is-visible');
            var remove = function () {
                st.$ov.remove();
                if (st.restorePos) $(el).css('position', '');
            };
            if (C.reducedMotion() || !st.shownAt) remove(); else setTimeout(remove, 220);
            $(el).removeAttr('aria-busy');
            if (st.prevFocus && $.contains(document.body, st.prevFocus)) C.focus(st.prevFocus);
            C.emit(el, 'nova:loader-hide', {});
        };
        // ainda não apareceu (carga rápida): cancela sem mostrar nada
        if (st.timer) {
            clearTimeout(st.timer);
            st.timer = null;
            return finish();
        }
        var wait = Math.max(0, st.minTime - (Date.now() - st.shownAt));
        if (wait) setTimeout(finish, wait); else finish();
    }

    function wrap(el, promise, opts) {
        show(el, opts);
        return after(promise, function () { hide(el); });
    }

    /* =====================================================================
       TELA DE ABERTURA
       ===================================================================== */
    function screen(el) {
        var $s = $(C.get(el));
        if (!$s.hasClass('loader-screen')) $s = $s.find('.loader-screen').first();
        var api = {
            el: $s[0],
            message: function (text) {
                $s.find('.loader-screen__message').text(text || '');
                return api;
            },
            progress: function (pct) {
                var $bar = $s.find('.loader-screen__progress');
                if (!$bar.length && $s.length) {
                    $bar = $('<div class="loader-screen__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div>');
                    var $before = $s.find('.loader-screen__message, .loader-screen__footer').first();
                    if ($before.length) $bar.insertBefore($before); else $s.append($bar);
                }
                if (pct == null) {
                    $bar.removeAttr('data-value aria-valuenow');
                } else {
                    pct = Math.max(0, Math.min(100, Math.round(pct)));
                    $bar.attr({ 'data-value': pct, 'aria-valuenow': pct });
                    if ($bar[0]) $bar[0].style.setProperty('--progress', pct + '%');
                }
                return api;
            },
            error: function (text, onRetry) {
                if (!$s.length) return api;
                var $box = $s.find('.loader-screen__error');
                if (!$box.length) {
                    var $footer = $s.find('.loader-screen__footer').first();
                    $box = $('<div class="loader-screen__error">');
                    if ($footer.length) $box.insertBefore($footer); else $s.append($box);
                }
                $box.html('<p></p>' + (onRetry ? '<button type="button" class="btn btn--primary btn--sm">Tentar de novo</button>' : ''))
                    .children('p').text(text || 'Não foi possível carregar os dados.');
                $box.find('button').on('click', function () {
                    $s.removeClass('is-error');
                    onRetry(api);
                });
                $s.removeClass('is-hidden').addClass('is-error').attr('role', 'alert');
                return api;
            },
            hide: function () {
                $s.addClass('is-hidden').attr('aria-hidden', 'true').parent().removeAttr('aria-busy');
                if ($s.length) C.emit($s, 'nova:loader-hide', {});
                return api;
            },
            show: function () {
                $s.removeClass('is-hidden is-error').attr('role', 'status').removeAttr('aria-hidden').parent().attr('aria-busy', 'true');
                $s.find('.loader-screen__progress').remove();
                return api.message('');
            }
        };
        return api;
    }

    /* =====================================================================
       BARRA NO TOPO
       ===================================================================== */
    var bar = (function () {
        var $el = null, timer = null, value = 0, active = 0;

        function set(v) {
            if (!$el) $el = $('<div class="top-loader" role="progressbar" aria-label="Carregando"><div class="top-loader__bar"></div></div>').appendTo(document.body);
            value = Math.max(0, Math.min(100, v));
            $el[0].style.setProperty('--progress', value + '%');
            $el.attr('aria-valuenow', Math.round(value));
        }

        function start() {
            if (++active > 1) return;
            clearInterval(timer);
            set(0);
            void $el[0].offsetWidth;
            $el.addClass('is-active');
            set(12);
            // avança devagar, sem nunca chegar ao fim sozinha
            timer = setInterval(function () { set(value + (90 - value) * 0.08); }, 300);
        }

        function done() {
            if (!$el) return;
            active = Math.max(0, active - 1);
            if (active) return;
            clearInterval(timer);
            set(100);
            setTimeout(function () {
                $el.removeClass('is-active');
                setTimeout(function () { if (!active) set(0); }, 250);
            }, 250);
        }

        return { start: start, set: set, done: done };
    })();

    /* =====================================================================
       SKELETON
       ===================================================================== */
    var NovaSkeleton = (function () {
        var W = [92, 78, 64, 85, 70, 56, 88, 74];
        function w(i, list) { list = list || W; return list[i % list.length]; }
        function sk(cls, width, extra) {
            return '<span class="skeleton ' + (cls || '') + '"' + (width ? ' style="--skeleton-width:' + width + '%' + (extra || '') + '"' : extra ? ' style="' + extra + '"' : '') + '></span>';
        }
        function repeat(n, fn) { var h = ''; for (var i = 0; i < n; i++) h += fn(i); return h; }

        var T = {
            text: function (o) {
                return '<div class="skeleton-stack skeleton-paragraph" style="gap:0">' + repeat(o.lines || 3, function (i) { return sk('skeleton--text', w(i)); }) + '</div>';
            },
            list: function (o) {
                return '<div class="skeleton-list">' + repeat(o.rows || 4, function (i) {
                    return '<div class="skeleton-row">' + (o.avatar === false ? '' : sk('skeleton--circle')) +
                        '<div class="skeleton-stack">' + sk('skeleton--text', w(i, [55, 42, 63, 48])) + sk('skeleton--text-sm', w(i, [32, 38, 26, 35])) + '</div>' +
                        (o.meta === false ? '' : sk('skeleton--badge')) + '</div>';
                }) + '</div>';
            },
            card: function (o) {
                var h = repeat(o.count || 1, function (i) {
                    return '<div class="skeleton-card">' + (o.media ? sk('skeleton--block') : '') + sk('skeleton--title') +
                        '<div class="skeleton-stack skeleton-paragraph" style="gap:0">' + sk('skeleton--text', w(i)) + sk('skeleton--text', w(i + 1)) + sk('skeleton--text', w(i + 2)) + '</div>' +
                        '<div class="skeleton-card__footer">' + sk('skeleton--button') + sk('skeleton--button', null, '--skeleton-width:88px') + '</div></div>';
                });
                return (o.count || 1) > 1 ? '<div class="card-group">' + h + '</div>' : h;
            },
            /* card com foto (produto) */
            product: function (o) {
                var h = repeat(o.count || 1, function (i) {
                    return '<div class="skeleton-product">' + sk('skeleton-product__media') + '<span class="skeleton-product__tag"></span>' +
                        '<div class="skeleton-product__body">' + sk('skeleton--title', w(i, [70, 58, 76, 64])) + sk('skeleton--text-sm', w(i, [55, 48, 60, 52])) +
                        '<div class="skeleton-product__price">' + sk('skeleton--kpi') + sk('skeleton--text-sm', 28) + '</div></div>' +
                        '<div class="skeleton-product__footer">' + sk('skeleton--button') + sk('skeleton--button') + '</div></div>';
                });
                return (o.count || 1) > 1 ? '<div class="skeleton-products">' + h + '</div>' : h;
            },
            stat: function (o) {
                return '<div class="stat-group">' + repeat(o.count || 4, function (i) {
                    return '<div class="skeleton-stat">' + sk('skeleton--text-sm', w(i, [55, 45, 60, 50])) + sk('skeleton--kpi') + sk('skeleton--text-sm', 35) + '</div>';
                }) + '</div>';
            },
            form: function (o) {
                return '<div class="skeleton-form" style="--skeleton-cols:' + (o.cols || 2) + '">' + repeat(o.fields || 4, function () { return sk('skeleton--input'); }) + '</div>';
            },
            chart: function (o) {
                var hs = [45, 70, 55, 85, 62, 78, 40, 66];
                return '<div class="skeleton-chart">' + repeat(o.bars || 8, function (i) { return sk('', null, '--h:' + hs[i % hs.length] + '%'); }) + '</div>';
            },
            /* linhas para o <tbody> de uma .data-table */
            table: function (o) {
                return repeat(o.rows || 5, function (r) {
                    return '<tr class="skeleton-table">' + repeat(o.cols || 4, function (c) {
                        if (c === 0 && o.avatar) {
                            return '<td><div class="skeleton-row">' + sk('skeleton--circle skeleton--circle-sm') + '<div class="skeleton-stack">' +
                                sk('skeleton--text', w(r, [70, 55, 82, 64])) + sk('skeleton--text-sm', 40) + '</div></div></td>';
                        }
                        return '<td>' + sk('skeleton--text', w(r + c, [80, 60, 72, 50, 66])) + '</td>';
                    }) + '</tr>';
                });
            }
        };

        function html(type, opts) { return (T[type] || T.text)(opts || {}); }

        function show(el, type, opts) {
            el = C.get(el);
            if (!el) return;
            opts = opts || {};
            if (el._novaSkeleton) { el._novaSkeleton.count++; return; }
            var rows = el.tagName === 'TBODY' || type === 'table';
            var $host = rows
                ? $('<tbody>').html(html(type, opts) + '<tr><td class="sr-only" role="status">Carregando</td></tr>').children()
                : $('<div>').html(html(type, opts)).add($('<span class="sr-only" role="status">Carregando</span>'));
            $host.attr('data-skeleton-host', '');
            $(el).prepend($host).addClass('is-skeleton-active').attr('aria-busy', 'true');
            el._novaSkeleton = { count: 1, $host: $host, shownAt: Date.now(), minTime: opts.minTime != null ? opts.minTime : 300 };
        }

        function hide(el) {
            el = C.get(el);
            var st = el && el._novaSkeleton;
            if (!st || --st.count > 0) return;
            var finish = function () {
                if (el._novaSkeleton !== st) return;
                el._novaSkeleton = null;
                st.$host.remove();
                $(el).removeClass('is-skeleton-active').removeAttr('aria-busy').children().each(function () {
                    $(this).removeClass('skeleton-reveal');
                    void this.offsetWidth;
                    $(this).addClass('skeleton-reveal');
                });
            };
            setTimeout(finish, Math.max(0, st.minTime - (Date.now() - st.shownAt)));
        }

        function wrap(el, promise, type, opts) {
            show(el, type, opts);
            return after(promise, function () { hide(el); });
        }

        /* modo data-sk: liga/desliga .is-loading no container */
        function loading(el, on) {
            $(C.get(el)).toggleClass('is-loading', !!on).attr('aria-busy', on ? 'true' : null);
        }

        /* <div data-skeleton="list" data-rows="4"></div> vazio vira o modelo */
        function render(root) {
            $(C.get(root) || document).find('[data-skeleton]').each(function () {
                var $el = $(this), o = {};
                if ($el.children().length) return;
                $.each(['rows', 'cols', 'lines', 'count', 'fields', 'bars'], function (i, k) {
                    var v = parseInt($el.attr('data-' + k), 10);
                    if (v) o[k] = v;
                });
                if ($el.is('[data-avatar]')) o.avatar = $el.attr('data-avatar') !== 'false';
                if ($el.is('[data-media]')) o.media = true;
                $el.html(html($el.attr('data-skeleton'), o)).attr('aria-hidden', 'true');
            });
        }

        $(function () { render(); });

        return { show: show, hide: hide, wrap: wrap, loading: loading, html: html, render: render };
    })();

    /* =====================================================================
       API
       ===================================================================== */
    var NovaLoader = {
        show: show,
        hide: hide,
        message: function (el, text) {
            el = target(el);
            if (el && el._novaLoader) setMessage(el._novaLoader, text);
        },
        wrap: wrap,
        isLoading: function (el) { el = target(el); return !!(el && el._novaLoader); },
        screen: screen,
        bar: bar,
        skeleton: NovaSkeleton
    };

    /* plugin jQuery: $(el).loader() · .loader('unload') · .loader('message', texto) */
    $.fn.loader = function (action, opts) {
        if (action && typeof action === 'object') { opts = action; action = 'load'; }
        action = action || 'load';
        return this.each(function () {
            if (action === 'load' || action === 'show') show(this, opts);
            else if (action === 'unload' || action === 'hide') hide(this, opts);
            else if (action === 'message') NovaLoader.message(this, opts);
            else if (window.console) console.error('loader: use "load", "unload" ou "message".');
        });
    };

    function tgt(o) { return o && o.target !== undefined ? o.target : o; }

    NOVAUI.loader = {
        // NOVAUI.loader.show({ target, message, card, blur, size, delay, minTime }) — sem target: página inteira
        show: function (o) { o = o || {}; return show(o.target || document.body, o); },
        // NOVAUI.loader.hide('#form') ou hide({ target, force })
        hide: function (o) { hide(tgt(o) || document.body, o && o.target !== undefined ? o : null); },
        message: function (target, text) { NovaLoader.message(target || document.body, text); },
        // NOVAUI.loader.wrap({ target, promise, message, … }) → promise
        wrap: function (o) { return wrap(o.target || document.body, o.promise, o); },
        isLoading: function (target) { return NovaLoader.isLoading(target || document.body); },
        screen: screen,
        bar: bar
    };

    NOVAUI.skeleton = {
        // NOVAUI.skeleton.show({ target, type: 'text'|'list'|'card'|'product'|'stat'|'form'|'table'|'chart', rows, cols, … })
        show: function (o) { NovaSkeleton.show(o.target, o.type, o); },
        hide: function (target) { NovaSkeleton.hide(tgt(target)); },
        // NOVAUI.skeleton.wrap({ target, promise, type, … }) → promise
        wrap: function (o) { return NovaSkeleton.wrap(o.target, o.promise, o.type, o); },
        loading: function (target, on) { NovaSkeleton.loading(target, on); },
        // NOVAUI.skeleton.html({ type, rows, … }) → string
        html: function (o) { return NovaSkeleton.html(o.type, o); },
        render: NovaSkeleton.render
    };
    NOVAUI._onRefresh(NovaSkeleton.render);
})(window.jQuery, window, document);
