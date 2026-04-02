import React, { useState } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import './AdaptiveFeedback.css';

/**
 * AdaptiveFeedback Component
 * Displays pedagogically-informed feedback based on learner profile,
 * text analysis, and interpretation rules
 */

interface CompetenceFactor {
  [key: string]: number;
}

interface AdaptiveResponse {
  learner_profile: {
    type: string;
    name: string;
    confidence: number;
    description: string;
    recommended_support: string;
  };
  competence: {
    factor_competence: CompetenceFactor;
    overall_competence_estimate: number;
    competence_profile: string;
    learning_trajectory: string;
  };
  adaptive_feedback: {
    online_feedback: string;
    onsite_intervention: string;
    metacognitive_prompts: string[];
    next_writing_goal: string;
  };
  pedagogical_evaluation: {
    diagnosis: {
      profile: string;
      intervention_priority: 'none' | 'low' | 'moderate' | 'high' | 'critical';
      learning_needs: { [key: string]: string };
    };
  };
  text_analysis: {
    basic_metrics: {
      word_count: number;
      sentence_count: number;
      avg_sentence_length: number;
    };
    lexical_features: {
      type_token_ratio: number;
      academic_vocab_percentage: number;
    };
    cohesion_features: {
      cohesion_index: number;
      transition_count: number;
    };
    error_density: {
      error_per_100_words: number;
    };
  };
  next_steps: Array<{
    priority: string;
    action: string;
    timing: string;
    rationale?: string;
  }>;
}

interface AdaptiveFeedbackProps {
  response: AdaptiveResponse;
  onRevise?: () => void;
}

