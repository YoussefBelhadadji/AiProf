# Adaptive Writing System (Official Pipeline)

This folder contains the official, batch-first writing analytics pipeline used by the project.

## Official Runtime Contract

- Entry point: `app/run_pipeline.py`
- Required input files in `data/`:
	- `moodle_logs.csv`
	- `rubric_scores.csv`
	- `essays.csv`
	- `messages.csv`
- Core config files in `config/`:
	- `thresholds.yaml`
	- `rules.yaml`
	- `feedback_templates.yaml`

## Official Processing Order

1. `merge_data.py` -> `outputs/01_merged.csv`
2. `text_features.py` -> `outputs/02_features.csv`
3. `threshold_engine.py` -> `outputs/03_thresholds.csv`
4. `clustering_engine.py` -> `outputs/04_clustered.csv`
5. `random_forest_engine.py` -> `outputs/05_rf.csv`
6. `bayesian_engine.py` -> `outputs/06_bayes.csv`
7. `rule_engine.py` -> `outputs/07_rules.csv`
8. `feedback_engine.py` -> `outputs/08_feedback.csv`
9. Growth summary -> `outputs/09_growth_summary.csv`
10. Teacher review queue -> `outputs/10_teacher_review.csv`

Additional summaries may be produced for diagnostics:

- `outputs/00_descriptive_summary.csv`
- `outputs/04_correlations.csv`

## Run

From the repository root:

```powershell
python adaptive_writing_system/app/run_pipeline.py
```

## Teacher-in-the-loop Output

The file `outputs/10_teacher_review.csv` is the explicit human approval stage.
Each row includes generated feedback plus approval fields:

- `teacher_approval_status` (default: `pending_review`)
- `teacher_approved_message`
- `teacher_override_note`

## Legacy Note

Some additional modules still exist in `app/legacy/` for backward compatibility and historical testing.
They are not part of the official runtime contract above.
