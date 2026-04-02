# 📋 WriteLens Project Structure - هيكل المشروع

## 🎯 نظرة عامة
مشروع **WriteLens** - نظام تحليل وتطوير الكتابة الأكاديمية بالذكاء الاصطناعي

**الحجم:** 321 ملف (بعد التنظيف الشامل)

---

## 📁 هيكل المشروع

```
projectpr/
│
├── 🎨 FRONTEND (واجهة تفاعلية)
│   ├── src/                    ← كود React/TypeScript
│   ├── public/                 ← موارد ثابتة
│   ├── package.json            ← تبعيات npm
│   └── vite.config.ts          ← إعدادات البناء
│
├── 🔧 BACKEND (خادم الويب)
│   ├── server.js               ← تطبيق Express الرئيسي
│   ├── adaptiveDecision.js     ← محرك القرارات
│   ├── rulebook.js             ← إدارة القواعس
│   ├── db.js                   ← طبقة قاعدة البيانات
│   ├── package.json            ← تبعيات npm
│   └── test-help-seeking-bayesian.js ← اختبارات
│
├── 🐍 ADAPTIVE_WRITING_SYSTEM (محرك Python الأساسي)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── decision_logic.py   ← منطق اتخاذ القرار
│   │   ├── rulebook.py         ← إدارة القواعد
│   │   ├── bayesian_engine.py  ← استنتاج بايزي
│   │   ├── clustering_engine.py← تجميع الملفات الشخصية
│   │   ├── correlation_engine.py
│   │   ├── feedback_engine.py  ← توليد التغذية الراجعة
│   │   ├── random_forest_engine.py
│   │   └── +7 محركات إضافية
│   ├── config/
│   │   ├── adaptive_rulebook.yaml    ← قواعس التغذية الراجعة
│   │   ├── competence_model.yaml     ← نموذج الكفاءة
│   │   ├── competence_model_enhanced.yaml ← تحسين بايزي
│   │   ├── feedback_templates.yaml   ← نماذج التغذية الراجعة
│   │   ├── feedback_templates_comprehensive.yaml
│   │   ├── help_seeking_coding_scheme.yaml
│   │   └── +5 ملفات إعدادات
│   ├── data/                   ← ملفات بيانات الإدخال
│   ├── outputs/                ← ملفات النتائج المولدة
│   ├── tests/
│   │   └── test_help_seeking_bayesian.py ← اختبارات شاملة
│   ├── scripts/
│   │   └── run_pipeline.py    ← تشغيل الخط الأنابيب
│   └── requirements.txt        ← تبعيات Python
│
├── 📊 RESEARCH_ANALYTICS (تحليلات البحث)
│   ├── 01_clean_data.py        ← معالجة البيانات
│   ├── 02_text_features.py     ← استخراج الميزات
│   ├── 03_detect_profiles.py   ← كشف الملفات الشخصية
│   ├── 04_predict_success.py   ← التنبؤ بالنجاح
│   ├── 05_infer_competence.py  ← استنتاج الكفاءة
│   ├── run_pipeline.py         ← تشغيل خط الأنابيب
│   ├── config/                 ← إعدادات البحث
│   └── data_templates/         ← قوالب البيانات
│
├── 📚 DOCS (التوثيق)
│   ├── QUICK_START.md          ← البدء السريع
│   ├── QUICK_FULL_START.md     ← شرح كامل  
│   ├── SYSTEM_READY.md         ← حالة النظام
│   ├── WRITELEN_GUIDE.md       ← دليل النظام
│   ├── ETHICS_STATEMENT.md     ← البيان الأخلاقي
│   └── WriteLens_Master_Checklist.md
│
├── 🛠️ .TOOLS (أدوات إضافية)
│   └── [أدوات مساعدة]
│
├── 📄 ملفات الجذر الرئيسية
│   ├── writelen_main.py        ← نقطة الدخول الرئيسية
│   ├── full_system_launcher.py ← مشغل شامل
│   ├── system_summary.py       ← ملخص النظام
│   ├── pyrightconfig.json      ← إعدادات Pylance
│   ├── requirements.txt        ← تبعيات Python
│   ├── render.yaml             ← إعدادات Render
│   ├── writelens.db            ← قاعدة البيانات
│   └── .gitignore              ← قائمة التجاهل
│
└── 📖 ملفات التوثيق الأساسية
    ├── README.md               ← هذا الملف
    ├── PROJECT_STRUCTURE.md    ← بنية المشروع
    └── IMPLEMENTATION_SUMMARY.md ← ملخص التنفيذ
```

---

## ⚙️ المكونات الرئيسية

