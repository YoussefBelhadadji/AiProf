from __future__ import annotations
import pandas as pd
from utils import PROJECT_ROOT, ensure_outputs_dir, load_yaml, safe_float

def assign_band(value: float, band_map: dict) -> str:
    value = safe_float(value)
    for label, limits in band_map.items():
        low, high = limits
        if low <= value <= high:
            return label
    return "unknown"

def main() -> None:
    out_dir = ensure_outputs_dir()
    cfg = load_yaml(PROJECT_ROOT / "config" / "thresholds.yaml")
    thresholds = cfg["thresholds"]

    df = pd.read_csv(out_dir / "02_text_features.csv")

    df["word_count_band"] = df["word_count"].apply(lambda v: assign_band(v, thresholds["word_count"]))
    df["error_density_band"] = df["error_density"].apply(lambda v: assign_band(v, thresholds["error_density"]))
    df["revision_band"] = df["revision_frequency"].apply(lambda v: assign_band(v, thresholds["revision_frequency"]))
    df["time_on_task_band"] = df["time_on_task"].apply(lambda v: assign_band(v, thresholds["time_on_task"]))
    df["cohesion_band"] = df["cohesion_index"].apply(lambda v: assign_band(v, thresholds["cohesion_index"]))
    df["rubric_views_band"] = df["rubric_views"].apply(lambda v: assign_band(v, thresholds["rubric_views"]))

    df.to_csv(out_dir / "03_thresholds_applied.csv", index=False)
    print("Created outputs/03_thresholds_applied.csv")

if __name__ == "__main__":
    main()
