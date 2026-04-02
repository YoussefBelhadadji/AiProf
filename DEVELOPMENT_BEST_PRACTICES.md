# 🎯 دليل تطوير WriteLens - Best Practices

**الغرض:** ضمان الحفاظ على نظافة المشروع ومعايير الجودة العالية

---

## 🏗️ البنية الموصى بها

### نظام الملفات المنطقي
```
projectpr/
├── core/                  ← الكود الأساسي فقط
│   ├── python/            ← محركات Python
│   ├── backend/           ← خادم Express
│   └── frontend/          ← واجهة React
│
├── config/                ← ملفات YAML و JSON
│
├── data/                  ← بيانات الإدخال (git-ignored)
│   ├── input/
│   └── processed/         ← يُعاد إنشاؤها تلقائياً
│
├── docs/                  ← التوثيق
│
├── tests/                 ← الاختبارات
│
└── tools/                 ← أدوات مساعدة
```

---

## 📝 معايير الكود

### 1. Python
```python
# ✓ موضح وواضح
def calculate_competence(evidence: Dict[str, Any]) -> float:
    """
    احسب درجة الكفاءة بناءً على الأدلة.
    
    Args:
        evidence: قاموس الأدلة
        
    Returns:
        درجة الكفاءة (0-1)
    """
    pass

# ✗ غير واضح
def calc(e):
    return sum(e.values()) / len(e)
```

### 2. JavaScript/TypeScript
```typescript
// ✓ موضح وآمن
interface StudentProfile {
  studentId: string;
  competence: Record<string, number>;
  helpSeeking: HelpSeekingLevel;
}

// ✗ غير آمن
const profile = { id: "123", comp: {}, help: "high" };
```

### 3. Config Files (YAML)
```yaml
# ✓ منظم بوضوح
rules:
  adaptive_feedback:
    - rule_id: R001
      category: "argument_quality"
      priority: 10
      conditions:
        thresholds:
          argument_score: ">= 3"
        ai_states:
          revision_depth: "Deep"
      display:
        pedagogical_interpretation: "..."
      actions:
        feedback_templates: ["T001", "T002"]

# ✗ غير منظم
rules:
  - id: R001
    cond: {arg: 3, rev: true}
    fb: [T001]
```

---

## 🧪 اختبار شامل

### الملفات المتوقعة
```bash
# اختبارات Python
adaptive_writing_system/tests/test_*.py

# اختبارات JavaScript
backend/test-*.js
frontend/src/__tests__/*.test.ts
```

### نمط الاختبار
```python
# ✓ اختبار واضح
def test_help_seeking_inference():
    """تحقق من استنتاج المساعدة بايزياً."""
    student = {"help_seeking_messages": 5, "help_seeking_state": "Adaptive"}
    states = build_bayesian_states(student)
    
    assert states["srl_competence_distribution"]["High"] > 0.5
    assert states["help_seeking_risk"] == "Adaptive Help-Seeking"
```

---

## 📦 إدارة التبعيات

### Python
```bash
# تحديث المتطلبات
pip freeze > requirements.txt

# تثبيت جديد
pip install -r requirements.txt
```

### Node.js
```bash
# تحديث package.json
npm install <package-name>
npm update

# تثبيت جديد
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

---

## 🔄 Git Workflow

### قواعد الـ Commit
```bash
# ✓ واضح ومفيد
git commit -m "feat: add Bayesian help-seeking inference engine

- Implement posterior calculation for SRL competence
- Add likelihood tables from competence_model_enhanced.yaml
- Update buildLearnerStates() to compute risk levels
- Tests: test_bayesian_posterior_inference passed"

# ✗ غير واضح
git commit -m "fix bugs"
git commit -m "update"
```

### فروع التطوير
```bash
# Feature branches
git checkout -b feature/help-seeking-module

# Bug fixes
git checkout -b fix/bayesian-calculation-error

# Documentation
git checkout -b docs/update-api-reference
```

---

## 🎨 تصميم المشروع

### مبادئ SOLID

#### S - Single Responsibility
```python
# ✓ كل فئة لها مسؤولية واحدة
class BayesianEngine:
    """حساب الاستنتاجات الاحتمالية."""
    
class FeedbackGenerator:
    """توليد التعليقات فقط."""

# ✗ مسؤوليات مختلطة
class ComplexEngine:
    def calculate_bayesian():
        # و أيضاً...
    def generate_feedback():
        # و أيضاً...
    def save_to_database():
        pass
```

#### D - Dependency Injection
```python
# ✓ فصل التبعيات
class AdaptiveDecision:
    def __init__(self, rulebook: Rulebook, templates: FeedbackTemplates):
        self.rulebook = rulebook
        self.templates = templates

