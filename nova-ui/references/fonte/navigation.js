/* =========================================================================
   NOVA UI — NAVEGAÇÃO (comportamento) · requer jQuery e core.js
   NovaMenu      Dropdown: <button data-menu="id" data-menu-placement="bottom-end">
                 Context:  <div data-context-menu="id">
                 Submenu:  <button class="menu__item" data-submenu="id">
                 evento: nova:menu-select { item, value, checked, target }
                 NOVAUI.menu.open(menu, { trigger | anchor, placement }), NOVAUI.menu.close()
   NovaTabs      .tabs com role="tablist"/"tab"/"tabpanel"; evento nova:tab-change
                 NOVAUI.tabs.select(tab)
   NovaAnchorNav nav.anchor-nav[data-scrollspy] (data-scroll-root, data-offset)
                 NOVAUI.anchorNav.refresh(el?)
   NovaStepper   NOVAUI.stepper.set(el, index, { errors: [i] }); eventos
                 nova:step-click { index } e nova:step-change { index }
   ========================================================================= */
(function ($, window, document) {
    'use strict';
    var NOVAUI = window.NOVAUI, C = NOVAUI.util;

    /* =====================================================================
       MENU / DROPDOWN / CONTEXT MENU
       ===================================================================== */
    var NovaMenu = (function () {
        var stack = [], openedAt = 0, hoverTimer = null, typeahead = { text: '', timer: null };

        function items(menu) {
            return $(menu).find('.menu__item').filter(function () {
                return !this.disabled && $(this).attr('aria-disabled') !== 'true' && this.offsetParent !== null;
            }).get();
        }

        function entryOf(menu) {
            return $.grep(stack, function (e) { return e.menu === menu; })[0] || null;
        }

        function position(menu, anchor, placement) {
            var $m = $(menu).prop('hidden', false).css({ visibility: 'hidden', left: 0, top: 0 });
            var m = 8, mw = menu.offsetWidth, mh = menu.offsetHeight;
            var vw = document.documentElement.clientWidth, vh = window.innerHeight, x, y;
            if (anchor.width === undefined) { // ponto (botão direito)
                x = anchor.x; y = anchor.y;
                if (x + mw > vw - m) x = Math.max(m, x - mw);
                if (y + mh > vh - m) y = Math.max(m, y - mh);
            } else if (placement === 'right-start') { // submenu
                x = anchor.right - 2;
                y = anchor.top - 5;
                if (x + mw > vw - m) x = anchor.left - mw + 2;
                if (y + mh > vh - m) y = Math.max(m, vh - m - mh);
            } else {
                var p = placement || 'bottom-start', top = p.indexOf('top') === 0;
                y = top ? anchor.top - mh - 4 : anchor.bottom + 4;
                x = /end$/.test(p) ? anchor.right - mw : anchor.left;
                if (!top && y + mh > vh - m && anchor.top - mh - 4 > m) y = anchor.top - mh - 4;
                if (top && y < m) y = anchor.bottom + 4;
            }
            $m.css({ left: Math.round(Math.min(Math.max(m, x), vw - m - mw)), top: Math.round(Math.max(m, y)), visibility: '' });
        }

        function closeFrom(level, restore) {
            while (stack.length && stack[stack.length - 1].level >= level) {
                var e = stack.pop();
                $(e.menu).prop('hidden', true);
                $(e.trigger).attr('aria-expanded', 'false');
                if (restore && e.level === level && e.trigger) C.focus(e.trigger);
            }
        }

        function close(restore) { closeFrom(0, restore); }

        function open(menu, opts) {
            menu = C.get(menu);
            if (!menu) return;
            opts = opts || {};
            var level = opts.level || 0, $menu = $(menu);
            closeFrom(level);
            // dentro de um modal, o menu precisa estar no modal (camada do topo)
            var host = $(opts.trigger || opts.target || []).closest('dialog[open]')[0] || document.body;
            if (menu.parentElement !== host) host.appendChild(menu);
            $menu.attr({ role: 'menu', tabindex: -1 }).find('.menu__item').each(function () {
                var $it = $(this).attr('tabindex', -1);
                if (!$it.attr('role')) $it.attr('role', 'menuitem');
                if ($it.is('[data-submenu]')) $it.attr({ 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
            });
            position(menu, opts.anchor || (opts.trigger ? opts.trigger.getBoundingClientRect() : { x: 0, y: 0 }), opts.placement);
            $(opts.trigger).attr('aria-expanded', 'true');
            stack.push({ menu: menu, trigger: opts.trigger || null, level: level, target: opts.target || null });
            openedAt = Date.now();
            if (opts.focus !== 'none') {
                var its = items(menu);
                C.focus((opts.focus === 'last' ? its[its.length - 1] : its[0]) || menu);
            }
        }

        function openSub(item, focus) {
            var sub = document.getElementById($(item).attr('data-submenu')), parent = entryOf($(item).closest('.menu')[0]);
            if (!sub || !parent) return;
            if (entryOf(sub)) {
                if (focus) C.focus(items(sub)[0]);
                return;
            }
            open(sub, { trigger: item, anchor: item.getBoundingClientRect(), placement: 'right-start', level: parent.level + 1, target: parent.target, focus: focus ? 'first' : 'none' });
        }

        function activate(item) {
            var $it = $(item), menu = $it.closest('.menu')[0], entry = entryOf(menu), role = $it.attr('role');
            if ($it.is('[data-submenu]')) return openSub(item, true);
            var checkable = role === 'menuitemcheckbox' || role === 'menuitemradio';
            if (role === 'menuitemcheckbox') {
                $it.attr('aria-checked', String($it.attr('aria-checked') !== 'true'));
            } else if (role === 'menuitemradio') {
                var group = $it.attr('data-group');
                $(menu).find('[role="menuitemradio"]').each(function () {
                    if (!group || $(this).attr('data-group') === group) $(this).attr('aria-checked', String(this === item));
                });
            }
            var $label = $it.find('.menu__label');
            C.emit(menu, 'nova:menu-select', {
                item: item,
                value: $it.attr('data-value') || $.trim(($label.length ? $label : $it).text()),
                checked: checkable ? $it.attr('aria-checked') === 'true' : undefined,
                target: entry ? entry.target : null
            });
            if (!$it.is('[data-keep-open]') && role !== 'menuitemcheckbox') close(true);
        }

        function move(menu, current, delta) {
            var its = items(menu);
            if (!its.length) return;
            var i = its.indexOf(current);
            C.focus(its[i < 0 ? (delta > 0 ? 0 : its.length - 1) : (i + delta + its.length) % its.length]);
        }

        function findTypeahead(menu, current, ch) {
            clearTimeout(typeahead.timer);
            typeahead.text += ch.toLowerCase();
            typeahead.timer = setTimeout(function () { typeahead.text = ''; }, 500);
            var its = items(menu), start = Math.max(0, its.indexOf(current));
            for (var k = 0; k < its.length; k++) {
                var it = its[(start + (typeahead.text.length === 1 ? 1 : 0) + k) % its.length];
                if ($.trim($(it).text()).toLowerCase().indexOf(typeahead.text) === 0) return C.focus(it);
            }
        }

        function openFrom(trigger, focus) {
            var menu = document.getElementById($(trigger).attr('data-menu'));
            if (!menu) return false;
            close();
            open(menu, { trigger: trigger, placement: $(trigger).attr('data-menu-placement'), focus: focus });
            return true;
        }

        $(document)
            .on('click', function (e) {
                var $t = $(e.target), trigger = $t.closest('[data-menu]')[0];
                if (trigger) {
                    var menu = document.getElementById($(trigger).attr('data-menu'));
                    if (!menu) return;
                    e.preventDefault();
                    if (entryOf(menu)) close(); else openFrom(trigger, e.detail === 0 ? 'first' : 'menu');
                    return;
                }
                var item = $t.closest('.menu__item')[0];
                if (item && entryOf($(item).closest('.menu')[0])) {
                    if (item.tagName !== 'A') e.preventDefault();
                    return activate(item);
                }
                if (stack.length && !$t.closest('.menu').length) close();
            })
            /* botão direito */
            .on('contextmenu', '[data-context-menu]', function (e) {
                var menu = document.getElementById($(this).attr('data-context-menu'));
                if (!menu) return;
                e.preventDefault();
                e.stopPropagation();
                close();
                open(menu, { anchor: { x: e.clientX, y: e.clientY }, target: e.target, focus: 'menu' });
                C.emit(this, 'nova:context-menu', { target: e.target, menu: menu });
            })
            /* passar o mouse sincroniza o foco e abre o submenu */
            .on('mouseover', '.menu__item', function () {
                var item = this, entry = entryOf($(item).closest('.menu')[0]);
                if (!entry) return;
                if (document.activeElement !== item) C.focus(item);
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(function () {
                    if ($(item).is('[data-submenu]')) openSub(item, false);
                    else closeFrom(entry.level + 1);
                }, 120);
            })
            /* teclado */
            .on('keydown', function (e) {
                var $t = $(e.target), trigger = $t.closest('[data-menu]')[0];
                if (trigger && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    if (openFrom(trigger, e.key === 'ArrowUp' ? 'last' : 'first')) e.preventDefault();
                    return;
                }
                // área com menu de contexto: Shift+F10 ou tecla Menu
                var area = $t.closest('[data-context-menu]')[0];
                if (area && !$t.closest('.menu').length && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) {
                    var cm = document.getElementById($(area).attr('data-context-menu'));
                    if (cm) {
                        e.preventDefault();
                        var r = e.target.getBoundingClientRect();
                        close();
                        open(cm, { anchor: { x: r.left + 8, y: r.bottom }, target: e.target });
                    }
                    return;
                }
                var menu = $t.closest('.menu')[0], entry = menu && entryOf(menu);
                if (!entry) {
                    if (e.key === 'Escape' && stack.length) close(true);
                    return;
                }
                var item = $t.closest('.menu__item')[0], its;
                switch (e.key) {
                    case 'ArrowDown': e.preventDefault(); move(menu, item, 1); break;
                    case 'ArrowUp': e.preventDefault(); move(menu, item, -1); break;
                    case 'Home': e.preventDefault(); C.focus(items(menu)[0]); break;
                    case 'End': e.preventDefault(); its = items(menu); C.focus(its[its.length - 1]); break;
                    case 'Escape': e.preventDefault(); closeFrom(entry.level, true); break;
                    case 'ArrowLeft': if (entry.level > 0) { e.preventDefault(); closeFrom(entry.level, true); } break;
                    case 'ArrowRight': if ($(item).is('[data-submenu]')) { e.preventDefault(); openSub(item, true); } break;
                    case 'Enter':
                    case ' ':
                        if (!item) break;
                        if (item.tagName === 'A' && e.key === 'Enter') return close();
                        e.preventDefault();
                        activate(item);
                        break;
                    case 'Tab': close(); break;
                    default:
                        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) findTypeahead(menu, item, e.key);
                }
            });

        /* rolar a página ou redimensionar fecha */
        $(window).on('resize', function () { if (stack.length) close(); });
        document.addEventListener('scroll', function (e) {
            if (!stack.length || $(e.target).closest('.menu').length || Date.now() - openedAt < 200) return;
            close();
        }, true);

        return { open: open, close: close };
    })();

    /* =====================================================================
       TABS
       ===================================================================== */
    var NovaTabs = (function () {
        function tabsOf(list) {
            return $(list).find('[role="tab"]').filter(function () { return $(this).closest('[role="tablist"]')[0] === list; });
        }

        function show($tabs, tab) {
            $tabs.each(function () {
                var on = this === tab;
                $(this).attr('aria-selected', String(on)).prop('tabIndex', on ? 0 : -1);
                $(document.getElementById($(this).attr('aria-controls'))).prop('hidden', !on);
            });
        }

        function select(tab, focus) {
            tab = C.get(tab);
            if (!tab || tab.disabled || $(tab).attr('aria-disabled') === 'true') return;
            var list = $(tab).closest('[role="tablist"]')[0], $tabs = tabsOf(list);
            show($tabs, tab);
            if (focus) C.focus(tab);
            if (tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            C.emit($(list).closest('.tabs')[0] || list, 'nova:tab-change', {
                tab: tab, index: $tabs.index(tab), panel: document.getElementById($(tab).attr('aria-controls'))
            });
        }

        function init(root) {
            $(root || document).find('[role="tablist"]').each(function () {
                var $tabs = tabsOf(this);
                show($tabs, $tabs.filter('[aria-selected="true"]')[0] || $tabs[0]);
                $tabs.each(function () {
                    var panel = document.getElementById($(this).attr('aria-controls'));
                    if (panel && !panel.hasAttribute('tabindex')) panel.tabIndex = 0;
                });
            });
        }

        $(document)
            .on('click', '[role="tablist"] [role="tab"]', function (e) {
                if (this.tagName === 'A') e.preventDefault();
                select(this);
            })
            .on('keydown', '[role="tab"]', function (e) {
                var list = $(this).closest('[role="tablist"]')[0];
                var tabs = tabsOf(list).filter(function () { return !this.disabled && $(this).attr('aria-disabled') !== 'true'; }).get();
                var vertical = $(list).attr('aria-orientation') === 'vertical', i = tabs.indexOf(this), next = null;
                if (e.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = tabs[(i + 1) % tabs.length];
                else if (e.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = tabs[(i - 1 + tabs.length) % tabs.length];
                else if (e.key === 'Home') next = tabs[0];
                else if (e.key === 'End') next = tabs[tabs.length - 1];
                if (next) {
                    e.preventDefault();
                    select(next, true);
                }
            });

        return { select: select, refresh: init };
    })();

    /* =====================================================================
       ANCHOR NAVIGATION (scrollspy)
       ===================================================================== */
    var NovaAnchorNav = (function () {
        function targetOf(a) { return document.getElementById(decodeURIComponent($(a).attr('href').slice(1))); }

        function setup(nav) {
            if (nav._novaSpy) return;
            var $nav = $(nav), root = $($nav.attr('data-scroll-root') || [])[0] || null;
            var offset = parseInt($nav.attr('data-offset'), 10);
            if (isNaN(offset)) offset = 80;
            var pairs = $nav.find('.anchor-nav__link[href^="#"]').map(function () {
                return { link: this, target: targetOf(this) };
            }).get().filter(function (p) { return p.target; });
            var ticking = false;

            function update() {
                ticking = false;
                if (!pairs.length) return;
                var rootTop = root ? root.getBoundingClientRect().top : 0;
                var scroller = root || document.scrollingElement || document.documentElement;
                var current = pairs[0];
                $.each(pairs, function (i, p) { if (p.target.getBoundingClientRect().top - rootTop - offset <= 1) current = p; });
                if (scroller.scrollTop + (root ? root.clientHeight : window.innerHeight) >= scroller.scrollHeight - 2) current = pairs[pairs.length - 1];
                $.each(pairs, function (i, p) { $(p.link).attr('aria-current', p === current ? 'location' : null); });
                if ($nav.hasClass('anchor-nav--horizontal')) {
                    var list = $(current.link).closest('.anchor-nav__list')[0];
                    if (list) list.scrollLeft = current.link.offsetLeft - list.clientWidth / 2 + current.link.offsetWidth / 2;
                }
            }

            function onScroll() {
                if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
            }

            (root || window).addEventListener('scroll', onScroll, { passive: true });
            $(window).on('resize', onScroll);

            $nav.on('click', '.anchor-nav__link[href^="#"]', function (e) {
                var target = targetOf(this);
                if (!target) return;
                e.preventDefault();
                var behavior = C.reducedMotion() ? 'auto' : 'smooth';
                if (root) {
                    root.scrollTo({ top: target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset + 8, behavior: behavior });
                } else {
                    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset + 8, behavior: behavior });
                    if (history.replaceState) history.replaceState(null, '', $(this).attr('href'));
                }
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                C.focus(target);
            });

            nav._novaSpy = update;
            update();
        }

        function refresh(el) {
            $(el ? C.get(el) : '.anchor-nav[data-scrollspy]').each(function () {
                if (this._novaSpy) this._novaSpy(); else setup(this);
            });
        }

        return { refresh: refresh };
    })();

    /* =====================================================================
       STEPPER
       ===================================================================== */
    var NovaStepper = (function () {
        function set(el, index, opts) {
            el = C.get(el);
            if (!el) return;
            var errors = (opts && opts.errors) || [];
            $(el).find('.stepper__step').each(function (i) {
                var err = $.inArray(i, errors) > -1;
                $(this).toggleClass('is-complete', i < index && !err).toggleClass('is-current', i === index).toggleClass('is-error', err)
                    .attr('aria-current', i === index ? 'step' : null);
            });
            C.emit(el, 'nova:step-change', { index: index });
        }

        $(document).on('click', 'button.stepper__link, a.stepper__link', function () {
            var $step = $(this).closest('.stepper__step'), $stepper = $(this).closest('.stepper');
            if ($step.length && $stepper.length) C.emit($stepper, 'nova:step-click', { index: $stepper.find('.stepper__step').index($step), step: $step[0] });
        });

        return { set: set };
    })();

    $(function () {
        NovaTabs.refresh(document);
        NovaAnchorNav.refresh();
    });

    NOVAUI._onRefresh(function (root) {
        NovaTabs.refresh(root);
        NovaAnchorNav.refresh();
    });

    NOVAUI.menu = NovaMenu;
    NOVAUI.tabs = NovaTabs;
    NOVAUI.anchorNav = NovaAnchorNav;
    NOVAUI.stepper = NovaStepper;
})(window.jQuery, window, document);
