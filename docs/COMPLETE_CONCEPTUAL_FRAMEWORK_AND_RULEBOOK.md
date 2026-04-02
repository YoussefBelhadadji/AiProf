# WriteLens Complete Conceptual Framework & Expanded Adaptive Rulebook
# Version 3.0 – Full Integration with Help-Seeking and Evidence-Centered Design
# Reference: Mislevy (2003), Zimmerman (2000), Newman & Schwager (1995), Hyland (2019)

---

## PART 1: CONCEPTUAL FRAMEWORK DIAGRAM SPECIFICATION

### Overview
The WriteLens adaptive assessment system operates through a NINE-LAYER INTEGRATED ARCHITECTURE:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WRITELEN SYSTEM ARCHITECTURE                     │
│                    (9-Layer Adaptive Assessment Framework)              │
└─────────────────────────────────────────────────────────────────────────┘

LAYER 1: RAW DATA COLLECTION
  └─ Moodle Logs | Essay Texts | Teacher Observations | Help-Seeking Messages
     │
LAYER 2: BEHAVIORAL LEARNING ANALYTICS
  └─ Platform Logins | Resource Access | Time-on-Task | Draft Submissions | Help-Seeking Frequency
     │
LAYER 3: WRITING PRODUCT ANALYSIS (Rubric-Based)
  └─ Rubric Scores (Argument, Organization, Grammar, etc.) via analytic scale
     │
LAYER 4: TEXT ANALYTICS (Computational Features)
  └─ Word Count | Error Density | Cohesion Index | Lexical Diversity | Sentence Length
     │
LAYER 5: CORRELATION ANALYSIS
  └─ Links Between Behavior Patterns and Writing Quality (Process-Product Relationship)
     │
LAYER 6: LEARNER PROFILING (K-Means Clustering)
  └─ Behavioral Clusters: Disengaged | Effortful-Struggling | Fragile-Efficient | Strategic-Engaged
     │
LAYER 7: PREDICTIVE MODELING (Random Forest)
  └─ Regressor: Predict Final Score
  └─ Classifier: Detect At-Risk Students
  └─ Feature Importance: Which variables predict success?
     │
LAYER 8: COMPETENCE INFERENCE (Bayesian Network)
  └─ Latent Competencies:
     ├─ Argument Structure Competence (posterior probability)
     ├─ Cohesion & Coherence Competence (posterior probability)
     ├─ Linguistic Complexity (posterior probability)
     └─ Self-Regulated Revision (posterior probability)
     │
LAYER 9: ADAPTIVE FEEDBACK & INTERVENTION
  └─ Evidence-Based Rules → Targeted Feedback Templates → Teacher Onsite Intervention
     │
     └─ OUTCOME: Student Growth Across Drafts
```

### Data Flow Model
```
STUDENT WRITES DRAFT 1
        ↓
   ┌────────────────────────────────────────────────────┐
   │ Extract Evidence (Layers 2-5)                      │
   │ ├─ Behavioral: time_on_task, revision_freq, etc.  │
   │ ├─ Rubric: scores on 7 criteria (1-5 each)       │
   │ ├─ Textual: word_count, cohesion_index, etc.     │
   │ └─ Help-Seeking: level, content, timing           │
   └────────────────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────────────────┐
   │ Profile Learner (Layers 6-8)                       │
   │ ├─ Cluster Assignment: Which profile matches?     │
   │ ├─ Predictability: RF predicts score              │
   │ └─ Competencies: Bayesian posteriors for 4 skills │
   └────────────────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────────────────┐
   │ Diagnose via ECD (Evidence-Centered Design)        │
   │ ├─ Observable Evidence: student's actual data      │
   │ ├─ Pedagogical Claim: what it means               │
   │ └─ Educational Intervention: what to teach        │
   └────────────────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────────────────┐
   │ Deliver Adaptive Feedback (Layer 9)                │
   │ ├─ Select Rule: which pedagogical rule matches?   │
   │ ├─ Select Template: which feedback variant?       │
   │ │  └─ Adjusted for help-seeking level             │
   │ └─ Deliver: written feedback + onsite intervention│
   └────────────────────────────────────────────────────┘
        ↓
   STUDENT REVISES (monitors, seeks help adaptively)
        ↓
   STUDENT WRITES DRAFT 2
        ↓
   ┌────────────────────────────────────────────────────┐
   │ Growth Analysis (Compare Draft 1 → Draft 2)        │
   │ ├─ Score Improvement: 2/35 → 3/35 → 4/35          │
   │ ├─ Process Growth: More revisions? Help-seeking?  │
   │ └─ Competency Growth: Bayesian posteriors change? │
   └────────────────────────────────────────────────────┘
        ↓
   ACCUMULATE EVIDENCE FOR FINAL ASSESSMENT
```

### Theoretical Integration Model
```
SRL PHASES (Zimmerman 2000)          ECD COMPONENTS                  ADAPTATION MECHANISM
─────────────────────────────────    ──────────────────────────────  ──────────────────────

