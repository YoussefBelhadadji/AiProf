# WriteLens Adaptive System - Quick Start Guide

## ⚡ 30-Second Setup

```bash
# 1. Backend setup
cd adaptive_writing_system
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 2. Start API server
python app/api_server.py
# Server running on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🎯 Key Features Implemented

### 1. Complete NLP Text Analysis
- Lexical diversity (TTR)
- Cohesion metrics
- Syntactic complexity
- Error density
- Academic register
- Draft comparison

### 2. Pedagogical Rule Engine (7 Rules)
- **A1**: Weak Planning & Criteria Awareness
- **A2**: Procrastination
- **B1**: Weak Organization
- **B2**: Limited Argument Development
- **C1**: Effortful but Low Quality
- **D1**: Adaptive Help-Seeking
- **E1**: At-Risk Profile

### 3. Learner Profiling (6 Types)
1. Strategic & Engaged
2. Effortful but Struggling
3. Procrastinating Writer
4. Disengaged Learner
5. Selective Reviser
6. Help-Seeking Learner

### 4. Competence Tracking (4 Factors)
- Planning Competence (15%)
- Drafting Competence (40%)
- Revision Competence (25%)
- Metacognitive Competence (20%)

### 5. REST API (7 Endpoints)
- `POST /api/submissions/analyze` - Main analysis
- `GET /api/students/{id}/dashboard` - Dashboard
- `GET /api/students/{id}/feedback-history` - History
- `GET /api/students/{id}/competence` - Competence trajectory
- `POST /api/admin/calibrate-thresholds` - Threshold validation
- `GET /api/admin/system-config` - System config
- `GET /api/admin/system-stats` - Statistics

### 6. React Adaptive Feedback Component
- Learner profile display
- Competence visualization
- Writing metrics summary
- Adaptive feedback boxes
- Next steps action plan

---

## 📊 API Example

```bash
# Submit a draft for analysis
curl -X POST http://localhost:5000/api/submissions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "S001",
    "text": "Your student draft...",
    "rubric_scores": {
      "rubric_organization": 3,
      "rubric_argument": 2
    },
    "engagement_metrics": {
      "rubric_views": 2
    }
  }'
```

---

## 🔌 Integration Checklist

- [ ] Update Station components to call `/api/submissions/analyze`
- [ ] Display AdaptiveFeedback component with response
- [ ] Create Student Dashboard with learner profile
- [ ] Build Teacher Admin Panel for intervention tracking
- [ ] Set up threshold calibration UI
- [ ] Add system statistics visualization

---

## 📁 Files Created/Updated

**Core System** (9 files):
1. ✅ `text_analytics_engine.py` - NLP
2. ✅ `interpretation_engine.py` - Rules
3. ✅ `learner_profiling_engine.py` - Profiling
4. ✅ `adaptive_system.py` - Orchestrator
5. ✅ `api_server.py` - Flask API
6. ✅ `database_adapter.py` - SQLite
7. ✅ `config/thresholds.yaml` - Configuration
8. ✅ `AdaptiveFeedback.tsx` - React component
9. ✅ `AdaptiveFeedback.css` - Styling

**Config Updates**:
- ✅ `requirements.txt` - Added flask, flask-cors, spacy

---

## 🧪 Test the System

```python
# test_system.py
from adaptive_system import AdaptiveWritingSystem

system = AdaptiveWritingSystem()

sample = {
    "student_id": "S001",
    "assignment_id": "A001",
    "text": """Online learning provides advantages for students. 
    First, it allows flexible access. Second, multimedia helps learning.""",
    "rubric_scores": {
        "rubric_organization": 2,
        "rubric_argument": 2,
    },
    "engagement_metrics": {
        "rubric_views": 1,
        "revision_frequency": 0,
    }
}

response = system.process_submission(sample)
print(response["learner_profile"])
print(response["adaptive_feedback"])
```

---

## 💾 Database Reset

```bash
# Clear and reinitialize database
rm adaptive_writing_system/writelens.db
python adaptive_writing_system/app/database_adapter.py
```

---

## 🚀 Production Deployment

1. Use Gunicorn instead of Flask dev server:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app.api_server:app
```

2. Set environment variables:
```bash
export FLASK_ENV=production
export DATABASE_URL=sqlite:///writelens.db
```

3. Deploy frontend build:
```bash
npm run build
# Serves from dist/
```

---

## 🎓 System Alignment

✅ **100% Complete** - Teacher's Pedagogical Vision

All components from the specification document are now implemented:
- Text Analytics ✓
- Thresholds & Rules ✓
- Learner Profiling ✓
- Competence Modeling ✓
- Feedback Generation ✓
- Backend API ✓
- Frontend Integration Ready ✓

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| API connection failed | Check `http://localhost:5000/api/health` |
| spaCy model not found | Run `python -m spacy download en_core_web_sm` |
| Database locked | Delete `writelens.db` and reinitialize |
| CORS errors | Verify Flask has `CORS(app)` enabled |
| Python import errors | Activate virtual environment: `source venv/bin/activate` |

---

**System Ready for Development! 🎉**
