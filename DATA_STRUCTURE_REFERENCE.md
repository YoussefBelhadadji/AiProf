# Frontend Public Data Structure

## Directory Tree

```
frontend/public/data/
│
├── RUN_20260408_020438/                          (3.5 MB)
│   ├── manifest.json
│   ├── run_index.json
│   ├── groups/
│   │   └── index.json
│   ├── shared/
│   │   ├── index.json
│   │   ├── index_by_id.json
│   │   └── summary.json
│   └── students/
│       ├── index.json
│       └── [student data files]
│
└── submission_journey_latest/                    (4.6 MB)
    ├── manifest.json
    ├── shared/
    │   ├── index.json
    │   ├── index_by_id.json
    │   └── summary.json
    │       └── Contains:
    │           - students_total: 65
    │           - students_with_submissions: 58
    │           - submissions_total: 503
    │           - progress_trends: {...}
    │
    └── students/                         (65 student folders)
        ├── BENMOUFFOK_FATIMA_ZOHRA_MERIEM/
        ├── abubakaraminu_sharif/
        ├── belabbes_nour/
        ├── belmouedden_fatima/
        ├── benchiha_mourad/
        ├── benmansour_hanane/
        ├── bennafla_nour/
        ├── bensaoula_safia/
        ├── berrehail_romaissa/
        ├── boulenouar_nawel/
        ├── ... (55 more)
        └── yousfi_anfal/
            
            Each student folder contains:
            ├── ai_analysis.json          ← AI scores, risk groups, quality data
            │   Contains:
            │   - student_snapshot.risk_group (e.g., "High Risk - Urgent support")
            │   - trajectory_analysis.quality_delta (improvement %)
            │   - trajectory_analysis.trend (improving/stable/declining)
            │   - predictive_outlook.portfolio_score (0-100)
            │
            ├── journey_full.json         ← Learning journey & portfolio
            │   Contains:
            │   - portfolio_score.portfolio_score (0-100)
            │   - portfolio_score.portfolio_level (good_progress/moderate_progress)
            │   - overview.submissions_total, lessons_covered
            │   - narrative.progress_interpretation.trend
            │   - phase_summary[]
            │
            ├── timeline.json             ← Submission history
            │   Contains:
            │   - timeline[]: array of submissions
            │   - Each: { assignment_name, stage_label, time_created_at,
            │              has_text, quality_score, text_preview }
            │
            ├── lesson_progress.json      ← Per-lesson progress
            ├── journey_full.md           ← Markdown report
            └── [other files]
```

---

## Key Files by Use Case

### 1. Dashboard Statistics (dashboardService.ts)
**Main File:** `shared/summary.json`
```json
{
  "students_total": 65,
  "students_with_submissions": 58,
  "submissions_total": 503,
  "average_submissions_per_student": 7.74,
  "average_ai_data_confidence": 0.6694,
  "progress_trends": {
    "improving": 13,
    "stable": 31,
    "declining": 8,
    "insufficient_data": 13
  }
}
```

**Secondary Files:**
- `students/index.json` — For student details
- `students/{slug}/ai_analysis.json` × 65 — For portfolio scores & risk levels

**Output:** Dashboard metrics card values, trend chart, intervention count

---

### 2. Student List & Lookup (submissionService.ts)
**Main File:** `students/index.json`
```json
[
  {
    "student_id": "9328",
    "student_name": "BENMOUFFOK FATIMA ZOHRA MERIEM",
    "submissions_total": 0,
    "lessons_covered": 0,
    "progress_trend": "insufficient_data",
    "ai_data_confidence": 0.0
  },
  ...
]
```

**Output:** Student lists for reports, searches, filters

---

### 3. Portfolio & Writing Analysis (portfolioService.ts)
**Files:**
- `students/{slug}/journey_full.json` — Portfolio scores, progress
- `students/{slug}/ai_analysis.json` — AI analysis details
- `students/{slug}/timeline.json` — Submission scores

**Key Fields:**
```json
{
  "portfolio_score": {
    "portfolio_score": 69.51,
    "portfolio_level": "good_progress"
  },
  "narrative": {
    "progress_interpretation": {
      "trend": "improving",
      "quality_delta": 0.05
    }
  }
}
```

**Output:** Portfolio page display, writing quality trends

---

