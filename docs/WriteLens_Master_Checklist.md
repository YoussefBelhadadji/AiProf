# WriteLens Master Project Checklist

This document consolidates all project requirements into a prioritized master checklist table, categorizing each item as **Must** (Critical for MVP and thesis defense), **Should** (Important for a complete feature set but can be simplified if time is constrained), or **Nice-to-have** (Polishing and advanced functionality).

## Must / Should / Nice-to-have Priority Framework
- **Must**: Cannot defend the thesis or run the pilot without this. (e.g., Core models, Human-in-the-loop, Basic AI & Rules, Backend Integration).
- **Should**: Core functionality that elevates the system quality. (e.g., Rich UI states, Advanced exports, Editable thresholds).
- **Nice-to-have**: Future-proofing, polishing, and complex automations that are secondary to the main research questions. (e.g., Sophisticated NLP beyond core metrics, multi-file advanced importers).

---

| Category | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| **1) Project foundation** | Final project name confirmed (WriteLens / Adaptive Blended Assessment) | Must | ⬜ |
| | Thesis title finalized | Must | ⬜ |
| | Research objectives & questions finalized | Must | ⬜ |
| | Conceptual framework finalized | Must | ⬜ |
| | Human-in-the-loop principle & Teacher authority explicitly documented | Must | ⬜ |
| | AI role limited to support, profiling, prediction, and inference | Must | ⬜ |
| | Main workflow documented end-to-end (data collection to growth analysis) | Must | ⬜ |
| **2) User roles & permissions** | Student, Teacher, Researcher roles defined & mapped | Must | ⬜ |
| | Admin role defined | Should | ⬜ |
| | Role-based redirects & page access | Must | ⬜ |
| | Teacher override authority logged | Must | ⬜ |
| | Research export permissions separated from classroom permissions | Should | ⬜ |
| **3) Core data model** | Primary entity defined as **student x task x draft** | Must | ⬜ |
| | Core identifiers present (student_id, course_id, task_id, etc.) | Must | ⬜ |
| | Data streams modeled (process, product, interaction, indicators, AI, rules, feedback, growth) | Must | ⬜ |
| **4) Input workbook & source** | Excel workbook import supported & Parser validates required sheets | Must | ⬜ |
| | Multi-file workbook import supported | Nice-to-have | ⬜ |
| | Handling for all 7 required workbook sheets | Must | ⬜ |
| | Ingest Moodle logs, Rubric scores, Essays/drafts, Messages, Submission history | Must | ⬜ |
| | Missing-data & invalid workbook error handling defined | Must | ⬜ |
| **5) Process variables** | Incorporate 15 process variables (e.g., time_on_task, rubric_views, revision_freq) | Must | ⬜ |
| **6) Product variables** | Incorporate 21 product variables (e.g., cohesion_index, error_density, word_count) | Must | ⬜ |
| **7) Help-seeking & interaction**| Help-seeking treated as a formal variable & message types coded | Must | ⬜ |
| | message_count, message_depth, message_type, timing, self-correction stored | Must | ⬜ |
| | Private-message thresholds supported in UI/reporting | Should | ⬜ |
| **8) Derived indicators** | Incorporate 13 derived indicators (e.g., score_gain, error_reduction, uptake) | Must | ⬜ |
| | Error density formula documented, All formulas versioned and documented | Must | ⬜ |
| **9) Threshold engine** | Thresholds theory-informed, task-based, rubric-aligned | Must | ⬜ |
| | Thresholds editable & pilot-calibrated | Must | ⬜ |
| | Threshold bands defined & implemented for core indicators | Must | ⬜ |
| | Threshold rationale documented | Must | ⬜ |
| | Threshold management interface available to admin/teacher-researcher | Should | ⬜ |
| **10) Analytics layer** | Descriptive, Correlation, Growth analysis implemented | Must | ⬜ |
| | Means/SD/min/max/counts & Completion rates available | Must | ⬜ |
| | Variable-pair correlations & p-values shown where applicable | Should | ⬜ |
| | Draft-to-draft gains visualized & feedback-aligned growth computed | Must | ⬜ |
| | Research exports available | Must | ⬜ |
| **11) AI layer** | Clustering, Random Forest, Bayesian inference implemented | Must | ⬜ |
| | Feature matrix standardized for clustering, labels mapped | Must | ⬜ |
| | RF target variables selected & feature importance exposed | Must | ⬜ |
| | Bayesian latent competence states defined | Must | ⬜ |
| | AI outputs logged per decision | Must | ⬜ |
| | Case-level fallback supported when cohort is too small | Should | ⬜ |
| **12) AI outputs to expose** | Incorporate 17 required AI outputs (e.g., forethought_risk, learner_profile) | Must | ⬜ |
| **13) Rule engine** | Rule schema defined (condition, ai_state, feedback_template, etc.) | Must | ⬜ |
| | Rule categories defined (planning, writing, revision, engagement) | Must | ⬜ |
| | Canonical examples covered (e.g., A1 planning risk, C4 feedback uptake risk) | Must | ⬜ |
| | Triggered rule logs stored & strong rule table exposed to UI | Must | ⬜ |
| **14) Feedback templates** | Template library created, editable by teacher, actionable | Must | ⬜ |
| | Templates map to pedag. need, can be combined, not generic | Must | ⬜ |
| | Core templates included (e.g., planning_scaffold, direct_corrective) | Must | ⬜ |
| **15) Feedback selection flow** | End-to-end flow: Evidence → Indicators → AI States → Rules → Template | Must | ⬜ |
| | Final feedback composed & Teacher review step required | Must | ⬜ |
| | Approve/send step logged & final decision stored in audit trail | Must | ⬜ |
| **16) Frontend application** | React + TypeScript, Routing, Auth guard, Role-based access | Must | ⬜ |
| | State management, API integration, Responsive layout | Must | ⬜ |
| | Loading/error/empty states, Reusable design system components | Must | ⬜ |
| | Accessibility baseline | Should | ⬜ |
| **17) Main frontend pages** | Login, Dashboard, Students, Reports, Notes, Import, Settings | Must | ⬜ |
| | Pipeline station pages (12 analytical stations) | Must | ⬜ |
| | Public landing page, Forgot/Reset password | Should | ⬜ |
| **18) Study scope / global state**| selectedCaseId, selectedTaskByCase, selectedVariableIds, selectedStationIds | Must | ⬜ |
| | Global scope reused across dashboard/students/reports/pipeline | Must | ⬜ |
| | Scope presets implemented (Classroom view, Writing focus, Full case) | Should | ⬜ |
| | Scope persisted between sessions, Quick scope summary always visible | Should | ⬜ |
| **19) 12 analytical stations** | S01 Context through S12 Revision evidence implemented | Must | ⬜ |
| | Navigation, Sidebar, Cohort-backed mode, Case-level mode | Must | ⬜ |
| | Locked/unavailable state messaging | Should | ⬜ |
| **20) Teacher dashboard flows** | Key metrics: Totals, At-risk, Pending approvals, Needs intervention | Must | ⬜ |
| | Filters by task/profile/risk | Should | ⬜ |
| | Feedback review screen shows all evidence, rules, templates, edit box, approve | Must | ⬜ |
| **21) Student-facing UX** | Dashboard, Writing task, Submission, Feedback, Progress, Reflection pages | Must | ⬜ |
| | Feedback page shows strengths, weaknesses, next steps, side-by-side view | Must | ⬜ |
| **22) Import and parsing UX** | 3-step import wizard (Upload, Review, Finalize) with progress | Must | ⬜ |
| | Review table for detected cases, Import error handling | Must | ⬜ |
| | Cohort status explanation after import | Should | ⬜ |
| **23) Reports and exports** | Overview, Assessment Architecture, Final Report tabs | Must | ⬜ |
| | Final report includes all 15 defined sections (e.g., Exec Summary, AI Synth) | Must | ⬜ |
| | PDF export, Browser print | Must | ⬜ |
| | HTML export | Nice-to-have | ⬜ |
| **24) UX and design system** | Evidence-first, Teacher-control-first experience, Dark academic identity | Must | ⬜ |
| | Glassmorphism card system, Component library, Defined UX states | Must | ⬜ |
| | Interpretation panel & PedagogicalInsightBadge present | Must | ⬜ |
| | Mobile navigation & Responsive tables/charts | Should | ⬜ |
| **25) Backend services** | 11 core services (Auth, DB, Features, AI, Rules, Feedback, Audit...) | Must | ⬜ |
| **26) API layer** | All 17 defined API endpoints implemented | Must | ⬜ |
| **27) Database / storage** | 17 core tables/collections (users, roles, tasks, submissions...) | Must | ⬜ |
| | Versioned drafts/rubrics | Must | ⬜ |
| | Rule log, AI output log, Teacher override log per decision | Must | ⬜ |
| | Exportable records | Must | ⬜ |
| **28) NLP / text processing** | Tokenization, splits, counts, acad vocab, flags, error density | Must | ⬜ |
| | Keep NLP interpretable and rubric-aligned (Avoid opaque NLP) | Must | ⬜ |
| **29) Engineering quality** | Logging, Error boundary, API error handling, Type checking | Must | ⬜ |
| | Config files documented, Deployment config documented, Pinned versions | Must | ⬜ |
| | Retry flow for failed rendering, Testing plan | Should | ⬜ |
| **30) Security & ethics** | Password hashing, RBAC, Secure storage, Audit trail | Must | ⬜ |
| | Student privacy, Anonymized research exports, No identity exposure | Must | ⬜ |
| | Explicit human oversight (No hidden high-stakes auto decisions) | Must | ⬜ |
| | Ethics statement documented | Must | ⬜ |
| **31) Deployment & operations**| Frontend/Backend prod builds, Python pipeline callable from backend | Must | ⬜ |
| | Output cleanup between runs, CSV standardized for pipeline, Report export works | Must | ⬜ |
| | Local development setup documented, Hosting config present | Must | ⬜ |
| **32) Pilot and evaluation** | Pilot completed, Thresholds recalibrated, Rules/Templates refined | Must | ⬜ |
| | UX improved after pilot, Full run completed, Growth measured | Must | ⬜ |
| | Final thesis analysis completed, Validity/Reliability discussed | Must | ⬜ |

### Critical Gaps to Address Immediately (High Priority)
1. [ ] **Authentication**: Replace `sessionStorage-only` frontend gate with real backend authentication/authorization.
2. [ ] **AI Engine Clarity**: Standardize on `adaptive_writing_system` and clean up `backend/ai_engine` confusion.
3. [ ] **UI States**: Ensure every station has proper **case-level / cohort-backed / unavailable** states, not just the happy path.
4. [ ] **Comprehensive Logging**: Verify all teacher decisions (AI outputs, rules, templates, edits, overrides) are logged.
5. [ ] **Final Report Output**: Final report must be academically complete and aligned with thesis outputs, not just a raw printout.

### Recommended Build Order Sequence
1. Schema, variables, thresholds, rules, templates.
2. Parser and data ingestion.
3. Indicator computation and growth metrics.
4. Analytics implementation.
5. AI outputs implementation.
6. Rule engine and feedback selector.
7. Teacher approval workflow.
8. Reports/exports.
9. Harden auth/security/audit.
10. Pilot, recalibrate, refine.
