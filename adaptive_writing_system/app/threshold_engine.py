from pathlib import Path

import pandas as pd
import yaml

BASE = Path(__file__).resolve().parents[1]


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def _range_to_band(value, band_config):
    if not isinstance(band_config, dict):
        return "unknown"

    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return "unknown"

    for band_name, band_info in band_config.items():
        bounds = band_info.get("range") if isinstance(band_info, dict) else band_info
        if isinstance(bounds, (list, tuple)) and len(bounds) == 2:
            low, high = bounds
            if float(low) <= numeric_value <= float(high):
                return band_name
    return "unknown"


def _apply_band(df, source_column, target_column, band_config):
    if source_column not in df.columns:
        df[target_column] = "unknown"
        return df
    df[target_column] = df[source_column].apply(lambda value: _range_to_band(value, band_config))
    return df


def apply_thresholds():
    cfg = load_yaml(BASE / "config" / "thresholds.yaml")
    df = pd.read_csv(BASE / "outputs" / "02_features.csv")

    textual = cfg.get("textual_indicators", {})
    behavioral = cfg.get("behavioral_indicators", {})

    df = _apply_band(df, "word_count", "word_count_band", textual.get("word_count", {}).get("bands", {}))
    df = _apply_band(df, "error_density", "error_density_band", textual.get("error_density", {}).get("bands", {}))
    df = _apply_band(df, "cohesion_index", "cohesion_band", textual.get("cohesion_index", {}).get("bands", {}))
    df = _apply_band(df, "type_token_ratio", "type_token_ratio_band", textual.get("type_token_ratio", {}).get("bands", {}))
    df = _apply_band(df, "grammar_accuracy", "grammar_accuracy_band", textual.get("grammar_accuracy", {}).get("bands", {}))
    df = _apply_band(df, "organization", "organization_band", textual.get("organization_score", {}).get("bands", {}))
    df = _apply_band(df, "argumentation", "argumentation_band", textual.get("argumentation_score", {}).get("bands", {}))
    df = _apply_band(df, "lexical_resource", "lexical_resource_band", textual.get("type_token_ratio", {}).get("bands", {}))
    df = _apply_band(df, "total_score", "total_score_band", textual.get("final_score", {}).get("bands", {}))

    df = _apply_band(df, "time_on_task", "time_on_task_band", behavioral.get("time_on_task", {}).get("bands", {}))
    df = _apply_band(df, "revision_frequency", "revision_frequency_band", behavioral.get("revision_frequency", {}).get("bands", {}))
    df = _apply_band(df, "rubric_views", "rubric_views_band", behavioral.get("rubric_views", {}).get("bands", {}))
    df = _apply_band(df, "feedback_views", "feedback_views_band", behavioral.get("feedback_views", {}).get("bands", {}))
    df = _apply_band(df, "help_seeking_messages", "help_seeking_messages_band", behavioral.get("help_seeking_messages", {}).get("bands", {}))
    df = _apply_band(df, "first_access_delay_hours", "first_access_timing_band", behavioral.get("first_access_timing", {}).get("bands", {}))

    out = BASE / "outputs" / "03_thresholds.csv"
    df.to_csv(out, index=False)
    return df


if __name__ == "__main__":
    apply_thresholds()
