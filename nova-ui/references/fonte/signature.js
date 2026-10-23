/* =========================================================================
   NOVA UI — ASSINATURA (desenhar com mouse, dedo ou caneta)
   Só HTML, sem JS: o campo vira a área de assinatura ao carregar a página.
   A assinatura vai para o campo do formulário como imagem PNG (data URL),
   então o Fluig grava junto e as próximas etapas mostram a assinatura.

   HTML
     <div class="signature" data-signature data-required>
       <textarea name="assinatura" hidden></textarea>
     </div>
   Atributos (no .signature):
     data-signature           liga o componente
     data-required            obrigatório no NOVAUI.signature.validate()
     data-readonly            só mostra (também quando o campo está readonly/disabled)
     data-label               texto da área vazia (padrão "Assine aqui")
     data-height              altura em px (padrão 180)
     data-color               cor da tinta (padrão azul-marinho da marca)

   JS (opcional)
     NOVAUI.signature.validate(target?)    // beforeSendValidate
     NOVAUI.signature.isEmpty(target) · get(target) · set(target, dataURL)
     NOVAUI.signature.clear(target) · toFile(target, 'assinatura.png')
   Evento (no .signature): nova:signature-change { value, empty }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util;

    function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

    function Pad(el) {
        var self = this, $el = $(el);
        this.el = el;
        this.$el = $el;
        this.field = $el.find('textarea, input').filter('[name]')[0] || $el.find('textarea, input[type="hidden"]')[0];
        this.strokes = [];       // [{ points: [{x, y, t}] }] em coordenadas da área (px CSS)
        this.drawing = null;
        this.image = null;       // assinatura já gravada (etapas seguintes)
        this.color = $el.attr('data-color') || getComputedStyle(el).getPropertyValue('--signature-ink').trim() || '#283272';
        this.readonly = el.hasAttribute('data-readonly') || (this.field && (this.field.readOnly || this.field.disabled));

        var label = this.readonly ? 'Sem assinatura' : $el.attr('data-label') || 'Assine aqui';
        var h = parseInt($el.attr('data-height'), 10);
        if (h) el.style.setProperty('--signature-height', h + 'px');
        this.$box = $('<div class="signature__box">');
        this.$canvas = $('<canvas class="signature__pad" role="img">').attr('aria-label', 'Área de assinatura. Desenhe com o mouse, o dedo ou a caneta.');
        this.$hint = $('<span class="signature__hint" aria-hidden="true">').html(icon('draw') + '<span></span>');
        this.$hint.find('span:last').text(label);
        this.$box.append(this.$canvas, '<span class="signature__line" aria-hidden="true"><span class="signature__x">×</span></span>', this.$hint);
        this.$bar = $('<div class="signature__actions">').html(
            '<span class="signature__status" aria-live="polite"></span>' +
            '<button type="button" class="btn btn--tertiary btn--sm" data-signature-undo>' + icon('undo') + '<span>Desfazer</span></button>' +
            '<button type="button" class="btn btn--tertiary btn--sm" data-signature-clear>' + icon('ink_eraser') + '<span>Limpar</span></button>');
        this.$error = $('<p class="signature__error" role="alert" hidden>');
        $el.prepend(this.$box).append(this.$bar, this.$error)
            .toggleClass('is-readonly', !!this.readonly);
        if (this.readonly) this.$bar.find('button').remove();

        this.ctx = this.$canvas[0].getContext('2d');
        this.resize();
        this.load();

        if (!this.readonly) {
            var c = this.$canvas[0];
            c.addEventListener('pointerdown', function (e) { self.down(e); });
            c.addEventListener('pointermove', function (e) { self.move(e); });
            c.addEventListener('pointerup', function (e) { self.up(e); });
            c.addEventListener('pointercancel', function (e) { self.up(e); });
            this.$bar.on('click', '[data-signature-clear]', function () { self.clear(); })
                .on('click', '[data-signature-undo]', function () { self.undo(); });
        }
        // largura muda com a tela: redesenha sem perder o traço
        if (window.ResizeObserver) new ResizeObserver(function () { self.resize(); }).observe(this.$box[0]);
        else $(window).on('resize', function () { self.resize(); });
    }

    $.extend(Pad.prototype, {
        /* ----- tamanho (nítido em tela retina) ----- */
        resize: function () {
            var box = this.$box[0], w = box.clientWidth, h = box.clientHeight, r = window.devicePixelRatio || 1, c = this.$canvas[0];
            if (!w || (this.w === w && this.h === h && this.r === r)) return;
            // traços guardados em proporção, para acompanhar a nova largura
            if (this.w) {
                var sx = w / this.w, sy = h / this.h;
                $.each(this.strokes, function (i, s) { $.each(s.points, function (k, p) { p.x *= sx; p.y *= sy; }); });
            }
            this.w = w; this.h = h; this.r = r;
            c.width = Math.round(w * r);
            c.height = Math.round(h * r);
            this.ctx.setTransform(r, 0, 0, r, 0, 0);
            this.redraw();
        },

        /* ----- desenho ----- */
        point: function (e) {
            var b = this.$canvas[0].getBoundingClientRect();
            return { x: e.clientX - b.left, y: e.clientY - b.top, p: e.pressure && e.pointerType === 'pen' ? e.pressure : 0.5 };
        },

        down: function (e) {
            if (e.button && e.button !== 0) return;
            e.preventDefault();
            this.$canvas[0].setPointerCapture(e.pointerId);
            // havia uma assinatura gravada: começar a desenhar substitui
            if (this.image) { this.image = null; this.strokes = []; this.redraw(); }
            this.drawing = { points: [this.point(e)] };
            this.strokes.push(this.drawing);
            this.$el.addClass('is-drawing has-value');
            this.redraw();
        },

        move: function (e) {
            if (!this.drawing) return;
            e.preventDefault();
            var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e], self = this;
            $.each(evs.length ? evs : [e], function (i, ev) { self.drawing.points.push(self.point(ev)); });
            this.drawStroke(this.drawing, true);
        },

        up: function () {
            if (!this.drawing) return;
            this.drawing = null;
            this.$el.removeClass('is-drawing');
            this.save();
        },

        width: function (p) { return 1.6 + p * 2.4; },

        // curva suave entre os pontos (meio-ponto + curva quadrática)
        drawStroke: function (s, onlyTail) {
            var ctx = this.ctx, pts = s.points, n = pts.length;
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (n === 1) {
                ctx.beginPath();
                ctx.arc(pts[0].x, pts[0].y, this.width(pts[0].p) / 2, 0, Math.PI * 2);
                ctx.fill();
                return;
            }
            var start = onlyTail ? Math.max(1, n - 3) : 1;
            for (var i = start; i < n; i++) {
                var a = pts[i - 1], b = pts[i], prev = pts[i - 2] || a;
                var m1 = { x: (prev.x + a.x) / 2, y: (prev.y + a.y) / 2 }, m2 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
                ctx.lineWidth = this.width((a.p + b.p) / 2);
                ctx.beginPath();
                ctx.moveTo(i === 1 ? a.x : m1.x, i === 1 ? a.y : m1.y);
                ctx.quadraticCurveTo(a.x, a.y, m2.x, m2.y);
                if (i === n - 1) ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        },

        redraw: function () {
            var self = this;
            this.$el.toggleClass('has-value', !this.empty());
            if (!this.w) return;              // ainda escondido: desenha quando aparecer
            this.ctx.clearRect(0, 0, this.w, this.h);
            if (this.image) {
                var img = this.image, s = Math.min(this.w / img.width, this.h / img.height, 1);
                var iw = img.width * s, ih = img.height * s;
                this.ctx.drawImage(img, (this.w - iw) / 2, (this.h - ih) / 2, iw, ih);
            }
            $.each(this.strokes, function (i, s) { self.drawStroke(s); });
        },

        empty: function () { return !this.image && !this.strokes.length; },

        /* ----- valor no formulário ----- */
        // recorta o espaço em branco em volta e gera o PNG
        exportPng: function () {
            if (this.empty()) return '';
            var c = this.$canvas[0], ctx = this.ctx, W = c.width, H = c.height;
            var data = ctx.getImageData(0, 0, W, H).data, x0 = W, y0 = H, x1 = -1, y1 = -1;
            for (var y = 0; y < H; y++) {
                for (var x = 0; x < W; x++) {
                    if (data[(y * W + x) * 4 + 3] > 0) {
                        if (x < x0) x0 = x; if (x > x1) x1 = x;
                        if (y < y0) y0 = y; if (y > y1) y1 = y;
                    }
                }
            }
            if (x1 < 0) return '';
            var pad = Math.round(8 * this.r), w = x1 - x0 + 1 + pad * 2, h = y1 - y0 + 1 + pad * 2;
            // guarda em 1x (arquivo menor para o campo do Fluig)
            var scale = 1 / this.r, out = document.createElement('canvas');
            out.width = Math.max(1, Math.round(w * scale));
            out.height = Math.max(1, Math.round(h * scale));
            out.getContext('2d').drawImage(c, x0 - pad, y0 - pad, w, h, 0, 0, out.width, out.height);
            return out.toDataURL('image/png');
        },

        save: function () {
            var v = this.exportPng(), empty = !v;
            if (this.field) {
                this.field.value = v;
                C.fire(this.field, 'change');
            }
            this.$el.find('.signature__status').text(empty ? '' : 'Assinado');
            if (!empty) this.fail('');
            C.emit(this.el, 'nova:signature-change', { value: v, empty: empty });
        },

        load: function () {
            var self = this, v = this.field ? $.trim(this.field.value) : '';
            if (!/^data:image\//.test(v)) { this.redraw(); return; }
            var img = new Image();
            img.onload = function () {
                self.image = img;
                self.redraw();
                self.$el.find('.signature__status').text('Assinado');
            };
            img.src = v;
        },

        set: function (v) {
            this.strokes = [];
            this.image = null;
            if (this.field) this.field.value = v || '';
            if (v) this.load(); else this.redraw();
            this.$el.find('.signature__status').text(v ? 'Assinado' : '');
        },

        clear: function () {
            if (this.empty()) return;
            this.strokes = [];
            this.image = null;
            this.redraw();
            this.save();
        },

        undo: function () {
            if (this.image) return this.clear();
            if (!this.strokes.length) return;
            this.strokes.pop();
            this.redraw();
            this.save();
        },

        fail: function (msg) {
            this.$error.text(msg || '').prop('hidden', !msg);
            this.$el.toggleClass('has-error', !!msg);
        },

        validate: function () {
            var ok = !this.el.hasAttribute('data-required') || !this.empty();
            this.fail(ok ? '' : 'Assine no campo acima.');
            return ok;
        }
    });

    function pad(target) {
        var el = C.get(target);
        if (el && !$(el).is('.signature')) el = $(el).closest('.signature')[0] || $(el).find('.signature')[0];
        if (!el) return null;
        if (!el._novaSignature) init(el);
        return el._novaSignature || null;
    }

    function init(el) {
        if (el._novaSignature) return;
        el._novaSignature = new Pad(el);
    }

    function refresh(root) {
        var $r = $(C.get(root) || document);
        ($r.is('[data-signature]') ? $r : $r.find('[data-signature]')).each(function () { init(this); });
    }

    $(function () { refresh(); });
    NOVAUI._onRefresh(refresh);

    NOVAUI.signature = {
        // valida uma ou todas (use no beforeSendValidate)
        validate: function (target) {
            var ok = true;
            $(target ? pad(target) && pad(target).el : '[data-signature]').each(function () {
                var p = pad(this);
                if (p && !p.validate()) ok = false;
            });
            return ok;
        },
        isEmpty: function (target) { var p = pad(target); return p ? p.empty() : true; },
        get: function (target) { var p = pad(target); return p && p.field ? p.field.value : (p ? p.exportPng() : ''); },
        set: function (target, v) { var p = pad(target); if (p) p.set(v); },
        clear: function (target) { var p = pad(target); if (p) p.clear(); },
        // arquivo para anexar (ex.: NOVAUI.attachment.fluig.send(arquivo) manda para a aba Anexos)
        toFile: function (target, name) {
            var v = this.get(target);
            if (!v) return null;
            var bin = atob(v.split(',')[1]), arr = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            return new File([arr], name || 'assinatura.png', { type: 'image/png' });
        }
    };
})(window.jQuery, window, document);
