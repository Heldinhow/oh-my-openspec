# Feature Specification: Restringir Prometheus ao Fluxo de Planejamento

**Feature Branch**: `[003-prometheus-readonly-flow]`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "precisamos melhorar o fluxo do Prometheus, ele não deve gerar codigo, apenas atuar no fluxo de planejamento. precisamos negar as permissoes de edicao para ele, ele só poderá mexer com .md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agente Prometheus Restrito ao Planejamento (Priority: P1)

Como operador do sistema multi-agent, desejo que o agente Prometheus atue exclusivamente no fluxo de planejamento (specify → clarify → plan → tasks), sem capacidade de gerar código ou modificar arquivos não-Markdown.

**Why this priority**: Garante que Prometheus funcione como orquestrador puro, delegando implementação a agentes especializados.

**Independent Test**: Quando Prometheus recebe uma instrução para criar código, o sistema deve recusar a operação e informar que apenas operações de planejamento são permitidas.

**Acceptance Scenarios**:

1. **Given** Prometheus está ativo, **When** recebe comando para editar arquivos .ts/.js/.py, **Then** sistema bloqueia operação com mensagem "Edição não permitida - Prometheus restrito a arquivos .md"
2. **Given** Prometheus está ativo, **When** recebe comando para criar arquivos de código, **Then** sistema retorna erro de permissão sem criar arquivo
3. **Given** Prometheus está ativo, **When** recebe comando para editar arquivos .md no fluxo de especificação, **Then** operação é permitida normalmente

---

### User Story 2 - Prometheus Como Orquestrador Puro (Priority: P2)

Como operador, quero que Prometheus coordene apenas artefatos de planejamento (.md), mantendo clear separation between planning e implementation.

**Why this priority**: Mantém separação de responsabilidades entre agentes de planejamento e implementação.

**Independent Test**: Prometheus deve conseguir criar/atualizar spec.md, plan.md, tasks.md mas nunca deve criar arquivos em src/, tests/, ou qualquer diretório de código.

**Acceptance Scenarios**:

1. **Given** Prometheus no fluxo specify, **When** precisa criar spec.md, **Then** operação permitida
2. **Given** Prometheus no fluxo plan, **When** precisa criar plan.md, **Then** operação permitida
3. **Given** Prometheus tentanto criar arquivo em src/, **When** qualquer operação de escrita, **Then** bloqueada com "Diretório src/ não permitido para Prometheus"

---

### User Story 3 - Verificação de Permissões (Priority: P3)

Como administrador, desejo poder auditar quais operações o Prometheus pode ou não realizar, garantindo conformidade com as restrições.

**Why this priority**: Permite verificação e compliance das restrições impostas ao agente.

**Independent Test**: Listagem de permissões via comando deve mostrar claramente limites de edição por extensão e diretório.

**Acceptance Scenarios**:

1. **Given** Administrador consulta permissões, **When** comando de status executado, **Then** lista de extensões permitidas (.md apenas) e diretórios restritos (src/, tests/, lib/, etc)
2. **Given** Log de auditoria ativado, **When** Prometheus tenta operação bloqueada, **Then** evento registrado com timestamp, operação tentada, e resultado (bloqueado)

---

### Edge Cases

- O que acontece quando Prometheus tenta renomear arquivo .md para .ts? Resposta: Sistema deve bloquear renomeação que resulta em extensão não permitida
- Como tratar comandos que afetam múltiplos arquivos (alguns .md, alguns não)? Resposta: Se qualquer arquivo da operação não for .md,整体 operação deve ser bloqueada
- Prometheus pode ler arquivos de código? Resposta: Sim, leitura é permitida para contexto, apenas escrita/edição é restrita

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE interceptar todas tentativas de escrita/ediçao de arquivos por Prometheus
- **FR-002**: Sistema DEVE permitir apenas operações de escrita em arquivos com extensão .md
- **FR-003**: Sistema DEVE bloquear operações de escrita em diretórios de código (src/, tests/, lib/, bin/, obj/, .specify/scripts/)
- **FR-004**: Sistema DEVE retornar mensagem clara de erro quando operação bloqueada
- **FR-005**: Sistema DEVE permitir leitura de qualquer arquivo para contexto de planejamento
- **FR-006**: Prometheus DEVE atuar apenas nos fluxos: specify, clarify, plan, tasks (sem implementation)
- **FR-007**: Configuração de permissões DEVE ser externalizada em arquivo de configuração (permissions.json ou similar)
- **FR-008**: Sistema DEVE registrar em log todas tentativas de operações bloqueadas

### Key Entities

- **PermissionRule**: Define regras de permissão com padrão (glob), tipo de operação (read/write), e resultado (allow/deny)
- **AuditLog**: Registra tentativas de operações com timestamp, agente, operação, arquivo, e resultado
- **AgentContext**: Configuração de contexto do Prometheus incluindo fluxos permitidos e permissões de arquivo

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tentativas de escrita em arquivos não-.md são bloqueadas
- **SC-002**: 0 arquivos de código (exceto .md) são criados por Prometheus
- **SC-003**: Prometheus consegue completar fluxos specify, clarify, plan, tasks sem restrições
- **SC-004**: Tempo de resposta para operações bloqueadas < 100ms
- **SC-005**: Log de auditoria captura todas operações bloqueadas com detalhes completos

## Assumptions

- Prometheus é o único agente afetado por estas restrições - outros agentes podem ter permissões diferentes
- Leitura de arquivos de código é permitida para que Prometheus possa entender contexto técnico durante planejamento
- Restrições são implementadas via hook/interceptor no sistema de arquivos, não apenas convenção
- Configuração de permissões pode ser atualizada sem recarregar o sistema (hot-reload)