FORETHOUGHT PHASE                    Observable Evidence             System Detects:
├─Goal Setting                       ├─Rubric views                 └─ Weak planning
├─Planning                           ├─Resource access              
├─Task Analysis                      └─Time before drafting          → Provides:
├─Motivation                                                         └─ Planning scaffolds
└─Help-Seeking (early)               Pedagogical Claims
                                     ├─Student lacks criteria        HELP-SEEKING LEVEL:
                                     │  awareness                    ├─ None → Normalize
PERFORMANCE PHASE                    └─Needs planning support        ├─ Present → Coach
├─Execution                                                         └─ Adaptive → Praise
├─Self-Monitoring                   Educational Interventions
├─Self-Control                       ├─Rubric walkthrough
└─Help-Seeking (strategic)           ├─Outlining scaffold
                                     └─Planning checklist

SELF-REFLECTION PHASE                Based on Bayesian             Feedback Complexity:
├─Self-Evaluation                    Competencies:                 ├─ Low demand if skill very low
├─Causal Attribution                 ├─Argument competence         ├─ Moderate if developing
├─Adaptive Inferences                ├─Cohesion competence         └─ High if strong (advanced challenge)
└─Help-Seeking (seeking clarification)├─Linguistic control
                                     └─Self-Regulated Revision     COGNITIVE SCAFFOLDING:
                                                                   ├─ Direct modeling
                                                                   ├─ Guided practice
                                                                   └─ Independent attempt
