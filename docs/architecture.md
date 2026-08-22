# Architecture

FUXA-AI-Gateway is a Model Context Protocol (MCP) gateway for FUXA SCADA systems. It provides a
safe, read-only bridge between language models and industrial monitoring data.

## Layered Design

The gateway follows a strict layered architecture. No layer reaches past its neighbor.

```
MCP Client / Language Model
            |
            v
      MCP Server (tools)
            |
            v
      Service Layer
            |
            v
    FUXA Adapter
            |
            v
     FUXA REST API
```

- **MCP Server** (`src/server.ts`): registers tools and prompts. Tool handlers are thin; they
  delegate to services and never call HTTP directly.
- **Service Layer** (`src/services/`): business logic — health, project overview, tag search,
  history analysis, comparison, alarm analysis, equipment diagnosis.
- **Analytics Engine** (`src/analytics/`): pure, testable statistics and anomaly detection.
- **Semantic Layer** (`src/semantic/`): industrial model (Device, Tag) and the device relationship
  graph.
- **Security Layer** (`src/security/`): policy enforcement, audit log, approval workflow.
- **Monitoring** (`src/monitoring/`): Prometheus-style metrics.
- **FUXA Adapter** (`src/adapters/fuxa/`): the only module that communicates with FUXA over HTTP.

## Key Modules

| Module           | Responsibility                                      |
| ---------------- | --------------------------------------------------- |
| `server.ts`      | MCP server bootstrap and tool/prompt registration   |
| `adapters/fuxa/` | FUXA REST client (auth, project, tags, alarms, DAQ) |
| `services/`      | Business logic for tools                            |
| `analytics/`     | History statistics and anomaly detection            |
| `semantic/`      | Industrial model and device relationship graph      |
| `security/`      | Policy, audit, and approval                         |
| `monitoring/`    | Metrics                                             |
| `prompts/`       | MCP prompts                                         |

## Data Flow

1. A language model invokes an MCP tool.
2. The server validates the input and delegates to a service.
3. The service calls the FUXA adapter.
4. The adapter requests data from FUXA and returns typed results.
5. The service applies analytics or semantic logic and returns a compact result.
