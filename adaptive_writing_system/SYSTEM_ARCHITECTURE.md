# Adaptive Writing System Architecture
## Complete Framework: Analytics → AI Outputs → Rules → Feedback

**Status**: Framework Definition and Implementation  
**Last Updated**: April 2026  
**Author**: Thesis Methodology  

---

## 1. SYSTEM OVERVIEW: THE COMPLETE PIPELINE

Your system operates as a **four-layer inference pipeline**:

```
Layer 1: Raw Data & Analytics
         ↓
       [Descriptive stats, correlations, growth analysis, text analytics]
         ↓
Layer 2: AI Learner-State Outputs
         ↓
       [Forethought_risk, engagement_risk, revision_depth, etc.]
         ↓
Layer 3: Pedagogical Rule Interpretations
         ↓
       [Weak planning, disengagement, weak argument, etc.]
         ↓
Layer 4: Feedback Template Selection & Delivery
         ↓
       [Planning_scaffold, motivational_reengagement, argument_scaffold, etc.]
```

### Why This Structure?

1. **Transparency**: Each layer is interpretable and educationally defensible
2. **Research Validity**: Analytics is separate from AI (you can report correlations independently)
3. **Rule Control**: You define what each AI output means pedagogically
4. **Feedback Alignment**: Each template is mapped to a specific diagnosis
5. **Adaptivity**: The rules can be updated without changing the models

---

## 2. LAYER 1: ANALYTICS & EVIDENCE

### What it produces:
- **Descriptive statistics**: Mean, SD, frequencies for each indicator
- **Correlations**: Spearman rho between process and product variables (research validation)
- **Growth analysis**: Score gains, error reduction, competence gain
- **Text analytics**: Cohesion index, TTR, error density, sentence complexity

### Key files:
- `correlation_engine.py`: Computes Spearman correlations (your research layer)
- Raw data merged from Moodle logs + rubric scores + text analytics

### Example outputs for your thesis:

