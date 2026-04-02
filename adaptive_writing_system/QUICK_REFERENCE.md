# Quick Reference: Using the Four-Layer System
**For implementing the analytical → AI → rules → feedback pipeline**

---

## 1-MINUTE SUMMARY

Your system answers: **"Which feedback should each student get, and why?"**

**Process**:
1. Analyze student data → detect patterns (correlations)
2. Classify student states → AI outputs (forethought_risk, revision_depth, etc.)
3. Interpret states → rule meanings ("weak planning", "disengagement", etc.)
4. Select feedback → use template for that rule

---

## QUICK START: 5 STEPS

### Step 1: Prepare Data
```python
import pandas as pd

# Merge: Moodle logs + rubric scores + text analytics
df = pd.concat([
    df_process,     # rubric_views, time_on_task, revision_frequency, etc.
    df_product,     # argumentation_score, organization_score, etc.
    df_analytics    # error_density, cohesion_index, type_token_ratio, etc.
], axis=1)

# One row = one student; each column is an indicator
# df.shape = (n_students, n_indicators)
df.to_csv("merged_student_data.csv", index=False)
```

### Step 2: Run Correlation Analysis (Research Validation)
```python
from adaptive_writing_system.app.legacy.correlation_engine import CorrelationEngine

engine = CorrelationEngine(df)
results = engine.run_correlations(method='spearman')

# See which process variables correlate with product outcomes
sig_results = engine.get_significant_only(p_threshold=0.05)
print(engine.academic_report())

# Save for thesis
engine.save_results("outputs/correlation_results.csv")
```

### Step 3: Compute AI Outputs for All Students
```python
from adaptive_writing_system.app.legacy.ai_output_computation import AIOutputComputer

computer = AIOutputComputer()
ai_outputs_df = computer.compute_for_cohort(df)

# Save: one row per (student, ai_output) pair
ai_outputs_df.to_csv("outputs/ai_outputs.csv", index=False)

# Example row:
# student_id | output_name       | state  | confidence_score | evidence | reasoning
# S001       | forethought_risk  | low    | 0.95             | [...]   | Strong forethought...
```

### Step 4: Look Up Rule Interpretations
```python
import yaml

with open("config/rule_interpretations.yaml") as f:
    rules = yaml.safe_load(f)

# For each AI output, find its rule interpretation
student_outputs = ai_outputs_df[ai_outputs_df['student_id'] == 'S001']

for _, output in student_outputs.iterrows():
    output_name = output['output_name']
    state = output['state']
    
    # Find the rule
    rule_key = f"{state}_{output_name}"  # e.g., "high_forethought_risk"
    if rule_key in rules:
        rule = rules[rule_key]
        print(f"{output_name} ({state})")
        print(f"  Interpretation: {rule['interpretation']}")
        print(f"  Priority: {rule['feedback_priority']}")
```

### Step 5: Select & Deliver Feedback Templates
```python
with open("config/system_alignment_table.yaml") as f:
    alignment = yaml.safe_load(f)

with open("config/feedback_templates_expanded.yaml") as f:
    templates = yaml.safe_load(f)

# For each student, find feedback to give
for student_id in df['student_id'].unique():
    student_outputs = ai_outputs_df[ai_outputs_df['student_id'] == student_id]
    
    # Collect all rule interpretations for this student
    interpretations = []
    for _, output in student_outputs.iterrows():
        # [Find interpretation from rules]
        interpretations.append(interpretation)
    
    # Priority-order the interpretations
    interpretations = sorted(interpretations, key=lambda x: x['priority'])
    
    # Select top 1-3 feedback templates
    selected_templates = []
    for interp in interpretations[:3]:
        template_family = interp['feedback_family']  # e.g., "planning_scaffold"
        template = templates[template_family]
        selected_templates.append(template)
    
    # Generate & deliver feedback
    print(f"\nStudent {student_id}:")
    for template in selected_templates:
        print(f"  - {template['name']}")
        # Deliver to student (via system, email, etc.)
```

---

## QUICK REFERENCE: KEY FILES

