# 📑 فهرس المشروع الشامل - WriteLens

**آخر تحديث:** 2026-04-02  
**الحالة:** ✅ نظيف وجاهز للاستخدام  
**عدد الملفات:** 324 (بعد التنظيف الشامل)

---

## 🎯 ملفات البدء السريع

| الملف | الهدف | القراءة |
|------|------|--------|
| [`QUICK_SETUP_AFTER_CLEANUP.md`](./QUICK_SETUP_AFTER_CLEANUP.md) | إعدادات بعد التنظيف | 5 min |
| [`docs/QUICK_START.md`](./docs/QUICK_START.md) | البدء السريع جداً | 3 min |
| [`CLEANUP_SUMMARY.md`](./CLEANUP_SUMMARY.md) | ملخص التنظيف | 10 min |
| [`PROJECT_STRUCTURE_CLEAN.md`](./PROJECT_STRUCTURE_CLEAN.md) | شرح البنية | 15 min |

---

## 📚 التوثيق الشاملة

### الفهم الأساسي
- [`README.md`](./README.md) - ملف التعريف الرئيسي
- [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) - البنية المعمارية
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - ملخص التنفيذ
- [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) - بنية المشروع الأصلية

### الهياكل والمعايير
- [`PROJECT_STRUCTURE_CLEAN.md`](./PROJECT_STRUCTURE_CLEAN.md) - الهيكل المنظم الجديد
- [`DEVELOPMENT_BEST_PRACTICES.md`](./DEVELOPMENT_BEST_PRACTICES.md) - ممارسات التطوير
- [`RULE_FEEDBACK_MATRIX.md`](./RULE_FEEDBACK_MATRIX.md) - مصفوفة القواعس

### التقارير والتحليلات
- [`docs/ETHICS_STATEMENT.md`](./docs/ETHICS_STATEMENT.md) - البيان الأخلاقي
- [`docs/SYSTEM_READY.md`](./docs/SYSTEM_READY.md) - حالة النظام
- [`WriteLens_Master_Checklist.md`](./WriteLens_Master_Checklist.md) - قائمة التحقق

### الأدلة المتخصصة
- [`docs/WRITELEN_GUIDE.md`](./docs/WRITELEN_GUIDE.md) - دليل النظام الشامل
- [`docs/QUICK_FULL_START.md`](./docs/QUICK_FULL_START.md) - شرح كامل مفصل
- [`docs/AUTOMATIC_INTEGRATION.md`](./docs/AUTOMATIC_INTEGRATION.md) - التكامل التلقائي

---

## 🐍 نظام Python الأساسي

### المحركات الرئيسية
```
adaptive_writing_system/app/
├── ai_output_computation.py    ← معالجة مخرجات الذكاء الاصطناعي
├── bayesian_engine.py           ← استنتاج احتمالي (Bayesian inference)
├── clustering_engine.py          ← تجميع الملفات الشخصية
├── correlation_engine.py         ← تحليل الارتباطات
├── decision_logic.py             ← منطق اتخاذ القرار التكيفي
├── feedback_engine.py            ← توليد التعليقات
├── feedback_generator.py         ← منشئ التعليقات المتقدم
├── init_system.py                ← تهيئة النظام
├── merge_data.py                 ← دمج البيانات
├── random_forest_engine.py       ← تنبؤ بـ Random Forest
├── rule_engine.py                ← محرك القواعس
├── rulebook.py                   ← إدارة القواعس والقوالب
└── threshold_engine.py           ← معالجة العتبات
```

### ملفات التكوين
```
adaptive_writing_system/config/
├── adaptive_rulebook.yaml              ← قواعس التعليقات (18+)
├── competence_model.yaml               ← نموذج الكفاءة الأساسي
├── competence_model_enhanced.yaml      ← نموذج محسّن ببايز
├── feedback_templates.yaml             ← نماذج التعليقات الأساسية
├── feedback_templates_comprehensive.yaml ← 50+ نموذج متقدم
├── help_seeking_coding_scheme.yaml     ← ترميز طلب المساعدة
├── rule_interpretations.yaml           ← تفسيرات القواعس
├── system_alignment_table.yaml         ← جدول التوافق
├── ai_outputs.yaml                     ← مخرجات الذكاء الاصطناعي
├── ai_rule_map.yaml                    ← خريطة قواعس الذكاء الاصطناعي
├── rubric.yaml                         ← معايير التقييم
└── thresholds.yaml                     ← العتبات والحدود
```

