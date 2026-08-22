# API

FUXA-AI-Gateway exposes a set of read-only Model Context Protocol (MCP) tools. All tools are
read-only by default.

## Tools

### `fuxa_health_check`

Check FUXA connectivity and gateway health.

- Inputs: none
- Returns: `{ status, gateway, fuxa }`

### `fuxa_project_overview`

Summarize the FUXA project structure.

- Inputs: none
- Returns: `{ projects, totalTags }`

### `fuxa_search_tags`

Search tags by natural language.

- Inputs: `query` (string)
- Returns: ranked tags with device, variable, unit, and description

### `fuxa_analyze_history`

Analyze historical data for a tag.

- Inputs: `tagId`, `from`, `to`
- Returns: `{ mean, max, min, trend, anomaly }`

### `fuxa_compare_periods`

Compare two time periods for a tag.

- Inputs: `tagId`, `from1`, `to1`, `from2`, `to2`
- Returns: `{ period1, period2, delta }`

### `fuxa_alarm_analysis`

Analyze an alarm.

- Inputs: `alarmId`
- Returns: alarm, device, related tags, history summary, and diagnosis

### `fuxa_diagnose_equipment`

Diagnose equipment health.

- Inputs: `deviceId`
- Returns: `{ health, causes, suggestions }`

### `fuxa_metrics`

Return gateway monitoring metrics in Prometheus text format.

- Inputs: none
- Returns: metrics text

## Prompts

- `diagnose_alarm` — guide alarm diagnosis.
- `daily_report` — guide a daily operations report.
- `maintenance_report` — guide a maintenance report.

## Transport

The gateway is an MCP stdio server. Connect an MCP client to `node dist/index.js`.
