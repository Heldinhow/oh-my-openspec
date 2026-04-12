# Tasks: Restringir Prometheus ao Fluxo de Planejamento

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Generated**: 2026-04-12

## Phase 1: Setup

### [T001] [P1] Configurar permissions.json
Criar arquivo `.specify/permissions.json` com estrutura aninhada.

**Scope**: Criar arquivo JSON com version, agents.prometheus config
**Acceptance**: Arquivo existe em `.specify/permissions.json` com schema válido
**Files**: `.specify/permissions.json`

### [T002] [P1] Criar estrutura de diretórios do hook
Criar diretório `.specify/hooks/prometheus-filter/`

**Scope**: Criar diretórios necessários
**Acceptance**: Diretório existe e contém estrutura vazia
**Files**: `.specify/hooks/prometheus-filter/`

---

## Phase 2: Foundational

### [T003] [P1] Implementar hook.ps1 e hook.yml
Criar script de hook em PowerShell e configuração YAML.

**Scope**: hook.ps1 com extension check, directory check, operation check, e audit logging; hook.yml com metadata
**Acceptance**: Script executa e bloqueia operações não-.md corretamente; YAML contém nome, description, entrypoint
**Files**: `.specify/hooks/prometheus-filter/hook.ps1`, `.specify/hooks/prometheus-filter/hook.yml`
**Story**: US1

### [T004] [P1] Configurar extensions.yml
Integrar hook no Speckit via extensions.yml.

**Scope**: Adicionar entry em hooks.before_write
**Acceptance**: extensions.yml contém hook do prometheus-filter
**Files**: `.specify/extensions.yml`
**Story**: US1

### [T005] [P2] Criar schema de permissão
Definir JSON schema para validação de permissions.json.

**Scope**: Criar contracts/permission-rule.schema.json
**Acceptance**: Schema valida permissions.json corretamente
**Files**: `contracts/permission-rule.schema.json`

---

## Phase 3: User Stories

### User Story 1 - Agente Prometheus Restrito ao Planejamento (P1)

### [T006] [P2] Testar блокировка de extensão
Verificar que Prometheus é bloqueado ao tentar escrever arquivos .ts, .js, .py.

**Scope**: Testar todas extensões não-.md
**Acceptance**: Todas operações bloqueadas com mensagem clara
**Verification**: Execute hook.ps1 com arquivo .ts → deve retornar erro

### [T007] [P2] Testar permissão .md
Verificar que Prometheus pode escrever arquivos .md.

**Scope**: Testar que .md é permitido
**Acceptance**: Operações em .md são permitidas
**Verification**: Execute hook.ps1 com arquivo .md → deve retornar sucesso

### [T008] [P2] Testar блокировка de diretório
Verificar que operações em src/, tests/ são bloqueadas.

**Scope**: Testar todos diretórios bloqueados
**Acceptance**: Operações em diretórios de código são bloqueadas
**Verification**: Execute hook.ps1 com path src/index.ts → deve retornar erro

### [T009] [P2] Testar блокировка de renomeação
Verificar que renomear .md para .ts é bloqueado.

**Scope**: Testar operação de rename
**Acceptance**: Renomeação que muda extensão é bloqueada
**Verification**: Execute hook.ps1 com operation=rename, target=test.md → deve falhar

---

### User Story 2 - Prometheus Como Orquestrador Puro (P2)

### [T010] [P3] Validar completude do fluxo specify→plan→tasks
Verificar que Prometheus consegue completar todos estágios de planejamento.

**Scope**: Verificar que não há restrições no fluxo specify/plan/tasks
**Acceptance**: Fluxo de planejamento funciona sem блокировка
**Verification**: Todos os estágios podem criar/atualizar .md normalmente

---

### User Story 3 - Verificação de Permissões (P3)

### [T011] [P3] Testar audit log
Verificar que operações bloqueadas são registradas.

**Scope**: Verificar formato e conteúdo do log
**Acceptance**: Log contém timestamp, agent, operation, target, result, reason
**Verification**: Operaçao bloqueada gera entrada em .specify/audit.log

---

## Phase 4: Polish

### [T012] [P4] Documentar quickstart.md
Atualizar guia de uso com instruções finais.

**Scope**: Revisar e finalizar quickstart.md
**Acceptance**: Documentação está clara e funcional
**Files**: `specs/003-prometheus-readonly-flow/quickstart.md`

---

## Task Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Phase 1: Setup | T001, T002 | T001 ‖ T002 |
| Phase 2: Foundational | T003, T004, T005 | T003 ‖ T004 ‖ T005 |
| Phase 3: User Stories | T006, T007, T008, T009, T010, T011 | T006‖T007‖T008‖T009; T010; T011 |
| Phase 4: Polish | T012 | - |

**Total**: 12 tasks
**Estimated Phases**: 4
**Parallel Opportunities**: 6 tasks can run in parallel in Phase 3

## Verification

| Task | Criteria |
|------|----------|
| T001 | permissions.json existe com schema válido |
| T002 | Diretório .specify/hooks/prometheus-filter/ criado |
| T003 | hook.ps1 retorna exit 0 para .md, exit 1 para .ts; stderr contém mensagem de erro |
| T004 | extensions.yml contém entry do prometheus-filter |
| T005 | Schema valida JSON corretamente |
| T006 | .ts/.js/.py bloqueados com mensagem |
| T007 | .md permitido |
| T008 | src/, tests/ bloqueados |
| T009 | rename .md→.ts bloqueado |
| T010 | Fluxo specify/plan/tasks funciona |
| T011 | Audit log registra operações |
| T012 | quickstart.md completo e funcional |
