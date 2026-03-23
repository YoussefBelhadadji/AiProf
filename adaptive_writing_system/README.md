# Adaptive Writing Pipeline

## Role of AI in This Study
AI functions here as a diagnostic and decision-support layer. It processes behavioural, textual, and performance evidence to cluster learner patterns, predict likely writing development, infer latent competence states, and route those signals into a rule-based pedagogical layer. Final scoring, pedagogical interpretation, and instructional action remain teacher-controlled.

## Canonical Sources
- Canonical rule system: [adaptive_rulebook.yaml](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\config\adaptive_rulebook.yaml)
- Shared feedback library: [feedback_templates.yaml](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\config\feedback_templates.yaml)
- Python runtime evaluator: [decision_logic.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\decision_logic.py)
- Rulebook loader: [rulebook.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\rulebook.py)
- Thesis-facing strong rule table: [RULE_FEEDBACK_MATRIX.md](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\RULE_FEEDBACK_MATRIX.md)
- Rule-table generator: [generate_rule_docs.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\scripts\generate_rule_docs.py)

`adaptive_rulebook.yaml` is now the canonical source of truth for the pedagogical rule system. The Python pipeline, the Node backend, and the generated thesis documentation are intended to stay aligned to that one rulebook.

## Required Input Files
Place these files in [PLACE_DATA_FILES_HERE.md](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\data\PLACE_DATA_FILES_HERE.md) with the exact names shown below:

- `moodle_logs.csv`
- `rubric_scores.csv`
- `essays.csv`
- `messages.csv`

The backend route in [server.js](c:\Users\CORTEC\Desktop\projectpr\backend\server.js) expects those exact filenames when it runs the pipeline through `/api/run-pipeline`.

## Programming Order
1. Merge the raw tables in [merge_data.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\merge_data.py).
   Output: `outputs/01_merged.csv`
2. Compute text indicators in [text_features.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\text_features.py).
   Output: `word_count`, `ttr`, `cohesion_index`, `error_density`, `avg_sentence_length`
3. Apply thresholds from [thresholds.yaml](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\config\thresholds.yaml) in [threshold_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\threshold_engine.py).
   Output: banded indicators such as `word_count_band`, `time_on_task_band`, `revision_band`
4. Cluster learner profiles in [clustering_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\clustering_engine.py).
   Output: upstream `cluster_id` and clustering profile signals
5. Predict score gain with Random Forest in [random_forest_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\random_forest_engine.py).
   Output: `predicted_score_gain`, `predicted_improvement`, `05_rf_importance.csv`
6. Infer competence states with the Bayesian layer in [bayesian_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\bayesian_engine.py).
   Output: competence-state evidence used by the adaptive decision layer
7. Convert thresholded evidence and AI outputs into pedagogical matches in [decision_logic.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\decision_logic.py).
   Output: `learner_profile`, `cluster_profile`, `predicted_improvement`, `bayesian_output`, `triggered_rule_ids`, `feedback_templates_selected`, `onsite_interventions`
8. Apply rule synthesis in [rule_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\rule_engine.py).
   Output: `outputs/07_rules.csv`
9. Select final feedback text in [feedback_engine.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\feedback_engine.py).
   Output: `final_feedback_message`
10. Run the full sequence from [run_pipeline.py](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\app\run_pipeline.py).

The full logic is:

```text
raw data -> indicators -> thresholds -> clustering -> random forest -> bayesian states -> AI outputs -> rule table -> feedback templates -> final feedback
```

## How to Run It
From [adaptive_writing_system](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system):

```powershell
python app/run_pipeline.py
```

To regenerate the thesis-facing strong rule table:

```powershell
python scripts/generate_rule_docs.py
```

To verify the generated document is up to date:

```powershell
python scripts/generate_rule_docs.py --check
```

## Output Fields That Matter Most
- `learner_profile`
- `cluster_profile`
- `clustering_output`
- `predicted_improvement`
- `random_forest_output`
- `bayesian_output`
- `triggered_rules`
- `triggered_rule_ids`
- `feedback_templates_selected`
- `onsite_interventions`
- `final_feedback_focus`
- `final_feedback_message`

## Render Deployment Checklist
- The repo pins Render language versions with [`.node-version`](c:\Users\CORTEC\Desktop\projectpr\.node-version) and [`.python-version`](c:\Users\CORTEC\Desktop\projectpr\.python-version).
- Render should build the frontend into `frontend/dist` before backend start.
- Render should install Python dependencies from `adaptive_writing_system/requirements.txt` during the build.
- The backend should remain the single web service serving both `/api/*` and the built frontend shell.
- `/api/health` should return a healthy JSON response after deployment.
- Same-origin frontend/API behavior should remain the production default by leaving `VITE_API_URL` unset unless an explicit override is required.
- `/api/upload-dataset` should accept workbook uploads after deployment.
- `/api/run-pipeline` should work when all four required CSV files are provided.
- Client-side routes should still load correctly on direct browser refresh because the backend serves the built frontend fallback.

The detailed thesis-facing table and the same checklist are also rendered in [RULE_FEEDBACK_MATRIX.md](c:\Users\CORTEC\Desktop\projectpr\adaptive_writing_system\RULE_FEEDBACK_MATRIX.md).
