from __future__ import annotations
import subprocess
import sys
from pathlib import Path
from scripts.utils import PROJECT_ROOT

SCRIPTS = [
    "01_merge_data.py",
    "02_extract_text_features.py",
    "03_apply_thresholds.py",
    "04_run_correlations.py",
    "05_run_clustering.py",
    "06_run_random_forest.py",
    "07_run_bayesian.py",
    "04_apply_rules.py",  # Re-labeled to 08 in concept, but keeping filenames
    "08_generate_feedback.py",
    "08_run_growth_analysis.py",
    "09_run_effectiveness.py"
]

def main() -> None:
    scripts_dir = PROJECT_ROOT / "scripts"

    for script in SCRIPTS:
        script_path = scripts_dir / script
        print(f"\n[PIPELINE] Running {script} ...")
        # Set PYTHONPATH to PROJECT_ROOT so imports work
        result = subprocess.run([sys.executable, str(script_path)], cwd=str(PROJECT_ROOT))
        if result.returncode != 0:
            print(f"\n[ERROR] Pipeline stopped because {script} failed.")
            sys.exit(1)

    print("\n[SUCCESS] Doctoral Analytics Pipeline completed successfully.")
    print(f"Master output: {PROJECT_ROOT / 'outputs/09_feedback_effectiveness.csv'}")

if __name__ == "__main__":
    main()
