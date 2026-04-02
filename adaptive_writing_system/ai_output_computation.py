"""
Text Analytics Engine - Extracts linguistic features from student writing
Core component for WriteLens adaptive assessment system
"""

import re
from typing import Dict, List, Tuple
from collections import Counter
import statistics

class TextAnalytics:
    """Comprehensive text feature extraction for writing analysis"""
    
    def __init__(self):
        """Initialize text analytics engine"""
        self.transition_words = {
            'addition': ['furthermore', 'moreover', 'additionally', 'also', 'besides'],
            'contrast': ['however', 'nevertheless', 'although', 'but', 'yet'],
            'cause': ['because', 'since', 'as', 'caused', 'due to'],
            'effect': ['therefore', 'thus', 'consequently', 'as a result'],
            'example': ['for example', 'for instance', 'such as', 'like'],
            'conclusion': ['in conclusion', 'finally', 'in summary', 'ultimately']
        }
        
        self.academic_vocab = {
            'argue', 'assert', 'claim', 'suggest', 'propose', 'demonstrate',
            'evidence', 'analyze', 'evaluate', 'interpret', 'compare',
            'contrast', 'conclude', 'implies', 'indicates', 'illustrates',
            'reveals', 'shows', 'exhibits', 'establishes', 'supports',
            'refute', 'contradict', 'challenge', 'dispute', 'validate',
            'framework', 'perspective', 'dimension', 'implication', 'significance'
        }
    
    def extract_all_features(self, text: str) -> Dict:
        """Extract all linguistic and structural features"""
        tokens = self._tokenize(text)
        sentences = self._segment_sentences(text)
        
        return {
            'word_count': self._word_count(tokens),
            'sentence_count': len(sentences),
            'avg_sentence_length': self._avg_sentence_length(tokens, sentences),
            'avg_word_length': self._avg_word_length(tokens),
            'lexical_diversity': self._type_token_ratio(tokens),
            'lexical_richness': self._lexical_variation(tokens),
            'academic_vocab_count': self._count_academic_vocab(tokens),
            'academic_vocab_ratio': self._academic_vocab_ratio(tokens),
            'cohesion_index': self._cohesion_index(text, sentences),
            'transition_density': self._transition_density(text),
            'argument_markers': self._count_argument_markers(text),
            'error_density': self._estimate_error_density(text),
            'syntactic_complexity': self._syntactic_complexity(tokens, sentences),
            'pronoun_reference_clarity': self._pronoun_clarity(text),
            'passive_voice_ratio': self._passive_voice_ratio(tokens),
            'nominalization_density': self._nominalization_density(tokens),
            'discourse_coherence': self._discourse_coherence(text, sentences)
        }
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization"""
        text = text.lower()
        tokens = re.findall(r'\b\w+\b', text)
        return tokens
    
    def _segment_sentences(self, text: str) -> List[str]:
        """Segment text into sentences"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _word_count(self, tokens: List[str]) -> int:
        """Count total words"""
        return len(tokens)
    
    def _avg_sentence_length(self, tokens: List[str], sentences: List[str]) -> float:
        """Calculate average sentence length in words"""
        if not sentences:
            return 0
        return len(tokens) / len(sentences)
    
    def _avg_word_length(self, tokens: List[str]) -> float:
        """Calculate average word length in characters"""
        if not tokens:
            return 0
        return statistics.mean(len(token) for token in tokens)
    
    def _type_token_ratio(self, tokens: List[str]) -> float:
        """Type-Token Ratio (lexical diversity)"""
        if not tokens:
            return 0
        unique_tokens = len(set(tokens))
        total_tokens = len(tokens)
        return round(unique_tokens / total_tokens, 3) if total_tokens > 0 else 0
    
    def _lexical_variation(self, tokens: List[str]) -> Dict:
        """Deeper lexical analysis"""
        if not tokens:
            return {'variation_index': 0, 'repeated_words': 0}
        
        word_freq = Counter(tokens)
        repeated = sum(1 for count in word_freq.values() if count > 2)
        
        return {
            'variation_index': len(set(tokens)) / len(tokens) if tokens else 0,
            'repeated_words': repeated,
            'most_common': word_freq.most_common(3)
        }
    
    def _count_academic_vocab(self, tokens: List[str]) -> int:
        """Count academic vocabulary usage"""
        return sum(1 for token in tokens if token in self.academic_vocab)
    
    def _academic_vocab_ratio(self, tokens: List[str]) -> float:
        """Ratio of academic vocabulary"""
        if not tokens:
            return 0
        academic_count = self._count_academic_vocab(tokens)
        return round(academic_count / len(tokens), 3)
    
    def _cohesion_index(self, text: str, sentences: List[str]) -> float:
        """Measure textual cohesion through transitions and reference chains"""
        if not sentences:
            return 0
        
        text_lower = text.lower()
        transition_count = 0
        
        for category in self.transition_words.values():
            for word in category:
                transition_count += text_lower.count(word)
        
        pronoun_count = len(re.findall(r'\b(he|she|it|they|this|that|these|those)\b', text_lower))
        reference_chains = pronoun_count / len(sentences) if sentences else 0
        
        cohesion_score = (transition_count + reference_chains) / (len(sentences) or 1)
        return round(min(cohesion_score, 5.0), 2)  # Scale to 5
    
    def _transition_density(self, text: str) -> float:
        """Density of transition markers"""
        text_lower = text.lower()
        total_transitions = 0
        
        for words in self.transition_words.values():
            for word in words:
                total_transitions += text_lower.count(word)
        
        token_count = len(self._tokenize(text))
        return round(total_transitions / token_count * 100, 2) if token_count > 0 else 0
    
    def _count_argument_markers(self, text: str) -> Dict:
        """Count markers of argumentation"""
        patterns = {
            'claim_markers': len(re.findall(r'\b(claim|argue|assert|believe|argue that)\b', text, re.I)),
            'evidence_markers': len(re.findall(r'\b(evidence|example|instance|shows|demonstrates)\b', text, re.I)),
            'reasoning_markers': len(re.findall(r'\b(because|since|therefore|consequently|thus)\b', text, re.I))
        }
        return patterns
    
    def _estimate_error_density(self, text: str) -> float:
        """Estimate grammatical error density (simplified)"""
        words = self._tokenize(text)
        if not words:
            return 0
        
        # Simplified heuristics for common errors
        errors = 0
        text_lower = text.lower()
        
        # Subject-verb agreement issues (simplified)
        if re.search(r'\b(student|person|writer)\s+is\s+(\w+)ing', text_lower):
            errors += len(re.findall(r'\b(student|person|writer)\s+is\s+(\w+)ing', text_lower))
        
        # Spelling patterns (simplified)
        common_misspellings = ['recieve', 'occured', 'seperate', 'definately', 'dont']
        for misspelling in common_misspellings:
            errors += text_lower.count(misspelling)
        
        error_per_100 = (errors / len(words)) * 100 if words else 0
        return round(min(error_per_100, 10), 2)  # Cap at 10
    
    def _syntactic_complexity(self, tokens: List[str], sentences: List[str]) -> float:
        """Estimate syntactic complexity"""
        if not sentences:
            return 0
        
        # Count clauses and complex structures
        clause_markers = sum(1 for token in tokens if token in ['because', 'since', 'although', 'while', 'if'])
        dependent_clauses = clause_markers / len(sentences) if sentences else 0
        
        complexity_score = dependent_clauses * 2.0  # Weight clause density
        return round(min(complexity_score, 5.0), 2)
    
    def _pronoun_clarity(self, text: str) -> float:
        """Estimate clarity of pronoun references"""
        pronouns = len(re.findall(r'\b(he|she|it|they|this|that)\b', text, re.I))
        antecedents = len(re.findall(r'\b(student|writer|author|reader|person|group)\b', text, re.I))
        
        if pronouns == 0:
            return 5.0  # No pronouns = clear
        
        clarity = (antecedents / pronouns) if pronouns > 0 else 0
        return round(min(clarity * 5, 5.0), 2)
    
    def _passive_voice_ratio(self, tokens: List[str]) -> float:
        """Estimate ratio of passive voice constructions"""
        total_verbs = sum(1 for token in tokens if token in ['is', 'was', 'are', 'been', 'being'])
        if total_verbs == 0:
            return 0
        return round(total_verbs / max(len(tokens), 1) * 100, 2)
    
    def _nominalization_density(self, tokens: List[str]) -> float:
        """Count nominalizations (noun forms of verbs)"""
        nominalizations = ['analysis', 'development', 'improvement', 'achievement', 'understanding',
                          'implementation', 'discussion', 'interpretation', 'evaluation', 'assessment']
        nominalization_count = sum(1 for token in tokens if token in nominalizations)
        return round(nominalization_count / len(tokens) * 100, 2) if tokens else 0
    
    def _discourse_coherence(self, text: str, sentences: List[str]) -> float:
        """Overall discourse coherence measure"""
        cohesion = self._cohesion_index(text, sentences)
        pronoun_clarity = self._pronoun_clarity(text)
        transition_density = self._transition_density(text)
        
        # Weighted average
        coherence = (cohesion * 0.4 + pronoun_clarity * 0.3 + min(transition_density / 20, 5) * 0.3)
        return round(coherence, 2)


def create_text_analytics() -> TextAnalytics:
    """Factory function for text analytics"""
    return TextAnalytics()
