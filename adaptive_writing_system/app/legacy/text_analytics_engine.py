"""
Text Analytics Engine - NLP-based writing analysis
Extracts linguistic features for adaptive writing assessment
"""

import re
import string
from collections import Counter
from typing import Dict, List, Tuple
import math

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False


class TextAnalyticsEngine:
    """
    Comprehensive NLP text analysis for L2 writing assessment
    Features: lexical diversity, cohesion, syntactic complexity, error detection
    """
    
    def __init__(self):
        self.nlp = None
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                print("Warning: spaCy model not found. Install: python -m spacy download en_core_web_sm")
    
    def analyze(self, text: str) -> Dict:
        """
        Complete text analysis - all features
        """
        return {
            "basic_metrics": self.extract_basic_metrics(text),
            "lexical_features": self.extract_lexical_features(text),
            "cohesion_features": self.extract_cohesion_features(text),
            "syntactic_features": self.extract_syntactic_features(text),
            "error_density": self.estimate_error_density(text),
            "academic_register": self.analyze_academic_register(text),
        }
    
    def extract_basic_metrics(self, text: str) -> Dict:
        """Word count, sentence count, etc."""
        words = text.split()
        sentences = text.split('.')
        
        return {
            "word_count": len(words),
            "sentence_count": len([s for s in sentences if s.strip()]),
            "avg_word_length": sum(len(w) for w in words) / len(words) if words else 0,
            "avg_sentence_length": len(words) / max(1, len([s for s in sentences if s.strip()])),
        }
    
    def extract_lexical_features(self, text: str) -> Dict:
        """
        Lexical diversity, word frequency, academic vocabulary
        """
        words = [w.lower() for w in re.findall(r'\b\w+\b', text)]
        
        if not words:
            return {}
        
        # Type-Token Ratio (TTR) - lexical diversity
        unique_words = len(set(words))
        ttr = unique_words / len(words) if words else 0
        
        # Corrected TTR (reduces effect of text length)
        corrected_ttr = unique_words / math.sqrt(2 * len(words)) if words else 0
        
        # Academic vocabulary (approximation without NLTK)
        academic_words = self._count_academic_vocabulary(words)
        
        return {
            "type_token_ratio": round(ttr, 3),
            "corrected_ttr": round(corrected_ttr, 3),
            "unique_word_count": unique_words,
            "academic_vocab_count": academic_words,
            "academic_vocab_percentage": round(academic_words / len(words) * 100, 2) if words else 0,
        }
    
    def extract_cohesion_features(self, text: str) -> Dict:
        """
        Connectives, pronouns, lexical cohesion
        """
        sentences = text.split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Count transitions and connectives
        transition_words = [
            'however', 'therefore', 'moreover', 'furthermore', 'additionally',
            'in addition', 'on the other hand', 'thus', 'consequently', 'also',
            'similarly', 'likewise', 'in contrast', 'because', 'since', 'if',
            'although', 'while', 'whereas', 'furthermore', 'besides'
        ]
        
        text_lower = text.lower()
        transition_count = sum(text_lower.count(t) for t in transition_words)
        
        # Pronoun density (anaphoric reference)
        pronouns = ['he', 'she', 'it', 'they', 'this', 'that', 'these', 'those']
        pronoun_count = sum(len(re.findall(r'\b' + p + r'\b', text_lower)) for p in pronouns)
        
        cohesion_index = (transition_count + pronoun_count / 2) / max(1, len(sentences))
        
        return {
            "transition_count": transition_count,
            "pronoun_count": pronoun_count,
            "cohesion_index": round(cohesion_index, 3),
            "sentence_count": len(sentences),
            "sentences": sentences,  # For detailed analysis
        }
    
    def extract_syntactic_features(self, text: str) -> Dict:
        """
        Sentence complexity, clause count, syntactic variety
        """
        sentences = text.split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        clause_count = text.count(',') + text.count(';')
        subordination_markers = [
            'because', 'although', 'while', 'if', 'since', 'unless',
            'until', 'before', 'after', 'when', 'where', 'which', 'that'
        ]
        
        text_lower = text.lower()
        subordination_count = sum(text_lower.count(m) for m in subordination_markers)
        
        return {
            "clause_count": clause_count,
            "subordination_count": subordination_count,
            "avg_clause_per_sentence": round(clause_count / max(1, len(sentences)), 2),
            "syntactic_complexity": round(1 + subordination_count / max(1, len(sentences)), 2),
        }
    
    def estimate_error_density(self, text: str) -> Dict:
        """
        Estimate grammatical and spelling errors
        """
        words = text.split()
        
        # Common error patterns
        errors = {
            "subject_verb_disagreement": len(re.findall(r'\b(?:are|is)\s+\w+\s+(?:was|were)\b', text, re.I)),
            "article_errors": len(re.findall(r'\b(?:a|an)\s+(?:consonant|aeiou)', text, re.I)),
            "preposition_errors": len(re.findall(r'\b(?:in|on|at|by)\s+\w+\s+(?:in|on|at|by)\b', text, re.I)),
            "fragment_sentences": text.count('!') + text.count('?'),  # Approximation
            "run_on_sentences": text.count(' and ') + text.count(' but '),  # Approximation
        }
        
        total_errors = sum(errors.values())
        error_density = (total_errors / len(words) * 100) if words else 0
        
        return {
            "total_errors_detected": total_errors,
            "error_density": round(error_density, 2),
            "error_per_100_words": round((total_errors / len(words) * 100), 2) if words else 0,
            "error_breakdown": errors,
        }
    
    def analyze_academic_register(self, text: str) -> Dict:
        """
        Academic style, formality, hedging language
        """
        text_lower = text.lower()
        
        # Hedging language (uncertainty markers)
        hedging = ['may', 'might', 'could', 'seem', 'appear', 'arguably', 'possibly']
        hedging_count = sum(text_lower.count(h) for h in hedging)
        
        # Passive voice approximation
        passive_patterns = [
            r'\b\w+\s+(?:is|are|was|were|be|been)\s+\w+ed\b',
            r'\b\w+\s+(?:is|are|was|were|be|been)\s+\w+en\b'
        ]
        passive_count = sum(len(re.findall(p, text, re.I)) for p in passive_patterns)
        
        # Formal tone markers
        formal_markers = ['moreover', 'furthermore', 'consequently', 'therefore', 'thus']
        formal_count = sum(text_lower.count(m) for m in formal_markers)
        
        # Contractions (informal)
        contractions = len(re.findall(r'\b\w+\'[a-z]+\b', text, re.I))
        
        formality_score = (formal_count - contractions/2 + passive_count/5) / max(1, len(text.split()))
        formality_score = min(1.0, max(0.0, formality_score))  # 0-1 scale
        
        return {
            "hedging_count": hedging_count,
            "passive_voice_count": passive_count,
            "formal_markers": formal_count,
            "contractions": contractions,
            "formality_score": round(formality_score, 3),
            "academic_register_assessment": "strong" if formality_score > 0.6 else "moderate" if formality_score > 0.3 else "weak"
        }
    
    @staticmethod
    def _count_academic_vocabulary(words: List[str]) -> int:
        """
        Count words from academic word list (approximation)
        """
        academic_words = {
            'analyze', 'argue', 'claim', 'conclude', 'consider', 'demonstrate',
            'develop', 'discuss', 'establish', 'evaluate', 'evidence', 'examine',
            'explain', 'illustrate', 'imply', 'indicate', 'infer', 'investigate',
            'maintain', 'method', 'occur', 'propose', 'recognize', 'result',
            'significant', 'suggest', 'support', 'theory', 'understand', 'variable',
            'issue', 'factor', 'process', 'concept', 'principle', 'approach',
            'assumption', 'benefit', 'challenge', 'constraint', 'context', 'criteria',
            'derive', 'function', 'hypothesis', 'implication', 'mechanism', 'objective',
            'outcome', 'parameter', 'perspective', 'phenomenon', 'potential', 'procedure',
        }
        
        return sum(1 for w in words if w.lower() in academic_words)