| File | Purpose | Use It When |
|------|---------|------------|
| `ai_outputs.yaml` | Defines all AI output states | Understanding what each AI output means |
| `thresholds_expanded.yaml` | Threshold values and logic | Setting cut-offs; modifying what triggers each state |
| `rule_interpretations.yaml` | Maps AI states to pedagogy | Understanding pedagogical meaning |
| `feedback_templates_expanded.yaml` | Feedback template families | Seeing examples of each feedback type |
| `system_alignment_table.yaml` | Complete mappings | Understanding full pipeline; selecting feedback |
| `correlation_engine.py` | Compute correlations | Validating process-product relationships |
| `ai_output_computation.py` | Compute AI outputs | Classifying students; generating diagnoses |

---

## CONFIGURATION YAML QUICK REFERENCE

### Example from `ai_outputs.yaml`:
```yaml
forethought_risk:
  description: "Readiness, planning quality, and criteria awareness"
  possible_states:
    - value: low
      meaning: "Active rubric consultation, adequate time, reasonable output"
    - value: medium
      meaning: "Some planning but incomplete"
    - value: high
      meaning: "No rubric views, short time, minimal output"
  evidence_sources:
    - rubric_views
    - time_on_task
    - word_count_at_first_save
```

### Example from `thresholds_expanded.yaml`:
```yaml
forethought_risk:
  high_risk_conditions: "rubric_views == 0 AND time_on_task < 15 AND word_count < 80"
  medium_conditions: "(rubric_views == 1 OR time_on_task 15-29) AND word_count 80-119"
  low_risk_conditions: "rubric_views >= 2 AND time_on_task >= 30"
```

### Example from `rule_interpretations.yaml`:
```yaml
weak_criteria_consultation:
  ai_output: "forethought_risk == high"
  interpretation: "weak planning and weak criteria awareness"
  theory: "Zimmerman's forethought phase; assessment literacy"
  required_intervention: "explicit rubric walkthrough and planning support"
  feedback_priority: "high"
```

### Example from `system_alignment_table.yaml`:
```yaml
forethought_alignment:
  analytics_source: "descriptive analytics / process logs"
  ai_output: "forethought_risk"
  state_determination:
    - condition: "rubric_views == 0 AND time_on_task < 15 AND word_count < 80"
      ai_state: "high"
      rule_interpretation: "weak planning and weak criteria awareness"
      feedback_family: ["planning_scaffold", "criteria_referenced_feedback"]
      intervention_priority: "high"
```

---

## TROUBLESHOOTING: COMMON QUESTIONS

**Q: A student has the same AI output as another, but they're different learners.**
A: It's expected. AI outputs capture one dimension. Look at ALL outputs together (use `get_student_outputs()`). Learner profiles combine multiple outputs for holistic view.

**Q: Should I give ALL the feedback templates to one student?**
A: No. Use priority ordering from `system_alignment_table.yaml`. Select top 1-3 templates, delivered sequentially (not all at once). Start with critical priority.

**Q: Can I change the thresholds?**
A: Yes. Edit `thresholds_expanded.yaml` and recalculate. Document any changes for methodological transparency.

**Q: My correlations aren't significant. Does the system still work?**
A: Yes. AI outputs are based on threshold logic, not statistical tests. Correlations are validation/evidence, not requirement. Report in thesis.

**Q: How do I know if feedback worked?**
A: Track `feedback_uptake_state` before and after feedback delivery. Did revision occur? Did next submission improve? Update AI outputs weekly.

**Q: Can students have "low risk" in ALL outputs (all "low")?**
A: Yes—that's your strategic writers. They need little directive feedback; use `metacognitive_extension` to challenge them.

**Q: What if a student has mixed outputs (high engagement but high argumentation_risk)?**
A: This is "effortful but struggling"—they try hard but lack knowledge/strategy. Use `explicit_strategic_instruction` to teach.

---

## INTERPRETATION TABLE: All AI Output States at a Glance

| Output Name | Low State | Medium State | High State |
|-------------|-----------|--------------|------------|
| **forethought_risk** | Strong planning | Partial planning | No planning |
| **engagement_risk** | High engagement | Variable engagement | Disengaged |
| **revision_depth** | Multiple revisions | One revision, limited gain | No revision |
| **feedback_uptake_state** | Acted on feedback | Partially used feedback | Ignored feedback |
| **help_seeking_state** | Adaptive help-seeking | Procedural help-seeking | No help-seeking |
| **argumentation_state** | Strong argument | Developing argument | Weak argument |
| **discourse_state** | Clear organization | Partial organization | Disjointed |
| **linguistic_accuracy_state** | Few errors | Moderate errors | Many errors |
| **lexical_state** | Varied vocabulary | Developing vocabulary | Basic vocabulary |