const AdaptiveFeedback: React.FC<AdaptiveFeedbackProps> = ({ response, onRevise }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'feedback',
    'profile'
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626'; // red
      case 'high':
        return '#f97316'; // orange
      case 'moderate':
        return '#eab308'; // yellow
      case 'low':
      case 'none':
        return '#22c55e'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      critical: '🔴 Critical Support Needed',
      high: '🟠 Significant Support Needed',
      moderate: '🟡 Targeted Development',
      low: '🟢 Monitor Progress',
      none: '🟢 Strong Progress',
    };
    return labels[priority] || priority;
  };

  const competenceProfile = response.competence;
  const diagnosis = response.pedagogical_evaluation.diagnosis;
  const adaptation = response.adaptive_feedback;

  return (
    <div className="adaptive-feedback-container">
      {/* HEADER: Learner Profile Card */}
      <div className="feedback-header">
        <div className="profile-card">
          <h2>{response.learner_profile.name}</h2>
          <p className="profile-description">
            {response.learner_profile.description}
          </p>
          <div className="confidence-badge">
            Confidence: {Math.round(response.learner_profile.confidence * 100)}%
          </div>
        </div>

        <div className="priority-indicator">
          <div
            className="priority-dot"
            style={{ backgroundColor: getPriorityColor(diagnosis.intervention_priority) }}
          ></div>
          <span>{getPriorityLabel(diagnosis.intervention_priority)}</span>
        </div>
      </div>

      {/* SECTION 1: Adaptive Feedback */}
      <div className="feedback-section">
        <div
          className="section-header"
          onClick={() => toggleSection('feedback')}
        >
          <Zap size={20} />
          <h3>Your Adaptive Feedback</h3>
          <span className="toggle-icon">
            {expandedSections.includes('feedback') ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.includes('feedback') && (
          <div className="section-content">
            {/* Online Feedback */}
            <div className="feedback-box primary">
              <h4>💡 Specific Feedback on Your Draft</h4>
              <p>{adaptation.online_feedback}</p>
            </div>

            {/* Next Goal */}
            <div className="feedback-box goal">
              <h4>🎯 Next Writing Goal</h4>
              <p>{adaptation.next_writing_goal}</p>
            </div>

            {/* Metacognitive Prompts */}
            <div className="feedback-box metacognitive">
              <h4>🤔 Think About This</h4>
              <ul>
                {adaptation.metacognitive_prompts.map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>

            {/* On-site Support */}
            {adaptation.onsite_intervention && (
              <div className="feedback-box support">
                <h4>🏫 On-Campus Support</h4>
                <p>{adaptation.onsite_intervention}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Learner Profile & Competence */}
      <div className="feedback-section">
        <div
          className="section-header"
          onClick={() => toggleSection('profile')}
        >
          <TrendingUp size={20} />
          <h3>Your Learning Profile</h3>
          <span className="toggle-icon">
            {expandedSections.includes('profile') ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.includes('profile') && (
          <div className="section-content">
            {/* Competence Overview */}
            <div className="competence-card">
              <h4>Overall Writing Competence</h4>
              <div className="competence-gauge">
                <div className="gauge-bar">
                  <div
                    className="gauge-fill"
                    style={{
                      width: `${competenceProfile.overall_competence_estimate * 100}%`,
                      backgroundColor: getPriorityColor(
                        competenceProfile.overall_competence_estimate > 0.75
                          ? 'none'
                          : competenceProfile.overall_competence_estimate > 0.6
                          ? 'low'
                          : competenceProfile.overall_competence_estimate > 0.4
                          ? 'moderate'
                          : 'high'
                      ),
                    }}
                  ></div>
                </div>
                <p className="gauge-label">
                  {Math.round(competenceProfile.overall_competence_estimate * 100)}% –{' '}
                  {competenceProfile.competence_profile}
                </p>
              </div>

              {/* Factor Breakdown */}
              <div className="competence-factors">
                <h5>Competence by Factor:</h5>
                {Object.entries(competenceProfile.factor_competence).map(
                  ([factor, value]) => (
                    <div key={factor} className="factor-item">
                      <label>
                        {factor
                          .replace(/_/g, ' ')
                          .replace(/competence/i, '')
                          .trim()}
                      </label>
                      <div className="mini-gauge">
                        <div
                          className="mini-fill"
                          style={{
                            width: `${(value as number) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span>{Math.round((value as number) * 100)}%</span>
                    </div>
                  )
                )}
              </div>

              {/* Learning Trajectory */}
              <div className="trajectory-box">
                <h5>📈 Your Learning Path</h5>
                <p>{competenceProfile.learning_trajectory}</p>
              </div>
            </div>

            {/* Support Strategy */}
            <div className="support-card">
              <h4>Recommended Support</h4>
              <p className="support-modality">
                <strong>{response.learner_profile.recommended_support}</strong>
              </p>
              {Object.entries(diagnosis.learning_needs).length > 0 && (
                <div className="learning-needs">
                  <h5>Focus Areas:</h5>
                  <ul>
                    {Object.entries(diagnosis.learning_needs).map(
                      ([need, strategy]) => (
                        <li key={need}>
                          <strong>{need}:</strong> {strategy}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Text Analysis Summary */}
      <div className="feedback-section">
        <div
          className="section-header"
          onClick={() => toggleSection('analysis')}
        >
          <AlertCircle size={20} />
          <h3>Your Writing Metrics</h3>
          <span className="toggle-icon">
            {expandedSections.includes('analysis') ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.includes('analysis') && (
          <div className="section-content">
            <div className="metrics-grid">
              <div className="metric">
                <h5>Length</h5>
                <p className="metric-value">
                  {response.text_analysis.basic_metrics.word_count} words
                </p>
                <p className="metric-guidance">
                  {response.text_analysis.basic_metrics.word_count < 80
                    ? '⚠️ Consider expanding'
                    : '✓ Adequate length'}
                </p>
              </div>

              <div className="metric">
                <h5>Lexical Diversity</h5>
                <p className="metric-value">
                  {Math.round(
                    response.text_analysis.lexical_features.type_token_ratio * 100
                  )}%
                </p>
                <p className="metric-guidance">
                  {response.text_analysis.lexical_features.type_token_ratio > 0.5
                    ? '✓ Strong vocabulary range'
                    : 'Consider varying word choice'}
                </p>
              </div>

              <div className="metric">
                <h5>Cohesion</h5>
                <p className="metric-value">
                  {Math.round(
                    response.text_analysis.cohesion_features.cohesion_index * 100
                  ) / 10}
                </p>
                <p className="metric-guidance">
                  Transitions: {response.text_analysis.cohesion_features.transition_count}
                </p>
              </div>

              <div className="metric">
                <h5>Accuracy</h5>
                <p className="metric-value">
                  {Math.round(
                    response.text_analysis.error_density.error_per_100_words
                  )}{' '}
                  errors/100w
                </p>
                <p className="metric-guidance">
                  {response.text_analysis.error_density.error_per_100_words < 4
                    ? '✓ Strong accuracy'
                    : 'Review for errors'}
                </p>
              </div>

              <div className="metric">
                <h5>Academic Vocabulary</h5>
                <p className="metric-value">
                  {Math.round(
                    response.text_analysis.lexical_features.academic_vocab_percentage
                  )}%
                </p>
                <p className="metric-guidance">Formal register strength</p>
              </div>

              <div className="metric">
                <h5>Sentence Length</h5>
                <p className="metric-value">
                  {Math.round(
                    response.text_analysis.basic_metrics.avg_sentence_length
                  )}{' '}
                  words
                </p>
                <p className="metric-guidance">
                  {response.text_analysis.basic_metrics.avg_sentence_length > 20
                    ? 'Complex structure'
                    : 'Clear and concise'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Action Plan */}
      <div className="feedback-section">
        <div
          className="section-header"
          onClick={() => toggleSection('actions')}
        >
          <CheckCircle size={20} />
          <h3>Your Next Steps</h3>
          <span className="toggle-icon">
            {expandedSections.includes('actions') ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.includes('actions') && (
          <div className="section-content action-plan">
            {response.next_steps.map((step, idx) => (
              <div key={idx} className="action-item">
                <div className="action-priority">{step.priority}</div>
                <div className="action-details">
                  <h5>{step.action}</h5>
                  <p>{step.timing}</p>
                  {step.rationale && <p className="rationale">{step.rationale}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="feedback-actions">
        {onRevise && (
          <button className="btn btn-primary" onClick={onRevise}>
            ✏️ Submit Revised Draft
          </button>
        )}
        <button className="btn btn-secondary">
          💬 Ask for Clarification
        </button>
        <button className="btn btn-secondary">
          📊 View Progress Timeline
        </button>
      </div>
    </div>
  );
};

export default AdaptiveFeedback;
