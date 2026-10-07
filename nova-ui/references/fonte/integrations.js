/* =========================================================================
   NOVA UI — INTEGRAÇÕES
   Funções que conversam com sistemas e dados (sem relação com layout).
   Acesso: NOVAUI.integration.<categoria>.<função>
   Documente cada função na seção "Integrações" do showcase, usando o
   modelo de lá. Carregue depois do nova-ui.min.js.

   Categorias:
     NOVAUI.integration.datasets   consultas a datasets do Fluig
     NOVAUI.integration.protheus   APIs REST do Protheus
     NOVAUI.integration.rm         consultas ao RM
     NOVAUI.integration.fluig      usuário, processos, tarefas, GED, anexos
     NOVAUI.integration.util       formatação, datas e funções de apoio

   Exemplo de função:
     NOVAUI.integration.rm.buscarFuncionario = function (matricula) {
         return new Promise(function (resolve, reject) { … });
     };

   Convenções sugeridas:
     - funções assíncronas devolvem Promise
     - erros: rejeitar com Error(mensagem em português, para mostrar ao usuário)
   ========================================================================= */
(function (window) {
    'use strict';

    var NOVAUI = window.NOVAUI = window.NOVAUI || {};
    var integration = NOVAUI.integration = NOVAUI.integration || {};

    integration.datasets = integration.datasets || {};
    integration.protheus = integration.protheus || {};
    integration.rm = integration.rm || {};
    integration.fluig = integration.fluig || {};
    integration.util = integration.util || {};

    /* ---------------------------------------------------------------------
       DATASETS
       --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       PROTHEUS
       --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       RM
       --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       FLUIG
       --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       UTILITÁRIOS
       --------------------------------------------------------------------- */

})(window);
