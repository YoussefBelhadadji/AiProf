import pandas as pd
import re
import os

# Helper for text tokenization (simple version if spacy is not setup yet)
def tokenize(text):
    return re.findall(r"\b\w+\b", str(text).lower())

def calculate_ttr(text):
    words = tokenize(text)
    if not words:
        return 0
    return len(set(words)) / len(words)

def count_cohesion_markers(text):
    # Research-based list of connectors (Hyland, 2019)
    connectors = {
        "however", "therefore", "moreover", "furthermore", "in addition",
        "for example", "as a result", "on the other hand", "thus", "consequently"
    }
    lowered = str(text).lower()
    return sum(lowered.count(c) for c in connectors)

def run_text_analysis():
    print("--- [PHASE 2] Automated Textual Feature Extraction ---")
    
    input_df_path = "outputs/01_master_dataset.csv"
    if not os.path.exists(input_df_path):
        print(f"Error: {input_df_path} not found. Run 01_clean_data.py first.")
        return

    df = pd.read_csv(input_df_path)
    
    print("Extracting NLP Indicators: Word Count, TTR, Cohesion Index...")
    df["word_count"] = df["essay_text"].apply(lambda x: len(tokenize(x)))
    df["ttr"] = df["essay_text"].apply(calculate_ttr)
    df["cohesion_index"] = df["essay_text"].apply(count_cohesion_markers)
    
    # Calculate error density proxy (simplified)
    # Researcher Note: Error density normally requires LanguageTool or manual coding
    df["error_density_proxy"] = df["rubric_grammar"].apply(lambda g: (5 - g) * 1.5)

    output_path = "outputs/02_dataset_with_features.csv"
    df.to_csv(output_path, index=False)
    print(f"--- SUCCESS: Text features saved to {output_path} ---")
    print(df[["student_id", "task_id", "word_count", "ttr", "cohesion_index"]].head())

if __name__ == "__main__":
    run_text_analysis()
