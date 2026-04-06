import yaml
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def assign_band(value, bands):
    for label, bounds in bands.items():
        low, high = bounds
        if low <= float(value) <= high:
            return label
    return "unknown"

def apply_thresholds():
    cfg = load_yaml(BASE / "config" / "thresholds.yaml")
    df = pd.read_csv(BASE / "outputs" / "02_features.csv")

    th = cfg["thresholds"]
    df["word_count_band"] = df["word_count"].apply(lambda x: assign_band(x, th["word_count"]))
    df["time_on_task_band"] = df["time_on_task"].apply(lambda x: assign_band(x, th["time_on_task"]))
    df["rubric_views_band"] = df["rubric_views"].apply(lambda x: assign_band(x, th["rubric_views"]))
    df["revision_band"] = df["revision_frequency"].apply(lambda x: assign_band(x, th["revision_frequency"]))
    df["cohesion_band"] = df["cohesion_index"].apply(lambda x: assign_band(x, th["cohesion_index"]))

    out = BASE / "outputs" / "03_thresholds.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    apply_thresholds()
