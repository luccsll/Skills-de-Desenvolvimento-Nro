/* Solicitação de abono · JS próprio do formulário.
   Os componentes (select, máscaras, campos automáticos, tour, toast…) já vêm do
   nova-ui.min.js. Aqui fica só a regra deste processo. */
$(function () {
  var TIPOS = { abono: 'Abono', desconto: 'Desconto em folha' };
  var CHAVE_BOAS_VINDAS = 'abono:boas-vindas-oculto';

  /* ---------------------------------------------------------------------
     1. TELAS: escolha do tipo → formulário
     O tipo fica gravado no campo oculto "tipo-solicitacao"; ao reabrir a
     solicitação (outras etapas), o formulário abre direto.
     --------------------------------------------------------------------- */
  function mostrarTela(n) {
    $('#tela-escolha').prop('hidden', n !== 1);
    $('#tela-formulario').prop('hidden', n !== 2);
  }

  function definirTipo(tipo) {
    var abono = tipo === 'abono';
    $('#tipo-solicitacao').val(tipo);
    $('#tipo-badge')
      .text(TIPOS[tipo])
      .attr('class', 'badge ' + (abono ? 'badge--info' : 'badge--warning'));
    $('#valor-abono')
      .closest('.field')
      .find('.field__label')
      .text(abono ? 'Valor a abonar' : 'Valor a descontar');
    $('#motivo')
      .closest('.field')
      .find('.field__label')
      .first()
      .text(abono ? 'Motivo do abono' : 'Motivo do desconto');
    $('#resumo-tipo').text(TIPOS[tipo]);
    $('#resumo-valor-rotulo').text(abono ? 'A abonar' : 'A descontar');
  }

  $('[data-request-type]').on('click', function () {
    definirTipo($(this).attr('data-request-type'));
    mostrarTela(2);
    $('#data-abertura').text(new Date().toLocaleString('pt-BR').slice(0, 16));
    atualizarResumo();
    if (NOVAUI.util.store(CHAVE_BOAS_VINDAS) !== '1') NOVAUI.modal.open('request-welcome');
  });

  $('#trocar-tipo').on('click', function () {
    mostrarTela(1);
  });

  if ($('#tipo-solicitacao').val()) {
    definirTipo($('#tipo-solicitacao').val());
    mostrarTela(2);
  }

  /* ---------------------------------------------------------------------
     2. BOAS-VINDAS E TUTORIAL
     --------------------------------------------------------------------- */
  function tutorial() {
    NOVAUI.tour({
      doneText: 'Começar',
      steps: [
        {
          target: '#request-header',
          title: 'Cabeçalho do processo',
          text: 'Tipo, situação, seus dados e a etapa atual.',
        },
        {
          target: '#parte-operador',
          title: 'Partes do formulário',
          text: 'Cada parte ganha o selo Completo quando está preenchida.',
        },
        {
          target: '#operador-codigo',
          title: 'Operador',
          text: 'Digite o código ou o nome e escolha na lista.',
          padding: 10,
        },
        {
          target: '#operador-nome',
          title: 'Campos automáticos',
          text: 'Campos com o ⚡ são preenchidos pelo sistema.',
          padding: 10,
        },
        {
          target: '#resumo',
          title: 'Resumo',
          text: 'Mostra o que falta e os valores informados.',
          placement: 'left',
        },
      ],
    });
  }

  $('#ver-tutorial').on('click', tutorial);

  $('#request-welcome').on('nova:modal-close', function (e) {
    if ($('#boas-vindas-ocultar').prop('checked')) NOVAUI.util.store(CHAVE_BOAS_VINDAS, '1');
    if (e.originalEvent.detail.value === 'confirm') setTimeout(tutorial, 250);
  });

  /* ---------------------------------------------------------------------
     3. OPERADOR E COORDENADOR: busca no dataset + campos automáticos
     Troque o nome do dataset e das colunas pelos do seu ambiente.
     --------------------------------------------------------------------- */
  function buscarNoDataset(dataset) {
    return function (termo, done) {
      var c = DatasetFactory.createConstraint('BUSCA', termo, termo, ConstraintType.MUST);
      DatasetFactory.getDataset(dataset, null, [c], null, {
        success: function (ds) {
          done(
            $.map(ds.values, function (r) {
              return {
                value: r.CODIGO,
                label: r.CODIGO + ' · ' + r.NOME,
                desc: r.FUNCAO,
                nome: r.NOME,
                mat: r.MATRICULA,
              };
            }),
          );
        },
        error: function () {
          done([]);
          NOVAUI.toast({ type: 'error', message: 'Não foi possível consultar o dataset ' + dataset + '.' });
        },
      });
    };
  }

  // pessoa: 'operador' ou 'coordenador' → campos <pessoa>-codigo, -id, -nome e -matricula
  function ligarBusca(pessoa, dataset) {
    var codigo = '#' + pessoa + '-codigo';
    NOVAUI.select.autocomplete(codigo, {
      minChars: 2,
      valueInput: '#' + pessoa + '-id',
      source: buscarNoDataset(dataset),
      onSelect: function (item) {
        $(codigo).val(item.value);
        NOVAUI.field.setState({ target: codigo, type: null });
        NOVAUI.field.autofill('#' + pessoa + '-nome', item.nome);
        NOVAUI.field.autofill('#' + pessoa + '-matricula', item.mat);
      },
    });
    // apagou o código: limpa nome e matrícula
    $(codigo).on('input', function () {
      NOVAUI.field.autofill('#' + pessoa + '-nome', '');
      NOVAUI.field.autofill('#' + pessoa + '-matricula', '');
    });
  }

  ligarBusca('operador', 'ds_rota000_operadores');
  ligarBusca('coordenador', 'ds_rota000_coordenadores');

  /* ---------------------------------------------------------------------
     4. RESUMO E PARTES COMPLETAS
     --------------------------------------------------------------------- */
  function preenchido(sel) {
    return $.trim($(sel).val()) !== '';
  }

  function dataValida() {
    return /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test($('#data-fechamento').val());
  }

  var PARTES = {
    'parte-operador': function () {
      return preenchido('#operador-id');
    },
    'parte-coordenador': function () {
      return preenchido('#coordenador-id');
    },
    'parte-fechamento': function () {
      return preenchido('#turno') && dataValida() && preenchido('#praca');
    },
    'parte-valores': function () {
      return (
        !!NOVAUI.field.unmask('#valor-qcx') &&
        !!NOVAUI.field.unmask('#valor-abono') &&
        preenchido('#motivo') &&
        preenchido('#observacao')
      );
    },
  };

  function atualizarResumo() {
    var feitas = 0;
    $.each(PARTES, function (id, completa) {
      var ok = completa();
      feitas += ok;
      $('#' + id)
        .toggleClass('is-complete', ok)
        .find('.request-section__complete')
        .prop('hidden', !ok);
      $('#request-summary-sections [data-sec="' + id + '"]').toggleClass('is-done', ok);
    });
    $('#resumo-progresso-texto').text(feitas + ' de 4 partes');
    $('#resumo-progresso')
      .attr('aria-valuenow', feitas * 25)
      .toggleClass('progress--success', feitas === 4)
      .find('.progress__bar')
      .css('--progress-value', feitas * 25 + '%');
    $('#resumo-operador').text($('#operador-nome').val() || '—');
    $('#resumo-praca').text($('#praca').val() ? $('#praca option:selected').text() : '—');
    $('#resumo-qcx').text($('#valor-qcx').val() ? 'R$ ' + $('#valor-qcx').val() : '—');
    $('#resumo-valor').text($('#valor-abono').val() ? 'R$ ' + $('#valor-abono').val() : '—');
  }

  $('#formulario-abono').on('input change', function () {
    setTimeout(atualizarResumo, 0);
  });

  $('#request-summary-sections').on('click', 'a', function (e) {
    e.preventDefault();
    document.querySelector($(this).attr('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------------------------------------------------------------
     5. VALIDAÇÃO: o Fluig chama beforeSendValidate ao clicar em Enviar
     --------------------------------------------------------------------- */
  function validar() {
    var erros = [];
    function exigir(sel, rotulo, ok) {
      ok = ok !== undefined ? ok : preenchido(sel);
      NOVAUI.field.setState({
        target: sel,
        type: ok ? null : 'error',
        message: ok ? '' : 'Campo obrigatório.',
      });
      if (!ok) erros.push({ sel: sel, rotulo: rotulo });
    }
    var abono = $('#tipo-solicitacao').val() === 'abono';
    exigir('#operador-codigo', 'Código do operador', preenchido('#operador-id'));
    exigir('#coordenador-codigo', 'Código do coordenador', preenchido('#coordenador-id'));
    exigir('#turno', 'Turno');
    exigir('#data-fechamento', 'Data e hora do fechamento', dataValida());
    exigir('#praca', 'Praça de pedágio');
    exigir('#valor-qcx', 'Valor do QCX original', !!NOVAUI.field.unmask('#valor-qcx'));
    exigir(
      '#valor-abono',
      abono ? 'Valor a abonar' : 'Valor a descontar',
      !!NOVAUI.field.unmask('#valor-abono'),
    );
    exigir('#motivo', abono ? 'Motivo do abono' : 'Motivo do desconto');
    exigir('#observacao', 'Observação');

    $('#resumo-erros-lista').html(
      $.map(erros, function (e) {
        return '<li><a href="' + e.sel + '">' + e.rotulo + '</a></li>';
      }).join(''),
    );
    $('#resumo-erros').prop('hidden', !erros.length);
    if (erros.length) $('#resumo-erros')[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    return !erros.length;
  }

  // o erro some assim que o campo é corrigido
  $('#formulario-abono').on('input change', '.field--error .field__input', function () {
    if (preenchido(this)) NOVAUI.field.setState({ target: this, type: null });
  });

  $('#resumo-erros').on('click', 'a', function (e) {
    e.preventDefault();
    var $campo = $($(this).attr('href'));
    var $alvo = $('#' + $campo.attr('id') + '-trigger');
    ($alvo.length ? $alvo : $campo).trigger('focus');
  });

  window.beforeSendValidate = function (numState, nextState) {
    if (!validar()) throw 'Há campos para corrigir. Veja a lista no topo do formulário.';
    return true;
  };
});
