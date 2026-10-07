/* =========================================================================
   NOVA UI — CONTROLES EXTRAS (comportamento) · requer jQuery e core.js
   Inicializa sozinho; para conteúdo novo chame NOVAUI.refresh(root).
   Rich Text  <div class="rte" data-rte-target="#textarea"> com
              .rte__toolbar (botões data-cmd) e .rte__content
              contenteditable. Cola como texto puro. data-max-length opcional.
              NOVAUI.rte.getHTML(el) / setHTML(el, html) / setDisabled(el, bool)
   Upload     <div class="upload" data-max-size="10" data-max-files="5">
              eventos: nova:upload-add { files, items }, nova:upload-remove,
              nova:upload-reject { file, reason }
              NOVAUI.upload.setProgress(item, %), .getFiles(el), .clear(el)
              NOVAUI.upload.setStatus({ target: item, type: 'done'|'error', message })
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
       UPLOAD
       ===================================================================== */
    var Upload = (function () {
        var ICON_X = '<span class="icon" aria-hidden="true">close</span>';

        function fmtSize(b) {
            if (b < 1024) return b + ' B';
            if (b < 1048576) return Math.round(b / 1024) + ' KB';
            return (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
        }

        function kind(name) {
            var ext = (name.split('.').pop() || '').toLowerCase();
            if (ext === 'pdf') return ['pdf', 'PDF'];
            if ($.inArray(ext, ['xls', 'xlsx', 'csv']) > -1) return ['xls', ext.toUpperCase()];
            if ($.inArray(ext, ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']) > -1) return ['img', ext.toUpperCase()];
            return ['', (ext || 'ARQ').slice(0, 4).toUpperCase()];
        }

        function accepts(input, file) {
            var acc = $.grep($.map(($(input).attr('accept') || '').split(','), function (s) { return $.trim(s).toLowerCase(); }), Boolean);
            var name = file.name.toLowerCase(), type = (file.type || '').toLowerCase();
            return !acc.length || acc.some(function (a) {
                if (a[0] === '.') return name.slice(-a.length) === a;
                if (/\/\*$/.test(a)) return type.indexOf(a.slice(0, -1)) === 0;
                return type === a;
            });
        }

        function files(up) {
            return up._novaFiles || (up._novaFiles = []);
        }

        function syncInput(up) {
            try {
                var dt = new DataTransfer();
                $.each(files(up), function (i, f) { dt.items.add(f.file); });
                $(up).find('.upload__input')[0].files = dt.files;
            } catch (e) { /* navegador sem DataTransfer: a lista fica só no JS */ }
        }

        function setError(up, msg) {
            $(up).toggleClass('is-error', !!msg).find('.upload__error').text(msg || '').prop('hidden', !msg);
        }

        function add(up, fileList) {
            var $up = $(up), input = $up.find('.upload__input')[0], $list = $up.find('.upload__list');
            var maxMB = parseFloat($up.attr('data-max-size')) || 0;
            var maxFiles = parseInt($up.attr('data-max-files'), 10) || (input.multiple ? 0 : 1);
            var list = files(up), added = [], errors = [];
            if (!input.multiple) { list.length = 0; $list.empty(); }
            $.each(fileList, function (i, file) {
                var reason = null;
                if (!accepts(input, file)) reason = 'Tipo de arquivo não permitido';
                else if (maxMB && file.size > maxMB * 1048576) reason = 'Maior que ' + String(maxMB).replace('.', ',') + ' MB';
                else if (maxFiles && list.length >= maxFiles) reason = 'Limite de ' + maxFiles + (maxFiles > 1 ? ' arquivos' : ' arquivo');
                else if (list.some(function (f) { return f.file.name === file.name && f.file.size === file.size; })) reason = 'Arquivo já adicionado';
                if (reason) {
                    errors.push(file.name + ': ' + reason.toLowerCase());
                    return C.emit(up, 'nova:upload-reject', { file: file, reason: reason });
                }
                var k = kind(file.name), n = esc(file.name);
                var $li = $('<li class="upload__item">').html(
                    '<span class="upload__file-icon' + (k[0] ? ' upload__file-icon--' + k[0] : '') + '" aria-hidden="true">' + esc(k[1]) + '</span>' +
                    '<span class="upload__name" title="' + n + '">' + n + '</span>' +
                    '<button type="button" class="btn btn--tertiary btn--sm btn--icon upload__remove" aria-label="Remover ' + n + '">' + ICON_X + '</button>' +
                    '<span class="upload__meta"><span class="upload__size">' + fmtSize(file.size) + '</span>' +
                    '<span class="upload__progress" role="progressbar" aria-label="Envio de ' + n + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></span>' +
                    '<span class="upload__status"></span></span>').appendTo($list);
                var entry = { file: file, item: $li[0] };
                $li[0]._novaFile = entry;
                list.push(entry);
                added.push(entry);
            });
            setError(up, errors.join(' · '));
            syncInput(up);
            if (added.length) {
                C.emit(up, 'nova:upload-add', { files: $.map(added, function (a) { return a.file; }), items: $.map(added, function (a) { return a.item; }) });
            }
        }

        function remove(up, li) {
            var list = files(up), entry = li._novaFile, i = $.inArray(entry, list);
            if (i > -1) list.splice(i, 1);
            $(li).remove();
            syncInput(up);
            setError(up, '');
            C.emit(up, 'nova:upload-remove', { file: entry ? entry.file : null });
            $(up).find('.upload__input').trigger('focus');
        }

        function setProgress(li, pct) {
            pct = Math.max(0, Math.min(100, Math.round(pct)));
            var $li = $(C.get(li));
            $li[0].style.setProperty('--upload-progress', pct + '%');
            $li.find('.upload__progress').attr('aria-valuenow', pct);
            $li.find('.upload__status').text(pct + '%');
        }

        function setStatus(li, status, msg) {
            var $li = $(C.get(li)).removeClass('is-done is-error');
            if (status) $li.addClass('is-' + status);
            $li.find('.upload__status').text(msg || (status === 'done' ? 'Enviado' : status === 'error' ? 'Falha no envio' : ''));
        }

        function init(up) {
            if (up._novaUpload) return;
            up._novaUpload = true;
            var $up = $(up), depth = 0;
            var hasFiles = function (e) { var dt = e.originalEvent.dataTransfer; return dt && $.inArray('Files', dt.types) > -1; };
            $up.find('.upload__input').on('change', function () {
                if (this.files && this.files.length) add(up, Array.prototype.slice.call(this.files));
            });
            $up.on('click', '.upload__remove', function () { remove(up, $(this).closest('.upload__item')[0]); })
                .on('dragenter', function (e) {
                    if (!hasFiles(e)) return;
                    e.preventDefault();
                    depth++;
                    $up.addClass('is-dragover');
                })
                .on('dragover', function (e) {
                    if ($up.hasClass('is-dragover')) { e.preventDefault(); e.originalEvent.dataTransfer.dropEffect = 'copy'; }
                })
                .on('dragleave', function () {
                    depth = Math.max(0, depth - 1);
                    if (!depth) $up.removeClass('is-dragover');
                })
                .on('drop', function (e) {
                    e.preventDefault();
                    depth = 0;
                    $up.removeClass('is-dragover');
                    if (!$up.find('.upload__input').prop('disabled')) add(up, e.originalEvent.dataTransfer.files);
                });
        }

        return {
            init: init,
            setProgress: setProgress,
            setStatus: setStatus,
            getFiles: function (el) { el = C.get(el); return el ? $.map(files(el), function (f) { return f.file; }) : []; },
            clear: function (el) {
                el = C.get(el);
                if (!el) return;
                files(el).length = 0;
                $(el).find('.upload__list').empty();
                syncInput(el);
                setError(el, '');
            }
        };
    })();

    /* soltar um arquivo fora da área não abre o arquivo no navegador */
    $(window).on('dragover drop', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if (dt && $.inArray('Files', dt.types || []) > -1 && !$(e.target).closest('.upload').length) e.preventDefault();
    });

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
            a.style.zIndex = changed === a ? 3 : 2;
            b.style.zIndex = changed === a ? 2 : 3;
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
        $root.find('.upload').each(function () { Upload.init(this); });
        $root.find('.color-field').each(function () {
            var n = $(this).find('.color-field__native')[0];
            if (n) setColor(this, n.value.toLowerCase(), 'init');
        });
        $root.find('.slider').each(function () { sliderSync($(this)); });
    }

    $(function () { refresh(); });

    NOVAUI._onRefresh(refresh);

    NOVAUI.rte = { getHTML: RTE.getHTML, setHTML: RTE.setHTML, setDisabled: RTE.setDisabled };
    NOVAUI.upload = {
        setProgress: Upload.setProgress,
        // NOVAUI.upload.setStatus({ target: item, type: 'done'|'error', message })
        setStatus: function (o) { Upload.setStatus(o.target, o.type, o.message); },
        getFiles: Upload.getFiles,
        clear: Upload.clear
    };
})(window.jQuery, window, document);