**Significant Finding 1:**
> Revision frequency is positively correlated with writing improvement (Spearman's rho = .62, p = .003), suggesting that students who revised more frequently tended to achieve greater gains across drafts.

**Significant Finding 2:**
> Feedback views were moderately associated with score gain (rho = .48, p = .021), indicating that engagement with instructor feedback may support writing development.

**Significant Finding 3:**
> Resource access was associated with cohesion improvement (rho = .41, p = .044), suggesting that students who engaged with discourse resources developed stronger text organization.

---

## 3. LAYER 2: AI LEARNER-STATE OUTPUTS

These are the **diagnostic states** the system generates. Not predictions, but diagnoses of current learner states.

### AI Output Categories:

#### A. Self-Regulation Outputs (SRL Phases — Zimmerman)
1. **forethought_risk** (states: low / medium / high)
   - Evidence: rubric_views, time_on_task, word_count_at_first_save
   - Meaning: Readiness, criteria awareness, planning quality
   - High-risk condition: No rubric views AND short time AND minimal output

2. **engagement_risk** (states: low / medium / high)
   - Evidence: assignment_views, resource_access_count, feedback_views
   - Meaning: Sustained participation and help-seeking
   - High-risk condition: Minimal views across all systems

3. **revision_depth** (states: low / medium / high)
   - Evidence: revision_frequency, score_gain, draft_changes
   - Meaning: Self-regulated monitoring and control in performance phase
   - High-risk condition: Zero revisions

4. **feedback_uptake_state** (states: low / medium / high)
   - Evidence: feedback_views, revision_after_feedback, feedback_alignment_score
   - Meaning: Feedback literacy (access, understanding, action)
   - High-risk: Feedback viewed but no revision follow-up

5. **help_seeking_state** (states: none / procedural / adaptive)
   - Evidence: message count, message content type, performance context
   - Meaning: Type and quality of metacognitive help-seeking
   - Adaptive: Content-focused, strategy-focused help requests

#### B. Writing Competence Outputs (Product Quality)
1. **argumentation_state** (states: low / medium / high)
   - Mapped directly to: argumentation_rubric_score
   - Meaning: Claim–evidence–explanation structure quality

2. **discourse_state** (states: low / medium / high)
   - Mapped to: organization_score + cohesion_index
   - Meaning: Text organization, linking, paragraph unity

3. **linguistic_accuracy_state** (states: low / medium / high)
   - Mapped to: grammar_score + error_density
   - Meaning: Grammatical control and form accuracy

4. **lexical_state** (states: low / medium / high)
   - Mapped to: lexical_score + type_token_ratio
   - Meaning: Vocabulary range and precision

#### C. Learner Profile Output (Clustering)
**learner_profile** (states: strategic_writer / engaged_but_developing / effortful_but_struggling / disengaged / fragile_regulator)
- Source: K-means clustering on process + product dimensions
- Meaning: Holistic learner categorization

#### D. Predictive Outputs (Random Forest)
1. **predicted_improvement** (states: low / medium / high)
2. **predictor_importance** (ranked features explaining improvement)

#### E. Bayesian Competence Outputs
1. **argument_competence_prob** (states: low / medium / high probability)
2. **cohesion_competence_prob**
3. **linguistic_competence_prob**
4. **srl_revision_competence_prob**

### Key Implementation File:
`ai_output_computation.py` — Computes all AI states from raw indicators using threshold logic

---

## 4. LAYER 3: PEDAGOGICAL RULE INTERPRETATIONS

Each AI output state is **interpreted through pedagogy** to create a rule interpretation.

### Mapping Examples:

| AI Output | State | Rule Interpretation | Theory |
|-----------|-------|-------------------|--------|
| forethought_risk | high | weak planning and weak criteria awareness | Zimmerman SRL; Assessment literacy |
| engagement_risk | high | disengagement or low behavioural participation | Motivation; SRL engagement |
| revision_depth | high | weak self-regulated revision | SRL performance phase |
| argumentation_state | high | weak claim–evidence–reasoning structure | Academic writing pedagogy |
| discourse_state | high | discourse organization problem | Functional grammar, L2 writing |
| lexical_state | high | restricted lexical repertoire | Vocabulary development theory |
| help_seeking_state | adaptive | active metacognitive regulation and learning mindset | SRL self-reflection |
| learner_profile | disengaged | participation and motivation risk requiring urgent re-engagement | Motivation theory |

### Key Implementation File:
`rule_interpretations.yaml` — Maps all AI states to pedagogical meanings

---

## 5. LAYER 4: FEEDBACK TEMPLATE SELECTION & DELIVERY

Based on the rule interpretation, the system **selects a feedback template family**.

### Template Families (19 total):

**Planning & Forethought:**
- `planning_scaffold` — Rubric walkthrough, planning support

**Engagement & Motivation:**
- `motivational_reengagement` — Re-engagement and barrier removal

**Revision & Metacognition:**
- `revision_prompt` — Call-to-action for revision
- `global_revision_feedback` — Deep revision instruction
- `metacognitive_training` — Explicit SRL training

**Feedback Literacy:**
- `feedback_decoding` — Show how to use feedback
- `feedforward_guidance` — Next-step clarification

**Argument & Reasoning:**
- `argument_scaffold` — Claim–evidence–explanation structure
- `argument_expansion` — Deepening explanation

**Discourse & Cohesion:**
- `cohesion_support` — Transitions and linking
- `organization_support` — Logical sequencing

**Grammar & Accuracy:**
- `direct_corrective_feedback` — Pattern-focused correction
- `metalinguistic_feedback` — Rule explanation with self-correction

**Vocabulary:**
- `lexical_enrichment` — Academic word introduction
- `lexical_refinement` — Word choice and register

**Dialogue & Extension:**
- `dialogic_scaffolding` — Conversational support
- `metacognitive_prompt` — Self-awareness prompts
- `explicit_strategic_instruction` — Skill instruction
- `intensive_support_plan` — Multi-modal support
- `targeted_development_feedback` — Focused growth area
- `metacognitive_extension` — Challenge for high-performers

### Key Implementation File:
`feedback_templates_expanded.yaml` — Complete template definitions with examples

---

## 6. THE MASTER ALIGNMENT TABLE

**File**: `system_alignment_table.yaml`

This is the **operational controller** showing complete mappings:

```
Analytics → AI Output → Threshold Logic → Rule Interpretation → Feedback Family → Intervention Intensity
```

**Example row:**

| Layer | Content |
|-------|---------|
| **Analytics** | assignment_views ≤ 1 AND resource_access_count = 0 AND feedback_views = 0 |
| **AI Output** | engagement_risk = high |
| **Threshold Logic** | High-risk condition met (3/3 disengagement signals) |
| **Rule** | disengagement or low behavioural participation |
| **Feedback** | motivational_reengagement |
| **Priority** | CRITICAL |
| **Frequency** | Same day / urgent |

---

## 7. CONFIGURATION FILES CREATED

### Core Config Files:

1. **`ai_outputs.yaml`**
   - Defines all 14 AI output states
   - Lists possible states for each (low/medium/high, etc.)
   - Documents evidence sources for each

2. **`thresholds_expanded.yaml`**
   - Raw indicator thresholds (word_count, time_on_task, etc.)
   - AI output determination logic (when state = high vs. medium vs. low)
   - Composite interpretation rules

3. **`rule_interpretations.yaml`**
   - Maps AI output states → pedagogical meanings
   - Includes theory grounding (Zimmerman, Carless & Boud, Weigle, etc.)
   - Specifies required intervention for each

4. **`feedback_templates_expanded.yaml`**
   - 19 template families with examples
   - Each family mapped to specific rule interpretations
   - Delivery timing and effectiveness noted

5. **`system_alignment_table.yaml`**
   - Complete mapping table: analytics → outputs → rules → templates
   - Feedback selection algorithm
   - Priority and sequencing logic

---

## 8. PYTHON MODULES CREATED

### `correlation_engine.py`
**Purpose**: Research-validation layer; computes Spearman correlations

**Classes & Methods**:
- `CorrelationEngine` class
  - `run_correlations()` — Main method
  - `get_significant_only()` — Filter by p-value
  - `get_by_effect_size()` — Filter by effect size
  - `academic_report()` — APA-formatted results
  - `save_results()` — Export to CSV

**Output**: `correlation_results.csv` with columns:
- process_variable, product_variable
- correlation (rho), p_value
- significant (True/False)
- effect_size (weak/moderate/strong)
- theoretical_connection

### `ai_output_computation.py`
**Purpose**: Computes AI learner-state outputs from raw indicators

**Classes & Methods**:
- `AIOutput` dataclass — Represents one computed output
- `AIOutputComputer` class
  - `compute_forethought_risk()`, `compute_engagement_risk()`, etc.
  - `compute_all_outputs()` — All outputs for one student
  - `compute_for_cohort()` — All outputs for all students
  - `get_student_outputs()` — Retrieve outputs for one student

**Output**: One row per (student, ai_output) pair with:
- student_id, output_name, state
- confidence_score, evidence list, reasoning

---

## 9. WORKFLOW: HOW EVERYTHING FITS TOGETHER

### Daily/Weekly Operational Workflow:

```
1. DATA COLLECTION (Moodle, Rubrics, Text Analytics)
   ↓
2. DATA CLEANING & MERGING (one row = one student)
   ↓
3. CORRELATION ANALYSIS (CorrelationEngine)
   └─ Output: correlation_results.csv (research evidence)
   ↓
4. AI OUTPUT COMPUTATION (AIOutputComputer)
   └─ Input: merged cleaned data
   └─ Process: apply threshold logic from thresholds_expanded.yaml
   └─ Output: ai_outputs.csv (all AI states for all students)
   ↓
5. RULE INTERPRETATION LOOKUP
   └─ For each AI output state, find rule interpretation
   └─ Reference: rule_interpretations.yaml
   ↓
6. FEEDBACK SELECTION
   └─ For each rule interpretation, select template family/families
   └─ Reference: system_alignment_table.yaml
   └─ Logic: prioritize by intervention intensity (critical→high→medium→low)
   ↓
7. FEEDBACK GENERATION & DELIVERY
   └─ Instantiate template examples for each student
   └─ Deliver via appropriate channel (direct message, discussion, etc.)
   └─ Track delivery time and channel
   ↓
8. OUTCOME TRACKING
   └─ Monitor whether feedback led to revision/improvement
   └─ Update feedback_uptake_state for next cycle
```

---

## 10. INTERPRETATION EXAMPLES FOR YOUR THESIS

### Example 1: Strategic Writer
```
Student: S001
Raw Data:
  - rubric_views: 3
  - time_on_task: 38 minutes
  - word_count: 140
  - revision_frequency: 2
  - score_gain: 4
  - argumentation_score: 5
  - organization_score: 4
  - error_density: 2

AI Outputs:
  - forethought_risk: LOW (strong criteria awareness)
  - engagement_risk: LOW (consistent participation)
  - revision_depth: LOW (multiple substantive revisions)
  - argumentation_state: LOW (strong argument)

Rule Interpretations:
  - Strong forethought and criteria awareness
  - Consistent, high engagement
  - Strong self-regulated revision
  - Strong argumentative competence

Feedback Type:
  - metacognitive_extension (challenge and extend)
  - reinforcement_feedback (acknowledge progress)
  
Intervention: MAINTENANCE — low frequency, high challenge
```

### Example 2: Effortful But Struggling
```
Student: S002
Raw Data:
  - rubric_views: 1
  - time_on_task: 22 minutes
  - word_count: 95
  - revision_frequency: 1
  - score_gain: 1
  - argumentation_score: 2
  - organization_score: 2
  - grammar_score: 2
  - error_density: 9

AI Outputs:
  - forethought_risk: MEDIUM (partial planning)
  - engagement_risk: MEDIUM (some gaps)
  - revision_depth: MEDIUM (one revision, limited gain)
  - argumentation_state: HIGH (weak argument)
  - discourse_state: HIGH (organization problem)
  - linguistic_accuracy_state: HIGH (persistent errors)

Rule Interpretations:
  - Partial planning
  - Variable engagement
  - Weak claim–evidence–reasoning structure
  - Discourse organization problem
  - Persistent linguistic accuracy problem

Feedback Types (in sequence):
  1. planning_scaffold (address root: planning)
  2. argument_scaffold (address product: argument)
  3. cohesion_support (address discourse)
  4. explicit_strategic_instruction (teach strategies)

Intervention: HIGH — frequent feedback, explicit teaching, multi-modal support
```

### Example 3: Disengaged Learner
```
Student: S003
Raw Data:
  - rubric_views: 0
  - assignment_views: 1
  - resource_access_count: 0
  - feedback_views: 0
  - help_seeking_message_count: 0
  - total_rubric_score: 8

AI Output:
  - engagement_risk: HIGH (critical disengagement)
  - help_seeking_state: NONE (despite weak performance)

Rule Interpretations:
  - Disengagement requiring urgent re-engagement
  - Passive approach or hidden difficulty

Feedback Type:
  - motivational_reengagement (immediate)
  - metacognitive_prompt (awareness raising)

Intervention: CRITICAL
  - Same-day direct outreach
  - Simple, low-barrier re-entry point
  - Check for barriers (technical, conceptual, motivational)
```

---

## 11. RESEARCH ALIGNMENT

### Your Research Questions Addressed by This Framework:

**RQ1**: Do process variables (engagement, revision, help-seeking) relate to product variables (writing quality)?
**Answer**: Correlation analysis (Layer 1) provides statistical evidence

**RQ2**: Can AI classify learners by their self-regulation and competence?
**Answer**: AI outputs (Layer 2) + learner profiling (clustering) classify learners

**RQ3**: Can adaptive feedback based on learner states improve writing?
**Answer**: Feedback selection (Layer 4) is targeted by diagnostic state; track outcome

**RQ4**: What mechanisms explain improvement?
**Answer**: Rule interpretations + feedback theory explain the causal chain

---

## 12. NEXT STEPS FOR IMPLEMENTATION

### Phase 1: Integration (You Are Here)
- [ ] Prepare merged dataset (one row = one student)
- [ ] Run correlation analysis (validate process-product relationships)
- [ ] Compute AI outputs for cohort (run AIOutputComputer)
- [ ] Generate sample feedback for 3-5 students (test template selection)

### Phase 2: Validation & Refinement
- [ ] Compare AI-selected feedback vs. expert judgment (inter-rater reliability)
- [ ] Adjust thresholds based on pilot data
- [ ] Refine template examples based on student response
- [ ] Document any rule refinements

### Phase 3: Full Deployment
- [ ] Automate daily/weekly AI output computation
- [ ] Integrate with feedback delivery system
- [ ] Track outcome: Did feedback lead to revision/improvement?
- [ ] Report results in thesis

### Phase 4: Research Reporting
- [ ] Report correlation findings (descriptive statistics)
- [ ] Report AI output distribution and profiles
- [ ] Report feedback effectiveness (prompt-response analysis)
- [ ] Discuss implications for adaptive feedback theory & practice

---

## 13. KEY THEORETICAL FOUNDATIONS

**System is grounded in:**

1. **Self-Regulated Learning (Zimmerman)**: Forethought → Performance → Reflection
2. **Feedback Literacy (Carless & Boud)**: Understanding + Action
3. **Analytic Writing Assessment (Weigle)**: Multiple dimensions (argument, organization, grammar, lexical)
4. **L2 Writing Development (Hyland)**: Functional grammar, discourse analysis
5. **Assessment for Learning**: Using evidence to guide instruction
6. **Adaptive Learning Theory**: Tailoring support based on learner state

---

## 14. THESIS SIGNIFICANCE

This framework allows you to claim:

> "The adaptive writing system integrates learning analytics (correlational evidence), machine learning (learner-state diagnosis), and pedagogical theory (rule-based interpretation) to select evidence-based feedback templates that are tailored to each learner's self-regulatory and writing competence profiles."

**This is methodologically strong because:**
- Analytics are transparent and researched
- AI outputs can be validated against expert judgment
- Feedback is justified pedagogically, not just algorithmically
- System can be analyzed, critiqued, and improved
- Results are traceable to theory

---

## Files Structure Summary

```
adaptive_writing_system/
├── config/
│   ├── ai_outputs.yaml                    ← AI output definitions
│   ├── thresholds_expanded.yaml           ← Threshold logic
│   ├── rule_interpretations.yaml          ← Pedagogical mappings
│   ├── feedback_templates_expanded.yaml   ← Template families
│   ├── system_alignment_table.yaml        ← Master alignment
│   ├── (existing configs remain)
│
├── app/
│   ├── correlation_engine.py              ← Research layer
│   ├── ai_output_computation.py           ← AI state computing
│   ├── (existing modules remain)
│
└── outputs/
    ├── correlation_results.csv            ← Research findings
    └── ai_outputs.csv                     ← Learner diagnostics
```

---

**This framework is complete and ready for your thesis. All four layers are defined, mapped, and implemented.**
