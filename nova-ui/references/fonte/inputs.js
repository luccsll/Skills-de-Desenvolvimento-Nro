/* =========================================================================
   NOVA UI — INPUTS (comportamento) · requer jQuery e core.js
   Delegação de eventos no document: funciona também para campos inseridos
   depois (ex.: pai x filho no Fluig).
   Limpar, contador, mostrar senha e força, máscaras (data-mask), validação
   no blur (data-validate), OTP/PIN e stepper numérico.
   API:
     NOVAUI.field.refresh(root?)                 -> recalcula valor/contador/máscaras
     NOVAUI.field.setState({ target, type, message })  type: 'error' | 'success' | 'warning' | null
     NOVAUI.field.clear(el)                      -> limpa o campo
     NOVAUI.field.validate(el)                   -> aplica data-validate; true/false
     NOVAUI.field.unmask(el)                     -> valor sem máscara (moeda: número)
     NOVAUI.field.autofill(el, valor)            -> preenche um campo .field--auto e destaca
     NOVAUI.field.isCPF(v), NOVAUI.field.isCNPJ(v)
     NOVAUI.field.otp.setState({ target, type: 'error'|'success'|null }), NOVAUI.field.otp.clear(el)
   'el' pode ser o .field, o input ou um seletor CSS.
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util;
    var ICONS = {
        error: '<span class="icon icon--filled" aria-hidden="true">error</span>',
        success: '<span class="icon icon--filled" aria-hidden="true">check_circle</span>',
        warning: '<span class="icon icon--filled" aria-hidden="true">warning</span>'
    };

    function field(el) {
        var $el = $(C.get(el));
        return $el.hasClass('field') ? $el : $el.closest('.field');
    }

    function input(el) {
        var $el = $(C.get(el));
        return $el.hasClass('field') ? $el.find('.field__input').first() : $el;
    }

    /* valor preenchido e contador de caracteres */
    function update($f) {
        var $i = $f.find('.field__input').first();
        if (!$i.length) return;
        var len = String($i.val() || '').length;
        $f.toggleClass('has-value', len > 0);
        var max = parseInt($i.attr('maxlength'), 10);
        var $count = $f.find('.field__counter');
        if ($count.length && max > 0) {
            $count.html('<span class="field__counter-current">' + len + '</span> / ' + max).toggleClass('is-limit', len >= max);
        }
    }

    function refresh(root) {
        $(root || document).find('.field').each(function () { update($(this)); });
    }

    function clear(el) {
        var $i = input(field(el));
        if (!$i.length || $i.prop('disabled') || $i.prop('readOnly')) return;
        $i.val('');
        C.fire($i, 'input');
        C.fire($i, 'change');
        $i.trigger('focus');
    }

    function setState(el, state, message) {
        var $f = field(el);
        if (!$f.length) return;
        var $i = $f.find('.field__input').first();
        $f.removeClass('field--error field--success field--warning');
        if (state) $f.addClass('field--' + state);
        $i.attr('aria-invalid', state === 'error' ? 'true' : 'false');

        var $msg = $f.find('.field__message').first();
        if (!message) {
            $msg.filter('[data-generated]').remove();
            // devolve o texto de ajuda que existia antes do erro
            $msg.not('[data-generated]').each(function () {
                var original = $(this).data('novaOriginal');
                if (original !== undefined) $(this).html(original).removeAttr('role').removeData('novaOriginal');
            });
            return;
        }
        if ($msg.length && !$msg.is('[data-generated]') && $msg.data('novaOriginal') === undefined) $msg.data('novaOriginal', $msg.html());
        if (!$msg.length) {
            var id = ($i.attr('id') || C.uid('field')) + '-msg';
            $msg = $('<p class="field__message" data-generated>').attr('id', id);
            var $footer = $f.find('.field__footer').first();
            if ($footer.length) $footer.prepend($msg); else $f.append($msg);
            $i.attr('aria-describedby', id);
        }
        $msg.attr('role', state === 'error' ? 'alert' : 'status')
            .html((ICONS[state] || '') + '<span></span>')
            .children('span').last().text(message);
    }

    /* =====================================================================
       PREENCHIDO AUTOMATICAMENTE
       <div class="field field--auto" data-auto-from="Código do operador">
       ===================================================================== */
    function autoInit(root) {
        $(root || document).find('.field--auto').each(function () {
            var $f = $(this), $i = $f.find('.field__input').first();
            if ($f.find('.field__auto').length) return;
            var from = $f.attr('data-auto-from');
            var tip = 'Preenchido automaticamente' + (from ? ' a partir de: ' + from : '') + '. Não é editável.';
            var id = ($i.attr('id') || C.uid('auto')) + '-auto';
            $i.prop('readOnly', true).attr('aria-describedby', $.trim(($i.attr('aria-describedby') || '') + ' ' + id));
            $('<span class="field__auto" tabindex="0">').attr({ id: id, 'data-tip': tip, 'aria-label': tip })
                .html('<span class="icon" aria-hidden="true">bolt</span><span class="field__auto-text">Automático</span>')
                .appendTo($f.find('.field__control').first());
        });
    }

    function autofill(el, value) {
        var $f = field(el), $i = $f.find('.field__input').first();
        if (!$i.length) return;
        $i.val(value == null ? '' : value);
        update($f);
        C.fire($i, 'change');
        $f.removeClass('is-autofilled');
        if (value) { void $f[0].offsetWidth; $f.addClass('is-autofilled'); }
    }

    /* =====================================================================
       SENHA: mostrar/ocultar e força
       ===================================================================== */
    var STRENGTH = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

    function passwordScore(v) {
        if (!v) return 0;
        var s = (v.length >= 8) + (/[a-z]/.test(v) && /[A-Z]/.test(v)) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v);
        if (v.length < 8) s = Math.min(s, 1);
        if (v.length >= 12 && s === 3) s = 4;
        return Math.max(1, s);
    }

    function updateStrength(el) {
        var $f = field(el);
        var $meter = $f.find('.password-strength');
        if (!$meter.length) $meter = $f.parent().find('.password-strength');
        var score = passwordScore(el.value);
        $meter.attr('data-score', score).find('.password-strength__text').text(STRENGTH[score]);
    }

    /* =====================================================================
       MÁSCARAS
       data-mask="cpf|cnpj|cpf-cnpj|cep|phone|date|time|datetime|placa|currency"
       ou padrão próprio: 9 = dígito, A = letra, * = letra ou dígito
       ===================================================================== */
    var PATTERNS = {
        cpf: '999.999.999-99',
        cnpj: '99.999.999/9999-99',
        cep: '99999-999',
        date: '99/99/9999',
        time: '99:99',
        datetime: '99/99/9999 99:99',
        placa: 'AAA-9*99',
        'cpf-cnpj': function (raw) { return raw.length > 11 ? PATTERNS.cnpj : PATTERNS.cpf + '999'; },
        phone: function (raw) { return raw.length > 10 ? '(99) 99999-9999' : '(99) 9999-99999'; }
    };

    function applyPattern(pattern, value) {
        var chars = value.replace(/[^0-9A-Za-z]/g, ''), out = '', i = 0;
        for (var p = 0; p < pattern.length && i < chars.length; p++) {
            var t = pattern[p], c = chars[i];
            if (t === '9') { if (/\d/.test(c)) out += c; else p--; i++; }
            else if (t === 'A') { if (/[A-Za-z]/.test(c)) out += c.toUpperCase(); else p--; i++; }
            else if (t === '*') { out += c.toUpperCase(); i++; }
            else out += t;
        }
        return out;
    }

    function formatCurrency(value, decimals) {
        var digits = String(value).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        if (!digits) return '';
        while (digits.length <= decimals) digits = '0' + digits;
        var int = digits.slice(0, digits.length - decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return decimals ? int + ',' + digits.slice(digits.length - decimals) : int;
    }

    function mask(el) {
        var type = el.getAttribute('data-mask');
        if (!type) return;
        var v = el.value, out;
        if (type === 'currency' || type === 'decimal') {
            var dec = parseInt(el.getAttribute('data-decimals'), 10);
            out = formatCurrency(v, isNaN(dec) ? 2 : dec);
        } else {
            var p = PATTERNS[type] || type;
            if (typeof p === 'function') p = p(v.replace(/\D/g, ''));
            out = applyPattern(p, v);
            if (type === 'cpf-cnpj' && out.length > 14) out = applyPattern(PATTERNS.cnpj, v);
            if (type === 'phone' && out.length === 15 && /-\d{5}$/.test(out)) out = applyPattern('(99) 99999-9999', v);
        }
        if (out !== v) {
            var atEnd = el.selectionStart === v.length;
            el.value = out;
            if (atEnd && el.setSelectionRange) el.setSelectionRange(out.length, out.length);
        }
    }

    /* valor sem máscara (moeda vira número) */
    function unmask(el) {
        var $i = $(C.get(el));
        if ($i.hasClass('field')) $i = $i.find('.field__input').first();
        if (!$i.length) return '';
        var v = String($i.val() || ''), type = $i.attr('data-mask');
        if (type === 'currency' || type === 'decimal') return v ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : null;
        return v.replace(/[^0-9A-Za-z]/g, '');
    }

    /* =====================================================================
       VALIDAÇÃO NO BLUR
       data-validate="cpf|cnpj|cpf-cnpj|email|phone|cep|date|url|required"
       Mensagem própria: data-error-message="…"
       ===================================================================== */
    function validCPF(v) {
        v = String(v).replace(/\D/g, '');
        if (v.length !== 11 || /^(\d)\1+$/.test(v)) return false;
        for (var t = 9; t < 11; t++) {
            var sum = 0;
            for (var i = 0; i < t; i++) sum += +v[i] * (t + 1 - i);
            if (+v[t] !== ((sum * 10) % 11) % 10) return false;
        }
        return true;
    }

    function validCNPJ(v) {
        v = String(v).replace(/\D/g, '');
        if (v.length !== 14 || /^(\d)\1+$/.test(v)) return false;
        var calc = function (len) {
            var sum = 0, pos = len - 7;
            for (var i = len; i >= 1; i--) {
                sum += +v[len - i] * pos--;
                if (pos < 2) pos = 9;
            }
            var r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        return calc(12) === +v[12] && calc(13) === +v[13];
    }

    function validDate(v) {
        var m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) return false;
        var d = new Date(+m[3], +m[2] - 1, +m[1]);
        return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1];
    }

    var VALIDATORS = {
        required: function (v) { return $.trim(v) !== '' || 'Campo obrigatório.'; },
        cpf: function (v) { return validCPF(v) || 'CPF inválido.'; },
        cnpj: function (v) { return validCNPJ(v) || 'CNPJ inválido.'; },
        'cpf-cnpj': function (v) { var d = v.replace(/\D/g, ''); return (d.length > 11 ? validCNPJ(d) : validCPF(d)) || 'Documento inválido.'; },
        email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'E-mail inválido.'; },
        phone: function (v) { var n = v.replace(/\D/g, '').length; return n === 10 || n === 11 || 'Telefone incompleto.'; },
        cep: function (v) { return v.replace(/\D/g, '').length === 8 || 'CEP incompleto.'; },
        date: function (v) { return validDate(v) || 'Data inválida.'; },
        url: function (v) { return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v) || 'Endereço inválido.'; }
    };

    function validate(el) {
        var $i = $(C.get(el));
        if ($i.hasClass('field')) $i = $i.find('.field__input').first();
        if (!$i.length) return true;
        var rules = ($i.attr('data-validate') || '').split(/\s+/).filter(Boolean);
        if ($i.prop('required') && rules.indexOf('required') < 0) rules.unshift('required');
        var v = String($i.val() || '');
        for (var k = 0; k < rules.length; k++) {
            if (rules[k] !== 'required' && !v) continue;
            var r = VALIDATORS[rules[k]] ? VALIDATORS[rules[k]](v) : true;
            if (r !== true) {
                setState($i, 'error', $i.attr('data-error-message') || r);
                return false;
            }
        }
        if (field($i).hasClass('field--error')) setState($i, null);
        return true;
    }

    /* =====================================================================
       OTP / PIN
       <div class="otp" data-otp="numeric|alnum"> <input class="otp__input"> …
         <input type="hidden" class="otp__value" name="…"> </div>
       evento: nova:otp-complete { value }
       ===================================================================== */
    function otpFilter($box, s) {
        return $box.attr('data-otp') === 'alnum' ? s.replace(/[^0-9A-Za-z]/g, '').toUpperCase() : s.replace(/\D/g, '');
    }

    function otpSync($box) {
        var $inputs = $box.find('.otp__input');
        var value = $inputs.map(function () { return this.value; }).get().join('');
        $box.find('.otp__value').val(value);
        $box.removeClass('is-error');
        $inputs.each(function () { $(this).toggleClass('is-filled', !!this.value); });
        if (value.length === $inputs.length) C.emit($box, 'nova:otp-complete', { value: value });
    }

    // distribui caracteres a partir da posição idx
    function otpFill($box, idx, chars) {
        var $inputs = $box.find('.otp__input');
        for (var k = 0; k < chars.length && idx + k < $inputs.length; k++) $inputs[idx + k].value = chars[k];
        $inputs.eq(Math.min(idx + chars.length, $inputs.length - 1)).trigger('focus');
        otpSync($box);
    }

    function otpInit(root) {
        $(root || document).find('.otp').each(function () {
            var $box = $(this), $inputs = $box.find('.otp__input');
            $inputs.each(function (n) {
                var $i = $(this).attr({ maxlength: '1', autocomplete: n === 0 ? 'one-time-code' : 'off' });
                if (!$i.attr('inputmode')) $i.attr('inputmode', $box.attr('data-otp') === 'alnum' ? 'text' : 'numeric');
                if (!$i.attr('aria-label')) $i.attr('aria-label', 'Dígito ' + (n + 1) + ' de ' + $inputs.length);
                if (!$i.attr('placeholder')) $i.attr('placeholder', ' ');
            });
        });
    }

    function otpSetState(box, state) {
        var $box = $(C.get(box)).removeClass('is-error is-success');
        if (state && $box.length) {
            void $box[0].offsetWidth; // reinicia a animação
            $box.addClass('is-' + state);
        }
    }

    function otpClear(box) {
        var $box = $(C.get(box));
        $box.find('.otp__input').val('').removeClass('is-filled').first().trigger('focus');
        $box.find('.otp__value').val('');
    }

    /* =====================================================================
       STEPPER NUMÉRICO
       <div class="stepper-input"><button class="stepper-input__btn" data-step="-1">
       <input class="stepper-input__value" type="number" min max step>
       <button class="stepper-input__btn" data-step="1"></div>
       ===================================================================== */
    function num(v) { return parseFloat(v); }

    function stepperSync($box) {
        var i = $box.find('.stepper-input__value')[0];
        if (!i) return;
        var min = num(i.min), max = num(i.max), v = num(i.value);
        $box.find('.stepper-input__btn').each(function () {
            var dir = num($(this).attr('data-step'));
            this.disabled = i.disabled || (!isNaN(v) && ((dir < 0 && v <= min) || (dir > 0 && v >= max)));
        });
    }

    function stepperChange($box, dir) {
        var i = $box.find('.stepper-input__value')[0];
        var step = num(i.step) || 1, min = num(i.min), max = num(i.max), v = num(i.value);
        v = isNaN(v) ? (isNaN(min) ? 0 : min) : v + dir * step;
        if (!isNaN(min)) v = Math.max(min, v);
        if (!isNaN(max)) v = Math.min(max, v);
        i.value = v.toFixed((String(step).split('.')[1] || '').length);
        C.fire(i, 'input');
        C.fire(i, 'change');
    }

    /* =====================================================================
       EVENTOS
       ===================================================================== */
    $(document)
        .on('input', function (e) {
            var t = e.target, $t = $(t);
            if (t.hasAttribute && t.hasAttribute('data-mask')) mask(t);
            if (t.hasAttribute && t.hasAttribute('data-strength')) updateStrength(t);
            if ($t.hasClass('stepper-input__value')) stepperSync($t.closest('.stepper-input'));
            if ($t.hasClass('field__input')) update(field(t));
        })
        .on('change', '.field__input', function () { update(field(this)); })
        .on('change', '.stepper-input__value', function () {
            var min = num(this.min), max = num(this.max), v = num(this.value);
            if (!isNaN(v) && v < min) this.value = min;
            if (!isNaN(v) && v > max) this.value = max;
            stepperSync($(this).closest('.stepper-input'));
        })
        // mantém o foco no input ao clicar em limpar / mostrar senha
        .on('mousedown', '.field__clear, .field__reveal', function (e) { e.preventDefault(); })
        .on('click', '.field__clear', function (e) { e.preventDefault(); clear(this); })
        .on('click', '.field__reveal', function () {
            var $i = field(this).find('.field__input').first();
            var show = $i.attr('type') === 'password';
            $i.attr('type', show ? 'text' : 'password');
            $(this).attr({ 'aria-pressed': String(show), 'aria-label': show ? 'Ocultar senha' : 'Mostrar senha' });
        })
        // clique em qualquer área do corpo foca o campo
        .on('click', '.field__body', function (e) {
            if (e.target === this) $(this).find('.field__input').not(':disabled').first().trigger('focus');
        })
        .on('click', '.stepper-input__btn', function () {
            var $box = $(this).closest('.stepper-input');
            stepperChange($box, num($(this).attr('data-step')) || 1);
            stepperSync($box);
        })
        .on('focusout', '[data-validate]', function () { if (this.value) validate(this); })
        // OTP
        .on('input', '.otp__input', function () {
            var $box = $(this).closest('.otp'), $inputs = $box.find('.otp__input');
            var chars = otpFilter($box, this.value), idx = $inputs.index(this);
            if (chars.length > 1) return otpFill($box, idx, chars); // colou ou autocompletou
            this.value = chars;
            if (chars) $inputs.eq(idx + 1).trigger('focus');
            otpSync($box);
        })
        .on('keydown', '.otp__input', function (e) {
            var $box = $(this).closest('.otp'), $inputs = $box.find('.otp__input'), idx = $inputs.index(this);
            var $prev = idx > 0 ? $inputs.eq(idx - 1) : $(), $next = $inputs.eq(idx + 1);
            if (e.key === 'Backspace' && !this.value && $prev.length) {
                e.preventDefault();
                $prev.val('').trigger('focus');
                otpSync($box);
            } else if (e.key === 'ArrowLeft' && $prev.length) {
                e.preventDefault(); $prev.trigger('focus');
            } else if (e.key === 'ArrowRight' && $next.length) {
                e.preventDefault(); $next.trigger('focus');
            }
        })
        .on('paste', '.otp__input', function (e) {
            var $box = $(this).closest('.otp');
            var data = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            var text = otpFilter($box, data);
            if (!text) return;
            e.preventDefault();
            otpFill($box, $box.find('.otp__input').index(this), text);
        })
        .on('focusin', '.otp__input', function () { this.select(); });

    function initTypes(root) {
        var $root = $(root || document);
        $root.find('[data-mask]').each(function () {
            var p = PATTERNS[$(this).attr('data-mask')];
            if (typeof p === 'string' && !this.hasAttribute('maxlength')) $(this).attr('maxlength', p.length);
            if (this.value) mask(this);
        });
        $root.find('.stepper-input').each(function () { stepperSync($(this)); });
        $root.find('[data-strength]').each(function () { updateStrength(this); });
        otpInit(root);
        autoInit(root);
    }

    $(function () {
        refresh();
        initTypes();
    });

    NOVAUI._onRefresh(function (root) { refresh(root); initTypes(root); });

    NOVAUI.field = {
        refresh: function (root) { refresh(root); initTypes(root); },
        // NOVAUI.field.setState({ target, type: 'error'|'success'|'warning'|null, message })
        setState: function (o) { setState(o.target, o.type || null, o.message); },
        clear: clear,
        validate: validate,
        unmask: unmask,
        autofill: autofill,
        isCPF: validCPF,
        isCNPJ: validCNPJ,
        otp: {
            setState: function (o) { otpSetState(o.target, o.type || null); },
            clear: otpClear
        }
    };
})(window.jQuery, window, document);
