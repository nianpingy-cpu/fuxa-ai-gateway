# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-08-21

### Added

- MCP server core with read-only tools:
  - `fuxa_health_check`
  - `fuxa_project_overview`
  - `fuxa_search_tags`
  - `fuxa_analyze_history`
  - `fuxa_compare_periods`
  - `fuxa_alarm_analysis`
  - `fuxa_diagnose_equipment`
  - `fuxa_metrics`
- FUXA API client layer with API Key and JWT authentication.
- Industrial semantic model and device relationship graph.
- Historical data analyzer and anomaly detection engine.
- Alarm intelligence and equipment diagnosis workflows.
- MCP prompts for alarm diagnosis, daily reports, and maintenance reports.
- Safety policy layer, audit log, and operation approval workflow.
- Monitoring metrics and a Grafana dashboard.
- Docker deployment support.
- Complete documentation and test suite (91% coverage).

### Security

- Read-only by default; no model-to-PLC write path.
- Write operations require explicit enablement, approval, and audit.
- No secrets in logs or the image.
