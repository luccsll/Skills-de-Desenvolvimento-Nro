/* =========================================================================
   NOVA UI — ANEXO (upload de arquivos, arrastar e soltar, aba Anexos do Fluig)
   Um componente só para anexar arquivos no formulário. Você escolhe:
     layout  'drop'   área de arrastar e soltar (FilePond)       ← padrão
             'button' botão compacto "Anexar arquivo"
     fluig   true     o arquivo vai para a aba Anexos do processo ← padrão
             false    o arquivo fica só no formulário; você envia
                      (getFiles, setProgress e setStatus)
     multiple         um arquivo (padrão) ou vários (maxFiles)

   Requer, antes do nova-ui.js (só para o layout 'drop'; sem ele a área
   continua aceitando arrastar e soltar, sem as animações do FilePond):
     <link rel="stylesheet" href="https://unpkg.com/filepond/dist/filepond.min.css">
     <script src="https://unpkg.com/filepond/dist/filepond.min.js"></script>
   Opcional (prévia de PDF):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

   HTML
     <div class="attachment" id="anexo-cnh">
       <input type="file" class="attachment__input">
       <input type="hidden" name="anexoCnhNome" id="anexoCnhNome">
     </div>

   JS
     NOVAUI.attachment.create({ target, nameField, layout, fluig, multiple, maxFiles,
                                accept, maxSize, prefix, editable, removable, required,
                                preview, previewPages, label, buttonText, onAdd, onRemove })
     NOVAUI.attachment.validate(target?)        // beforeSendValidate
     NOVAUI.attachment.get(target)              // controle já criado
     NOVAUI.attachment.getFiles(target)         // File[] anexados nesta etapa
     NOVAUI.attachment.clear(target)
     NOVAUI.attachment.setProgress({ target: item, value: 40 })
     NOVAUI.attachment.setStatus({ target: item, type: 'done'|'error'|null, message })
   As opções também podem vir no HTML: data-layout, data-fluig="false",
   data-multiple, data-max-files, data-max-size (KB), data-accept, data-prefix,
   data-required.
   Eventos (no .attachment): nova:attachment-add { file, name, item, fluig, sent }
                             nova:attachment-remove { name }
                             nova:attachment-error { message, file }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util, esc = C.esc;
    var PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    var MIME = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
    var instances = [];

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }
    function ext(name) { return String(name || '').toLowerCase().split('.').pop(); }
    function fmtSize(b) { return b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB'; }
    function fileIcon(name) {
        var e = ext(name);
        if (e === 'pdf') return 'picture_as_pdf';
        if (MIME[e] && MIME[e].indexOf('image/') === 0) return 'image';
        if ($.inArray(e, ['xls', 'xlsx', 'csv']) > -1) return 'table_view';
        return 'draft';
    }
    function resize() { requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); }); }

    /* ---------------------------------------------------------------------
       FLUIG (frame pai). Fora do Fluig tudo devolve null e o campo continua
       funcionando só na tela (útil para testar).
       --------------------------------------------------------------------- */
    var Fluig = {
        parent: function () {
            try { return window.parent && window.parent !== window && window.parent.document ? window.parent : null; } catch (e) { return null; }
        },
        uploader: function () {
            var p = this.parent();
            try { return p ? p.document.querySelector('input[type="file"]') : null; } catch (e) { return null; }
        },
        attachments: function () {
            var p = this.parent();
            try { return (p && p.ECM && p.ECM.attachmentTable && p.ECM.attachmentTable.getData()) || []; } catch (e) { return []; }
        },
        // manda o arquivo para o uploader nativo (aba Anexos)
        send: function (file) {
            var input = this.uploader(), p = this.parent();
            if (!input) return false;
            var dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            if (p.jQuery) p.jQuery(input).trigger('change');
            else input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        },
        remove: function (name) {
            var p = this.parent(), list = this.attachments(), i = -1;
            $.each(list, function (k, item) { if (item.description === name) { i = k; return false; } });
            if (i < 0 || !p || !p.WKFViewAttachment) return false;
            p.WKFViewAttachment.removeAttach([i]);
            return true;
        },
        // baixa um anexo já enviado (etapas seguintes)
        download: function (name) {
            var item = null;
            $.each(this.attachments(), function (k, a) { if (a.description === name) { item = a; return false; } });
            if (!item) return Promise.reject(new Error('Anexo "' + name + '" não encontrado na aba Anexos.'));
            return fetch('/api/public/ecm/document/downloadURL/' + item.documentId + '?version=' + (item.version || 1), { credentials: 'same-origin' })
                .then(function (r) { if (!r.ok) throw new Error('downloadURL ' + r.status); return r.json(); })
                .then(function (d) {
                    var url = d.content || d.url || d.downloadUrl || d.link;
                    if (!url) throw new Error('URL de download não reconhecida.');
                    return fetch(url, { credentials: 'same-origin' });
                })
                .then(function (r) { if (!r.ok) throw new Error('download ' + r.status); return r.blob(); })
                .then(function (b) { return new Blob([b], { type: MIME[ext(name)] || b.type }); });
        }
    };

    /* ---------------------------------------------------------------------
       PRÉVIA (imagem ou páginas de PDF com pdf.js, se estiver carregado)
       --------------------------------------------------------------------- */
    function pdfPages(blob, pages) {
        var lib = window.pdfjsLib;
        if (!lib) return Promise.resolve([]);
        if (!lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
        return blob.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf }).promise; }).then(function (pdf) {
            var n = Math.min(pdf.numPages, pages || 2), chain = Promise.resolve(), out = [];
            for (var i = 1; i <= n; i++) {
                (function (num) {
                    chain = chain.then(function () { return pdf.getPage(num); }).then(function (page) {
                        var vp = page.getViewport({ scale: 1.6 }), cv = document.createElement('canvas');
                        cv.width = vp.width; cv.height = vp.height; cv.className = 'attachment__page';
                        out.push(cv);
                        return page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
                    });
                })(i);
            }
            return chain.then(function () { return out; });
        });
    }

    /* opções que podem vir do HTML (data-*) */
    function dataOptions($el) {
        var d = {}, v;
        if ((v = $el.attr('data-layout'))) d.layout = v;
        if ($el.is('[data-fluig]')) d.fluig = $el.attr('data-fluig') !== 'false';
        if ($el.is('[data-multiple]')) d.multiple = $el.attr('data-multiple') !== 'false';
        if ((v = parseInt($el.attr('data-max-files'), 10))) d.maxFiles = v;
        if ((v = parseFloat($el.attr('data-max-size')))) d.maxSize = v;
        if ((v = $el.attr('data-accept'))) d.accept = $.map(v.split(','), function (a) { return $.trim(a) || null; });
        if ((v = $el.attr('data-prefix'))) d.prefix = v;
        if ($el.is('[data-required]')) d.required = $el.attr('data-required') !== 'false';
        return d;
    }

    /* ---------------------------------------------------------------------
       CAMPO
       --------------------------------------------------------------------- */
    function Attachment(el, o) {
        var self = this;
        this.el = el;
        this.$el = $(el);
        o = $.extend({
            layout: 'drop',
            fluig: true,
            multiple: false,
            maxFiles: 0,
            accept: ['.pdf', '.jpg', '.jpeg', '.png'],
            maxSize: 5120,              // KB
            prefix: '',
            editable: true,
            removable: false,
            required: false,
            previewPages: 2,
            label: 'Arraste o arquivo aqui ou <span class="filepond--label-action">clique para escolher</span>',
            buttonText: 'Anexar arquivo'
        }, dataOptions(this.$el), o);
        if (o.layout !== 'button') o.layout = 'drop';
        if (!o.multiple) o.maxFiles = 1;
        if (o.preview === undefined) o.preview = !o.multiple;   // com vários arquivos a prévia fica no Abrir
        if (o.multiple && o.label.indexOf('Arraste o arquivo') === 0) o.label = o.label.replace('o arquivo', 'os arquivos');
        this.o = o;
        this.nameField = C.get(o.nameField) || this.$el.find('input[type="hidden"], input[name]').not('[type="file"]')[0];
        this.items = [];
        this.urls = [];

        this.$el.addClass('attachment attachment--' + o.layout)
            .toggleClass('is-required', !!o.required)
            .toggleClass('is-multiple', !!o.multiple);

        var accept = $.map(o.accept, function (a) { return a.replace(/^\./, '').toUpperCase(); }).join(', ');
        var hint = accept + ' · até ' + fmtSize(o.maxSize * 1024) + (o.multiple ? ' cada' + (o.maxFiles ? ' · no máximo ' + o.maxFiles + ' arquivos' : '') : '');
        this.$drop = $('<div class="attachment__drop">').prependTo(el);
        this.$hint = $('<p class="attachment__hint">').text(hint).insertAfter(this.$drop);
        this.$error = $('<p class="attachment__error" role="alert" hidden>').insertAfter(this.$hint);
        this.$list = $('<div class="attachment__list" aria-live="polite">').insertAfter(this.$error);
        this.$empty = $('<p class="attachment__empty" hidden>').html(icon('attach_file') + '<span>Nenhum arquivo anexado.</span>').insertAfter(this.$list);

        var $input = this.$el.find('.attachment__input, input[type="file"]').first();
        if (!$input.length) $input = $('<input type="file" class="attachment__input">');
        $input.attr('accept', o.accept.join(',')).prop('multiple', !!o.multiple).appendTo(this.$drop);
        this.$input = $input;

        if (o.layout === 'drop' && window.FilePond) this.buildPond($input[0]);
        else this.buildNative($input);

        this.$list.on('click', '[data-attachment-remove]', function () { self.confirmRemove($(this).closest('.attachment__item')[0]); })
            .on('click', '[data-attachment-open]', function () { self.open($(this).closest('.attachment__item')[0]); });

        // nomes já gravados (etapas seguintes)
        $.each(this.storedNames(), function (i, n) { self.addEntry({ name: n, file: null, sent: false, existing: true }); });
        this.render();
        if (o.preview && this.items.length === 1 && o.fluig) this.loadExisting(this.items[0]);
    }

    $.extend(Attachment.prototype, {
        /* ----- montagem ----- */
        buildPond: function (input) {
            var self = this, o = this.o;
            this.pond = window.FilePond.create(input, {
                allowMultiple: !!o.multiple,
                maxFiles: o.multiple ? (o.maxFiles || null) : 1,
                credits: false,
                instantUpload: false,
                labelIdle: '<span class="attachment__label">' + icon('upload_file') + '<span>' + o.label + '</span></span>'
            });
            // o FilePond é só a área de soltar: o arquivo sai dele e vira um item da Nova UI
            this.pond.on('addfile', function (err, item) {
                if (err) return self.fail('Não foi possível ler o arquivo.');
                var f = item.file;
                setTimeout(function () { self.pond.removeFile(item.id); }, 0);
                self.add(f);
            });
            // o FilePond mede a altura antes do ícone carregar: recalcula depois
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { window.dispatchEvent(new Event('resize')); });
        },

        buildNative: function ($input) {
            var self = this, o = this.o, depth = 0, $drop = this.$drop;
            $input.addClass('attachment__native');
            var $zone = $('<label class="attachment__zone">');
            if (o.layout === 'button') {
                $zone.addClass('btn btn--secondary').append(icon('attach_file'), $('<span>').text(o.buttonText));
            } else {
                if (window.console && o.layout === 'drop') console.warn('Nova UI: carregue o FilePond antes do nova-ui.js para a área de soltar completa.');
                $zone.html('<span class="attachment__label">' + icon('upload_file') + '<span>' + o.label + '</span></span>');
            }
            $zone.prepend($input).appendTo($drop.addClass('attachment__drop--native'));
            $input.on('change', function () {
                if (this.files && this.files.length) self.addMany(this.files);
                this.value = '';
            });
            var hasFiles = function (e) { var dt = e.originalEvent.dataTransfer; return dt && $.inArray('Files', dt.types || []) > -1; };
            $drop.on('dragenter', function (e) {
                if (!hasFiles(e)) return;
                e.preventDefault();
                depth++;
                self.$el.addClass('is-dragover');
            }).on('dragover', function (e) {
                if (self.$el.hasClass('is-dragover')) { e.preventDefault(); e.originalEvent.dataTransfer.dropEffect = 'copy'; }
            }).on('dragleave', function () {
                depth = Math.max(0, depth - 1);
                if (!depth) self.$el.removeClass('is-dragover');
            }).on('drop', function (e) {
                e.preventDefault();
                depth = 0;
                self.$el.removeClass('is-dragover');
                if (!$input.prop('disabled')) self.addMany(e.originalEvent.dataTransfer.files);
            });
        },

        /* ----- nomes gravados no formulário ----- */
        storedNames: function () {
            var v = this.nameField ? $.trim(this.nameField.value) : '';
            if (!v) return [];
            if (v.charAt(0) === '[') { try { return JSON.parse(v); } catch (e) { /* texto simples */ } }
            return [v];
        },

        name: function () { return this.items.length ? this.items[0].name : ''; },
        names: function () { return $.map(this.items, function (it) { return it.name; }); },

        saveNames: function () {
            if (!this.nameField) return;
            var n = this.names();
            // um arquivo: o nome; vários: lista em JSON
            this.nameField.value = this.o.multiple ? (n.length ? JSON.stringify(n) : '') : (n[0] || '');
            C.fire(this.nameField, 'change');
        },

        /* ----- erros ----- */
        fail: function (msg, file) {
            this.$error.text(msg || '').prop('hidden', !msg);
            this.$el.toggleClass('has-error', !!msg);
            if (msg) C.emit(this.el, 'nova:attachment-error', { message: msg, file: file || null });
        },

        check: function (f) {
            var o = this.o, name = f.name.toLowerCase(), type = (f.type || '').toLowerCase();
            var ok = !o.accept.length || $.grep(o.accept, function (a) {
                a = a.toLowerCase();
                if (a.charAt(0) === '.') return name.slice(-a.length) === a;
                if (/\/\*$/.test(a)) return type.indexOf(a.slice(0, -1)) === 0;
                return type === a;
            }).length;
            if (!ok) return 'Tipo de arquivo não aceito. Envie ' + o.accept.join(', ') + '.';
            if (f.size > o.maxSize * 1024) return 'Arquivo muito grande. O máximo é ' + fmtSize(o.maxSize * 1024) + '.';
            if (o.multiple && o.maxFiles && this.items.length >= o.maxFiles) return 'Limite de ' + o.maxFiles + ' arquivos.';
            var dup = $.grep(this.items, function (it) { return it.file && it.file.name.slice(-f.name.length) === f.name && it.file.size === f.size; }).length;
            if (dup) return 'Este arquivo já foi anexado.';
            return null;
        },

        /* ----- anexar ----- */
        addMany: function (list) {
            var self = this;
            $.each(Array.prototype.slice.call(list), function (i, f) { self.add(f); });
        },

        add: function (f) {
            var o = this.o;
            if (!o.editable) return this.fail('Não é possível anexar arquivos nesta etapa.', f);
            var msg = this.check(f);
            if (msg) return this.fail(o.multiple ? f.name + ': ' + msg.charAt(0).toLowerCase() + msg.slice(1) : msg, f);
            // prefixo deixa claro na aba Anexos de qual campo é o arquivo
            if (o.prefix) f = new File([f], o.prefix + ' - ' + f.name, { type: f.type, lastModified: f.lastModified });
            this.fail('');
            // um arquivo só: o novo troca o anterior (que sai da aba Anexos)
            if (!o.multiple && this.items.length) this.remove(this.items[0], true);
            var sent = o.fluig ? Fluig.send(f) : false;
            var it = this.addEntry({ name: f.name, file: f, sent: sent, existing: false });
            this.saveNames();
            this.render();
            if (o.preview) this.showPreview(it, f);
            C.emit(this.el, 'nova:attachment-add', { file: f, name: f.name, item: it.el, fluig: !!o.fluig, sent: sent });
            if (o.onAdd) o.onAdd(f, this, it.el);
            resize();
        },

        addEntry: function (it) {
            it.el = $('<div class="attachment__item">')[0];
            it.el._novaAttachment = it;
            it.$card = $('<div class="attachment__file">').appendTo(it.el);
            it.$preview = $('<div class="attachment__preview" hidden>').appendTo(it.el);
            this.items.push(it);
            this.$list.append(it.el);
            this.renderItem(it);
            return it;
        },

        /* ----- remover ----- */
        confirmRemove: function (el) {
            var self = this, it = el && el._novaAttachment;
            if (!it) return;
            // só pergunta quando o arquivo já está no processo (aba Anexos)
            if (!this.o.fluig || (!it.sent && !it.existing)) return this.remove(it);
            NOVAUI.dialog.confirm({
                type: 'danger',
                title: 'Remover anexo?',
                message: 'O arquivo "' + it.name + '" sai do formulário e da aba Anexos. Depois você pode anexar outro.',
                confirmText: 'Remover'
            }).then(function (ok) { if (ok) self.remove(it); });
        },

        remove: function (it, silentRender) {
            if (typeof it === 'string') it = $.grep(this.items, function (x) { return x.name === it; })[0];
            if (!it) return;
            if (this.o.fluig && (it.sent || it.existing)) Fluig.remove(it.name);
            this.items = $.grep(this.items, function (x) { return x !== it; });
            $(it.el).remove();
            this.saveNames();
            if (!silentRender) {
                this.render();
                this.fail('');
                resize();
            }
            C.emit(this.el, 'nova:attachment-remove', { name: it.name });
            if (this.o.onRemove) this.o.onRemove(it.name, this);
        },

        clear: function () {
            var self = this;
            $.each(this.items.slice(), function (i, it) { self.remove(it, true); });
            this.render();
            this.fail('');
            resize();
        },

        /* ----- abrir ----- */
        open: function (el) {
            var self = this, it = el && el._novaAttachment;
            if (!it) return;
            if (it.file) return window.open(this.url(it.file), '_blank');
            var w = window.open('', '_blank');
            Fluig.download(it.name).then(function (b) { if (w) w.location = self.url(b); }, function (e) {
                if (w) w.close();
                self.fail(e.message);
            });
        },

        url: function (blob) {
            var u = URL.createObjectURL(blob);
            this.urls.push(u);
            return u;
        },

        /* ----- envio feito por você (fluig: false) ----- */
        item: function (target) {
            if (typeof target === 'string' && !/^[#.\[]/.test(target)) return $.grep(this.items, function (x) { return x.name === target; })[0];
            var el = C.get(target);
            return el ? el._novaAttachment || $(el).closest('.attachment__item')[0]._novaAttachment : null;
        },

        setProgress: function (target, pct) {
            var it = this.item(target);
            if (!it) return;
            it.progress = Math.max(0, Math.min(100, Math.round(pct)));
            var $bar = it.$card.find('.progress');
            // barra já na tela: só avança (mantém a animação)
            if ($bar.length && !it.status) {
                NOVAUI.progress.set({ target: $bar[0], value: it.progress });
                it.$card.find('.attachment__file-meta').text(it.progress + '%');
                return;
            }
            it.status = null;
            this.renderItem(it);
        },

        setStatus: function (target, type, message) {
            var it = this.item(target);
            if (!it) return;
            it.status = type || null;
            it.message = message || '';
            if (type) it.progress = null;
            this.renderItem(it);
        },

        files: function () { return $.map(this.items, function (it) { return it.file || null; }); },

        /* ----- desenho ----- */
        render: function () {
            var o = this.o, n = this.items.length;
            var full = o.multiple ? (o.maxFiles && n >= o.maxFiles) : n > 0;
            this.$drop.prop('hidden', full || !o.editable);
            this.$hint.prop('hidden', full || !o.editable);
            this.$empty.prop('hidden', n > 0 || o.editable);
            this.$list.prop('hidden', !n);
            this.$el.toggleClass('has-file', n > 0);
        },

        renderItem: function (it) {
            var o = this.o, name = it.name, meta;
            if (it.status === 'error') meta = it.message || 'Falha no envio';
            else if (it.status === 'done') meta = it.message || 'Enviado';
            else if (it.progress != null) meta = it.progress + '%';
            else if (it.file) meta = fmtSize(it.file.size) + (it.sent ? ' · enviado para a aba Anexos' : '');
            else meta = 'Anexado ao processo';
            var canRemove = o.removable || (o.editable && !it.existing);
            $(it.el).toggleClass('is-done', it.status === 'done').toggleClass('is-error', it.status === 'error');
            it.$card.html(
                '<span class="attachment__file-icon">' + icon(fileIcon(name)) + '</span>' +
                '<span class="attachment__file-text"><span class="attachment__file-name" title="' + esc(name) + '">' + esc(name) + '</span>' +
                '<span class="attachment__file-meta">' + esc(meta) + '</span>' +
                (it.progress != null ? '<span class="attachment__progress progress progress--sm" data-value="' + it.progress + '" role="progressbar" aria-label="Envio de ' + esc(name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + it.progress + '"><span class="progress__bar"></span></span>' : '') +
                '</span>' +
                '<span class="attachment__file-actions">' +
                '<button type="button" class="btn btn--tertiary btn--sm" data-attachment-open>' + icon('open_in_new') + '<span>Abrir</span></button>' +
                (canRemove ? '<button type="button" class="btn btn--tertiary btn--sm btn--icon" data-attachment-remove aria-label="Remover ' + esc(name) + '">' + icon('delete') + '</button>' : '') +
                '</span>');
            var $bar = it.$card.find('.progress');
            if ($bar.length && NOVAUI.progress) NOVAUI.progress.set({ target: $bar[0], value: it.progress });
        },

        showPreview: function (it, blob) {
            var type = blob.type || MIME[ext(it.name)] || '';
            it.$preview.empty().prop('hidden', true);
            if (type.indexOf('image/') === 0) {
                $('<img class="attachment__page" alt="">').attr('src', this.url(blob)).appendTo(it.$preview);
                it.$preview.prop('hidden', false);
            } else if (type === 'application/pdf') {
                pdfPages(blob, this.o.previewPages).then(function (pages) {
                    if (!pages.length) return;
                    it.$preview.append(pages).prop('hidden', false);
                }, function () { /* prévia é opcional */ });
            }
        },

        loadExisting: function (it) {
            var self = this;
            it.$preview.html('<span class="spinner spinner--sm" aria-hidden="true"></span>').prop('hidden', false);
            Fluig.download(it.name).then(function (b) { self.showPreview(it, b); }, function () { it.$preview.empty().prop('hidden', true); });
        },

        validate: function () {
            var ok = !this.o.required || this.items.length > 0;
            this.fail(ok ? '' : (this.o.multiple ? 'Anexe pelo menos um arquivo.' : 'Anexe o arquivo.'));
            return ok;
        },

        destroy: function () {
            var self = this;
            if (this.pond) this.pond.destroy();
            $.each(this.urls, function (i, u) { URL.revokeObjectURL(u); });
            this.$drop.add(this.$hint).add(this.$error).add(this.$list).add(this.$empty).remove();
            this.$el.removeClass('attachment--drop attachment--button is-required is-multiple has-file has-error is-dragover');
            instances = $.grep(instances, function (i) { return i !== self; });
        }
    });

    function get(target) {
        var el = C.get(target);
        return el ? $.grep(instances, function (i) { return i.el === el; })[0] || null : null;
    }

    /* acha o controle a partir de um item (.attachment__item) */
    function owner(target) {
        var el = C.get(target);
        return el ? get($(el).closest('.attachment')[0]) : null;
    }

    /* soltar um arquivo fora da área não abre o arquivo no navegador */
    $(window).on('dragover drop', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if (dt && $.inArray('Files', dt.types || []) > -1 && !$(e.target).closest('.attachment__drop').length) e.preventDefault();
    });

    NOVAUI.attachment = {
        // NOVAUI.attachment.create({ target, nameField, layout, fluig, multiple, maxFiles, accept, maxSize, prefix,
        //                            editable, removable, required, preview, previewPages, label, buttonText, onAdd, onRemove })
        create: function (o) {
            o = o || {};
            var el = C.get(o.target);
            if (!el) return null;
            var old = get(el);
            if (old) return old;
            var a = new Attachment(el, o);
            instances.push(a);
            return a;
        },
        get: get,
        // valida um campo ou todos (use no beforeSendValidate)
        validate: function (target) {
            var list = target ? [get(target)] : instances, ok = true;
            $.each(list, function (i, a) { if (a && !a.validate()) ok = false; });
            return ok;
        },
        getFiles: function (target) { var a = get(target); return a ? a.files() : []; },
        clear: function (target) { var a = get(target); if (a) a.clear(); },
        // NOVAUI.attachment.setProgress({ target: item, value: 40 })
        setProgress: function (o) { var a = owner(o.target); if (a) a.setProgress(C.get(o.target), o.value); },
        // NOVAUI.attachment.setStatus({ target: item, type: 'done'|'error'|null, message })
        setStatus: function (o) { var a = owner(o.target); if (a) a.setStatus(C.get(o.target), o.type, o.message); },
        fluig: Fluig
    };
})(window.jQuery, window, document);