### الاختبارات والنصوص
```
adaptive_writing_system/
├── tests/
│   └── test_help_seeking_bayesian.py   ← اختبارات بايزية شاملة
├── scripts/
│   └── run_pipeline.py                 ← تشغيل خط الأنابيب
└── requirements.txt                    ← تبعيات Python
```

---

## 🎨 نظام Frontend (React + TypeScript)

### المكونات الرئيسية
```
frontend/src/
├── components/
│   ├── Dashboard.tsx                ← لوحة تحكم الطالب
│   ├── TeacherDashboard.tsx         ← لوحة تحكم المعلم
│   ├── StudentProfile.tsx           ← ملف الطالب
│   ├── StudentReport.tsx            ├─ تقرير الطالب
│   ├── StudentFeedback.tsx          ├─ تعليقات الطالب
│   └── StudentSettings.tsx          ├─ إعدادات الطالب
├── diagnostic/
│   ├── Station01.tsx through Station12.tsx
│   └── StationRouter.tsx            ← جهاز التوجيه
├── pages/
│   ├── Login.tsx                    ← صفحة الدخول
│   ├── ResetPassword.tsx            ├─ تعيين كلمة المرور
│   ├── ForgotPassword.tsx           ├─ نسيان كلمة المرور
│   └── NotFound.tsx                 ├─ صفحة خطأ
└── App.tsx                          ← التطبيق الرئيسي
```

### الخدمات والأدوات
```
frontend/src/
├── api/        ← خدمات API (auth, export, pipeline, rulebook, workbook)
├── store/      ← متجر Redux (auth, study scope)
├── utils/      ← دوال مساعدة
└── types/      ← تعاريف TypeScript
```

### الإعدادات
```
frontend/
├── vite.config.ts                  ← إعدادات Vite
├── tsconfig.json                   ← إعدادات TypeScript
├── eslint.config.js                ← قواعس الأسلوب
├── package.json                    ← تبعيات npm
└── index.html                      ← ملف HTML الرئيسي
```

---

## 🔧 نظام Backend (Express.js)

### الملفات الأساسية
```
backend/
├── server.js                       ← تطبيق Express الرئيسي
├── adaptiveDecision.js             ← محرك القرارات التكيفية
├── rulebook.js                     ← إدارة القواعس والقوالب
├── db.js                           ├─ طبقة قاعدة البيانات SQLite
├── auth.js                         ├─ المصادقة والترخيص
├── workbookParser.js               ├─ معالج المصنف
├── liveAnalytics.js                ├─ التحليلات المباشرة
├── package.json                    └─ تبعيات npm
└── test-help-seeking-bayesian.js   └─ اختبارات بايزية
```

---

## 📊 نظام البحث والتحليل

```
research_analytics/
├── 01_clean_data.py                ← تنظيف البيانات
├── 02_text_features.py             ← استخراج ميزات لغوية
├── 03_detect_profiles.py           ├─ كشف الملفات الشخصية
├── 04_predict_success.py           ├─ التنبؤ بالنجاح
├── 05_infer_competence.py          └─ استنتاج الكفاءة
├── Master_Analysis_Guide.md        ← دليل التحليل
├── run_pipeline.py                 ← تشغيل خط الأنابيب
├── requirements.txt                ├─ تبعيات Python
└── config/ & data_templates/       └─ الإعدادات والقوالب
```

---

## 📄 ملفات الدخول الرئيسية

| الملف | الهدف |
|------|------|
| `writelen_main.py` | نقطة الدخول الأساسية للمعالجة |
| `full_system_launcher.py` | مشغل شامل (Backend + Frontend) |
| `system_summary.py` | ملخص شامل للنظام |
| `pyrightconfig.json` | إعدادات التحليل الثابت |

---

## 🗂️ البيانات والنتائج

