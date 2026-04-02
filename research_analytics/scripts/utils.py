from __future__ import annotations
import math
import re
from pathlib import Path
from typing import Any, Dict
import yaml

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def load_yaml(path: str | Path) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def ensure_outputs_dir() -> Path:
    out_dir = PROJECT_ROOT / "outputs"
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir

def tokenize(text: str) -> list[str]:
    return re.findall(r"\b\w+\b", str(text).lower())

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return default
        return float(value)
    except Exception:
        return default

def compare_condition(value: float, expression: str) -> bool:
    expression = str(expression).strip()
    if expression.startswith("<="):
        return value <= float(expression[2:])
    if expression.startswith(">="):
        return value >= float(expression[2:])
    if expression.startswith("<"):
        return value < float(expression[1:])
    if expression.startswith(">"):
        return value > float(expression[1:])
    if expression.startswith("=="):
        return value == float(expression[2:])
    raise ValueError(f"Unsupported condition expression: {expression}")
