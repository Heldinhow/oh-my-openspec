# Implementation Plan: Restringir Prometheus ao Fluxo de Planejamento

**Branch**: `[003-prometheus-readonly-flow]` | **Date**: 2026-04-12 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `./spec.md`

## Summary

Implementar um sistema de controle de permissões que restringe o agente Prometheus a atuar exclusivamente no fluxo de planejamento (specify → clarify → plan → tasks), permitindo apenas operações de escrita em arquivos `.md` e bloqueando qualquer tentativa de modificar arquivos de código.

## Technical Context

**Language/Version**: PowerShell 7.x (cross-platform), Configuration (YAML/JSON)  
**Primary Dependencies**: OpenCode CLI, Speckit plugin hooks  
**Storage**: File-based configuration (permissions.json, extensions.yml)  
**Testing**: Integration testing via hook execution  
**Target Platform**: macOS/Linux with OpenCode  
**Project Type**: Agent orchestration configuration  
**Performance Goals**: <100ms hook execution time (operation rejection latency)  
**Constraints**: Não deve afetar outros agentes além do Prometheus  
**Scale/Scope**: 1 agente, 3-8 fluxos de operação

## Constitution Check

*Nota: Esta feature adiciona restrições ao comportamento do agente Prometheus sem alterar a estrutura do projeto.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| Agentes especializados | ✅ Alinhado | Prometheus como orquestrador puro |
| Separação planning/implementation | ✅ Alinhado | Restrição a .md preserva fronteira |

## Project Structure

### Documentation (this feature)

```text
specs/003-prometheus-readonly-flow/
├── SPEC.md                  # Feature specification (approved)
├── plan.md                  # This file
├── research.md              # Technical research findings
├── data-model.md            # Data model schema
├── quickstart.md            # Setup guide
├── contracts/
│   └── permission-rule.schema.json  # JSON schema for permissions
└── checklists/
    └── requirements.md      # Validation checklist
```

### Source Code (repository root)

```text
# Novas adições (configuração)
.specify/
├── permissions.json          # Permissões do Prometheus (NOVA)
└── hooks/
    └── prometheus-filter/
        ├── hook.ps1          # PowerShell hook script (NOVA)
        └── hook.yml          # Hook configuration (NOVA)
```

**Hook Contract**:
- **Input**: `$Args[0]` = operation (write/edit/create/delete/rename), `$Args[1]` = target path
- **Output**: Exit code 0 = allowed, Exit code 1 = denied + stderr message
- **Location**: `.specify/hooks/prometheus-filter/hook.ps1`

**Structure Decision**: Adição de arquivos de configuração apenas. Nenhum código fonte novo.

## Implementation Approach

### Phase 1: Permission Configuration

Criar arquivo `.specify/permissions.json` com estrutura aninhada (conforme data-model.md):

```json
{
  "version": "1.0",
  "agents": {
    "prometheus": {
      "allowed_extensions": [".md"],
      "blocked_directories": [
        "src/**",
        "tests/**",
        "lib/**",
        "bin/**",
        "obj/**",
        ".specify/scripts/**"
      ],
      "blocked_operations": ["write", "edit", "create", "delete", "rename"]
    }
  },
  "audit": {
    "enabled": true,
    "log_file": ".specify/audit.log"
  }
}
```

**Evaluation Order**: 
1. Check extension first (if not .md → deny)
2. Then check directory (if in blocked directory → deny)

### Phase 2: Hook Integration

Implementar hook de filtro em `.specify/hooks/prometheus-filter/hook.ps1`:

1. **Input parsing**: Read operation and target path from arguments
2. **Load permissions**: Read `.specify/permissions.json`
3. **Extension check**: Verify target has `.md` extension
4. **Directory check**: Verify target is not in blocked directories
5. **Operation check**: Verify operation is not in blocked list
6. **Log if blocked**: Write to audit log
7. **Return result**: Exit 0 = allowed, Exit 1 = denied

**Hook integration via extensions.yml**:
```yaml
hooks:
  before_write:
  - extension: prometheus-filter
    command: prometheus.filter.write
    enabled: true
    optional: false
    condition: null
```

### Phase 3: Audit Logging

Audit log entries em `.specify/audit.log` (JSON Lines format):

```json
{"timestamp":"2026-04-12T10:30:00Z","agent":"prometheus","operation":"write","target":"src/index.ts","result":"denied","reason":"extension-not-allowed"}
{"timestamp":"2026-04-12T10:31:00Z","agent":"prometheus","operation":"write","target":"specs/feature/spec.md","result":"allowed"}
```

## Key Decisions

| Decisão | Justificativa |
|---------|---------------|
| Arquivos .md permitidos | Artefatos de planejamento são Markdown |
| Hook de pré-operação | Interceção antes de criação/edição |
| Config externalizada | Permite ajuste sem recarregar sistema |
| Auditoria ativa | Compliance e debugging |

## Dependencies

- Speckit plugin já instalado
- OpenCode CLI configurado
- Hook execution framework disponível

## Risks & Mitigations

| Risco | Mitigação |
|-------|-----------|
| Hook não intercepta todas operações | Teste exaustivo antes de production |
| Performance impact | Meta <100ms por operação |
| Configuração incorreta bloqueia fluxo | Whitelist vs blacklist approach |

## Verification Plan

1. **Teste de permissão**: Prometheus tenta criar arquivo .ts → bloqueado
2. **Teste de whitelist**: Prometheus tenta criar .md → permitido
3. **Teste de diretório**: Prometheus tenta escrever em src/ → bloqueado
4. **Teste de leitura**: Prometheus lê src/index.ts → permitido
5. **Teste de renomeação**: Prometheus tenta renomear .md para .ts → bloqueado
6. **Teste de auditoria**: Verificar logs de operações bloqueadas
