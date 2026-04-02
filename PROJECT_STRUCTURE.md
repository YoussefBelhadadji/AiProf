# 📁 WriteLens - Project Structure (Organized)

## 📊 Current Organization

```
projectpr/
│
├── 📁 docs/                           ← ALL DOCUMENTATION (Organized)
│   ├── QUICK_START.md                 ← Start here! ⭐
│   ├── QUICK_FULL_START.md
│   ├── SYSTEM_READY.md
│   ├── WRITELEN_GUIDE.md
│   ├── SYSTEM_ARCHITECTURE.md         (in adaptive_writing_system/)
│   ├── ETHICS_STATEMENT.md
│   ├── AUTOMATIC_INTEGRATION.md
│   ├── CLEANUP_REPORT.md
│   └── WriteLens_Master_Checklist.md
│
├── 📁 adaptive_writing_system/        ← MAIN PYTHON APPLICATION
│   ├── app/                           ← Python modules
│   │   ├── ai_output_computation.py
│   │   ├── bayesian_engine.py
│   │   ├── clustering_engine.py
│   │   ├── decision_logic.py
│   │   ├── feedback_engine.py
│   │   ├── merge_data.py
│   │   ├── random_forest_engine.py
│   │   ├── rule_engine.py
│   │   ├── text_features.py
│   │   ├── threshold_engine.py
│   │   └── utils.py
│   │
│   ├── config/                        ← Configuration YAML files
│   │   ├── adaptive_rulebook.yaml
│   │   ├── rules.yaml
│   │   ├── rubric.yaml
│   │   ├── competence_model.yaml
│   │   └── ...other configs
│   │
│   ├── data/                          ← Input data files
│   │   ├── essays.csv
│   │   ├── messages.csv
│   │   ├── moodle_logs.csv
│   │   └── rubric_scores.csv
│   │
│   ├── outputs/                       ← Generated outputs
│   │   ├── 01_merged.csv
│   │   ├── 02_features.csv
│   │   └── ...more outputs
│   │
│   ├── tests/                         ← Unit tests
│   ├── requirements.txt
│   └── README.md
│
├── 📁 backend/                        ← NODE.JS BACKEND
│   ├── server.js
│   ├── db.js
│   ├── auth.js
│   ├── liveAnalytics.js
│   ├── package.json
│   └── ai_engine/
│
├── 📁 frontend/                       ← REACT/VUE FRONTEND
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 research_analytics/             ← RESEARCH & ANALYSIS
│   ├── 01_clean_data.py
│   ├── 02_text_features.py
│   ├── run_pipeline.py
│   └── config/
│
├── 📁 results/                        ← ALL OUTPUTS & REPORTS (NEW!)
│   └── reports/
│       ├── WriteLens_Report_20260401_172611.html      ← Latest reports ⭐
│       ├── WriteLens_DetailedReport_20260401_172611.txt
│       ├── WriteLens_Summary_20260401_172611.json
│       ├── README.md
│       └── archive/                   ← Old reports (backup)
│           ├── WriteLens_Report_20260401_171454.html
│           ├── WriteLens_Report_20260401_171548.html
│           └── ...more old reports
│
│
├── 📄 writelen_main.py                ← MAIN ENTRY POINT ⭐
├── 📄 full_system_launcher.py         ← Full automation launcher
├── 📄 system_summary.py               ← System status report
│
├── 📄 pyrightconfig.json              ← Python type checking
├── 📄 package-lock.json               ← NPM dependencies
├── 📄 render.yaml                     ← Deployment config
├── 📄 .gitignore                      ← Git ignore file
├── 📄 .python-version                 ← Python version spec
├── 📄 .node-version                   ← Node version spec
└── 📄 lahmarabbou_asmaa_FULL_ENGLISH (1).xlsx ← Sample data

```

---

## 🚀 Quick Commands

### Start the System
```bash
python writelen_main.py
```

### Full System Launch (Auto)
```bash
python full_system_launcher.py
```

### System Status
```bash
python system_summary.py
```

---

## 📚 How to Use After Organization

1. **Read Documentation First**
   - Start with: `docs/QUICK_START.md`
   - Full guide: `docs/WRITELEN_GUIDE.md`

2. **Run the Application**
   - Execute: `python writelen_main.py`
   - Or: `python full_system_launcher.py`

3. **Check Results**
   - Latest reports: `results/reports/`
   - Old reports backup: `results/reports/archive/`

4. **View Application Output**
   - Python outputs: `adaptive_writing_system/outputs/`

---

## 📋 Cleanup Done

✅ **Removed:** Old `AI_ANALYSIS_REPORTS/` folder (moved to `results/reports/`)

✅ **Organized:** All documentation → `docs/` folder

✅ **Archived:** Old reports → `results/reports/archive/`

✅ **Grouped:** Latest reports → `results/reports/` (main folder)

---

## 🔧 Active Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Core Engine** | `adaptive_writing_system/app/` | AI analytics algorithms |
| **Configuration** | `adaptive_writing_system/config/` | System rules & models |
| **Backend API** | `backend/` | REST API server |
| **Frontend** | `frontend/` | User interface |
| **Documentation** | `docs/` | All guides & instructions |
| **Results** | `results/reports/` | Generated reports |

---

**Last Organized:** April 1, 2026
