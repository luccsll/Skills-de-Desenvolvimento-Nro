# Gerar Guia de Deploy — Processo Fluig

Produza um arquivo Markdown chamado `deploy_<nome_do_processo>.md` na raiz do projeto.

Este documento é um guia operacional passo a passo para outro desenvolvedor publicar o processo pela primeira vez em produção. Não liste pré-requisitos óbvios. Foque em o que fazer, onde fazer e em que ordem, dentro do próprio Fluig e do Fluig Studio.

> Se as skills de validação de nomenclatura e/ou revisão de qualidade de código já rodaram para este processo, inclua o resultado delas (✅ ou ⚠️ com link para `inconsistencias.md` / `code_review.md`) no topo deste documento.

```
# Deploy — Processo <número> - <nome>

## Ordem de publicação

> Siga exatamente esta ordem.

1. Datasets personalizados
2. Serviços autorizados / Authorized Clients (se houver)
3. Formulário
4. Grupos e permissões
5. Workflow (processo)
6. Validação

> ⚠️ O formulário e os grupos **devem estar configurados antes** do workflow.
> Publicar o processo sem o formulário vinculado ou sem os grupos das
> atividades configurados impede a liberação de versão.

---

## 1. Datasets personalizados

1. No **Fluig Studio**, na visão **Explorador de Pacotes**, selecione os
   datasets do projeto
2. Clique com o botão direito → **Exportar**
3. Na tela de exportação, selecione **Fluig → Exportar para o servidor Fluig**
4. Informe o servidor de destino, marque a opção **Novo Dataset** para cada
   dataset que ainda não existe no servidor
5. Preencha a descrição de cada dataset conforme a tabela abaixo e clique
   em **Finish**
6. No Fluig, acesse **Painel de Controle → Datasets** e confirme que os
   datasets abaixo estão listados:

<Para cada dataset encontrado em datasets/, procure um comentário no topo
com "Descrição:" ou similar. Se não encontrar, escreva:
"⚠️ Descrição não informada — solicitar ao desenvolvedor antes do deploy.">

| Dataset | Descrição | Arquivo |
|---|---|---|
| `<nome_do_dataset>` | <descrição ou aviso de pendência> | `datasets/<nome_do_dataset>.js` |

---

## 2. Serviços autorizados (Authorized Clients)

<Omita esta seção inteira se o projeto não usar
fluigAPI.getAuthorizeClientService(). Se usar, para cada serviceCode
encontrado no código:>

**Service: `<serviceCode>`**

1. No Fluig, acesse **Painel de Controle → Serviços → Clientes Autorizados**
2. Clique em **Novo**
3. Preencha:
   - Código do serviço: `<serviceCode>` ← exatamente este
   - URL base: `<endpoint_base>`
   - Tipo de autenticação: `<Basic / OAuth / Bearer>`
4. Salve e anote o ID gerado

> ⚠️ O `serviceCode` é case-sensitive. Se estiver errado, o workflow lança
> exceção na service task sem mensagem de erro clara.

---

## 3. Formulário

1. No **Fluig Studio**, na visão **Explorador de Pacotes**, selecione a
   pasta `forms/<nome_do_formulario>/`
2. Clique com o botão direito → **Exportar**
3. Selecione **Fluig → Exportar para o servidor Fluig** e clique em **Avançar**
4. Informe o servidor de destino e clique em **Concluir**
5. No Fluig, acesse **Documentos → Formulários Fluig** e confirme que o
   formulário está listado

> Verifique que os eventos foram importados junto com o formulário: acesse
> o formulário publicado e confirme que a aba **Eventos** lista:
> - `validateForm`
> - `displayFields`
> - `enableFields`
> - `inputFields`
> _(omita os que não existirem no projeto)_

---

## 4. Grupos e permissões

<Para cada ator/responsável identificado nas atividades do workflow:>

**Atividade: `<nome_da_atividade>`** — responsável: `<nome_do_grupo_ou_papel>`

1. No Fluig, acesse **Painel de Controle → Grupos**
2. Verifique se o grupo `<nome_do_grupo>` existe; se não existir, crie-o
3. Adicione os usuários responsáveis por esta etapa

> Preencher com os grupos e usuários reais após confirmação com o cliente.

---

## 5. Workflow (processo)

1. No **Fluig Studio**, na visão **Explorador de Pacotes**, selecione a
   pasta `workflow/`
2. Verifique se as atividades precisam configurar grupo ou permissão; se
   sim, selecione o grupo criado no passo 4 para cada atividade correspondente:
   - Atividade `<nome>` → grupo `<nome>`
3. Clique com o botão direito → **Exportar**
4. Selecione **Fluig → Exportar para o servidor Fluig** e clique em **Avançar**
5. Informe o servidor de destino e clique em **Concluir**
6. Confirme que os scripts estão presentes na aba **Scripts**:
   - `beforeTaskSave.js`
   - `afterTaskSave.js`
   - _(omita os que não existirem)_
7. Clique em **Finish**

---

## 6. Checklist de validação pós-deploy

### Formulário e abertura
- [ ] Abrir novo processo — formulário carrega sem erros no console do browser
- [ ] Painéis corretos aparecem conforme o tipo de solicitação selecionado
- [ ] <demais itens específicos do processo>

---

## Responsável pelo deploy

> Preencher com nome, cargo e data após a publicação em produção.
```

## Instruções finais

Escreva em português brasileiro. Cite nomes reais de datasets, service codes, grupos e caminhos encontrados no código — não invente valores. Ao terminar, informe ao usuário o caminho do arquivo gerado e destaque os pontos de preenchimento manual (seção 4, e "Responsável pelo deploy").
