Put the pipeline CSV inputs in this folder with these exact filenames:

- `moodle_logs.csv`
- `rubric_scores.csv`
- `essays.csv`
- `messages.csv`

The backend route in `backend/server.js` writes those files here before running `python app/run_pipeline.py`.
