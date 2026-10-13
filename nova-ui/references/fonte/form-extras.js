/* =========================================================================
   NOVA UI — CONTROLES EXTRAS (comportamento) · requer jQuery e core.js
   Inicializa sozinho; para conteúdo novo chame NOVAUI.refresh(root).
   Rich Text  <div class="rte" data-rte-target="#textarea"> com
              .rte__toolbar (botões data-cmd) e .rte__content
              contenteditable. Cola como texto puro. data-max-length opcional.
              NOVAUI.rte.getHTML(el) / setHTML(el, html) / setDisabled(el, bool)
   Upload     agora é o Anexo: NOVAUI.attachment (attachments.js)
   Cor        <div class="color-field"> com .color-field__native e
              .color-field__hex; .color-swatch[data-color] com
              data-target="#input-color"
   Slider     <div class="slider"> com 1 input (simples) ou 2 (faixa)
              .slider__input; saída em [data-slider-output]
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;

    /* =====================================================================
       RICH TEXT EDITOR
       ===================================================================== */
    var RTE = (function () {
        var STATE_CMDS = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'];
        var savedRange = null;

        function parts(rte) {
            var $r = $(rte);
            return {
                $content: $r.find('.rte__content').first(),
                $target: $($r.attr('data-rte-target') || []),
                $count: $r.find('[data-rte-count]'),
                $linkbar: $r.find('.rte__linkbar')
            };
        }

        // remove marcação vazia comum do contenteditable
        function clean(html) {
            var h = $.trim(html.replace(/<br\s*\/?>$/i, ''));
            return h === '<p></p>' || h === '<br>' ? '' : h;
        }

        function queryValue() {
            try { return String(document.queryCommandValue('formatBlock')).toLowerCase(); } catch (e) { return ''; }
        }

        function sync(rte) {
            var p = parts(rte), html = clean(p.$content.html());
            if (!html) p.$content.empty();
            if (p.$target.length) { p.$target.val(html); C.fire(p.$target, 'change'); }
            var len = p.$content.text().length, max = parseInt($(rte).attr('data-max-length'), 10);
            p.$count.text(max ? len + ' / ' + max : len + (len === 1 ? ' caractere' : ' caracteres'));
            $(rte).toggleClass('is-error', !!max && len > max);
        }

        function updateState(rte) {
            $(rte).find('.rte__btn[data-cmd]').each(function () {
                var cmd = $(this).attr('data-cmd'), on = false;
                if (STATE_CMDS.indexOf(cmd) < 0) return;
                try { on = document.queryCommandState(cmd); } catch (e) { /* sem suporte */ }
                $(this).attr('aria-pressed', String(on));
            });
            $(rte).find('.rte__btn[data-cmd="formatBlock"][data-value="h3"]').attr('aria-pressed', String(queryValue() === 'h3'));
        }

        function exec(rte, cmd, value) {
            parts(rte).$content.trigger('focus');
            if (cmd === 'formatBlock') document.execCommand('formatBlock', false, '<' + (queryValue() === value ? 'p' : value) + '>');
            else document.execCommand(cmd, false, value || null);
            sync(rte);
            updateState(rte);
        }

        function closeLink(rte) {
            var p = parts(rte);
            p.$linkbar.prop('hidden', true);
            p.$content.trigger('focus');
        }

        function openLink(rte) {
            var p = parts(rte);
            if (!p.$linkbar.length) return;
            var sel = window.getSelection();
            savedRange = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
            var a = sel.anchorNode && $(sel.anchorNode.parentElement).closest('a');
            p.$linkbar.prop('hidden', false).find('input').val(a && a.length ? a.attr('href') : 'https://').trigger('focus').trigger('select');
        }

        function applyLink(rte) {
            var p = parts(rte), url = $.trim(p.$linkbar.find('input').val());
            closeLink(rte);
            if (savedRange) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }
            if (url && url !== 'https://') {
                if (!/^(https?:|mailto:|\/|#)/i.test(url)) url = 'https://' + url;
                if (savedRange && savedRange.collapsed) document.execCommand('insertHTML', false, '<a href="' + esc(url) + '">' + esc(url) + '</a>');
                else document.execCommand('createLink', false, url);
            } else {
                document.execCommand('unlink', false, null);
            }
            sync(rte);
        }

        function init(rte) {
            if (rte._novaRte) return;
            rte._novaRte = true;
            var $r = $(rte), p = parts(rte), $toolbar = $r.find('.rte__toolbar').attr('role', 'toolbar');
            p.$content.attr({ contenteditable: String(!$r.hasClass('is-disabled')), role: 'textbox', 'aria-multiline': 'true' });
            if (p.$target.val() && !$.trim(p.$content.html())) p.$content.html(p.$target.val());
            try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* sem suporte */ }

            $r.on('mousedown', '.rte__btn', function (e) { e.preventDefault(); }) // mantém a seleção do texto
                .on('click', '.rte__btn, [data-link-apply], [data-link-cancel]', function () {
                    var $b = $(this), cmd = $b.attr('data-cmd');
                    if (cmd === 'link') openLink(rte);
                    else if ($b.is('[data-link-apply]')) applyLink(rte);
                    else if ($b.is('[data-link-cancel]')) closeLink(rte);
                    else if (cmd) exec(rte, cmd, $b.attr('data-value'));
                });
            p.$linkbar.on('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); applyLink(rte); }
                if (e.key === 'Escape') { e.preventDefault(); closeLink(rte); }
            });
            p.$content.on('input', function () { sync(rte); })
                .on('keyup mouseup', function () { updateState(rte); })
                .on('keydown', function (e) {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                        e.preventDefault();
                        e.stopPropagation();
                        openLink(rte);
                    }
                })
                // colar como texto puro, mantendo os parágrafos
                .on('paste', function (e) {
                    e.preventDefault();
                    var text = (e.originalEvent.clipboardData || window.clipboardData).getData('text/plain');
                    document.execCommand('insertHTML', false, $.map(text.split(/\r?\n\r?\n/), function (para) {
                        return '<p>' + esc(para).replace(/\r?\n/g, '<br>') + '</p>';
                    }).join(''));
                    sync(rte);
                });
            // setas entre os botões da toolbar
            $toolbar.on('keydown', function (e) {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                var $btns = $toolbar.find('.rte__btn'), i = $btns.index(document.activeElement);
                if (i < 0) return;
                e.preventDefault();
                $btns.eq((i + (e.key === 'ArrowRight' ? 1 : -1) + $btns.length) % $btns.length).trigger('focus');
            });
            sync(rte);
        }

        return {
            init: init,
            getHTML: function (el) { el = C.get(el); return el ? clean(parts(el).$content.html()) : ''; },
            setHTML: function (el, html) { el = C.get(el); if (el) { parts(el).$content.html(html || ''); sync(el); } },
            setDisabled: function (el, on) {
                el = C.get(el);
                if (!el) return;
                $(el).toggleClass('is-disabled', !!on);
                parts(el).$content.attr('contenteditable', String(!on));
            }
        };
    })();

    /* =====================================================================
       COLOR PICKER
       ===================================================================== */
    function normHex(v) {
        v = $.trim(v).replace(/^#?/, '#');
        if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null;
    }

    function setColor(f, hex, source) {
        var $f = $(f), native = $f.find('.color-field__native')[0];
        f.style.setProperty('--color-value', hex);
        $f.find('.color-field__swatch')[0].style.setProperty('--color-value', hex);
        $f.removeClass('is-invalid');
        if (native && source !== 'native') native.value = hex;
        if (source !== 'text') $f.find('.color-field__hex').val(hex.toUpperCase());
        if (native) {
            $('.color-swatch[data-target="#' + native.id + '"]').each(function () {
                $(this).attr('aria-pressed', String(normHex($(this).attr('data-color')) === hex));
            });
        }
        if (source !== 'init' && native) {
            C.fire(native, 'change');
            C.emit(f, 'nova:color-change', { value: hex });
        }
    }

    $(document)
        .on('input', '.color-field__native', function () { setColor($(this).closest('.color-field')[0], this.value.toLowerCase(), 'native'); })
        .on('input', '.color-field__hex', function () {
            var hex = normHex(this.value), $f = $(this).closest('.color-field');
            if (hex && this.value.replace('#', '').length === 6) setColor($f[0], hex, 'text');
            else $f.addClass('is-invalid');
        })
        .on('focusout', '.color-field__hex', function () {
            var $f = $(this).closest('.color-field'), hex = normHex(this.value);
            setColor($f[0], hex || $f.find('.color-field__native').val(), hex ? 'blur' : 'init');
        })
        .on('click', '.color-swatch', function () {
            var native = $($(this).attr('data-target'))[0], hex = normHex($(this).attr('data-color'));
            if (native && hex) setColor($(native).closest('.color-field')[0], hex, 'swatch');
        })
        .on('input', '.slider__input', function () { sliderSync($(this).closest('.slider'), this); });

    /* =====================================================================
       SLIDER / RANGE SLIDER
       ===================================================================== */
    function sliderPct(input) {
        var min = parseFloat(input.min) || 0, max = parseFloat(input.max);
        if (isNaN(max)) max = 100;
        return ((parseFloat(input.value) - min) / (max - min)) * 100;
    }

    function sliderFormat($s, v) {
        var fmt = $s.attr('data-format'), n = parseFloat(v), unit = $s.attr('data-unit') || '';
        if (fmt === 'currency') return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
        if (fmt === 'percent') return n + '%';
        return n.toLocaleString('pt-BR') + (unit ? ' ' + unit : '');
    }

    function sliderSync($s, changed) {
        $s = $($s);
        var el = $s[0], inputs = $s.find('.slider__input').get();
        if (!el || !inputs.length) return;
        var gap = parseFloat($s.attr('data-min-gap')) || 0, a = inputs[0], b = inputs[1];
        if (b) {
            if (parseFloat(a.value) > parseFloat(b.value) - gap) {
                if (changed === a) a.value = parseFloat(b.value) - gap;
                else b.value = parseFloat(a.value) + gap;
            }
            // o polegar mexido por último fica por cima
            $(a).toggleClass('is-front', changed === a);
            $(b).toggleClass('is-front', changed !== a);
            el.style.setProperty('--slider-from', sliderPct(a) + '%');
            el.style.setProperty('--slider-to', sliderPct(b) + '%');
            $(b).attr('aria-valuetext', sliderFormat($s, b.value));
        } else {
            el.style.setProperty('--slider-from', '0%');
            el.style.setProperty('--slider-to', sliderPct(a) + '%');
        }
        $(a).attr('aria-valuetext', sliderFormat($s, a.value));
        $s.find('[data-slider-output]').text(b ? sliderFormat($s, a.value) + ' – ' + sliderFormat($s, b.value) : sliderFormat($s, a.value));
        $s.toggleClass('is-disabled', $(inputs).is(':disabled'));
    }

    /* =====================================================================
       INICIALIZAÇÃO
       ===================================================================== */
    function refresh(root) {
        var $root = $(C.get(root) || document);
        $root.find('.rte').each(function () { RTE.init(this); });
        $root.find('.color-field').each(function () {
            var n = $(this).find('.color-field__native')[0];
            if (n) setColor(this, n.value.toLowerCase(), 'init');
        });
        $root.find('.slider').each(function () { sliderSync($(this)); });
        $root.find('.rating-display[data-value]').each(function () { ratingSet(this, $(this).attr('data-value')); });
    }

    /* nota só leitura: <span class="rating-display" data-value="4.3"> */
    function ratingSet(el, value) {
        el = C.get(el);
        if (!el) return;
        var v = Math.max(0, Math.min(5, parseFloat(String(value).replace(',', '.')) || 0));
        $(el).attr({ 'data-value': v, role: 'img', 'aria-label': 'Nota ' + String(v).replace('.', ',') + ' de 5' });
        el.style.setProperty('--rating-value', v);
    }

    $(function () { refresh(); });

    NOVAUI._onRefresh(refresh);

    // NOVAUI.rating.set({ target, value })
    NOVAUI.rating = { set: function (o) { ratingSet(o.target, o.value); } };
    NOVAUI.rte = { getHTML: RTE.getHTML, setHTML: RTE.setHTML, setDisabled: RTE.setDisabled };
})(window.jQuery, window, document);