### 1️⃣ **Backend (Express.js)**
- **الملف الرئيسي:** `backend/server.js`
- **الوحدات الرئيسية:**
  - `adaptiveDecision.js` - قرارات التكيفية مع الذكاء الاصطناعي
  - `rulebook.js` - إدارة قواعد التعليقات
  - `db.js` - قاعدة البيانات SQLite
  - `auth.js` - المصادقة

### 2️⃣ **Frontend (React + TypeScript)**
- **الملف الرئيسي:** `frontend/src/main.tsx`
- **الصفحات الرئيسية:**
  - لوحات تحكم الطالب والمعلم
  - محطات تشخيصية (Station 01-12)
  - إدارة الملاحظات والمهام
  - تقارير شاملة

### 3️⃣ **Python Analytics Engine**
- **الملف الرئيسي:** `writelen_main.py`
- **المحركات:**
  - محرك بايزي للاستنتاج الاحتمالي
  - محرك Random Forest للتنبؤ
  - محرك التجميع لملفات شخصية
  - محرك التعليقات التكيفية

### 4️⃣ **Configuration System**
- نظام rules-based للتعليقات المكيفة
- نماذج Bayesian للكفاءة
- قوالب التعليقات الشاملة
- نظام ترميز طلب المساعدة

---

## 🚀 البدء السريع

### النسخ الأولية
```bash
# استنساخ المشروع
git clone <repo>
cd projectpr

# تثبيت التبعيات
pip install -r requirements.txt
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### تشغيل النظام
```bash
# Python Analytics (تجهيز البيانات)
python writelen_main.py

# أو تشغيل Backend + Frontend معاً
python full_system_launcher.py
```

### تشغيل الاختبارات
```bash
# Python tests
python adaptive_writing_system/tests/test_help_seeking_bayesian.py

# JavaScript tests
node backend/test-help-seeking-bayesian.js
```

---

## 📊 ملفات البيانات المهمة

### Config Files (`.yaml`)
- `adaptive_rulebook.yaml` - قواعس التعليقات (18+ قاعدة)
- `competence_model_enhanced.yaml` - نموذج الكفاءة مع بايز
- `feedback_templates_comprehensive.yaml` - 50+ نموذج تعليق
- `help_seeking_coding_scheme.yaml` - ترميز طلب المساعدة

### Data Files
- `adaptive_writing_system/data/` - بيانات الإدخال
- `adaptive_writing_system/outputs/` - النتائج المولدة
- `writelens.db` - قاعدة البيانات المركزية

---

## 🧪 الميزات المتقدمة

### ✅ Bayesian Inference for Help-Seeking
نموذج احتمالي يربط بين طلب المساعدة والكفاءة الذاتية

### ✅ Adaptive Rules Engine  
قواعس ديناميكية تتغير حسب حالة الطالب

### ✅ Random Forest Predictions
تنبؤ بدقة بتطور الكتابة

### ✅ Unified Feedback Generation
توليد تعليقات مخصصة ومترابطة

---

## 📈 إحصائيات المشروع

| المجال | الإحصائية |
|-------|----------|
| **عدد الملفات** | 321 (بعد التنظيف) |
| **سطور الكود** | ~15,000 |
| **قواعس التعليقات** | 18+ |
| **نماذج التعليقات** | 50+ |
| **المحركات** | 10+ |
| **قواعد بايز** | 4 عُقد رئيسية |

---

## 🔄 سير العمل الرئيسي

```
1. استخراج البيانات من Excel
   ↓
2. المعالجة المسبقة وتنظيف البيانات
   ↓
3. استخراج ميزات لغوية متقدمة
   ↓
4. تطبيق عتبات التصنيف
   ↓
5. كشف الملفات الشخصية (Clustering)
   ↓
6. تحليل الارتباطات
   ↓
7. التنبؤ بـ Random Forest
   ↓
8. الاستنتاج البايزي للكفاءة
   ↓
9. تطبيق قواعس التعليقات
   ↓
10. توليد التعليقات المكيفة
    ↓
11. عرض النتائج في الواجهة
```

---

## 🛡️ معايير الجودة

- ✅ **Type Safety**: TypeScript + Python type hints
- ✅ **Error Handling**: معالجة شاملة للأخطاء
- ✅ **Logging**: نظام سجلات شامل
- ✅ **Testing**: اختبارات بايزية وملائمة
- ✅ **Documentation**: توثيق كامل للـ API

---

## 🤝 المساهمة

1. إنشء فرع جديد
2. قم بالتحسينات
3. أرسل طلب دمج مع وصف واضح

---

## 📞 الدعم

- 📚 اطلع على `/docs` للتوثيق الكامل
- 🐍 Python: `adaptive_writing_system/README.md`
- 🎨 Frontend: `frontend/README.md`
- 🔧 Backend: يتبع معايير REST قياسية

---

**آخر تحديث:** 2026-04-02  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج
