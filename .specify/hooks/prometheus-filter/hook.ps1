#!/usr/bin/env pwsh
# hook.ps1 - Prometheus File Filter Hook
# Intercepts file operations and enforces .md only policy

param(
    [Parameter(Mandatory=$false)]
    [string]$Operation = "write",
    
    [Parameter(Mandatory=$false)]
    [string]$TargetPath = ""
)

$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot "..\..\permissions.json"

if (-not (Test-Path $configPath)) {
    $configPath = ".specify/permissions.json"
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json
$agentConfig = $config.agents.prometheus

function Write-AuditLog {
    param(
        [string]$Operation,
        [string]$Target,
        [string]$Result,
        [string]$Reason = ""
    )
    
    $logEntry = @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        agent = "prometheus"
        operation = $Operation
        target = $Target
        result = $Result
        reason = $Reason
    }
    
    $logFile = $config.audit.log_file
    $logDir = Split-Path $logFile -Parent
    if ($logDir -and -not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $logEntry | ConvertTo-Json | Out-File -FilePath $logFile -Append -Encoding UTF8
}

function Test-ExtensionAllowed {
    param([string]$Path)
    
    $extension = [System.IO.Path]::GetExtension($Path)
    if ($extension -and $extension -in $agentConfig.allowed_extensions) {
        return $true
    }
    return $false
}

function Test-DirectoryBlocked {
    param([string]$Path)
    
    $normalizedPath = $Path -replace '\\', '/'
    
    foreach ($blocked in $agentConfig.blocked_directories) {
        $pattern = $blocked -replace '\*\*', '*'
        $pattern = $pattern -replace '\*', '.*'
        $pattern = "^$pattern"
        
        if ($normalizedPath -match $pattern) {
            return $true
        }
        
        $parts = $normalizedPath -split '/'
        foreach ($part in $parts) {
            $testPath = $part
            if ($testPath -match ($pattern -replace '\.\*/', '')) {
                return $true
            }
        }
    }
    return $false
}

function Test-OperationBlocked {
    param([string]$Op)
    
    if ($Op -in $agentConfig.blocked_operations) {
        return $true
    }
    return $false
}

if (-not $TargetPath) {
    Write-Error "TargetPath is required"
    exit 1
}

if (Test-OperationBlocked -Op $Operation) {
    Write-AuditLog -Operation $Operation -Target $TargetPath -Result "denied" -Reason "operation-blocked"
    Write-Error "Operacao '$Operation' nao permitida para Prometheus"
    exit 1
}

if (-not (Test-ExtensionAllowed -Path $TargetPath)) {
    Write-AuditLog -Operation $Operation -Target $TargetPath -Result "denied" -Reason "extension-not-allowed"
    Write-Error "Edicao nao permitida - Prometheus restrito a arquivos .md"
    exit 1
}

if (Test-DirectoryBlocked -Path $TargetPath) {
    Write-AuditLog -Operation $Operation -Target $TargetPath -Result "denied" -Reason "directory-blocked"
    Write-Error "Diretorio nao permitido para Prometheus"
    exit 1
}

Write-AuditLog -Operation $Operation -Target $TargetPath -Result "allowed"
exit 0
