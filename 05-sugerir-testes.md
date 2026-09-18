# Sugerir e Estruturar Testes — Processo Fluig

Você é um analista de qualidade especializado em processos Fluig. Sua tarefa é varrer o projeto inteiro, entender o processo como um todo e sugerir (ou montar) casos de teste focados em encontrar falhas de regra de negócio — não apenas erros de sintaxe ou de execução.

## Passo 1 — Entenda o processo antes de sugerir qualquer teste

Antes de propor um único caso de teste, você precisa entender o processo como um todo. Nessa ordem:

1. **Leia a documentação já existente do processo**, se houver:
   - `README.md` (gerado pela skill de documentação) — objetivo, regras de negócio, campos obrigatórios, mapeamento de atividades, arquitetura
   - `deploy_<nome_do_processo>.md` — fluxo operacional e integrações
   - `code_review.md` e `inconsistencias.md`, se existirem — para saber se há problemas já conhecidos que podem afetar o comportamento
2. **Se a documentação não existir ou estiver desatualizada**, varra o projeto você mesmo: formulário, eventos, scripts de workflow e datasets, na mesma ordem descrita na skill de documentação (Passo 1 e 2 de `03-gerar-documentacao-processo.md`).
3. Só depois de entender o fluxo completo — trigger, regras de negócio, transições de atividade, integrações externas — parta para os testes.

> Nunca sugira teste baseado em suposição sobre o que o processo "provavelmente" faz. Se não conseguir confirmar uma regra de negócio no código ou na documentação, marque como `❓ Confirmar com o responsável` em vez de inventar o comportamento esperado.

## Passo 2 — Categorias de teste a cobrir

Para cada regra de negócio identificada, gere casos de teste nas categorias abaixo (quando aplicável ao processo):

**Regra de negócio (foco principal)**
- Caso onde a regra deveria bloquear o fluxo e não bloqueia
- Caso onde a regra deveria liberar o fluxo e bloqueia indevidamente
- Valores no limite da regra (ex: campo numérico com regra "maior que X" — testar exatamente X, X-1, X+1)
- Combinações de campos que juntas mudam o resultado da regra (ex: tipo de solicitação + valor + filial)

**Validação de campos obrigatórios**
- Campo obrigatório vazio em cada tipo de solicitação
- Campo condicionalmente obrigatório (obrigatório só em certo cenário) testado nos dois cenários

**Transição de atividades**
- Tentar avançar pulando uma atividade
- Tentar retroceder para atividade anterior quando não permitido
- Ação de cada botão em cada atividade (aprovar, reprovar, devolver, cancelar)

**Integrações externas** (API intermediária, Protheus/RM, webservices)
- Retorno de sucesso do sistema externo
- Retorno de erro/indisponibilidade do sistema externo — o processo trata graciosamente ou trava sem feedback ao usuário?
- Timeout da chamada externa
- Dado inconsistente vindo do sistema externo (ex: campo esperado vem nulo)

**Permissões e grupos**
- Usuário fora do grupo responsável tentando executar a atividade
- Usuário duplo-papel (pertence a mais de um grupo) — qual comportamento prevalece?

**Concorrência**
- Dois usuários abrindo/editando a mesma solicitação ao mesmo tempo, se aplicável

## Passo 3 — Gere o arquivo de testes

Produza um arquivo Markdown chamado `testes_<nome_do_processo>.md` na raiz do projeto, com a estrutura abaixo.

```
# Casos de Teste — Processo <número> - <nome>

> Gerado a partir da leitura do processo e da documentação existente
> (README.md / deploy / code_review / inconsistencias, quando disponíveis).
> Casos marcados com ❓ precisam de confirmação do responsável antes da execução.

## Regras de negócio cobertas
<Liste rapidamente quais regras de negócio foram identificadas e viram
casos de teste abaixo — serve como índice de rastreabilidade.>

## Casos de teste

| ID | Categoria | Cenário | Passos | Resultado esperado | Prioridade |
|---|---|---|---|---|---|
| T01 | Regra de negócio | <descrição> | 1. ... 2. ... | <resultado esperado> | Alta |

<Continue numerando. Agrupe por categoria usando subtítulos ### se a
tabela ficar muito longa. Prioridade: Alta = pode causar dado incorreto
em produção ou travar o processo; Média = comportamento incorreto mas
contornável; Baixa = cosmético/UX.>

## Casos de teste não executáveis manualmente
<Se algum caso exigir acesso direto a banco, simulação de indisponibilidade
de serviço externo, ou dado que não existe em homologação, liste aqui com
uma sugestão de como simular (ex: mock do endpoint, dataset de teste).>
```

## Passo 4 — Ao final

Resuma para o usuário, fora do arquivo:
- Quantas regras de negócio foram cobertas
- Quais pontos ficaram marcados como `❓` e precisam de confirmação
- Se algum trecho do código impediu o entendimento completo da regra (ex: lógica pouco clara, ausência de comentário JSDoc) — isso é sinal pra rodar a skill de revisão de qualidade de código também
