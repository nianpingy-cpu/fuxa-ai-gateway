# Deployment

This guide covers running FUXA-AI-Gateway in a production or evaluation environment.

## Prerequisites

- Node.js 22+ (for source deployment)
- npm
- Docker (for container deployment)
- A running FUXA instance

## Environment Configuration

Copy the environment template and set your FUXA connection details.

```bash
cp .env.example .env
```

Key variables:

| Variable        | Description                           |
| --------------- | ------------------------------------- |
| `FUXA_BASE_URL` | Base URL of the FUXA instance         |
| `FUXA_API_KEY`  | API key for FUXA (optional)           |
| `FUXA_USERNAME` | FUXA username for JWT auth (optional) |
| `FUXA_PASSWORD` | FUXA password for JWT auth (optional) |

## Source Deployment

```bash
npm ci
npm run build
npm start
```

The gateway is an MCP stdio server; configure your MCP client to launch
`node dist/index.js`.

## Docker Deployment

Build and run with Docker Compose:

```bash
docker compose up --build
```

The image runs as a non-root user and keeps stdin/stdout open for MCP clients.

## Health Checks

- Use the `fuxa_health_check` MCP tool to verify FUXA connectivity and gateway health.
- Use the `fuxa_metrics` MCP tool to inspect monitoring metrics.

## Monitoring

- The gateway exposes Prometheus-style metrics (request count, latency, error count, tool usage).
- A Grafana dashboard is provided under `docker/grafana/` to visualize these metrics.
