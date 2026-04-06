import re
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

CONNECTORS = [
    "however", "therefore", "furthermore", "moreover",
    "in addition", "as a result", "for example", "because"
]

def tokenize(text: str):
    return re.findall(r"\b\w+\b", str(text).lower())

def word_count(text: str) -> int:
    return len(tokenize(text))

def sentence_count(text: str) -> int:
    parts = re.split(r"[.!?]+", str(text))
    return len([p for p in parts if p.strip()])

def ttr(text: str) -> float:
    words = tokenize(text)
    return len(set(words)) / len(words) if words else 0.0

def cohesion_index(text: str) -> int:
    lower = str(text).lower()
    return sum(lower.count(c) for c in CONNECTORS)

def avg_sentence_length(text: str) -> float:
    wc = word_count(text)
    sc = sentence_count(text)
    return wc / sc if sc else 0.0

def error_density_proxy(text: str) -> float:
    words = tokenize(text)
    if not words:
        return 0.0
    # starter proxy only; replace later with grammar checker
    rough_errors = 0
    if len(words) < 80:
        rough_errors += 2
    if "big worry" in str(text).lower():
        rough_errors += 1
    if "students can" in str(text).lower():
        rough_errors += 0
    return round((rough_errors / len(words)) * 100, 2)

def compute_features():
    df = pd.read_csv(BASE / "outputs" / "01_merged.csv")
    df["word_count"] = df["essay_text"].apply(word_count)
    df["sentence_count"] = df["essay_text"].apply(sentence_count)
    df["ttr"] = df["essay_text"].apply(ttr)
    df["cohesion_index"] = df["essay_text"].apply(cohesion_index)
    df["avg_sentence_length"] = df["essay_text"].apply(avg_sentence_length)
    df["error_density"] = df["essay_text"].apply(error_density_proxy)

    out = BASE / "outputs" / "02_features.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    compute_features()
