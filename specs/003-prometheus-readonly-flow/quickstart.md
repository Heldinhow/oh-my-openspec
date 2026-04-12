# Quick Start: Prometheus Read-Only Mode

## O que é?

Restrição que impede o agente Prometheus de editar arquivos que não sejam `.md`, garantindo que ele atue apenas no fluxo de planejamento.

## Como Ativar

### 1. Configurar permissions.json

Crie `.specify/permissions.json`:

```json
{
  "version": "1.0",
  "agents": {
    "prometheus": {
      "allowed_extensions": [".md"],
      "blocked_directories": ["src/**", "tests/**", "lib/**", "bin/**", "obj/**", ".specify/scripts/**"],
      "blocked_operations": ["write", "edit", "create", "delete", "rename"]
    }
  },
  "audit": {
    "enabled": true,
    "log_file": ".specify/audit.log"
  }
}
```

### 2. Criar Hook Script

Crie `.specify/hooks/prometheus-filter/hook.sh`:

```bash
#!/bin/bash
OPERATION="${1:-write}"
TARGET_PATH="${2:-}"

# Check extension - only .md allowed
extension="${TARGET_PATH##*.}"
if [ "$extension" != "md" ]; then
    echo "ERROR: Edicao nao permitida - Prometheus restrito a arquivos .md" >&2
    exit 1
fi

# Check directory - blocked directories
blocked_dirs=("src/" "tests/" "lib/" "bin/" "obj/" ".specify/scripts/")
for blocked in "${blocked_dirs[@]}"; do
    if [[ "$TARGET_PATH" == *"$blocked"* ]]; then
        echo "ERROR: Diretorio nao permitido para Prometheus" >&2
        exit 1
    fi
done

exit 0
```

Torne executável: `chmod +x .specify/hooks/prometheus-filter/hook.sh`

### 3. Habilitar Hook

Adicione em `.specify/extensions.yml`:

```yaml
hooks:
  before_write:
  - extension: prometheus-filter
    command: prometheus.filter.write
    enabled: true
    optional: false
```

## Avaliação de Regras

1. **Extensão primeiro**: Se arquivo não tem `.md` → bloqueado
2. **Diretório segundo**: Se está em diretório bloqueado → bloqueado
3. **Operação terceiro**: Se operação é bloqueada → bloqueado

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| Verificar status | Leia `.specify/permissions.json` |
| Ver audit log | Leia `.specify/audit.log` |

## Troubleshooting

### Prometheus consegue escrever em arquivo .ts
- Verificar se `permissions.json` está correto
- Verificar se hook está habilitado em `extensions.yml`
- Verificar se hook script existe em `.specify/hooks/prometheus-filter/hook.sh` e é executável

### Performance lenta
- Verificar se log de auditoria não está crescendo demais
- Arquivo de audit pode ser rotacionado com `logrotate`
