# Research: Prometheus Read-Only Flow

## Background

Prometheus é o agente orquestrador do sistema Speckit. Atualmente, ele pode executar operações de escrita em qualquer arquivo, incluindo código fonte. A necessidade é restringir Prometheus a apenas operações de planejamento.

## Research Questions

### Q1: Como interceptar operações de arquivo no OpenCode?

**Finding**: OpenCode suporta hooks de lifecycle que podem interceptar operações antes da execução.

**Approach**:
- Hooks definidos em `.specify/extensions.yml`
- Estrutura de hook com `before_operation` e `after_operation`
- Scripts PowerShell/Bash para verificação de regras

### Q2: Quais padrões de hook são suportados?

**Finding**: Speckit suporta hooks nos seguintes pontos:
- `before_specify`, `after_specify`
- `before_plan`, `after_plan`
- `before_tasks`, `after_tasks`
- `before_implement`, `after_implement`

**Approach**: Criar hook específico `before_file_write` para interceptar operações de escrita.

### Q3: Como definir permissões de forma externalizada?

**Finding**: JSON/YAML configuration é suportado.

**Approach**:
- Arquivo `permissions.json` com regras
- Estrutura: agente → extensão → operações permitidas
- Hot-reload para atualização sem restart

## Technical Analysis

### Option 1: Hook de pré-operação (RECOMENDADO)
- Intercepta antes da escrita
- Verifica extensão e diretório
- Retorna erro se não permitido

### Option 2: Validação pós-operação
- Permite escrita, reverte depois
- Riscos de estado inconsistente
- **REJEITADO**

### Option 3: Convention-based
- Confia em convenção (Prometheus não escreve código)
- Não é enforceable
- **REJEITADO**

## Conclusion

Implementar hook de pré-operação com configuração externalizada em JSON.
