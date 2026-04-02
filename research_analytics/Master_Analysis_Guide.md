# Master Guide: AI-Driven Research Analytics in Writing Assessment

This guide explains the "Methodological Engine" of your dissertation. It details how Learning Analytics (LA) and Artificial Intelligence (AI) work together to transform raw student behavior into adaptive pedagogical support.

---

## 1. The Core Analytical Question
**"How does student writing behavior (Process) relate to writing quality (Product) over time?"**

To answer this, we use three distinct AI families. Each answers a different sub-question:

| Model | Sub-Question | Dissertation Role |
| :--- | :--- | :--- |
| **Clustering** | *Who are my students?* | **Learner Taxonomy**: Identifying groups (e.g., 'At-Risk', 'Strategic') based on behavioral patterns. |
| **Random Forest** | *What matters most?* | **Variable Importance**: Predicting the final score and identifying the strongest predictors (e.g., Is 'Revision Frequency' more important than 'Total Time'?). |
| **Bayesian Network** | *What is the hidden competence?* | **Latent State Modeling**: Estimating internal skills (Argumentation, Cohesion, Regulation) that we cannot see directly. |

---

## 2. When & How to Use Each Model

### **A. Clustering (K-Means)**
- **When**: After you have collected data for the first few tasks.
- **Why**: To see if students naturally group into different "engagement profiles."
- **PhD Justification**: "Following Siemens (2013), clustering was used to identify heterogeneous learner profiles within the BL environment, allowing for differentiated feedback paths."

### **B. Random Forest (RF)**
- **When**: When you want to predict the final rubric score or identify "at-risk" students.
- **Why**: RF handles non-linear relationships better than traditional regression.
- **PhD Justification**: "A Random Forest Regressor was employed to model the predictive relationship between Moodle process indicators and final rubric scores, identifying 'feedback engagement' as the primary driver of score gain."

### **C. Bayesian Inference**
- **When**: To build the "adaptive engine."
- **Why**: It handles uncertainty. If a student hasn't revised much but has high rubric scores, the model updates the probability of 'Planning Competence.'
- **PhD Justification**: "Drawing on Evidence-Centered Design (ECD), a Bayesian Network was used to infer latent writing competencies, providing a probabilistic basis for adaptive pedagogical triggers."

---

## 3. The Implementation Pipeline

### **Phase 1: Feature Extraction (The 'Eyes' of the AI)**
Before running models, the AI must "read" the text. It extracts indicators like:
- **TTR (Lexical Diversity)**: $Unique Words / Total Words$.
- **Cohesion Index**: Frequency of connectors (however, therefore).
- **Error Density**: Grammar/Spelling issues per 100 words.

### **Phase 2: Data Integration (The 'Memory')**
Linking Moodle logs (Logins, Views) with Rubric Scores and Text Features into one **Master Dataset**.

### **Phase 3: Pattern Discovery (The 'Brain')**
Running the models (Clustering, RF, Bayesian) to generate the "Pedagogical Dashboard."

---

## 4. Your Role vs. The AI's Role

> [!IMPORTANT]
> In a PhD, you are the **Human-in-the-Loop**. AI does the calculation; you do the **Pedagogical Interpretation**.

- **AI's Role**: Processing 1,000+ Moodle logs; Calculating NLP metrics; Predicting probabilities.
- **Your Role**: Setting the thresholds; Justifying the rules; Delivering the "Onsite Intervention" (e.g., meeting with a 'Cluster 3' student to discuss their planning).

---

## 5. Next Steps for Implementation
1.  **Prepare the CSV files** in the `data_templates/` folder.
2.  **Run scripts** in sequence (01 to 04).
3.  **Review outputs** in the `outputs/` folder to create tables for Chapter 4 (Results).
