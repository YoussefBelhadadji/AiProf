import re
import pandas as pd
from pathlib import Path
import textstat
import nltk

# Ensure basic NLTK resources are available silently without crashing on first run
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download('words', quiet=True)

BASE = Path(__file__).resolve().parents[1]

# Expanded list of academic connectors for true cohesion analysis
CONNECTORS = [
    "however", "therefore", "furthermore", "moreover", "nevertheless",
    "in addition", "as a result", "for example", "because", "consequently",
    "subsequently", "in contrast", "on the other hand", "similarly", "thus",
    "hence", "meanwhile", "specifically", "ultimately", "namely"
]

def tokenize(text: str):
    return re.findall(r"\b\w+\b", str(text).lower())

def word_count(text: str) -> int:
    return textstat.lexicon_count(str(text), removepunct=True)

def sentence_count(text: str) -> int:
    return textstat.sentence_count(str(text))

def ttr(text: str) -> float:
    words = [w for w in tokenize(text) if len(w) > 2] # ignore tiny stop words for TTR
    return len(set(words)) / len(words) if words else 0.0

def cohesion_index(text: str) -> int:
    lower = str(text).lower()
    return sum(lower.count(c) for c in CONNECTORS)

def avg_sentence_length(text: str) -> float:
    wc = word_count(text)
    sc = sentence_count(text)
    return wc / sc if sc else 0.0

def error_density_proxy(text: str) -> float:
    """
    Advanced grammatical proxy using a combination of readability metrics 
    and out-of-dictionary word checks (as a spell/grammar check proxy).
    """
    words = tokenize(text)
    if not words:
        return 0.0
    
    # Check words against NLTK words corpus (fast spelling/vocabulary check)
    try:
        english_vocab = set(w.lower() for w in nltk.corpus.words.words())
        unknown_words = sum(1 for w in words if w not in english_vocab and not w.isdigit())
    except:
        unknown_words = 0
        
    # Factor in Fog Scale: if text is too hard to read relative to word count, it indicates syntactic errors
    fog_index = textstat.gunning_fog(str(text))
    # A base score combining spelling errors and disproportionate complexity
    estimated_errors = unknown_words + (0.5 if fog_index > 14 else 0)
    
    # Adding previous manual proxies mapped to logic
    if len(words) < 80:
        estimated_errors += 2
        
    return round((estimated_errors / len(words)) * 100, 2)

def compute_features():
    df = pd.read_csv(BASE / "outputs" / "01_merged.csv")
    
    # Fill NaN essays securely
    df["essay_text"] = df["essay_text"].fillna("")
    
    df["word_count"] = df["essay_text"].apply(word_count)
    df["sentence_count"] = df["essay_text"].apply(sentence_count)
    df["ttr"] = df["essay_text"].apply(ttr)
    df["cohesion_index"] = df["essay_text"].apply(cohesion_index)
    df["avg_sentence_length"] = df["essay_text"].apply(avg_sentence_length)
    df["error_density"] = df["essay_text"].apply(error_density_proxy)

    out = BASE / "outputs" / "02_features.csv"
    df.to_csv(out, index=False)
    return df

if __name__ == "__main__":
    compute_features()

