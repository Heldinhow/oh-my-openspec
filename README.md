# oh-my-openspec

AI-powered specification-driven development plugin for OpenCode.

## Overview

oh-my-openspec is an OpenCode plugin that combines subagent orchestration with Speckit planning flow, providing a seamless experience from natural conversation to implementation.

## Architecture

- **Prometheus**: Orchestrator agent that routes intent and manages stages
- **Momus**: Spec reviewer for completeness validation
- **Metis**: Researcher for technical decisions
- **Librarian**: Context manager for artifact retrieval
- **Oracle**: Validator for constraints and transition guards

## Stage Flow

`
specify → clarify → plan → tasks → handoff → build
`

## Setup

```bash
npm install
```

Running `npm install` configures OpenCode automatically for local use:

- adds this plugin to `~/.config/opencode/opencode.json`
- registers `Prometheus`, `Momus`, `Metis`, `Librarian`, and `Oracle`
- sets `Prometheus` as the default agent when no default is configured yet

Set `OH_MY_OPENSPEC_SKIP_INSTALL=1` to skip the automatic setup.

## Commands

```bash
npm test        # Run tests
npm run lint    # Type check
```

## Project Structure

`
src/            # TypeScript source code
tests/          # Test files
specs/          # Feature specifications
docs/           # Documentation
.opencode/      # Command templates
.specify/       # Extension hooks
.config/        # Agent configuration
