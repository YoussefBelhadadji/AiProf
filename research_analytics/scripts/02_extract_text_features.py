from __future__ import annotations
import re
import pandas as pd
from utils import PROJECT_ROOT, ensure_outputs_dir, tokenize

CONNECTORS = [
    "however", "therefore", "furthermore", "moreover", "in addition", 
    "as a result", "for example", "because", "in contrast", "subsequently"
]

ACADEMIC_WORDS = {
    "furthermore", "therefore", "moreover", "consequently", "significant",
    "flexibility", "effectively", "responsibilities", "education", "academic",
    "argument", "evidence", "cohesion", "analysis", "framework", "perspective"
}

def word_count(text: str) -> int:
    return len(tokenize(text))

def sentence_count(text: str) -> int:
    parts = re.split(r"[.!?]+", str(text))
    return len([p for p in parts if p.strip()])

def type_token_ratio(text: str) -> float:
    words = tokenize(text)
    if not words: return 0.0
    return len(set(words)) / len(words)

def cohesion_index(text: str) -> int:
    lowered = str(text).lower()
    return sum(lowered.count(connector) for connector in CONNECTORS)

def avg_sentence_length(text: str) -> float:
    wc = word_count(text)
    sc = sentence_count(text)
    return wc / sc if sc else 0.0

def academic_vocab_count(text: str) -> int:
    words = set(tokenize(text))
    return sum(1 for w in words if w in ACADEMIC_WORDS)

def error_density_proxy(text: str) -> float:
    """
    Simple research proxy.
    """
    text = str(text)
    words = tokenize(text)
    if not words: return 0.0
    
    rough_errors = 0
    if "is very useful for students" in text.lower(): rough_errors += 1
    if len(words) < 80: rough_errors += 2
    if text.count("good") > 0: rough_errors += 1
    if text.count("very") > 1: rough_errors += 1
    
    return round((rough_errors / len(words)) * 100, 2)

def main() -> None:
    out_dir = ensure_outputs_dir()
    df = pd.read_csv(out_dir / "01_merged_dataset.csv")

    df["word_count"] = df["essay_text"].apply(word_count)
    df["sentence_count"] = df["essay_text"].apply(sentence_count)
    df["ttr"] = df["essay_text"].apply(type_token_ratio)
    df["cohesion_index"] = df["essay_text"].apply(cohesion_index)
    df["avg_sentence_length"] = df["essay_text"].apply(avg_sentence_length)
    df["academic_vocab_count"] = df["essay_text"].apply(academic_vocab_count)
    df["error_density"] = df["essay_text"].apply(error_density_proxy)

    df.to_csv(out_dir / "02_text_features.csv", index=False)
    print("Created outputs/02_text_features.csv")

if __name__ == "__main__":
    main()