### مجلدات البيانات
```
adaptive_writing_system/
├── data/                           ← ملفات الإدخال (Excel/CSV)
├── outputs/                        ← النتائج المعالجة
│   ├── 01_merged.csv               ← بيانات مدمجة
│   ├── 02_features.csv             ← ميزات لغوية
│   ├── 03_thresholds.csv           ├─ تصنيفات
│   ├── 04_clustered.csv            ├─ ملفات شخصية
│   ├── 04_correlations.csv         ├─ ارتباطات
│   ├── 05_rf.csv                   ├─ تنبؤات RF
│   ├── 06_bayes.csv                ├─ حالات بايزية
│   ├── 07_rules.csv                ├─ قواعس مطبقة
│   └── 08_feedback.csv             └─ تعليقات
└── scripts/                        ← نصوص مساعدة
```

### قاعدة البيانات
```
writelens.db                        ← قاعدة البيانات المركزية SQLite
```

---

## 🛠️ أدوات وملفات مساعدة

```
.tools/                             ← مجلد الأدوات (5 ملفات)
.gitignore                          ← قائمة التجاهل الشاملة (محدثة)
render.yaml                         ← إعدادات Render
render_services.json                ← خدمات Render
```

---

## 📈 إحصائيات المشروع

### التوزيع حسب المجلد
| المجلد | الملفات | الحجم |
|------|---------|------|
| .tools | 5 | 28.89 MB |
| frontend | 155 | 2.2 MB |
| backend | 30 | 1.89 MB |
| adaptive_writing_system | 60 | 0.62 MB |
| research_analytics | 46 | 0.1 MB |
| docs | 9 | 0.1 MB |

### التحسح: **إجمالي 324 ملف - 33.8 MB**

قبل التنظيف:
- **46,836 ملف - تقريباً 500+ MB**
- **تقليل 99.3%!** 🎉

---

## 🚀 الخطوات الموصى بها

### 1. البدء السريع (5 دقائق)
```bash
# اقرأ هذا أولاً
cat QUICK_SETUP_AFTER_CLEANUP.md
```

### 2. الإعدادات الأساسية (10 دقائق)
```bash
# ثبت التبعيات
pip install -r requirements.txt
npm install (في كل مجلد)
```

### 3. تشغيل الاختبارات (2 دقيقة)
```bash
# تحقق من الأنظمة
python adaptive_writing_system/tests/test_help_seeking_bayesian.py
node backend/test-help-seeking-bayesian.js
```

### 4. تشغيل النظام (1 دقيقة)
```bash
# ابدأ كل شي
python full_system_launcher.py
```

---

## 🎓 موارد التعلم

### للمبتدئين
1. اقرأ `docs/QUICK_START.md`
2. اقرأ `PROJECT_STRUCTURE_CLEAN.md`
3. شغل `python writelen_main.py`

### للمطورين
1. اقرأ `SYSTEM_ARCHITECTURE.md`
2. ادرس `adaptive_writing_system/app/`
3. اقرأ `DEVELOPMENT_BEST_PRACTICES.md`

### للمساهمين
1. نسخ الفرع الرئيسي
2. اتبع `DEVELOPMENT_BEST_PRACTICES.md`
3. أرسل طلب دمج واضح المقصد

---

## 🆘 الدعم السريع

| المشكلة | الحل |
|--------|-----|
| لا يعمل Python | ستلاحظ في `QUICK_SETUP_AFTER_CLEANUP.md` |
| Port مشغول | غيّر Port في `.env` |
| Module not found | تأكد من تثبيت `requirements.txt` |
| لا توجد بيانات | ضع ملفات في `data/` |

---

## 📞 الاتصال والمساعدة

- 📖 اقرأ التوثيق أولاً
- 🐛 افحص الأخطاء والسجلات
- 🧪 شغل الاختبارات للتحقق
- 💬 اطلب مساعدة بشكل واضح

---

## 🎉 الخلاصة

**نظام WriteLens الآن:**
- ✅ نظيف بنسبة 99.3%
- ✅ منظم وسهل الفهم
- ✅ موثق بشكل شامل
- ✅ جاهز للتطوير والإنتاج
- ✅ مدعوم بأدوات اختبار قوية

**آخر كلمة:**
> This is not just code, it's a **clean, professional system** ready for the **future**. 🚀

---

**إصدار:** 1.0.0 ✅  
**التاريخ:** 2026-04-02  
**الحالة:** **جاهز للإنتاج**
