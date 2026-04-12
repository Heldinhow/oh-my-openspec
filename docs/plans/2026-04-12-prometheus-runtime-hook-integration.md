# Prometheus Runtime Hook Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Conectar o runtime do plugin aos hooks reais do OpenCode para que Prometheus inicie o fluxo spec-driven, injete contexto de estágio e delegue trabalho aos subagents corretos em vez de cair no comportamento padrão.

**Architecture:** Implementar uma camada fina de integração no entrypoint do plugin que registre hooks de chat/system/command e chame os serviços já existentes de orquestração, templates e estado. Corrigir o resolver de hooks YAML, tornar a injeção de estágio observável por testes e substituir a delegação simulada por um caminho real de subagent delegation orientado por configuração.

**Tech Stack:** TypeScript, `@opencode-ai/plugin` 1.4.3, Vitest, OpenCode plugin hooks, YAML config loading

---

## Contexto do problema

O diagnóstico atual mostra três falhas centrais:

1. `src/prometheus-speckit/prometheus-speckit.ts` retorna apenas `{ tool: {} }`, então o plugin não registra hooks de runtime.
2. A lógica de orquestração existe (`orchestrator/`, `core/`, `review/`), mas está desconectada do entrypoint efetivamente carregado.
3. `src/prometheus-speckit/core/hook-resolver.ts` lê o YAML com a chave errada (`hooks.before_specify` em vez de `cfg.hooks.before_specify`).

O plano abaixo ataca primeiro a ativação do runtime e a observabilidade, depois a delegação real para subagents.

---

### Task 1: Ativar hooks mínimos do runtime do plugin

**Files:**
- Create: `tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`
- Modify: `src/prometheus-speckit/prometheus-speckit.ts`
- Modify: `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts`

**Step 1: Write the failing test**

Criar testes cobrindo:
- existência de `experimental.chat.system.transform`
- existência de `chat.message`
- injeção de texto de sistema do Prometheus
- início de sessão em `specify` para prompt com `planning_required=true`

Exemplo de casos:

```ts
it('registers runtime hooks for chat and system injection', async () => {
  const hooks = await prometheusSpeckitPlugin(fakeInput)
  expect(hooks['experimental.chat.system.transform']).toBeTypeOf('function')
  expect(hooks['chat.message']).toBeTypeOf('function')
})

it('starts spec-driven flow for planning-required prompts', async () => {
  const hooks = await prometheusSpeckitPlugin(fakeInput)
  const output = { message: fakeMessage, parts: [] as any[] }

  await hooks['chat.message']?.({ sessionID: 's1' }, output)

  expect(output.parts.length).toBeGreaterThan(0)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`

Expected: FAIL porque os hooks ainda não estão registrados.

**Step 3: Write minimal implementation**

Em `src/prometheus-speckit/prometheus-speckit.ts`:
- registrar `experimental.chat.system.transform`
- registrar `chat.message`
- criar/adquirir sessão ativa por `sessionID`
- chamar `prometheusOrchestrator.handleUserInput(...)`
- anexar mensagem/status/template ao output quando o fluxo entrar em `specify`

Em `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts`:
- permitir inicialização de sessão por `sessionID`
- expor utilitário mínimo para gerar resposta de runtime sem depender de slash command manual

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/prometheus-speckit/prometheus-speckit.ts src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts
git commit -m "fix: activate prometheus runtime hooks"
```

---

### Task 2: Corrigir resolução de hooks e injeção stage-aware de comandos

**Files:**
- Create: `tests/unit/prometheus-speckit/hook-resolver.test.ts`
- Modify: `src/prometheus-speckit/core/hook-resolver.ts`
- Modify: `src/prometheus-speckit/prometheus-speckit.ts`
- Modify: `src/prometheus-speckit/core/template-injector.ts`

**Step 1: Write the failing test**

Criar testes cobrindo:
- `hookResolver.getBeforeHooks('specify')` retorna entradas do YAML
- `command.execute.before` injeta template apropriado para `speckit.specify`, `speckit.clarify`, `speckit.plan` e `speckit.tasks`

Exemplo:

```ts
it('reads before_specify from nested hooks map', () => {
  const hooks = hookResolver.getBeforeHooks('specify')
  expect(hooks.length).toBeGreaterThan(0)
  expect(hooks[0]?.command).toBe('speckit.git.feature')
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/prometheus-speckit/hook-resolver.test.ts`

Expected: FAIL porque o resolver busca a chave errada.

**Step 3: Write minimal implementation**

Em `src/prometheus-speckit/core/hook-resolver.ts`:
- trocar leitura de `cfg["hooks.before_specify"]` para `cfg.hooks?.[phase]`

Em `src/prometheus-speckit/prometheus-speckit.ts`:
- adicionar `command.execute.before`
- usar `templateInjector.getTemplateForStage(...)` ou mapeamento por comando Speckit
- anexar template e hooks relevantes ao `output.parts`

Em `src/prometheus-speckit/core/template-injector.ts`:
- só ajustar se necessário para suportar resolução por comando sem duplicação de lógica

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/prometheus-speckit/hook-resolver.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/prometheus-speckit/core/hook-resolver.ts src/prometheus-speckit/prometheus-speckit.ts src/prometheus-speckit/core/template-injector.ts tests/unit/prometheus-speckit/hook-resolver.test.ts
git commit -m "fix: resolve speckit hooks and command injection"
```

---

### Task 3: Implementar delegação real para Momus, Metis, Librarian e Oracle

**Files:**
- Create: `src/prometheus-speckit/runtime/subagent-delegator.ts`
- Create: `tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`
- Modify: `src/prometheus-speckit/review/review-client.ts`
- Modify: `src/prometheus-speckit/prometheus-speckit.ts`
- Modify: `src/prometheus-speckit/config/model-config.ts`

**Step 1: Write the failing test**

Criar testes cobrindo:
- Prometheus delega review de spec para `Momus`
- chamadas de pesquisa/contexto/validação usam o agente configurado
- saída não usa mais texto de simulação local

Exemplo:

```ts
it('delegates spec review to Momus using configured model', async () => {
  const response = await reviewClient.delegateReview({
    sessionId: 's1',
    specContent: '# Draft spec',
    reviewAgent: 'Momus',
  })

  expect(response.result.review_agent).toBe('Momus')
  expect(response.modelUsed.length).toBeGreaterThan(0)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`

Expected: FAIL porque `review-client.ts` ainda usa simulação local.

**Step 3: Write minimal implementation**

Criar `src/prometheus-speckit/runtime/subagent-delegator.ts` para:
- encapsular chamadas ao runtime/OpenCode client
- receber `agentName`, `prompt`, `sessionId`
- aplicar guardrails do conjunto permitido

Modificar `src/prometheus-speckit/review/review-client.ts` para:
- remover `callModel()` simulada
- delegar review real via `subagent-delegator`
- preservar parsing estruturado do retorno

Modificar `src/prometheus-speckit/prometheus-speckit.ts` para:
- inicializar o delegator com dependências de runtime
- expor caminho de delegação para review, pesquisa, contexto e validação

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/prometheus-speckit/runtime/subagent-delegator.ts src/prometheus-speckit/review/review-client.ts src/prometheus-speckit/prometheus-speckit.ts src/prometheus-speckit/config/model-config.ts tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts
git commit -m "feat: delegate prometheus runtime work to configured subagents"
```

---

### Task 4: Endurecer carregamento do plugin e verificar regressão completa

**Files:**
- Create: `tests/unit/prometheus-speckit/plugin-module-shape.test.ts`
- Modify: `src/prometheus-speckit/prometheus-speckit.ts`
- Modify: `package.json`
- Test: `tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`
- Test: `tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`

**Step 1: Write the failing test**

Criar teste validando shape exportado do módulo e presença do `server` entrypoint estável.

Exemplo:

```ts
it('exports a stable server plugin entrypoint', async () => {
  const mod = await import('../../../src/prometheus-speckit/prometheus-speckit.js')
  expect(mod.default).toBeDefined()
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/prometheus-speckit/plugin-module-shape.test.ts`

Expected: FAIL ou cobertura insuficiente até o formato final do módulo ser endurecido.

**Step 3: Write minimal implementation**

Em `src/prometheus-speckit/prometheus-speckit.ts`:
- exportar `server` explicitamente
- preferir `export default { id: 'oh-my-openspec', server }`
- manter compatibilidade com uso interno se necessário

Em `package.json`:
- revisar `main` e `exports` para apontar de forma consistente ao entrypoint de server

**Step 4: Run full verification**

Run: `npm test && npm run lint`

Expected: PASS com cobertura das novas integrações e sem regressão dos testes existentes.

**Step 5: Commit**

```bash
git add src/prometheus-speckit/prometheus-speckit.ts package.json tests/unit/prometheus-speckit/plugin-module-shape.test.ts tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts
git commit -m "fix: harden plugin runtime entrypoint"
```

---

## Sequência recomendada

1. Task 1 — ativar runtime mínimo
2. Task 2 — corrigir hooks/config e injeção por estágio
3. Task 3 — trocar simulação por delegação real
4. Task 4 — endurecer loading/export e validar tudo

## Verificação final

Executar ao fim:

```bash
npm test
npm run lint
```

Validar manualmente também:
- prompt natural entra em `specify` sem slash command manual
- Prometheus injeta contexto do fluxo
- review de spec usa Momus
- pesquisa/contexto/validação não caem no explorer padrão