class TextComparisonEngine:
    """
    Compare two drafts to measure revision effectiveness
    """
    
    def compare_drafts(self, draft1: str, draft2: str, analytics_engine: TextAnalyticsEngine) -> Dict:
        """
        Analyze draft-to-draft improvements
        """
        analysis1 = analytics_engine.analyze(draft1)
        analysis2 = analytics_engine.analyze(draft2)
        
        # Calculate improvements
        improvements = {
            "word_count_change": analysis2["basic_metrics"]["word_count"] - analysis1["basic_metrics"]["word_count"],
            "lexical_diversity_change": analysis2["lexical_features"]["type_token_ratio"] - analysis1["lexical_features"]["type_token_ratio"],
            "cohesion_improvement": analysis2["cohesion_features"]["cohesion_index"] - analysis1["cohesion_features"]["cohesion_index"],
            "error_reduction": analysis1["error_density"]["error_per_100_words"] - analysis2["error_density"]["error_per_100_words"],
            "syntactic_complexity_change": analysis2["syntactic_features"]["syntactic_complexity"] - analysis1["syntactic_features"]["syntactic_complexity"],
            "formality_improvement": analysis2["academic_register"]["formality_score"] - analysis1["academic_register"]["formality_score"],
        }
        
        # Overall revision quality assessment
        improvement_score = sum(1 for v in improvements.values() if v > 0) / len(improvements)
        
        return {
            "draft_1_analysis": analysis1,
            "draft_2_analysis": analysis2,
            "improvements": improvements,
            "overall_improvement_score": round(improvement_score, 3),
            "revision_depth": self._assess_revision_depth(draft1, draft2),
        }
    
    @staticmethod
    def _assess_revision_depth(draft1: str, draft2: str) -> str:
        """
        Categorize revision as surface or deep
        """
        # Simple heuristic: if word count change > 20%, likely deep revision
        words1 = len(draft1.split())
        words2 = len(draft2.split())
        
        word_change = abs(words2 - words1) / max(words1, 1)
        
        if word_change > 0.30:
            return "deep"  # Significant restructuring
        elif word_change > 0.10:
            return "moderate"  # Some content changes
        else:
            return "surface"  # Mostly edits within existing structure


if __name__ == "__main__":
    # Example usage
    engine = TextAnalyticsEngine()
    
    sample_text = """
    Online learning provides significant advantages for many students. First, 
    it allows flexible access to educational resources without geographical constraints. 
    Students can engage with materials at their own pace and schedule. Moreover, 
    online platforms offer opportunities for diverse learning styles through multimedia integration.
    """
    
    results = engine.analyze(sample_text)
    for category, features in results.items():
        print(f"\n{category}:")
        for key, value in features.items():
            print(f"  {key}: {value}")
