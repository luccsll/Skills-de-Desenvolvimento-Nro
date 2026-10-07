/* =========================================================================
   NOVA UI — NÚCLEO · requer jQuery (o Fluig já carrega)
   Cria o objeto NOVAUI, por onde se acessa tudo pelo JavaScript.
   Carregue antes dos outros arquivos JS (o nova-ui.min.js já vem na ordem).

   NOVAUI.refresh(root)   inicia componentes inseridos depois no HTML
   NOVAUI.field           campos, máscaras, validação, campo automático
   NOVAUI.select          select, combobox, autocomplete
   NOVAUI.tags            campo de tags
   NOVAUI.rte · upload    editor de texto · upload de arquivos
   NOVAUI.table · grid    tabela · tabela editável
   NOVAUI.tree · kanban · calendar
   NOVAUI.menu · tabs · stepper · anchorNav
   NOVAUI.modal           modal e drawer
   NOVAUI.dialog          confirm e alert
   NOVAUI.toast           avisos rápidos
   NOVAUI.tour · onboarding · help
   NOVAUI.loader · skeleton
   NOVAUI.integration     datasets, protheus, rm, fluig, util (integrations.js)
   NOVAUI.util            funções de apoio (emit, esc, norm, store…)

   Componentes com variações recebem um objeto, com a variação em "type":
     NOVAUI.toast({ type: 'success', message: 'Salvo.', timeout: 5000 });
   ========================================================================= */
(function ($, window, document) {
    'use strict';

    if (!$) {
        if (window.console) console.error('Nova UI: carregue o jQuery antes da Nova UI.');
        return;
    }

    var uid = 0;

    var NOVAUI = window.NOVAUI = window.NOVAUI || {}, inits = [];

    NOVAUI.version = '1.0.0';

    NOVAUI.util = {
        // evento nativo (funciona com addEventListener e com $(el).on)
        emit: function (el, name, detail) {
            el = $(el)[0];
            if (!el) return;
            var ev;
            try {
                ev = new CustomEvent(name, { bubbles: true, detail: detail });
            } catch (e) {
                ev = document.createEvent('CustomEvent');
                ev.initCustomEvent(name, true, false, detail);
            }
            el.dispatchEvent(ev);
        },
        // input/change nativos, para o Fluig e para quem usa addEventListener
        fire: function (el, type) {
            el = $(el)[0];
            if (!el) return;
            var ev;
            try {
                ev = new Event(type, { bubbles: true });
            } catch (e) {
                ev = document.createEvent('Event');
                ev.initEvent(type, true, false);
            }
            el.dispatchEvent(ev);
        },
        // aceita elemento, jQuery, '#id', 'id' ou seletor; devolve o elemento
        get: function (el) {
            if (!el) return null;
            if (el.jquery) return el[0] || null;
            if (typeof el === 'string') return document.getElementById(el) || $(el)[0] || null;
            return el;
        },
        esc: function (s) {
            return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
            });
        },
        // sem acento e minúsculo, para buscas
        norm: function (s) {
            return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        },
        uid: function (prefix) {
            return (prefix || 'nova') + '-' + (++uid);
        },
        reducedMotion: function () {
            return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        },
        isMobile: function () {
            return window.matchMedia ? window.matchMedia('(max-width: 991.98px)').matches : window.innerWidth < 992;
        },
        // localStorage com proteção (navegador bloqueado ou cheio)
        store: function (key, value) {
            try {
                if (value === undefined) return window.localStorage.getItem(key);
                if (value === null) window.localStorage.removeItem(key);
                else window.localStorage.setItem(key, value);
            } catch (e) { /* sem storage */ }
            return null;
        },
        focus: function (el) {
            el = $(el)[0];
            if (!el) return;
            try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
        }
    };

    /* cada módulo registra aqui o que precisa rodar em HTML novo */
    NOVAUI._onRefresh = function (fn) { inits.push(fn); };

    /* inicia componentes inseridos depois (pai x filho, AJAX) */
    NOVAUI.refresh = function (root) {
        root = NOVAUI.util.get(root) || document;
        $.each(inits, function (i, fn) { fn(root); });
    };
})(window.jQuery, window, document);
