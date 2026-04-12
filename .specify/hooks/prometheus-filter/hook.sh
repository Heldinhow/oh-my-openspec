#!/bin/bash
# hook.sh - Prometheus File Filter Hook (Bash version)
# Intercepts file operations and enforces .md only policy

OPERATION="${1:-write}"
TARGET_PATH="${2:-}"

write_audit_log() {
    local operation="$1"
    local target="$2"
    local result="$3"
    local reason="${4:-}"
    
    local log_entry="{\"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"agent\": \"prometheus\", \"operation\": \"$operation\", \"target\": \"$target\", \"result\": \"$result\", \"reason\": \"$reason\"}"
    
    local log_file=".specify/audit.log"
    local log_dir=$(dirname "$log_file")
    
    if [ -n "$log_dir" ] && [ ! -d "$log_dir" ]; then
        mkdir -p "$log_dir"
    fi
    
    echo "$log_entry" >> "$log_file"
}

check_extension_allowed() {
    local path="$1"
    local extension="${path##*.}"
    
    if [ "$extension" = "md" ]; then
        return 0
    fi
    return 1
}

check_directory_blocked() {
    local path="$1"
    
    local blocked_dirs=("src/" "tests/" "lib/" "bin/" "obj/" ".specify/scripts/")
    
    for blocked in "${blocked_dirs[@]}"; do
        if [[ "$path" == *"$blocked"* ]]; then
            return 0
        fi
    done
    return 1
}

if [ -z "$TARGET_PATH" ]; then
    echo "ERROR: TargetPath is required" >&2
    exit 1
fi

if ! check_extension_allowed "$TARGET_PATH"; then
    write_audit_log "$OPERATION" "$TARGET_PATH" "denied" "extension-not-allowed"
    echo "ERROR: Edicao nao permitida - Prometheus restrito a arquivos .md" >&2
    exit 1
fi

if check_directory_blocked "$TARGET_PATH"; then
    write_audit_log "$OPERATION" "$TARGET_PATH" "denied" "directory-blocked"
    echo "ERROR: Diretorio nao permitido para Prometheus" >&2
    exit 1
fi

write_audit_log "$OPERATION" "$TARGET_PATH" "allowed"
exit 0
