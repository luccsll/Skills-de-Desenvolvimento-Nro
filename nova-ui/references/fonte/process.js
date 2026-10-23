/* =========================================================================
   NOVA UI — PÁGINA DE PROCESSO (comportamento) · requer jQuery e core.js
   Liga as partes (.process-section) ao resumo (.process-summary):

     - monta a lista de partes do resumo ([data-process-sections]) com as
       partes visíveis, na ordem da tela;
     - marca como feita a parte que tem .is-complete;
     - atualiza a barra ([data-process-progress]) e o texto
       ([data-process-count]) "2 de 4 partes";
     - clique numa parte do resumo rola até ela.

   Parte completa:
     manual   NOVAUI.process.setComplete({ target: '#parte-x', complete: true })
     automático  <section class="process-section" data-process-auto>
                 fica completa quando todos os campos obrigatórios visíveis
                 dela estão preenchidos ([required] e .form-label.is-required
                 de grupos de radio/checkbox).

   Mostrar ou esconder uma parte (atributo hidden) já atualiza o resumo.

   API:
     NOVAUI.process.refresh(root?)                 recalcula tudo
     NOVAUI.process.setComplete({ target, complete })
     NOVAUI.process.isComplete(target)             true | false
   Evento: nova:process-change { done, total } no .process-summary
   ========================================================================= */
(function ($, window, document) {
    'use strict';

    var NOVAUI = window.NOVAUI = window.NOVAUI || {};
    var pending = null;

    function visible(el) {
        return !el.hidden && !$(el).closest('[hidden]').length;
    }

    /* área onde ficam as partes de um resumo */
    function scopeOf(summary) {
        var forSel = $(summary).attr('data-process-for');
        if (forSel) return $(forSel);
        var $layout = $(summary).closest('.process-layout');
        return $layout.length ? $layout : $(document.body);
    }

    function sectionsOf(summary) {
        return scopeOf(summary).find('.process-section').filter(function () { return visible(this); });
    }

    function titleOf(section) {
        var $t = $(section).find('.process-section__title').first();
        return $.trim($t.length ? $t.text() : ($(section).attr('aria-label') || section.id));
    }

    /* ----- parte completa automática ----- */
    function filled(el) {
        var $el = $(el);
        if ($el.is(':checkbox, :radio')) {
            return $el.closest('form, body').find('[name="' + el.name + '"]:checked').length > 0;
        }
        return $.trim($el.val() || '') !== '';
    }

    function autoComplete(section) {
        var ok = true;
        var $s = $(section);
        $s.find('[required]').each(function () {
            if (this.disabled || !visible(this) || $(this).is('[type="hidden"]')) return;
            if (!filled(this)) { ok = false; return false; }
        });
        if (!ok) return false;
        /* grupos de radio/checkbox marcados como obrigatórios pelo rótulo */
        $s.find('.form-group').each(function () {
            if (!visible(this) || !$(this).children('.form-label.is-required').length) return;
            var $choices = $(this).find(':radio, :checkbox');
            if ($choices.length && !$choices.filter(':checked').length) { ok = false; return false; }
        });
        if (!ok) return false;
        /* anexos obrigatórios da Nova UI */
        $s.find('.attachment').each(function () {
            var ctl = NOVAUI.attachment && NOVAUI.attachment.get ? NOVAUI.attachment.get(this) : null;
            if (!visible(this) || !ctl || !ctl.o || !ctl.o.required) return;
            var names = ctl.names ? ctl.names() : [];
            if (!names.length) { ok = false; return false; }
        });
        return ok;
    }

    function applyComplete(section, ok) {
        $(section).toggleClass('is-complete', !!ok);
    }

    /* ----- resumo ----- */
    function renderSummary(summary) {
        var $sum = $(summary);
        var $list = $sum.find('[data-process-sections]').first();
        var $secs = sectionsOf(summary);
        var done = 0;

        if ($list.length) {
            var items = [];
            $secs.each(function (i) {
                var complete = $(this).hasClass('is-complete');
                if (complete) done++;
                var $li = $('<li class="process-summary__item">')
                    .toggleClass('is-done', complete)
                    .attr('data-sec', this.id);
                var $a = $('<a class="process-summary__link">').attr('href', '#' + this.id);
                $a.append($('<span class="process-summary__mark" aria-hidden="true">').text(i + 1));
                $a.append($('<span>').text(titleOf(this)));
                if (complete) $a.append($('<span class="sr-only">').text(' (completa)'));
                items.push($li.append($a));
            });
            $list.empty().append(items);
        } else {
            done = $secs.filter('.is-complete').length;
        }

        var total = $secs.length;
        $sum.find('[data-process-count]').text(done + ' de ' + total + (total === 1 ? ' parte' : ' partes'));
        $sum.find('[data-process-progress]').each(function () {
            var pct = total ? Math.round(done / total * 100) : 0;
            if (NOVAUI.progress && NOVAUI.progress.set) NOVAUI.progress.set({ target: this, value: pct });
            $(this).toggleClass('progress--success', total > 0 && done === total);
        });
        if (NOVAUI.util && NOVAUI.util.emit) NOVAUI.util.emit(summary, 'nova:process-change', { done: done, total: total });
    }

    function refresh(root) {
        var $root = root ? $(root) : $(document);
        $root.find('.process-section[data-process-auto]').addBack('.process-section[data-process-auto]').each(function () {
            if (visible(this)) applyComplete(this, autoComplete(this));
        });
        $('.process-summary').each(function () { renderSummary(this); });
    }

    function schedule() {
        if (pending) return;
        pending = setTimeout(function () { pending = null; refresh(); }, 0);
    }

    /* campos mudaram: recalcula as partes automáticas */
    $(document).on('input change nova:attachment-add nova:attachment-remove nova:child-add nova:child-remove', '.process-section', schedule);

    /* clique numa parte do resumo */
    $(document).on('click', '.process-summary__link', function (e) {
        var target = document.getElementById(($(this).attr('href') || '').slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* parte mostrada/escondida (hidden) ou marcada como completa: refaz o resumo */
    if (window.MutationObserver) {
        $(function () {
            new MutationObserver(function (list) {
                for (var i = 0; i < list.length; i++) {
                    var t = list[i].target;
                    if (t.nodeType === 1 && $(t).is('.process-section, .process-layout, .process-layout__main')) { schedule(); return; }
                }
            }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
        });
    }

    $(function () { refresh(); });
    if (NOVAUI._onRefresh) NOVAUI._onRefresh(function () { schedule(); });

    NOVAUI.process = {
        refresh: function (root) { refresh(root); },
        // NOVAUI.process.setComplete({ target: '#parte-x', complete: true })
        setComplete: function (o) {
            $(o.target).each(function () { applyComplete(this, o.complete); });
            schedule();
        },
        isComplete: function (target) { return $(target).first().hasClass('is-complete'); }
    };
})(window.jQuery, window, document);