### 4. Recent Submissions Table (Dashboard)
**File:** `students/{slug}/timeline.json` (top 15 students)
```json
{
  "timeline": [
    {
      "assignment_name": "Argumentative Essay",
      "stage_label": "body_development",
      "time_created_at": "2026-04-06T10:30:00Z",
      "has_text": true,
      "quality_score": 0.71,
      "text_preview": "..."
    }
  ]
}
```

**Output:** Recent submissions table in dashboard

---

### 5. Final Reports (reportService.ts)
**Files:**
- `students/index.json` — Student metadata
- `students/{slug}/journey_full.json` — Full portfolio data
- `students/{slug}/ai_analysis.json` — AI insights
- `students/{slug}/timeline.json` — Submission details

**Output:** Comprehensive student reports

---

## File Sizes

| File/Folder | Size | Count |
|-------------|------|-------|
| submission_journey_latest/ | 4.6 MB | ~6000 files |
| RUN_20260408_020438/ | 3.5 MB | ~2000 files |
| **Total** | **8.1 MB** | **~8000 files** |

### Size Breakdown (submission_journey_latest)
```
shared/
  ├── summary.json            ~2 KB
  ├── index.json             ~120 KB (65 students × ~2 KB each)
  └── index_by_id.json       ~120 KB

students/ (65 folders)
  Per student (~70 KB):
  ├── ai_analysis.json       ~10 KB
  ├── journey_full.json      ~20 KB
  ├── timeline.json          ~10 KB
  ├── lesson_progress.json   ~5 KB
  ├── journey_full.md        ~25 KB
  └── [misc]                 ~5 KB
```

---

## Loading Strategy

### Development (Vite)
```
Browser Request
  → GET /data/submission_journey_latest/students/index.json
  → Vite resolves to: frontend/public/data/submission_journey_latest/students/index.json
  → Returns file
```

### Production (Vercel)
```
Browser Request
  → GET /data/submission_journey_latest/students/index.json
  → Vercel CDN resolves to: deployed static asset
  → Returns file (cached)
```

### Error Fallback
```
If /data/ URL fails (rare):
  → Dev: Retry via @fs URL (local filesystem)
  → Prod: Error message with deployment checklist
```

---

## Usage in Code

### Using localJourneyData (old way)
```typescript
import { fetchLocalJourneyJson } from '../services/localJourneyData';

const data = await fetchLocalJourneyJson('students/index.json');
// Automatically handles dev/prod paths
```

### Using dataUtils (recommended new way)
```typescript
import { loadAllStudents, loadStudentAiAnalysis } from '../lib/dataUtils';

const students = await loadAllStudents();
// Returns: StudentIndexEntry[]

const aiData = await loadStudentAiAnalysis('john_doe');
// Returns: AI analysis JSON
```

### URL Construction
```typescript
import { getJourneyPath, getRunPath } from '../lib/dataUtils';

const url1 = getJourneyPath('students/index.json');
// Result: https://yourapp.vercel.app/data/submission_journey_latest/students/index.json

const url2 = getRunPath('manifest.json');
// Result: https://yourapp.vercel.app/data/RUN_20260408_020438/manifest.json
```

---

## Deployment Verification

After deploying to Vercel, verify these URLs work:
```
✅ /data/submission_journey_latest/shared/summary.json
✅ /data/submission_journey_latest/students/index.json
✅ /data/submission_journey_latest/students/BENMOUFFOK_FATIMA_ZOHRA_MERIEM/ai_analysis.json
✅ /data/RUN_20260408_020438/manifest.json
```

Check in browser:
```javascript
// In DevTools Console
fetch('/data/submission_journey_latest/shared/summary.json')
  .then(r => r.json())
  .then(d => console.log('✅ Data loads:', d))
  .catch(e => console.error('❌ Error:', e))
```

---

## Related Files

- **Loading:** `frontend/src/services/localJourneyData.ts`
- **Utilities:** `frontend/src/lib/dataUtils.ts`
- **Services:** `frontend/src/services/{dashboard,submission,portfolio,report}Service.ts`
- **Config:** `frontend/vite.config.ts`
- **Original Data:** (unchanged outside frontend project)
  - `/home/youcef-bl/Documents/Prof_English/.../submission_journey_latest/`
  - `/home/youcef-bl/Documents/Prof_English/.../RUN_20260408_020438/`