# ✗ أقران مباشرة
class AdaptiveDecision:
    def __init__(self):
        self.rulebook = load_rulebook()  # مرتبطة بشدة
```

---

## 📊 البيانات والقياسات

### ملفات الإدخال
- ضع في `adaptive_writing_system/data/`
- استخدم `.csv` أو `.xlsx`
- لا تضع بيانات كبيرة مباشرة في الـ Repo

### النتاج
- يتم إنشاؤه في `adaptive_writing_system/outputs/`
- لا تحفظه في Git (استخدم `.gitignore`)
- يمكن إعادة توليده دائماً

### قواعدة البيانات
- `writelens.db` محفوظة في Git (أساسية)
- `.db-shm` و `.db-wal` مُتجاهلة (مؤقتة)

---

## 🚀 عملية التطوير الموصى بها

### 1. البدء بميزة جديدة
```bash
# 1. إنشاء فرع
git checkout -b feature/new-feature

# 2. كتابة الاختبار أولاً (TDD)
nano adaptive_writing_system/tests/test_new_feature.py

# 3. تنفيذ الميزة
nano adaptive_writing_system/app/new_module.py

# 4. تشغيل الاختبارات
python adaptive_writing_system/tests/test_new_feature.py

# 5. تحديث المستندات
nano docs/NEW_FEATURE.md

# 6. الالتزام والدفع
git add .
git commit -m "feat: implement new-feature"
git push origin feature/new-feature
```

### 2. استكمال الميزة
```bash
# 1. طلب دمج مع وصف واضح
# العنوان: "Implement X feature"
# الوصف:
#   - ماذا تفعل الميزة؟
#   - لماذا ضرورية؟
#   - كيف تختبرها؟
#   - الملفات المعدلة

# 2. مراجعة الكود
# - بحث عن الأخطاء
# - التحقق من الأسلوب
# - اختبار الوظائف

# 3. دمج بعد الموافقة
git checkout main
git merge feature/new-feature
```

---

## 🧹 تنظيف دوري

### أسبوعياً
- [ ] حذف ملفات `.pyc` غير المستخدمة
- [ ] تنظيف السجلات القديمة
- [ ] تحديث التوثيق

### شهرياً
- [ ] مراجعة التبعيات وتحديثها
- [ ] تحليل أداء الكود
- [ ] تنظيف الفروع المغلقة

### ربع سنوياً
- [ ] إعادة فحص البنية
- [ ] تحديث معايير الكود
- [ ] مراجعة الأمان

---

## ⚠️ ما يجب تجنبه

### ❌ لا تفعل
```
✗ رفع node_modules
✗ رفع __pycache__
✗ رفع .env ببيانات حقيقية
✗ رفع ملفات مولدة (outputs/*)
✗ رفع ملفات كبيرة (> 10MB)
✗ commit كود بدون اختبارات
✗ push مباشرة إلى main
✗ استخدام متغيرات عامة
✗ دوال بدون docstrings
✗ API بدون error handling
```

### ✅ افعل
```
✓ ضع التبعيات في requirements.txt/package.json
✓ استخدم .gitignore شامل
✓ أعد الأسرار عبر متغيرات البيئة
✓ اختبر قبل كل commit
✓ استخدم branches للميزات
✓ وثق الكود معقد
✓ أضف error handling دائماً
✓ استخدم type hints
✓ راجع الكود قبل النشر
```

---

## 📖 الموارد المساعدة

### التوثيق الداخلية
- `docs/QUICK_START.md` - البدء السريع
- `docs/SYSTEM_READY.md` - شرح مكونات النظام
- `SYSTEM_ARCHITECTURE.md` - البنية المعمارية

### معايير الكود
- [PEP 8](https://pep8.org/) - معايير Python
- [Google Style Guide](https://google.github.io/styleguide/tsguide.html) - TypeScript
- [Prettier](https://prettier.io/) - تنسيق جديد

### أدوات مفيدة
```bash
# تنسيق كود Python
black adaptive_writing_system/app/*.py

# فحص أسلوب Python
pylint adaptive_writing_system/app/*.py

# تنسيق كود JavaScript
npm run format

# فحص الأخطاء
npm run lint
```

---

## 🎯 الخلاصة

**المبادئ الذهبية:**

1. **النظافة أولاً** - برنامج نظيف أسهل في الصيانة
2. **التوثيق ثانياً** - كود بدون توثيق لا قيمة له
3. **الاختبار ثالثاً** - لا تأمن بكود بدون اختبارات
4. **النمو الثابت** - تطور ببطء وبثقة

---

**ملاحظة! نحن في طريقنا إلى نظام **نظيف جداً** و **احترافي جداً**! 🚀**