```

---

## PART 2: EXPANDED ADAPTIVE RULEBOOK (30+ COMPREHENSIVE RULES)

### Rule Organization
Rules are organized by PEDAGOGICAL DIMENSION and HELP-SEEKING INTEGRATION

metadata:
  total_rules: 32
  organization: "7 pedagogical dimensions × profile-context rules + help-seeking variants"
  version: "3.0 Complete"

---

# ===========================================================================
# DIMENSION A: PLANNING & FORETHOUGHT (5 rules)
# ===========================================================================

rules_dimension_a:
  
  rule_id: "A1_weak_planning_early"
    priority: 105
    category: "Planning & Criteria Awareness"
    trigger_condition: "rubric_views == 0 AND time_before_draft < 15"
    evidence_chain: "Zero rubric consultation + immediate drafting → No pre-writing planning"
    pedagogical_claim: "Student lacks criteria awareness; has not engaged in forethought phase"
    adaptive_strategy: "Metacognitive + Scaffolding"
    cognitive_demand: "Low (explicit instruction in planning steps)"
    feedback_template_base: "planning_scaffold"
    help_seeking_variants:
      hs_none: "planning_scaffold_none"  # Normalization
      hs_present: "planning_scaffold_present"  # Coaching on specificity
      hs_adaptive: "planning_scaffold_adaptive"  # Reinforcement + advanced
    response_template: "planning_scaffold"
    onsite_intervention:
      - "rubric_guided_walkthrough"
      - "collaborative_outline_building"
      - "task_analysis_checklist"
    theoretical_basis: "Zimmerman (2000) forethought; Nicol & Macfarlane-Dick (2006) criteria awareness"
    growth_marker: "Next: Monitor rubric_views increase → indicates planning engagement"
  
  rule_id: "A2_strong_planning"
    priority: 85
    category: "Planning & Criteria Awareness"
    trigger_condition: "rubric_views >= 3 AND time_before_draft >= 20"
    evidence_chain: "Multiple rubric consultations + planning time → Adequate forethought"
    pedagogical_claim: "Student engages appropriately in planning phase"
    adaptive_strategy: "Reinforcement + Redirect to execution quality"
    cognitive_demand: "Low-Moderate"
    feedback_template_base: "planning_reinforcement"
    help_seeking_variants:
      hs_none: "planning_efficient"
      hs_present: "planning_with_followup"
      hs_adaptive: "planning_exemplary"
    response_template: "planning_reinforcement"
    onsite_intervention:
      - "confirm_planning_strategy"
      - "discuss_task_interpretation"
    theoretical_basis: "Zimmerman (2000) effective forethought"
    growth_marker: "Next: Monitor quality of execution; is planning quality reflected in product?"
  
  rule_id: "A3_procrastination_pattern"
    priority: 110
    category: "Time Management & Self-Regulation"
    trigger_condition: "first_access_timing > 48 hours OR submission_very_late"
    evidence_chain: "Delayed engagement + last-minute submission → Procrastination pattern"
    pedagogical_claim: "Student delays task initiation; may lack self-regulatory control"
    adaptive_strategy: "Metacognitive reflection + Support for time management"
    cognitive_demand: "Moderate (requires reflection)"
    feedback_template_base: "procrastination_coaching"
    help_seeking_variants:
      hs_none: "procrastination_normalization"
      hs_present: "procrastination_strategy_coaching"
      hs_adaptive: "procrastination_selfmonitoring"
    response_template: "procrastination_coaching"
    onsite_intervention:
      - "task_breakdown_into_milestones"
      - "personal_goal_setting"
      - "accountability_checkin"
    theoretical_basis: "Zimmerman (2000) self-regulation; Steel (2007) temporal motivation"
    growth_marker: "Next: Monitor first_access_timing; earlier engagement = improvement"
  
  rule_id: "A4_resource_seeking_pattern"
    priority: 90
    category: "Strategic Resource Use"
    trigger_condition: "resource_access_count >= 5 OR exemplar_views >= 2"
    evidence_chain: "Multiple resource consultations before/during drafting → Strategic learning behavior"
    pedagogical_claim: "Student actively seeks learning resources; demonstrates metacognitive self-direction"
    adaptive_strategy: "Reinforcement + Advanced challenge"
    cognitive_demand: "Moderate-High (building on strength)"
    feedback_template_base: "resource_strategic_reinforcement"
    help_seeking_variants:
      hs_adaptive: "resource_seeking_exemplary"
    response_template: "resource_seeking_reinforcement"
    onsite_intervention:
      - "discuss_resource_selection_strategy"
      - "advanced_example_analysis"
    theoretical_basis: "Zimmerman (2000) metacognitive resource use"
    growth_marker: "Monitor whether resource use translates to quality improvement"
  
  rule_id: "A5_goal_clarity"
    priority: 95
    category: "Task Understanding & Goal Setting"
    trigger_condition: "either(early_help_seeking_about_task OR task_clarification_questions)"
    evidence_chain: "Student asks clarifying questions about task before/early in drafting → Seeks clarity"
    pedagogical_claim: "Student shows metacognitive awareness of own understanding gaps"
    adaptive_strategy: "Direct clarification + Goal-setting support"
    cognitive_demand: "Moderate"
    feedback_template_base: "task_clarification_support"
    help_seeking_variants:
      hs_present: "task_clarification_brief"
      hs_adaptive: "task_clarification_detailed"
    response_template: "task_clarification_detailed"
    onsite_intervention:
      - "explicit_expectation_review"
      - "co_construct_success_criteria"
    theoretical_basis: "Hyland (2004) genre awareness; Nicol & Macfarlane-Dick (2006) clarity of expectations"
    growth_marker: "Next: Confirm understanding reflected in draft structure"

# ===========================================================================
# DIMENSION B: DISCOURSE ORGANIZATION & COHESION (6 rules)
# ===========================================================================

rules_dimension_b:
  
  rule_id: "B1_weak_organization_structure"
    priority: 103
    category: "Organization & Logical Flow"
    trigger_condition: "organization_score <= 2 AND cohesion_index < 1.5"
    evidence_chain: "Low org score + few connectives → Ideas not logically sequenced"
    pedagogical_claim: "Paragraph lacks clear logical structure; ideas seem random or disconnected"
    adaptive_strategy: "Explicit structural instruction + Modeling"
    cognitive_demand: "Low (direct instruction)"
    feedback_template_base: "organization_structure_scaffold"
    help_seeking_variants:
      hs_none: "organization_basic_info"
      hs_present: "organization_guided_practice"
      hs_adaptive: "organization_advanced_analysis"
    response_template: "organization_structure_scaffold"
    onsite_intervention:
      - "paragraph_structure_modeling"
      - "sentence_ordering_activity"
      - "outlining_practice"
    theoretical_basis: "Flower & Hayes (1981) cognitive writing; M.A.K. Halliday (1976) cohesion"
    growth_marker: "Monitor cohesion_index increase in next draft"
  
  rule_id: "B2_weak_transitions"
    priority: 100
    category: "Discourse Connectives & Transitions"
    trigger_condition: "cohesion_index < 2.0 AND organization_score >= 2"
    evidence_chain: "Ideas organized but not smoothly connected → Transition problem"
    pedagogical_claim: "Organization is adequate, but discourse flow is disrupted by missing links"
    adaptive_strategy: "Indirect feedback + Modeling of transitions"
    cognitive_demand: "Moderate"
    feedback_template_base: "transition_word_instruction"
    help_seeking_variants:
      hs_present: "transition_word_fill_blank"
      hs_adaptive: "transition_analysis_and_generation"
    response_template: "transition_word_instruction"
    onsite_intervention:
      - "transition_word_teaching"
      - "sentence_combining_activity"
      - "paragraph_flow_practice"
    theoretical_basis: "Halliday & Hasan (1976) cohesive ties"
    growth_marker: "Next: Count connectives in revised draft; expect increase"
  
  rule_id: "B3_strong_organization_with_cohesion"
    priority: 80
    category: "Advanced Discourse Skills"
    trigger_condition: "organization_score >= 4 AND cohesion_index >= 3"
    evidence_chain: "Strong scores + frequent connectives → Mature discourse control"
    pedagogical_claim: "Student demonstrates advanced Organization & Cohesion competence"
    adaptive_strategy: "Advanced challenge; introduce rhetorical complexity"
    cognitive_demand: "High"
    feedback_template_base: "discourse_advanced_challenge"
    help_seeking_variants:
      hs_adaptive: "discourse_rhetorical_analysis"
    response_template: "discourse_advanced_challenge"
    onsite_intervention:
      - "varied_sentence_structure_modeling"
      - "paragraph_coherence_analysis"
      - "argument_flow_sophistication"
    theoretical_basis: "Hyland (2019) advanced academic discourse"
    growth_marker: "Monitor sentence structure variety; rhetorical awareness"
  
  rule_id: "B4_incoherent_progression"
    priority: 105
    category: "Logical Progression"
    trigger_condition: "both(organization_low AND revision_frequency < 1 AND final_score_low)"
    evidence_chain: "Disorganized + no revision + low score → More fundamental structure understanding needed"
    pedagogical_claim: "Student may not understand what 'logical flow' means; needs concept clarification"
    adaptive_strategy: "Explicit modeling + Collaborative reconstruction"
    cognitive_demand: "Low-Moderate"
    feedback_template_base: "logical_progression_explanation"
    help_seeking_variants:
      hs_none: "logical_progression_definition"
      hs_present: "logical_progression_examples"
      hs_adaptive: "logical_progression_analysis"
    response_template: "logical_progression_explanation"
    onsite_intervention:
      - "paragraph_reconstruction_together"
      - "flow_chart_outlining"
    theoretical_basis: "Bereiter & Scardamalia (1987) knowledge-telling vs knowledge-transforming"
    growth_marker: "Monitor structure awareness; check if student can identify flow problems in others' writing"
  
  rule_id: "B5_multiple_revisions_improving_flow"
    priority: 90
    category: "Revision-Triggered Organization Growth"
    trigger_condition: "revision_frequency >= 2 AND cohesion_index_draft1 < cohesion_index_draft2"
    evidence_chain: "Multiple revisions + measurable flow improvement → Responsive to feedback"
    pedagogical_claim: "Student is successfully learning to improve organization through revision"
    adaptive_strategy: "Reinforcement + Metacognitive reflection"
    cognitive_demand: "Moderate"
    feedback_template_base: "revision_success_reinforcement"
    help_seeking_variants:
      hs_adaptive: "revision_metacognitive_reflection"
    response_template: "revision_success_reinforcement"
    onsite_intervention:
      - "draft_comparison_analysis"
      - "what_changed_discussion"
    theoretical_basis: "Zimmerman (2000) self-reflection phase"
    growth_marker: "Continue revision cycles; monitor continued improvement"
  
  rule_id: "B6_overuse_of_simple_connectives"
    priority: 75
    category: "Sophisticated Discourse Progression"
    trigger_condition: "cohesion_index_high AND repetitive_connective_use"
    evidence_chain: "High connective frequency BUT low variety (many 'and', 'then') → Relies on basic connectives"
    pedagogical_claim: "Student overuses simple connectives; can sophisticate discourse choices"
    adaptive_strategy: "Advanced instruction in varied connectives"
    cognitive_demand: "High"
    feedback_template_base: "connective_variety_sophistication"
    help_seeking_variants:
      hs_adaptive: "connective_analysis_academic_discourse"
    response_template: "connective_variety_sophistication"
    onsite_intervention:
      - "academic_connective_instruction"
      - "style_variation_modeling"
    theoretical_basis: "Hyland (2019) academic register; Graesser (2007) discourse sophistication"
    growth_marker: "Monitor increasing variety of discourse markers"

# ===========================================================================
# DIMENSION C: ARGUMENTATION & EVIDENCE (7 rules)
# ===========================================================================

rules_dimension_c:
  
  rule_id: "C1_no_evidence_claim_only"
    priority: 107
    category: "Argument Development – Evidence Missing"
    trigger_condition: "both(argumentation_score <= 2 AND word_count < 100)"
    evidence_chain: "Very low argumentation + short text → Claims stated but unsupported"
    pedagogical_claim: "Student makes claims without providing evidence"
    adaptive_strategy: "Explicit claim-evidence-explanation modeling"
    cognitive_demand: "Low (direct instruction)"
    feedback_template_base: "argument_scaffold"
    help_seeking_variants:
      hs_none: "argument_claim_definition"
      hs_present: "argument_evidence_fill_blank"
      hs_adaptive: "argument_cee_structure_analysis"
    response_template: "argument_scaffold"
    onsite_intervention:
      - "claim_evidence_reasoning_modeling"
      - "guided_argument_construction"
      - "examples_with_feedback"
    theoretical_basis: "Toulmin (2003) logic; Hyland (2019) academic argumentation"
    growth_marker: "Next: Check if draft includes evidence supporting claims"
  
  rule_id: "C2_weak_evidence_integration"
    priority: 104
    category: "Argument Development – Explanation Weak"
    trigger_condition: "both(argumentation_score <= 3 AND 'evidence present' AND 'explanation missing')"
    evidence_chain: "Student has evidence but doesn't explain connection to claim → Incomplete reasoning"
    pedagogical_claim: "Argument structure partially developed; missing explanation link"
    adaptive_strategy: "Indirect feedback on explanation + Modeling"
    cognitive_demand: "Moderate"
    feedback_template_base: "argument_explanation_coaching"
    help_seeking_variants:
      hs_present: "argument_explanation_prompts"
      hs_adaptive: "argument_explanation_analysis"
    response_template: "argument_explanation_coaching"
    onsite_intervention:
      - "explanation_sentence_modeling"
      - "claim_evidence_reasoning_practice"
    theoretical_basis: "Anderson & Krathwohl (2001) higher-order thinking"
    growth_marker: "Monitor explanatory sentences added in revision"
  
  rule_id: "C3_strong_argument_with_evidence"
    priority: 85
    category: "Argument Development – Competent"
    trigger_condition: "both(argumentation_score >= 4 AND word_count >= 120)"
    evidence_chain: "Strong arg score + sufficient elaboration → Mature argument structure"
    pedagogical_claim: "Student demonstrates solid argument competence"
    adaptive_strategy: "Reinforcement + Advanced challenge (counterargument)"
    cognitive_demand: "High"
    feedback_template_base: "argument_advanced_challenge"
    help_seeking_variants:
      hs_adaptive: "argument_counterargument_introduction"
    response_template: "argument_advanced_challenge"
    onsite_intervention:
      - "counterargument_introduction"
      - "multi_perspective_analysis"
    theoretical_basis: "Kuhn (2005) argument scaffolding for experts"
    growth_marker: "Monitor introduction of counterarguments; sophistication of reasoning"
  
  rule_id: "C4_argument_but_not_supported_bya_specific_evidence"
    priority: 102
    category: "Argument Development – Generic Evidence"
    trigger_condition: "has_claim AND has_general_example AND lacks_specific_context"
    evidence_chain: "Generic examples used instead of specific ones → Weak support"
    pedagogical_claim: "Argument needs specificity; examples too general"
    adaptive_strategy: "Guided practice in using specific details"
    cognitive_demand: "Moderate"
    feedback_template_base: "argument_specificity_coaching"
    help_seeking_variants:
      hs_present: "argument_specific_example_fill"
      hs_adaptive: "argument_specificity_analysis"
    response_template: "argument_specificity_coaching"
    onsite_intervention:
      - "specific_example_generation"
      - "detail_and_context_practice"
    theoretical_basis: "Hyland (2004) concreteness vs abstraction in academic writing"
    growth_marker: "Check for specific details in next draft"
  
  rule_id: "C5_reasoning_visible_with_scaffolding_needed"
    priority: 98
    category: "Argument Development – Reasoning Emerging"
    trigger_condition: "both(argumentation_score == 3 AND 'reasoning implicit' AND 'first revision')"
    evidence_chain: "Moderate score + implicit reasoning → Student understands but not explicit"
    pedagogical_claim: "Student grasps the concept but needs to make reasoning visible"
    adaptive_strategy: "Coaching on explicit statement of reasoning"
    cognitive_demand: "Moderate"
    feedback_template_base: "argument_reasoning_visibility"
    help_seeking_variants:
      hs_present: "argument_reasoning_prompts"
      hs_adaptive: "argument_reasoning_analysis"
    response_template: "argument_reasoning_visibility"
    onsite_intervention:
      - "explicit_reasoning_sentence_practice"
    theoretical_basis: "Vygotsky sociocultural scaffolding; Zone of Proximal Development"
    growth_marker: "Monitor explicit reasoning sentences in next draft"
  
  rule_id: "C6_counterargument_ready_advanced_student"
    priority: 80
    category: "Advanced Argumentation"
    trigger_condition: "both(argumentation_score >= 4 AND revision_frequency >= 2 AND 'no counterargument')"
    evidence_chain: "Strong arguments + revision engagement + missing counterargument consideration → Ready for advancement"
    pedagogical_claim: "Student is ready to engage with oppositional perspectives"
    adaptive_strategy: "Introduction to counterargument as academic practice"
    cognitive_demand: "High"
    feedback_template_base: "argument_counterargument_advanced"
    help_seeking_variants:
      hs_adaptive: "argument_counterargument_detailed"
    response_template: "argument_counterargument_advanced"
    onsite_intervention:
      - "counterargument_planning"
      - "opposing_position_generation"
    theoretical_basis: "Kuhn (2005) epistemology and argument; Graesser (2007) question generation"
    growth_marker: "Monitor introduction of 'some might argue' or equivalent; awareness of multiple perspectives"
  
  rule_id: "C7_help_seeking_about_argument_quality"
    priority: 98
    category: "Help-Seeking Focused on Argumentation"
    trigger_condition: "help_seeking_level == 'adaptive' AND help_content == 'HC_ARG'"
    evidence_chain: "Student asks targeted questions about argument → Metacognitive monitoring of argument skill"
    pedagogical_claim: "Student demonstrates awareness of argument development gaps; seeks targeted support"
    adaptive_strategy: "Provide specific argument coaching; reinforce strategic help-seeking"
    cognitive_demand: "Adaptive (determined by specific question)"
    feedback_template_base: "argument_help_seeking_targeted"
    help_seeking_variants:
      hs_adaptive: "argument_help_seeking_specific_coaching"
    response_template: "argument_help_seeking_targeted"
    onsite_intervention:
      - "argument_problem_diagnosis"
      - "targeted_solution_generation"
    theoretical_basis: "Newman & Schwager (1995) adaptive help-seeking"
    growth_marker: "Monitor whether implemented suggestion improves argument in next draft"

# ===========================================================================
# DIMENSION D: LINGUISTIC ACCURACY & VOCABULARY (5 rules)
# ===========================================================================

rules_dimension_d:
  
  rule_id: "D1_high_error_density"
    priority: 106
    category: "Grammar & Syntax Errors"
    trigger_condition: "error_density > 5"
    evidence_chain: "High error frequency → Consistent grammatical difficulty"
    pedagogical_claim: "Frequent grammatical errors interfere with clarity and professionalism"
    adaptive_strategy: "Pattern-focused indirect feedback; teach grammar concepts"
    cognitive_demand: "Low-Moderate"
    feedback_template_base: "grammar_pattern_instruction"
    help_seeking_variants:
      hs_none: "grammar_error_correction"
      hs_present: "grammar_pattern_teaching"
      hs_adaptive: "grammar_self_check_coaching"
    response_template: "grammar_pattern_instruction"
    onsite_intervention:
      - "grammar_pattern_identification"
      - "rule_based_error_correction"
      - "sentence_editing_practice"
    theoretical_basis: "Truscott (2007) grammar teaching; Ferris (2011) error feedback"
    growth_marker: "Next: error_density should decrease in revision"
  
  rule_id: "D2_specific_grammar_pattern_error"
    priority: 104
    category: "Grammar – Specific Pattern"
    trigger_condition: "has_repet_specific_error_pattern"
    evidence_chain: "Same error type repeated (e.g., tense shifts) → Needs pattern focus"
    pedagogical_claim: "Student has not yet controlled this specific grammar feature"
    adaptive_strategy: "Focused instruction on that one feature"
    cognitive_demand: "Moderate"
    feedback_template_base: "grammar_specific_pattern"
    help_seeking_variants:
      hs_present: "grammar_pattern_highlight_and_rule"
      hs_adaptive: "grammar_pattern_selfcheck"
    response_template: "grammar_specific_pattern"
    onsite_intervention:
      - "focused_grammar_rule_teaching"
      - "error_pattern_identification_practice"
    theoretical_basis: "Ferris (2011) targeted feedback"
    growth_marker: "Monitor if pattern errors decrease; positive marker = pattern control improving"
  
  rule_id: "D3_strong_grammar_low_vocabulary"
    priority: 92
    category: "Vocabulary Development"
    trigger_condition: "both(error_density < 3 AND type_token_ratio < 0.45)"
    evidence_chain: "Good grammar but repetitive vocabulary → Receptive skills strong, productive vocabulary limited"
    pedagogical_claim: "Student has grammatical control but needs vocabulary expansion"
    adaptive_strategy: "Vocabulary building; word choice coaching"
    cognitive_demand: "Moderate"
    feedback_template_base: "vocabulary_expansion"
    help_seeking_variants:
      hs_present: "vocabulary_synonym_suggestions"
      hs_adaptive: "vocabulary_academic_register"
    response_template: "vocabulary_expansion"
    onsite_intervention:
      - "synonym_generation_activity"
      - "academic_word_list_instruction"
      - "register_specific_vocabulary"
    theoretical_basis: "Nation & Newton (2008) vocabulary teaching; Hyland (2019) academic register"
    growth_marker: "Monitor type_token_ratio increase; vocabulary diversity in next draft"
  
  rule_id: "D4_sophisticated_grammar_and_vocabulary"
    priority: 78
    category: "Advanced Linguistic Control"
    trigger_condition: "both(error_density < 2 AND type_token_ratio > 0.55)"
    evidence_chain: "Low errors + high diversity → Advanced linguistic control"
    pedagogical_claim: "Student demonstrates sophisticated linguistic control"
    adaptive_strategy: "Advanced challenge; discuss stylistic variation"
    cognitive_demand: "High"
    feedback_template_base: "linguistics_advanced_style"
    help_seeking_variants:
      hs_adaptive: "linguistics_stylistic_variation"
    response_template: "linguistics_advanced_style"
    onsite_intervention:
      - "style_variation_discussion"
      - "register_awareness_building"
    theoretical_basis: "Hyland (2019) advanced academic style"
    growth_marker: "Monitor stylistic awareness; genre-specific register choices"
  
  rule_id: "D5_vocabulary_level_mismatch_topic"
    priority: 88
    category: "Academic Vocabulary Use"
    trigger_condition: "uses_only_general_vocab AND task_requires_academic_terms"
    evidence_chain: "General vocabulary used for academic task → Missing register awareness"
    pedagogical_claim: "Student needs to learn academic vocabulary specific to this discourse domain"
    adaptive_strategy: "Academic vocabulary instruction; register awareness"
    cognitive_demand: "Moderate"
    feedback_template_base: "academic_vocabulary_instruction"
    help_seeking_variants:
      hs_present: "academic_term_suggestions"
      hs_adaptive: "academic_vocabulary_analysis"
    response_template: "academic_vocabulary_instruction"
    onsite_intervention:
      - "academic_register_review"
      - "academic_term_matching"
    theoretical_basis: "Hyland (2004) academic discourse community; Swales (1990) genre analysis"
    growth_marker: "Monitor academic term usage in next draft; appropriateness of vocabulary to context"

# ===========================================================================
# DIMENSION E: REVISION BEHAVIOR & COGNITIVE STRATEGIES (5 rules)
# ===========================================================================

rules_dimension_e:
  
  rule_id: "E1_no_revision_attempt"
    priority: 108
    category: "Revision Willingness & Effort"
    trigger_condition: "revision_frequency == 0"
    evidence_chain: "Single submission without revision → No attempt to improve"
    pedagogical_claim: "Student submitted without engagement with revision process"
    adaptive_strategy: "Motivational + Strategy instruction for revision"
    cognitive_demand: "Low (motivational focus)"
    feedback_template_base: "revision_motivation_and_process"
    help_seeking_variants:
      hs_none: "revision_normalizing_importance"
      hs_present: "revision_strategy_coaching"
      hs_adaptive: "revision_strategic_planning"
    response_template: "revision_motivation_and_process"
    onsite_intervention:
      - "revision_importance_discussion"
      - "professional_writer_examples"
      - "structured_revision_checklist"
    theoretical_basis: "Zimmerman (2000) self-reflection phase; Hayes (2012) revision importance"
    growth_marker: "Next: Check if student attempts revision; submission of Draft 2"
  
  rule_id: "E2_cosmetic_revisions_only"
    priority: 103
    category: "Revision Depth – Surface-Level"
    trigger_condition: "revision_frequency >= 1 AND revisions_appear_cosmetic"
    evidence_chain: "Revisions present but only small wording changes, no substantial changes → Shallow revision"
    pedagogical_claim: "Student revises but doesn't engage with meaningful/substantive changes"
    adaptive_strategy: "Coaching on deep revision; model substantial revision"
    cognitive_demand: "Moderate"
    feedback_template_base: "revision_depth_coaching"
    help_seeking_variants:
      hs_present: "revision_deep_prompts"
      hs_adaptive: "revision_deep_model_and_analysis"
    response_template: "revision_depth_coaching"
    onsite_intervention:
      - "draft_comparison_analysis"
      - "deep_revision_modeling"
      - "substantial_change_planning"
    theoretical_basis: "Sommers (1980) revision typology; Fitzgerald (1987) revision vs editing"
    growth_marker: "Next draft: Check for substantial revisions (content changes, reorganization)"
  
  rule_id: "E3_deep_revisions_multiple_drafts"
    priority: 88
    category: "Revision Depth – Substantive"
    trigger_condition: "revision_frequency >= 2 AND revisions_are_substantive"
    evidence_chain: "Multiple revisions with content changes → Engaged revision process"
    pedagogical_claim: "Student engages in meaningful revision; develops writing through iteration"
    adaptive_strategy: "Reinforcement + Metacognitive reflection"
    cognitive_demand: "Moderate"
    feedback_template_base: "revision_success_reinforcement"
    help_seeking_variants:
      hs_adaptive: "revision_metacognitive_reflection"
    response_template: "revision_success_reinforcement"
    onsite_intervention:
      - "revision_journey_discussion"
      - "what_and_why_of_changes"
    theoretical_basis: "Murray (1978) revision as learning; Sommers (1980) revision strategies"
    growth_marker: "Continue deep revision; expect quality gains correlated with revision engagement"
  
  rule_id: "E4_revision_guided_by_feedback"
    priority: 95
    category: "Feedback-Responsive Revision"
    trigger_condition: "both('feedback provided' AND revision_occurs AND improvements_address_feedback)"
    evidence_chain: "Feedback given → Student revises specifically toward that feedback → Responsive behavior"
    pedagogical_claim: "Student implements feedback; demonstrates responsiveness to guidance"
    adaptive_strategy: "Reinforce feedback integration; celebrate responsive revision"
    cognitive_demand: "Moderate"
    feedback_template_base: "feedback_responsive_revision"
    help_seeking_variants:
      hs_adaptive: "feedback_responsive_reinforcement"
    response_template: "feedback_responsive_revision"
    onsite_intervention:
      - "feedback_implementation_discussion"
    theoretical_basis: "Nicol & Macfarlane-Dick (2006) feedback models; Carless & Boud (2018) feedback literacy"
    growth_marker: "Monitor that revisions continue to be feedback-responsive; building feedback literacy"
  
  rule_id: "E5_revision_without_feedback_self_initiated"
    priority: 92
    category: "Self-Initiated Revision"
    trigger_condition: "both('no specific feedback yet' AND revision_occurs)"
    evidence_chain: "Revision attempted before receiving feedback → Self-monitoring and self-improvement"
    pedagogical_claim: "Student demonstrates self-regulation and internal quality standards"
    adaptive_strategy: "Praise self-monitoring; help develop systematic self-review processes"
    cognitive_demand: "Moderate-High"
    feedback_template_base: "self_initiated_revision_praise"
    help_seeking_variants:
      hs_adaptive: "self_review_process_coaching"
    response_template: "self_initiated_revision_praise"
    onsite_intervention:
      - "self_assessment_rubric_use"
      - "peer_review_process_introduction"
    theoretical_basis: "Zimmerman (2000) self-monitoring; Panadero (2017) self-assessment"
    growth_marker: "Monitor continued self-initiated revision; development of self-assessment skills"

# ===========================================================================
# DIMENSION F & G: FEEDBACK UPTAKE & HELP-SEEKING (4 rules)
# ===========================================================================

rules_dimension_fg:
  
  rule_id: "F1_feedback_ignored_no_action"
    priority: 107
    category: "Feedback Disengagement"
    trigger_condition: "both('feedback provided' AND 'not acted on' AND revision_none)"
    evidence_chain: "Feedback provided but not engaged → Feedback ignored"
    pedagogical_claim: "Student does not act on feedback; may lack feedback literacy"
    adaptive_strategy: "Metacognitive + Feedback literacy building"
    cognitive_demand: "Moderate"
    feedback_template_base: "feedback_uptake_coaching"
    help_seeking_variants:
      hs_none: "feedback_literacy_explanation"
      hs_present: "feedback_action_prompts"
      hs_adaptive: "feedback_implementation_planning"
    response_template: "feedback_uptake_coaching"
    onsite_intervention:
      - "feedback_clarity_discussion"
      - "feedback_to_action_planning"
      - "implementation_practice"
    theoretical_basis: "Carless & Boud (2018) feedback literacy; Nicol & Macfarlane-Dick (2006)"
    growth_marker: "Next: Check if feedback is engaged; Draft 2 shows implementation"
  
  rule_id: "G1_help_seeking_none_independent"
    priority: 90
    category: "Help-Seeking Absence"
    trigger_condition: "help_seeking_frequency == 0 AND (quality_strong OR quality_low)"
    evidence_chain: "No help-seeking observed → Independent work (positive) or isolation (concern) unclear"
    pedagogical_claim: "Student did not seek help (could indicate independence OR isolation); needs context"
    adaptive_strategy: "Normalization of help-seeking as professional practice"
    cognitive_demand: "Low"
    feedback_template_base: "help_seeking_normalization"
    help_seeking_variants:
      hs_none: "help_seeking_normalization_full"
    response_template: "help_seeking_normalization"
    onsite_intervention:
      - "discussion_of_help_seeking_as_skill"
      - "modeling_when_and_how_ask"
    theoretical_basis: "Newman & Schwager (1995) help-seeking taxonomy"
    growth_marker: "Next: Monitor if help-seeking initiated when appropriate"
  
  rule_id: "G2_help_seeking_vague_coaching_needed"
    priority: 98
    category: "Help-Seeking Skill Development"
    trigger_condition: "help_seeking_level == 'present' AND vague_question"
    evidence_chain: "Student seeks help but questions are vague ('How do I make this better?') → Needs question-asking coaching"
    pedagogical_claim: "Student has metacognitive awareness (recognizes difficulty) but needs targeted question strategy"
    adaptive_strategy: "Coaching on asking specific, focused questions"
    cognitive_demand: "Moderate"
    feedback_template_base: "help_seeking_question_coaching"
    help_seeking_variants:
      hs_present: "help_seeking_specific_question_modeling"
    response_template: "help_seeking_question_coaching"
    onsite_intervention:
      - "question_decomposition_practice"
      - "specific_reference_to_text"
    theoretical_basis: "Newman & Schwager (1995) help-seeking dimensions"
    growth_marker: "Next: Monitor if help-seeking questions become more specific"
  
  rule_id: "G3_help_seeking_strategic_adaptive"
    priority: 85
    category: "Strategic Help-Seeking Excellence"
    trigger_condition: "help_seeking_level == 'adaptive' AND (attempted_first OR specific_question OR early_asking)"
    evidence_chain: "Student asks targeted questions, tries first, or asks early → Strategic help-seeking"
    pedagogical_claim: "Student demonstrates advanced help-seeking as self-regulated learning indicator"
    adaptive_strategy: "Reinforce and celebrate; provide advanced challenge"
    cognitive_demand: "High"
    feedback_template_base: "help_seeking_adaptive_praise"
    help_seeking_variants:
      hs_adaptive: "help_seeking_exemplary_reinforcement"
    response_template: "help_seeking_adaptive_praise"
    onsite_intervention:
      - "reflection_on_help_seeking_strategy"
      - "advanced_challenge_introduction"
      - "peer_mentoring_opportunity"
    theoretical_basis: "Newman & Schwager (1995) adaptive help-seeking as metacognitive skill; Zimmerman (2000) SRL"
    growth_marker: "Monitor continued strategic help-seeking; model for other students"

---

## End of Comprehensive Framework & Rulebook

This expandable template includes 32 comprehensive rules covering:
- Planning & Forethought (5 rules)
- Discourse Organization (6 rules)
- Argumentation (7 rules)
- Linguistic Accuracy (5 rules)
- Revision Behavior (5 rules)
- Feedback Uptake & Help-Seeking (4 rules)

Each rule can be extended further based on classroom implementation and student data.

