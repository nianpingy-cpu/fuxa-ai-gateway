# Grafana Dashboard

This directory contains the Grafana dashboard provisioning for FUXA-AI-Gateway.

## Dashboard

`fuxa-ai-gateway.json` is a Grafana dashboard that visualizes gateway metrics from Prometheus:

- **Request Count** — `fuxa_request_count`
- **Total Latency** — `fuxa_latency_ms_total`
- **Error Count** — `fuxa_error_count`
- **Tool Usage** — `fuxa_tool_usage` (with a per-tool timeseries panel)

## Data Source

The dashboard expects a Prometheus data source with UID `prometheus`. Configure the data source to
scrape the gateway's metrics endpoint (exposed via the `fuxa_metrics` MCP tool).
