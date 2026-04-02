# Legacy Modules Note

These modules are currently outside the official batch pipeline runtime contract (`run_pipeline.py`):

- `adaptive_system.py`
- `api_server.py`
- `database_adapter.py`
- `init_system.py`
- `interpretation_engine.py`
- `learner_profiling_engine.py`
- `text_analytics_engine.py`
- `decision_logic.py`
- `rulebook.py`

They are kept for backward compatibility and historical experiments.
Do not wire them into the official pipeline unless a migration plan is approved.
