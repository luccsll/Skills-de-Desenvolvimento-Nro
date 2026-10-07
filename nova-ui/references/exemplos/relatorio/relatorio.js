/* Relatório de abono · JS da widget (sugestão de estrutura, não é regra).
   Os componentes (tabela, select, skeleton, toast, drawer…) já vêm do nova-ui.min.js. */
var RelatorioAbono = SuperWidget.extend({
  init: function () {
    relatorioAbono($('#RelatorioAbono_' + this.instanceId));
  },
  bindings: { local: {}, global: {} },
});

/* Relatório de abono · JS próprio da página.
   Tudo é buscado dentro de $root (a widget pode aparecer mais de uma vez na página). */
function relatorioAbono($root) {
  var POR_PAGINA = 8;
  var STATUS = {
    aberta: { texto: 'Aberta', badge: 'info' },
    analise: { texto: 'Em análise', badge: 'warning' },
    concluida: { texto: 'Concluída', badge: 'success' },
    cancelada: { texto: 'Cancelada', badge: 'danger' },
  };
  var estado = {
    tipo: 'abono',
    todos: [],
    pagina: 1,
    ordem: { key: 'data', dir: 'descending' },
    visiveis: [],
  };

  function $q(nome) {
    return $root.find('[data-report="' + nome + '"]');
  }
  function esc(s) {
    return NOVAUI.util.esc(s);
  }
  function moeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function iniciais(nome) {
    return nome
      .split(' ')
      .map(function (p) {
        return p[0];
      })
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  function dataHora(d) {
    return (
      d.toLocaleDateString('pt-BR') +
      ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  }

  /* ---------------------------------------------------------------------
     1. DADOS
     --------------------------------------------------------------------- */
  /* Busca as solicitações no dataset. Troque o nome do dataset e das colunas pelos reais. */
  function carregarDados(filtro) {
    function dia(d) {
      return d.toISOString().slice(0, 10);
    }
    return new Promise(function (resolve, reject) {
      var filtros = [
        DatasetFactory.createConstraint('DATA_INICIO', dia(filtro.de), dia(filtro.de), ConstraintType.MUST),
        DatasetFactory.createConstraint('DATA_FIM', dia(filtro.ate), dia(filtro.ate), ConstraintType.MUST),
      ];
      DatasetFactory.getDataset('ds_rota000_relatorioAbono', null, filtros, null, {
        success: function (ds) {
          resolve($.map(ds.values, converter));
        },
        error: reject,
      });
    });
  }

  function converter(r) {
    return {
      proc: +r.NUM_PROCESSO,
      tipo: r.TIPO, // 'abono' | 'desconto'
      solicitante: { nome: r.SOLICITANTE, info: r.CARGO_SOLICITANTE },
      operador: { nome: r.OPERADOR, info: 'Cód: ' + r.COD_OPERADOR },
      coordenador: { nome: r.COORDENADOR, info: 'Cód: ' + r.COD_COORDENADOR },
      turno: +r.TURNO,
      data: new Date(r.DATA_FECHAMENTO),
      praca: r.PRACA,
      qcx: +r.VALOR_QCX,
      valor: +r.VALOR,
      motivo: r.MOTIVO,
      status: r.STATUS, // 'aberta' | 'analise' | 'concluida' | 'cancelada'
    };
  }

  function periodo() {
    var p = $root.find('#report-month').val().split('-');
    return { de: new Date(+p[0], +p[1] - 1, 1), ate: new Date(+p[0], +p[1], 0, 23, 59) };
  }

  function carregar() {
    var req = carregarDados(periodo()).then(
      function (lista) {
        estado.todos = lista;
        estado.pagina = 1;
        $q('atualizado').text(
          'atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        );
        atualizarTudo();
      },
      function () {
        NOVAUI.toast({
          type: 'error',
          title: 'Não foi possível carregar',
          message: 'Tente de novo em instantes.',
        });
      },
    );
    NOVAUI.skeleton.wrap({
      target: $q('linhas')[0],
      promise: req,
      type: 'table',
      rows: POR_PAGINA,
      cols: 10,
      avatar: true,
    });
  }

  /* ---------------------------------------------------------------------
     2. INDICADORES E LISTAS
     --------------------------------------------------------------------- */
  function doTipo() {
    return $.grep(estado.todos, function (r) {
      return r.tipo === estado.tipo;
    });
  }

  function indicadores() {
    var lista = doTipo(),
      qcx = 0,
      valor = 0,
      abono = estado.tipo === 'abono';
    $.each(lista, function (i, r) {
      qcx += r.qcx;
      valor += r.valor;
    });
    var resto = Math.max(0, qcx - valor),
      pv = qcx ? Math.round((valor / qcx) * 100) : 0,
      pr = qcx ? 100 - pv : 0;

    $q('n-abono').text(
      $.grep(estado.todos, function (r) {
        return r.tipo === 'abono';
      }).length,
    );
    $q('n-desconto').text(
      $.grep(estado.todos, function (r) {
        return r.tipo === 'desconto';
      }).length,
    );
    $q('qtd').text(lista.length);
    $q('qtd-foot').text(lista.length === 1 ? 'solicitação no mês' : 'solicitações no mês');
    $q('qcx').text(moeda(qcx));
    $q('qcx-foot').text('valor original dos caixas');
    $q('valor-label').text(abono ? 'Valor abonado' : 'Valor descontado');
    $q('valor').text(moeda(valor));
    $q('valor-foot').text(pv + '% do QCX original');
    $q('valor-prog')
      .attr('aria-valuenow', pv)
      .find('.progress__bar')
      .css('--progress-value', pv + '%');
    $q('resto').text(moeda(resto));
    $q('resto-foot').text(pr + '% não ' + (abono ? 'abonado' : 'descontado'));
    $q('resto-prog')
      .attr('aria-valuenow', pr)
      .find('.progress__bar')
      .css('--progress-value', pr + '%');

    agrupar($q('pracas'), lista, 'praca', true);
    agrupar($q('motivos'), lista, 'motivo', false);
  }

  function agrupar($lista, linhas, campo, praca) {
    var grupos = {},
      total = 0;
    $.each(linhas, function (i, r) {
      var g = grupos[r[campo]] || (grupos[r[campo]] = { chave: r[campo], qtd: 0, valor: 0 });
      g.qtd++;
      g.valor += r.valor;
      total += r.valor;
    });
    var top = $.map(grupos, function (g) {
      return g;
    })
      .sort(function (a, b) {
        return b.valor - a.valor;
      })
      .slice(0, 4);
    if (!top.length) {
      return $lista.html(
        '<li><div class="empty-state empty-state--compact"><p class="empty-state__text">Sem dados no mês.</p></div></li>',
      );
    }
    $lista.html(
      $.map(top, function (g, i) {
        var pct = total ? Math.round((g.valor / total) * 100) : 0;
        var lead = praca
          ? '<span class="icon-tile icon-tile--teal icon-tile--sm"><span class="icon" aria-hidden="true">toll</span></span>'
          : '<span class="avatar avatar--sm' + (i ? '' : ' avatar--solid') + '">' + (i + 1) + 'º</span>';
        return (
          '<li><div class="list-item"><span class="list-item__leading">' +
          lead +
          '</span>' +
          '<span class="list-item__content"><span class="list-item__title">' +
          esc(praca ? 'Praça ' + g.chave : g.chave) +
          '</span>' +
          '<span class="list-item__desc">' +
          g.qtd +
          (g.qtd > 1 ? ' solicitações' : ' solicitação') +
          (praca ? ' · ' + pct + '%' : '') +
          '</span>' +
          (praca
            ? '<span class="progress progress--sm progress--teal" role="img" aria-label="' +
              pct +
              '% do total" data-pct="' +
              pct +
              '"><span class="progress__bar"></span></span>'
            : '') +
          '</span><span class="list-item__trailing"><strong>' +
          moeda(g.valor) +
          '</strong></span></div></li>'
        );
      }).join(''),
    );
    $lista.find('[data-pct]').each(function () {
      $(this)
        .find('.progress__bar')
        .css('--progress-value', $(this).attr('data-pct') + '%');
    });
  }

  /* ---------------------------------------------------------------------
     3. TABELA: busca, filtro de atividade, ordenação, seleção e paginação
     --------------------------------------------------------------------- */
  function statusMarcados() {
    return $q('status')
      .find('.tag[aria-pressed="true"]')
      .map(function () {
        return $(this).attr('data-value');
      })
      .get();
  }

  function filtradas() {
    var termo = NOVAUI.util.norm($.trim($root.find('#report-search').val())),
      sts = statusMarcados();
    $q('limpar-filtros').prop('hidden', !sts.length && !termo);
    var lista = $.grep(doTipo(), function (r) {
      if (sts.length && $.inArray(r.status, sts) < 0) return false;
      return (
        !termo ||
        NOVAUI.util
          .norm([r.proc, r.solicitante.nome, r.operador.nome, r.operador.info, r.motivo].join(' '))
          .indexOf(termo) > -1
      );
    });
    var k = estado.ordem.key,
      f = estado.ordem.dir === 'ascending' ? 1 : -1;
    function val(r) {
      return k === 'resto' ? r.qcx - r.valor : r[k] && r[k].nome ? r[k].nome : r[k];
    }
    return lista.sort(function (a, b) {
      var va = val(a),
        vb = val(b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * f;
    });
  }

  function pessoa(p) {
    return (
      '<div class="cell-user"><span class="cell-user__avatar" aria-hidden="true">' +
      iniciais(p.nome) +
      '</span><div><span class="cell-user__name">' +
      esc(p.nome) +
      '</span><span class="cell-sub">' +
      esc(p.info) +
      '</span></div></div>'
    );
  }

  function tabela() {
    var lista = filtradas(),
      paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    estado.pagina = Math.min(estado.pagina, paginas);
    var ini = (estado.pagina - 1) * POR_PAGINA;
    estado.visiveis = lista.slice(ini, ini + POR_PAGINA);
    $q('total').text(lista.length);
    $q('vazio').prop('hidden', lista.length > 0);
    $q('linhas').html(
      $.map(estado.visiveis, function (r, i) {
        var resto = r.qcx - r.valor,
          st = STATUS[r.status];
        return (
          '<tr data-i="' +
          i +
          '">' +
          '<td class="cell-check"><input type="checkbox" class="data-table__check" data-select-row aria-label="Selecionar processo ' +
          r.proc +
          '"></td>' +
          '<td><span class="report-process">' +
          r.proc +
          '</span><span class="cell-sub">' +
          r.turno +
          'º turno</span></td>' +
          '<td>' +
          pessoa(r.solicitante) +
          '</td><td>' +
          pessoa(r.operador) +
          '</td>' +
          '<td>' +
          dataHora(r.data) +
          '</td><td>' +
          r.praca +
          '</td>' +
          '<td class="cell-num">' +
          moeda(r.qcx) +
          '</td><td class="cell-num">' +
          moeda(r.valor) +
          '</td>' +
          '<td class="cell-num' +
          (resto < 0 ? ' report-negative' : '') +
          '">' +
          moeda(resto) +
          '</td>' +
          '<td><span class="badge badge--' +
          st.badge +
          '"><span class="badge__dot"></span>' +
          st.texto +
          '</span></td></tr>'
        );
      }).join(''),
    );
    NOVAUI.table.refresh('#tabela-solicitacoes');
    $q('mostrando').html(
      lista.length
        ? 'Mostrando <strong>' +
            (ini + 1) +
            '–' +
            (ini + estado.visiveis.length) +
            '</strong> de <strong>' +
            lista.length +
            '</strong>'
        : '',
    );
    paginacao(paginas);
  }

  function paginacao(total) {
    var p = estado.pagina,
      html = '';
    function botao(n, rotulo, off, atual) {
      return (
        '<li><button type="button" class="pagination__page" data-pagina="' +
        n +
        '"' +
        (atual ? ' aria-current="page"' : '') +
        (off ? ' disabled' : '') +
        (rotulo ? ' aria-label="' + rotulo + '"' : '') +
        '>' +
        (rotulo
          ? '<span class="icon" aria-hidden="true">' + (n < p ? 'chevron_left' : 'chevron_right') + '</span>'
          : n) +
        '</button></li>'
      );
    }
    html += botao(p - 1, 'Página anterior', p === 1);
    for (var n = 1; n <= total; n++) {
      if (n === 1 || n === total || Math.abs(n - p) <= 1) html += botao(n, '', false, n === p);
      else if (Math.abs(n - p) === 2) html += '<li><span class="pagination__gap">…</span></li>';
    }
    $q('paginas').html(html + botao(p + 1, 'Próxima página', p === total));
  }

  function atualizarTudo() {
    indicadores();
    tabela();
  }

  /* ---------------------------------------------------------------------
     4. DETALHE DO PROCESSO (drawer)
     --------------------------------------------------------------------- */
  function detalhe(r) {
    var resto = r.qcx - r.valor,
      st = STATUS[r.status],
      abono = r.tipo === 'abono';
    function item(dt, dd) {
      return '<div class="desc-list__item"><dt>' + dt + '</dt><dd>' + dd + '</dd></div>';
    }
    function etapa(titulo, desc, ok, atual) {
      return (
        '<li class="timeline__item"><span class="timeline__marker' +
        (ok ? ' timeline__marker--success' : atual ? ' timeline__marker--current' : '') +
        '">' +
        '<span class="icon" aria-hidden="true">' +
        (ok ? 'check' : atual ? 'schedule' : 'more_horiz') +
        '</span></span>' +
        '<div class="timeline__content"><div class="timeline__header"><p class="timeline__title">' +
        titulo +
        '</p></div><p class="timeline__desc">' +
        desc +
        '</p></div></li>'
      );
    }
    var feitas = { aberta: 1, analise: 2, concluida: 4, cancelada: 1 }[r.status];
    $q('det-avatar').text(iniciais(r.operador.nome));
    $root.find('#detalhe-processo-titulo').text('Processo ' + r.proc);
    $q('det-sub').html(
      '<span class="badge badge--' +
        st.badge +
        ' badge--sm"><span class="badge__dot"></span>' +
        st.texto +
        '</span> ' +
        (abono ? 'Abono' : 'Desconto em folha'),
    );
    $q('det-corpo').html(
      '<dl class="desc-list desc-list--horizontal desc-list--divided">' +
        item('Operador', esc(r.operador.nome) + ' · ' + esc(r.operador.info)) +
        item('Solicitante', esc(r.solicitante.nome)) +
        item('Coordenador', esc(r.coordenador.nome)) +
        item('Fechamento', dataHora(r.data) + ' · ' + r.turno + 'º turno') +
        item('Praça', r.praca) +
        item('Motivo', esc(r.motivo)) +
        item('QCX original', moeda(r.qcx)) +
        item(abono ? 'Valor abonado' : 'Valor descontado', '<strong>' + moeda(r.valor) + '</strong>') +
        item(
          'Remanescente',
          '<span' + (resto < 0 ? ' class="report-negative"' : '') + '>' + moeda(resto) + '</span>',
        ) +
        '</dl>' +
        '<h3 class="text-h4 margin-top-5 margin-bottom-3">Andamento</h3><ol class="timeline">' +
        etapa('Solicitação aberta', 'Por ' + esc(r.solicitante.nome), feitas >= 1, false) +
        (r.status === 'cancelada'
          ? '<li class="timeline__item"><span class="timeline__marker timeline__marker--danger"><span class="icon" aria-hidden="true">close</span></span><div class="timeline__content"><div class="timeline__header"><p class="timeline__title">Cancelada</p></div><p class="timeline__desc">Encerrada sem abono.</p></div></li>'
          : etapa('Avaliação da supervisão', 'Supervisor da praça', feitas >= 2, feitas === 1) +
            etapa('Avaliação CCA', 'Analista CCA', feitas >= 3, feitas === 2) +
            etapa('Concluída', 'Valor lançado', feitas >= 4, false)) +
        '</ol>',
    );
    NOVAUI.modal.open($root.find('#detalhe-processo')[0]);
  }

  /* ---------------------------------------------------------------------
     5. EVENTOS
     --------------------------------------------------------------------- */
  $root.find('[role="tablist"]').on('click', '[data-tipo]', function () {
    estado.tipo = $(this).attr('data-tipo');
    estado.pagina = 1;
    NOVAUI.table.clearSelection('#tabela-solicitacoes');
    atualizarTudo();
  });

  $root.find('#report-month').on('change', carregar);
  $q('recarregar').on('click', carregar);

  var espera;
  $root.find('#report-search').on('input', function () {
    clearTimeout(espera);
    espera = setTimeout(function () {
      estado.pagina = 1;
      tabela();
    }, 200);
  });
  $q('status').on('nova:toggle', function () {
    estado.pagina = 1;
    tabela();
  });
  $q('limpar-filtros').on('click', function () {
    $q('status').find('.tag').attr('aria-pressed', 'false');
    $root.find('#report-search').val('');
    NOVAUI.field.refresh($root[0]);
    estado.pagina = 1;
    tabela();
  });

  $root.find('#tabela-solicitacoes').on('nova:sort', function (e) {
    estado.ordem = { key: e.originalEvent.detail.key, dir: e.originalEvent.detail.direction };
    tabela();
  });

  $q('paginas').on('click', '[data-pagina]', function () {
    estado.pagina = +$(this).attr('data-pagina');
    tabela();
  });

  $q('linhas').on('click', 'tr', function (e) {
    if ($(e.target).closest('.cell-check').length) return;
    detalhe(estado.visiveis[+$(this).attr('data-i')]);
  });

  $q('det-abrir').on('click', function () {
    NOVAUI.toast({ type: 'info', message: 'Aqui abriria o processo no Fluig.' });
  });

  $q('exportar-sel').on('click', function () {
    NOVAUI.toast({
      type: 'success',
      message: NOVAUI.table.getSelected('#tabela-solicitacoes').length + ' solicitações exportadas.',
    });
  });

  // o menu é movido para o <body> quando abre: o evento é ouvido no document
  $(document).on('nova:menu-select', '#menu-exportar', function (e) {
    var formato = e.originalEvent.detail.value;
    if (formato === 'pdf') return window.print();
    NOVAUI.toast({
      type: 'success',
      message:
        filtradas().length + ' solicitações exportadas em ' + (formato === 'csv' ? 'CSV' : 'Excel') + '.',
    });
  });

  carregar();
}
