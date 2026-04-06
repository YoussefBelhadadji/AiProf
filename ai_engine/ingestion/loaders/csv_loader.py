from __future__ import annotations

from pathlib import Path

import pandas as pd

from ai_engine.ingestion.normalizer import normalize_keys
from ai_engine.ingestion.validator import REQUIRED_RAW_FILES


def load_required_frames(raw_dir: Path) -> dict[str, pd.DataFrame]:
    data: dict[str, pd.DataFrame] = {}
    for filename in REQUIRED_RAW_FILES:
        frame = pd.read_csv(raw_dir / filename)
        data[filename] = normalize_keys(frame)
    return data