*(For these, "low" is good; "high" is risk)*

---

## FEEDBACK PRIORITY QUICK DECODER

| Priority | Timing | Intensity | Example |
|----------|--------|-----------|---------|
| **CRITICAL** | Same day | Daily contact | Disengaged learner, hidden difficulty |
| **HIGH** | Next 48 hours | 2-3× weekly | Weak major competence (argument, cohesion) |
| **MEDIUM** | Within 1 week | Weekly | Developing competence, partial uptake |
| **LOW** | 1-2× per week | Maintenance | Strategic writers, high performers |

---

## TEMPLATE SELECTION DECISION TREE

```
Start with learner's most significant AI output risk (usually highest priority)

                        AI Output State?
                             |
         ____________________________________________
         |                   |                      |
      [LOW]              [MEDIUM]               [HIGH]
        ↓                   ↓                      ↓
    Reinforce         Develop/Refine         Intervene
      
       ↓                   ↓                      ↓
    Pick:            Pick:                  Pick:
   - reinforce_      - targeted_            - planning_scaffold
     feedback          develop_             - argument_scaffold
   - extension         feedback             - motivational_reengagement
                      - refinement          - explicit_strategic_instruction
                                            - intensive_support_plan

If MULTIPLE high-risk outputs for one student:
  → Rank by pedagogical sequence (planning → skill → revision)
  → Use max 3 templates per feedback cycle
  → Deliver sequentially, not simultaneously
```

---

## EXAMPLE: COMPLETE WORKFLOW FOR ONE STUDENT

**Student S042 Data:**
```
rubric_views: 0
time_on_task: 10 min
word_count: 65
revision_frequency: 0
feedback_views: 0
argumentation_score: 1
organization_score: 2
error_density: 12
```

**Step 1: AI Outputs (computed)**
```
forethought_risk: HIGH → "weak planning and weak criteria awareness"
engagement_risk: HIGH → "disengagement"
revision_depth: HIGH → "weak self-regulated revision"
argumentation_state: HIGH → "weak claim-evidence-reasoning"
discourse_state: MEDIUM → "partial organization"
```

**Step 2: Rule Interpretations**
```
Most critical → disengagement
Next critical → weak planning
Next → weak argument structure
```

**Step 3: Feedback Selection**
```
IMMEDIATE (today):
  Template: motivational_reengagement
  Message: "I notice you haven't engaged with this assignment yet. 
            What obstacles are preventing you? Let me help you 
            take a small first step."

NEXT (48 hours, after student re-engages):
  Template: planning_scaffold
  Message: "Before you draft, spend 5 minutes reviewing the rubric.
            Look for what makes a strong argument. Write down your 
            main point in one sentence."

THEN (after first attempt):
  Template: argument_scaffold
  Message: "Strong essays have three parts: CLAIM (your main idea),
            EVIDENCE (an example), EXPLANATION (why it matters).
            Your paragraph needs all three. Here's what each looks like..."
```

**Outcome Tracking**:
- Did S042 re-engage after motivational message? → Update engagement_risk
- Did planning_scaffold lead to more time-on-task? → Update forethought_risk
- Did argument_scaffold improve argumentation_score? → Update argumentation_state
- → Recompute all AI outputs for next week

---

## MONTHLY RHYTHM (For Your Implementation)

### Week 1: Data Collection
- Gather Moodle logs, rubric scores, text analytics
- Merge into one dataset
- Run descriptive stats

### Week 2: Analysis & Diagnosis
- Run correlation analysis (research validation)
- Compute AI outputs for cohort
- Identify critical-priority students (forethought_risk = HIGH, engagement_risk = HIGH)

### Week 3: Feedback Design & Delivery
- Select templates for each student
- Generate personalized feedback messages
- Deliver via system/email

### Week 4: Outcome Assessment
- Track: Did student revise? Improve? Re-engage?
- Update AI outputs based on new evidence
- Adjust rules/thresholds if needed

---

**You now have a complete, theoretically grounded, implementable system for adaptive feedback.**

**Start with Step 1 (prepare data) and work through to Step 5 (select feedback).**
**Test with 5-10 students first, then scale to full cohort.**
