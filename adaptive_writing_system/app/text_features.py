import re
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parents[1]

CONNECTORS = [
    "however",
    "therefore",
    "furthermore",
    "moreover",
    "nevertheless",
    "in addition",
    "as a result",
    "for example",
    "because",
    "consequently",
    "subsequently",
    "in contrast",
    "on the other hand",
    "similarly",
    "thus",
    "hence",
    "meanwhile",
    "specifically",
    "ultimately",
    "namely",
]


def tokenize(text: str):
    return re.findall(r"\b\w+\b", str(text).lower())


def word_count(text: str) -> int:
    return len(tokenize(text))


def sentence_count(text: str) -> int:
    fragments = re.split(r"[.!?]+", str(text))
    return len([fragment for fragment in fragments if fragment.strip()])


def ttr(text: str) -> float:
    words = [word for word in tokenize(text) if len(word) > 2]
    return len(set(words)) / len(words) if words else 0.0


def cohesion_index(text: str) -> int:
    lower = str(text).lower()
    return sum(lower.count(connector) for connector in CONNECTORS)


def avg_sentence_length(text: str) -> float:
    total_words = word_count(text)
    total_sentences = sentence_count(text)
    return total_words / total_sentences if total_sentences else 0.0


def error_density_proxy(text: str) -> float:
    words = tokenize(text)
    if not words:
        return 0.0

    lower = str(text).lower()
    estimated_errors = 0.0

    if len(words) < 80:
        estimated_errors += 2.0
    if "big worry" in lower:
        estimated_errors += 1.0
    if lower.count(" and ") > 4 and len(words) < 120:
        estimated_errors += 0.5

    return round((estimated_errors / len(words)) * 100, 2)


def compute_features():
    df = pd.read_csv(BASE / "outputs" / "01_merged.csv")
    df["essay_text"] = df["essay_text"].fillna("")

    df["word_count"] = df["essay_text"].apply(word_count)
    df["sentence_count"] = df["essay_text"].apply(sentence_count)
    df["ttr"] = df["essay_text"].apply(ttr)
    df["type_token_ratio"] = df["ttr"]
    df["cohesion_index"] = df["essay_text"].apply(cohesion_index)
    df["avg_sentence_length"] = df["essay_text"].apply(avg_sentence_length)
    df["error_density"] = df["essay_text"].apply(error_density_proxy)

    out = BASE / "outputs" / "02_features.csv"
    df.to_csv(out, index=False)
    return df


if __name__ == "__main__":
    compute_features()

