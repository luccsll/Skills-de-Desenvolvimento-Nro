/* =========================================================================
   NOVA UI — INTEGRAÇÕES
   Funções que conversam com sistemas e dados (sem relação com layout).
   Acesso: NOVAUI.integration.<categoria>.<função>
   Documente cada função na seção "Integrações" do showcase, usando o
   modelo de lá. Já vem no fim do nova-ui.min.js: não precisa incluir
   outro arquivo. Quem chama as funções precisa do /webdesk/vcXMLRPC.js
   no formulário (é ele que cria o DatasetFactory).

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

    /*
     * searchLeader(searchParam, request)
     * Dados do solicitante no RM (dataset ds_global_executeQueryRm) e a
     * hierarquia acima dele: líder, supervisor, coordenador, gerente,
     * diretor e presidente.
     *   request 'solic'  → só os dados do solicitante
     *   request 'all'    → toda a hierarquia (L0 a L5)
     *   request 'CARGO'  → solicitante + o primeiro líder de cada cargo pedido
     *                      (ou acima); vários: 'GERENTE,DIRETOR' ou lista
     * Retorna uma STRING JSON: use JSON.parse. { status, data } ou
     * { status: false, message }. Síncrona.
     * Uso: NOVAUI.integration.rm.searchLeader('004871', 'GERENTE')
     * Código da equipe. Ajustes em 14/10/2026: rótulo GERENTE na
     * combinação 11011, PRESIDENTE no L5 da 10111 e retirada da chave
     * 00011 repetida (POINT Q, cópia da O).
     */
    function searchLeader(searchParam, request) {
        try {
            var dataset = "ds_global_executeQueryRm";
            var dataset_ = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("MATRICULA", searchParam, searchParam, ConstraintType.MUST)), null);
            var position_ = dataset_.values[dataset_.values.length - 1]

            var nameSolic = position_['NOME']
            var funcSolic = position_['FUNCAO']
            var directLeader = position_['NOME_LIDER']
            var secaoSolic = position_['SECAO']
            var chapaSolic = position_['CHAPA']
            var directLeaderChapa = position_['CODIGO_LIDER']

            var lookupTable = '';
            var key = '';

            if (request !== 'solic') {
                const lider = ['LIDER', 'LIDR'];
                const sup = ['SUPERVISOR', 'SUPER', 'SUPV', 'SUPRV', 'SUPRVSR', 'SUPRVISOR', 'SUPRVSR', 'SUPRVSOR'];
                const coord = ['COORDENADOR', 'COORD', 'CDR', 'CDRDR', 'CDRDR', 'MEDICO', 'MED', 'MEDIC', 'MEDICA', 'MEDICO DO TRABALHO', 'MEDICA DO TRABALHO'];
                const ger = ['GERENTE', 'GER', 'GRNT', 'GEREN', 'GRNT'];
                const dir = ['DIRETOR', 'DIR', 'DR', 'DRTR', 'DIRE', 'DRTR', 'DIRETOR', 'DIRET'];
                const pres = ['PRESIDENTE', 'PRES', 'PRESID', 'PRESIDNTE', 'PRESIDNT', 'PRESIDENCIA', 'PRESIDÊNCIA', 'ESTATUTARIO', 'ESTATUTARIA', 'ESTATUTARIO', 'ESTATUTÁRIA', 'ESTATUTÁRIOS', 'ESTATUTÁRIAS'];

                let hasLider = false;
                let hasSupervisor = false;
                let hasCoordinator = false;
                let hasGerente = false;
                let hasDiretor = false;
                let hasPresident = true;

                var dataset_00, position_00, funcEmployee_00, nameEmployee_00, secaoEmployee_00, nameLeader_00, chapaEmployee_00, chapaLeader_00
                var dataset_01, position_01, funcEmployee_01, nameEmployee_01, secaoEmployee_01, nameLeader_01, chapaEmployee_01, chapaLeader_01
                var dataset_02, position_02, funcEmployee_02, nameEmployee_02, secaoEmployee_02, nameLeader_02, chapaEmployee_02, chapaLeader_02
                var dataset_03, position_03, funcEmployee_03, nameEmployee_03, secaoEmployee_03, nameLeader_03, chapaEmployee_03, chapaLeader_03
                var dataset_04, position_04, funcEmployee_04, nameEmployee_04, secaoEmployee_04, nameLeader_04, chapaEmployee_04, chapaLeader_04
                var dataset_05, position_05, funcEmployee_05, nameEmployee_05, secaoEmployee_05, nameLeader_05, chapaEmployee_05, chapaLeader_05

                var response = new Map();

                //LIDER
                dataset_00 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", directLeaderChapa, directLeaderChapa, ConstraintType.MUST)), null);
                position_00 = dataset_00.values[dataset_00.values.length - 1] || null

                if (position_00) {
                    funcEmployee_00 = position_00['FUNCAO']
                    nameEmployee_00 = position_00['NOME']
                    secaoEmployee_00 = position_00['SECAO']
                    nameLeader_00 = position_00['NOME_LIDER']
                    chapaEmployee_00 = position_00['CHAPA']
                    chapaLeader_00 = position_00['CODIGO_LIDER']

                    var isLider_00 = lider.some(position => funcEmployee_00.toUpperCase().includes(position));
                    var isSupervisor_00 = sup.some(position => funcEmployee_00.toUpperCase().includes(position));
                    var isCoordinator_00 = coord.some(position => funcEmployee_00.toUpperCase().includes(position));
                    var isGerente_00 = ger.some(position => funcEmployee_00.toUpperCase().includes(position));
                    var isDirector_00 = dir.some(position => funcEmployee_00.toUpperCase().includes(position)) && !pres.some(position => funcEmployee_00.toUpperCase().includes(position));

                    if (isLider_00) { hasLider = true }
                    if (isSupervisor_00) { hasSupervisor = true }
                    if (isCoordinator_00) { hasCoordinator = true }
                    if (isGerente_00) { hasGerente = true }
                    if (isDirector_00) { hasDiretor = true }
                }

                //SUPERVISOR
                if (nameLeader_00) {
                    dataset_01 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", chapaLeader_00, chapaLeader_00, ConstraintType.MUST)), null);
                    position_01 = dataset_01.values[dataset_01.values.length - 1] || null

                    if (position_01) {
                        funcEmployee_01 = position_01['FUNCAO']
                        nameEmployee_01 = position_01['NOME']
                        secaoEmployee_01 = position_01['SECAO']
                        nameLeader_01 = position_01['NOME_LIDER']
                        chapaEmployee_01 = position_01['CHAPA']
                        chapaLeader_01 = position_01['CODIGO_LIDER']

                        var isLider_01 = lider.some(position => funcEmployee_01.toUpperCase().includes(position));
                        var isSupervisor_01 = sup.some(position => funcEmployee_01.toUpperCase().includes(position));
                        var isCoordinator_01 = coord.some(position => funcEmployee_01.toUpperCase().includes(position));
                        var isGerente_01 = ger.some(position => funcEmployee_01.toUpperCase().includes(position));
                        var isDirector_01 = dir.some(position => funcEmployee_01.toUpperCase().includes(position)) && !pres.some(position => funcEmployee_01.toUpperCase().includes(position));

                        if (isLider_01) { hasLider = true }
                        if (isSupervisor_01) { hasSupervisor = true }
                        if (isCoordinator_01) { hasCoordinator = true }
                        if (isGerente_01) { hasGerente = true }
                        if (isDirector_01) { hasDiretor = true }
                    }
                }

                //COORDENADOR
                if (nameLeader_01) {
                    dataset_02 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", chapaLeader_01, chapaLeader_01, ConstraintType.MUST)), null);
                    position_02 = dataset_02.values[dataset_02.values.length - 1] || null

                    if (position_02) {
                        funcEmployee_02 = position_02['FUNCAO']
                        nameEmployee_02 = position_02['NOME']
                        secaoEmployee_02 = position_02['SECAO']
                        nameLeader_02 = position_02['NOME_LIDER']
                        chapaEmployee_02 = position_02['CHAPA']
                        chapaLeader_02 = position_02['CODIGO_LIDER']

                        var isLider_02 = lider.some(position => funcEmployee_02.toUpperCase().includes(position));
                        var isSupervisor_02 = sup.some(position => funcEmployee_02.toUpperCase().includes(position));
                        var isCoordinator_02 = coord.some(position => funcEmployee_02.toUpperCase().includes(position));
                        var isGerente_02 = ger.some(position => funcEmployee_02.toUpperCase().includes(position));
                        var isDirector_02 = dir.some(position => funcEmployee_02.toUpperCase().includes(position)) && !pres.some(position => funcEmployee_02.toUpperCase().includes(position));

                        if (isLider_02) { hasLider = true }
                        if (isSupervisor_02) { hasSupervisor = true }
                        if (isCoordinator_02) { hasCoordinator = true }
                        if (isGerente_02) { hasGerente = true }
                        if (isDirector_02) { hasDiretor = true }
                    }
                }

                //GERENTE
                if (nameLeader_02) {
                    dataset_03 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", chapaLeader_02, chapaLeader_02, ConstraintType.MUST)), null);
                    position_03 = dataset_03.values[dataset_03.values.length - 1] || null

                    if (position_03) {
                        funcEmployee_03 = position_03['FUNCAO']
                        nameEmployee_03 = position_03['NOME']
                        secaoEmployee_03 = position_03['SECAO']
                        nameLeader_03 = position_03['NOME_LIDER']
                        chapaEmployee_03 = position_03['CHAPA']
                        chapaLeader_03 = position_03['CODIGO_LIDER']

                        var isLider_03 = lider.some(position => funcEmployee_03.toUpperCase().includes(position));
                        var isSupervisor_03 = sup.some(position => funcEmployee_03.toUpperCase().includes(position));
                        var isCoordinator_03 = coord.some(position => funcEmployee_03.toUpperCase().includes(position));
                        var isGerente_03 = ger.some(position => funcEmployee_03.toUpperCase().includes(position));
                        var isDirector_03 = dir.some(position => funcEmployee_03.toUpperCase().includes(position)) && !pres.some(position => funcEmployee_03.toUpperCase().includes(position));

                        if (isLider_03) { hasLider = true }
                        if (isSupervisor_03) { hasSupervisor = true }
                        if (isCoordinator_03) { hasCoordinator = true }
                        if (isGerente_03) { hasGerente = true }
                        if (isDirector_03) { hasDiretor = true }
                    }
                }

                //DIRETOR
                if (nameLeader_03) {
                    dataset_04 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", chapaLeader_03, chapaLeader_03, ConstraintType.MUST)), null);
                    position_04 = dataset_04.values[dataset_04.values.length - 1] || null

                    if (position_04) {
                        funcEmployee_04 = position_04['FUNCAO']
                        nameEmployee_04 = position_04['NOME']
                        secaoEmployee_04 = position_04['SECAO']
                        nameLeader_04 = position_04['NOME_LIDER']
                        chapaEmployee_04 = position_04['CHAPA']
                        chapaLeader_04 = position_04['CODIGO_LIDER']

                        var isLider_04 = lider.some(position => funcEmployee_04.toUpperCase().includes(position));
                        var isSupervisor_04 = sup.some(position => funcEmployee_04.toUpperCase().includes(position));
                        var isCoordinator_04 = coord.some(position => funcEmployee_04.toUpperCase().includes(position));
                        var isGerente_04 = ger.some(position => funcEmployee_04.toUpperCase().includes(position));
                        var isDirector_04 = dir.some(position => funcEmployee_04.toUpperCase().includes(position)) && !pres.some(position => funcEmployee_04.toUpperCase().includes(position));
                        var isPresident_04 = pres.some(position => secaoEmployee_04.toUpperCase().includes(position));

                        if (isLider_04) { hasLider = true }
                        if (isSupervisor_04) { hasSupervisor = true }
                        if (isCoordinator_04) { hasCoordinator = true }
                        if (isGerente_04) { hasGerente = true }
                        if (isDirector_04) { hasDiretor = true }
                        if (isPresident_04) { hasPresident = true }
                    }
                }

                //PRESIDENTE
                if (nameLeader_04) {
                    dataset_05 = DatasetFactory.getDataset(dataset, null, new Array(DatasetFactory.createConstraint("PARAM", chapaLeader_04, chapaLeader_04, ConstraintType.MUST)), null);
                    position_05 = dataset_05.values[dataset_05.values.length - 1] || null

                    if (position_05) {
                        funcEmployee_05 = position_05['FUNCAO']
                        nameEmployee_05 = position_05['NOME']
                        secaoEmployee_05 = position_05['SECAO']
                        nameLeader_05 = position_05['NOME_LIDER']
                        chapaEmployee_05 = position_05['CHAPA']
                        chapaLeader_05 = position_05['CODIGO_LIDER']

                        var isPresident_05 = pres.some(position => secaoEmployee_05.toUpperCase().includes(position));
                        if (isPresident_05) { hasPresident = true }
                    }
                }

                if (hasLider) {
                    key = `${+hasLider}${+hasSupervisor}${+hasCoordinator}${+hasGerente}${+hasDiretor}${+hasPresident}`;
                } else {
                    key = `${+hasSupervisor}${+hasCoordinator}${+hasGerente}${+hasDiretor}${+hasPresident}`;
                }

                lookupTable = {
                    "11111": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'A' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameEmployee_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_04, 'MATRICULA': chapaEmployee_04, 'FUNCAO': funcEmployee_04, 'SECAO': secaoEmployee_04, 'LIDER': nameLeader_04 }]
                    ]),
                    "11101": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'B' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }]
                    ]),
                    "11011": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'C' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }]
                    ]),
                    "11001": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'D' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "10111": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'E' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }]
                    ]),
                    "10101": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'F' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "10011": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'G' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "10001": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'H' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }]
                    ]),
                    "01111": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'I' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }]
                    ]),
                    "01101": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'J' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "01011": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'K' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "01001": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'L' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }]
                    ]),
                    "00111": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'M' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "00101": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'N' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }]
                    ]),
                    "00011": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'O' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }]
                    ]),
                    "00001": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'P' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': null, 'MATRICULA': null, 'FUNCAO': null, 'SECAO': null, 'LIDER': null }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }]
                    ]),
                    "111111": response = new Map([
                        ['DADOS-SOLIC', { 'NOMESOLIC': nameSolic, 'FUNCSOLIC': funcSolic, 'hasLider': hasLider, 'hasSupervisor': hasSupervisor, 'hasCoordinator': hasCoordinator, 'hasGerente': hasGerente, 'hasDiretor': hasDiretor, 'POINT': 'R' }],
                        ['L0', { 'DENOMINATION': 'LÍDER', 'NOME': nameEmployee_00, 'MATRICULA': chapaEmployee_00, 'FUNCAO': funcEmployee_00, 'SECAO': secaoEmployee_00, 'LIDER': nameLeader_00 }],
                        ['L1', { 'DENOMINATION': 'SUPERVISOR', 'NOME': nameEmployee_01, 'MATRICULA': chapaEmployee_01, 'FUNCAO': funcEmployee_01, 'SECAO': secaoEmployee_01, 'LIDER': nameLeader_01 }],
                        ['L2', { 'DENOMINATION': 'COORDENADOR', 'NOME': nameEmployee_02, 'MATRICULA': chapaEmployee_02, 'FUNCAO': funcEmployee_02, 'SECAO': secaoEmployee_02, 'LIDER': nameLeader_02 }],
                        ['L3', { 'DENOMINATION': 'GERENTE', 'NOME': nameEmployee_03, 'MATRICULA': chapaEmployee_03, 'FUNCAO': funcEmployee_03, 'SECAO': secaoEmployee_03, 'LIDER': nameLeader_03 }],
                        ['L4', { 'DENOMINATION': 'DIRETOR', 'NOME': nameEmployee_04, 'MATRICULA': chapaEmployee_04, 'FUNCAO': funcEmployee_04, 'SECAO': secaoEmployee_04, 'LIDER': nameLeader_04 }],
                        ['L5', { 'DENOMINATION': 'PRESIDENTE', 'NOME': nameEmployee_05, 'MATRICULA': chapaEmployee_05, 'FUNCAO': funcEmployee_05, 'SECAO': secaoEmployee_05, 'LIDER': nameLeader_05 }]
                    ])
                    // ,"00000": console.log("Não tem nenhum cargo acima")
                };
            }

            switch (request) {
                case "all":
                    return JSON.stringify(
                        { status: true, data: Object.fromEntries(lookupTable[key]) },
                        null,
                        2
                    );

                case "solic":
                    return JSON.stringify(
                        { status: true, data: { nameSolic, funcSolic, directLeader, secaoSolic, chapaSolic } },
                        null,
                        2
                    );

                default:
                    response = lookupTable[key]

                    const hierarchyOrder = {
                        "L0": "LIDER",
                        "L1": "SUPERVISOR",
                        "L2": "COORDENADOR",
                        "L3": "GERENTE",
                        "L4": "DIRETOR",
                        "L5": "PRESIDENTE"
                    };

                    const hierarchyIndex = {
                        "LIDER": 0,
                        "SUPERVISOR": 1,
                        "COORDENADOR": 2,
                        "GERENTE": 3,
                        "DIRETOR": 4,
                        "PRESIDENTE": 5
                    };

                    const requestedRoles = Array.isArray(request)
                        ? request.map(r => r.trim().toUpperCase())
                        : request.split(",").map(r => r.trim().toUpperCase());

                    const leaders = [response.get("DADOS-SOLIC")];

                    const foundRoles = new Set();

                    for (let requestedRole of requestedRoles) {
                        let found = false;
                        for (const [key, value] of Object.entries(hierarchyOrder)) {
                            const leaderData = response.get(key);

                            if (
                                leaderData &&
                                leaderData.NOME !== null &&
                                hierarchyIndex[value] >= hierarchyIndex[requestedRole]
                            ) {
                                if (!leaders.some(leader => leader.NOME === leaderData.NOME)) {
                                    leaders.push(leaderData);
                                    foundRoles.add(value);
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) continue;
                    }

                    leaders.sort((a, b) => {
                        return hierarchyIndex[a.DENOMINATION] - hierarchyIndex[b.DENOMINATION];
                    });

                    return JSON.stringify(
                        { status: true, data: leaders },
                        null,
                        2
                    );
            }

        } catch (error) {
            return JSON.stringify(
                {
                    status: false,
                    message: error.stack
                },
                null,
                2
            );
        }
    }

    /*
     * searchTeam(chapa, request)
     * Equipe de um líder (dataset ds_rota009_buscaLiderados).
     *   request 'all'    → equipe completa, cada membro com a própria EQUIPE
     *   outro valor      → só os liderados diretos (EQUIPE vazia)
     * Retorna um OBJETO: { status: true, data: { LEADER, EQUIPE } } ou
     * { status: false, message } ('Líder não encontrado' ou o erro). Síncrona.
     * Uso: NOVAUI.integration.rm.searchTeam('004871', 'all')
     * Código da equipe. Ajuste em 14/10/2026: try/catch, devolvendo
     * { status: false, message } em caso de erro, como a searchLeader.
     */
    function searchTeam(chapa, request) {
        try {
            console.log(`Buscando equipe para o líder com chapa: ${chapa}, request: ${request}`);

            const coord = ['COORDENADOR', 'COORD', 'CDR', 'CDRDR', 'MEDICO', 'MED', 'MEDIC', 'MEDICA', 'MEDICO DO TRABALHO', 'MEDICA DO TRABALHO'];
            const ger = ['GERENTE', 'GER', 'GRNT', 'GEREN'];
            const dir = ['DIRETOR', 'DIR', 'DR', 'DRTR', 'DIRE', 'DIRET'];
            const pres = ['PRESIDENTE', 'PRES', 'PRESID', 'PRESIDNTE', 'PRESIDNT', 'PRESIDENCIA', 'PRESIDÊNCIA', 'ESTATUTARIO', 'ESTATUTARIA', 'ESTATUTÁRIA', 'ESTATUTÁRIOS', 'ESTATUTÁRIAS'];

            function getLiderLevel(funcao) {
                funcao = (funcao || "").toUpperCase();
                if (pres.some(term => funcao.includes(term))) return 'presidente';
                if (dir.some(term => funcao.includes(term))) return 'diretor';
                if (ger.some(term => funcao.includes(term))) return 'gerente';
                if (coord.some(term => funcao.includes(term))) return 'coordenador';
                return 'supervisor';
            }

            const chapaOriginal = chapa;

            function montarEquipe(lider, visitados) {
                if (!visitados) visitados = {};
                if (visitados[lider.CHAPA]) return [];

                visitados[lider.CHAPA] = true;

                const ctLiderados = DatasetFactory.createConstraint('CODIGO_LIDER', lider.CHAPA, lider.CHAPA, ConstraintType.MUST);
                const dsLiderados = DatasetFactory.getDataset('ds_rota009_buscaLiderados', null, [ctLiderados], null);

                const equipe = [];

                if (dsLiderados?.values?.length > 0) {
                    dsLiderados.values.forEach(function (liderado) {
                        if (liderado.CHAPA !== chapaOriginal && !visitados[liderado.CHAPA]) {
                            const membro = {
                                CHAPA: liderado.CHAPA,
                                NOME: liderado.NOME,
                                FUNCAO: liderado.FUNCAO,
                                SECAO: liderado.SECAO,
                                CODIGO_LIDER: liderado.CODIGO_LIDER,
                                EQUIPE: request === 'all' ? montarEquipe(liderado, visitados) : []
                            };
                            equipe.push(membro);
                        }
                    });
                }

                return equipe;
            }

            const ctLider = DatasetFactory.createConstraint('CHAPA', chapa, chapa, ConstraintType.MUST);
            const dsLider = DatasetFactory.getDataset('ds_rota009_buscaLiderados', null, [ctLider], null);

            if (!dsLider?.values?.length) {
                return { status: false, message: "Líder não encontrado" };
            }

            const lider = dsLider.values[0];
            const funcao = lider.FUNCAO;
            const nivel = getLiderLevel(funcao);

            const equipe = montarEquipe(lider, {});

            const result = {
                status: true,
                data: {
                    LEADER: {
                        nome: lider.NOME,
                        funcao: lider.FUNCAO,
                        chapa: lider.CHAPA,
                        secao: lider.SECAO,
                        codigoLider: lider.CODIGO_LIDER,
                    },
                    EQUIPE: equipe
                }
            };

            return result;
        } catch (error) {
            return { status: false, message: error.stack };
        }
    }

    integration.rm.searchLeader = searchLeader;
    integration.rm.searchTeam = searchTeam;

    /* ---------------------------------------------------------------------
       FLUIG
       --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       UTILITÁRIOS
       --------------------------------------------------------------------- */

})(window);
