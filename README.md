# FUXA-AI-Gateway

A Model Context Protocol (MCP) Gateway for FUXA SCADA systems.

FUXA-AI-Gateway is a secure bridge that lets large language models safely understand and query
industrial monitoring data from [FUXA](https://github.com/frangoteam/FUXA) SCADA systems. It
exposes a curated set of read-only MCP tools covering projects, devices, tags, alarms, and
historical data, and provides analytics such as trend analysis, anomaly detection, alarm
diagnosis, and operations assistance.

## Why

Industrial systems are safety-critical. Directly exposing a SCADA backend to a language model is
dangerous. FUXA-AI-Gateway sits between the model and FUXA and enforces:

- **Read-only by default** — no write path from the model to the plant.
- **A permission layer** — every tool call is checked against policy.
- **An audit log** — every request is recorded for traceability.
- **Aggregated responses** — analytics return summaries and statistics, never raw firehoses of
  historical points.

## Features

- MCP server exposing a stable, well-defined set of tools.
- FUXA API adapter layer (API Key and JWT authentication).
- Industrial semantic model: Plant, System, Device, Sensor, Tag.
- Natural-language tag search (e.g. "cooling pump temperature").
- Historical data analysis: mean, max, min, trend, anomaly.
- Anomaly detection via Z-score, moving average, and thresholds.
- Alarm intelligence and equipment diagnosis workflows.
- Safety policy layer with permissions, audit, and policy enforcement.
- Prometheus metrics and a Grafana dashboard.
- Docker deployment and CI.

## MCP Tools

| Tool | Purpose |
| --- | --- |
| `fuxa_health_check` | Check FUXA connectivity and gateway health. |
| `fuxa_project_overview` | Summarize the FUXA project structure. |
| `fuxa_search_tags` | Search tags by natural language. |
| `fuxa_search_equipment` | Search equipment/devices. |
| `fuxa_get_current_state` | Read current values of tags. |
| `fuxa_analyze_history` | Analyze historical data (mean, max, min, trend, anomaly). |
| `fuxa_active_alarms` | List active alarms. |
| `fuxa_alarm_analysis` | Diagnose an alarm. |
| `fuxa_diagnose_equipment` | Diagnose equipment health. |

## Security Model

- **Read-only by default.** Write operations are disabled unless explicitly enabled and approved.
- **No direct model-to-PLC write path.** Any future write requires permission checks, an approval
  workflow, and an audit trail.
- **No secrets in logs.** Passwords and API keys are never logged.

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- A running FUXA instance (or the mock server for development)

### Install

```bash
npm install
```

### Configure

Copy the environment template and set your FUXA connection details.

```bash
cp .env.example .env
```

### Run

```bash
npm run build
npm start
```

### Test

```bash
npm test
```

### Docker

```bash
docker compose up --build
```

## Documentation

- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [Deployment](docs/deployment.md)
- [Development](docs/development.md)
- [API](docs/api.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md).

## License

[Apache-2.0](LICENSE)
