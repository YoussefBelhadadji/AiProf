# ⚡ دليل الإعداد السريع بعد التنظيف

**بعد تنظيف المشروع، اتبع هذه الخطوات لتشغيل النظام:**

---

## 🚀 الخطوة 1: تثبيت التبعيات

### Python
```bash
# تثبيت بيئة Python افتراضية
python -m venv .venv

# تفعيل البيئة
# على Windows:
.venv\Scripts\activate
# على macOS/Linux:
source .venv/bin/activate

# تثبيت التبعيات
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
# أو باستخدام yarn/pnpm
yarn install
# أو
pnpm install
```

### Backend
```bash
cd backend
npm install
# أو باستخدام yarn/pnpm
yarn install
```

---

## ◀️ الخطوة 2: إعداد المتغيرات البيئية

### إنشاء ملف `.env`
```bash
# في جذر المشروع
touch .env
```

### محتوى `.env`
```env
# Python
PYTHONPATH=.
DEBUG=True

# Backend
PORT=5000
DATABASE_URL=sqlite:///writelens.db
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=WriteLens

# Optional
LOG_LEVEL=info
```

---

## ✅ الخطوة 3: تشغيل الاختبارات

### Python Tests
```bash
# اختبار الاستنتاج البايزي والمساعدة
python adaptive_writing_system/tests/test_help_seeking_bayesian.py
```

### Backend Tests
```bash
cd backend
node test-help-seeking-bayesian.js
```

---

## 🎯 الخطوة 4: تشغيل النظام

### الخيار 1: التشغيل الشامل (الموصى به)
```bash
python full_system_launcher.py
```
**يقوم بـ:**
- ✓ معالجة البيانات (Python)
- ✓ تشغيل Backend (Node.js)
- ✓ تشغيل Frontend (React)

### الخيار 2: التشغيل اليدوي

#### Terminal 1: Backend
```bash
cd backend
npm start
# أو
node server.js
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3: Analytics (اختياري)
```bash
python writelen_main.py
```

### الخيار 3: المعالجة فقط
```bash
python writelen_main.py
```

---

## 🌐 الوصول إلى الواجهة

بعد التشغيل:

- **Frontend:** http://localhost:5173 (Vite)
- **Backend API:** http://localhost:5000
- **Database:** يتم إنشاؤها في `writelens.db`

---

## 📊 التحقق من السير

### معايير النجاح

**Backend جاهز عند رؤية:**
```
Server running on port 5000
Database connected
Rulebook loaded (18 feedback rules)
Templates loaded (50+ templates)
```

**Frontend جاهز عند رؤية:**
```
VITE v4.x.x  ready in xx ms
Network: http://localhost:5173/
```

**Python جاهز عند إكمال:**
```
Processing complete!
Output files generated in adaptive_writing_system/outputs/
Reports generated in AI_ANALYSIS_REPORTS/
```

---

## 🧪 الاختبار السريع

### 1. اختبر Backend API
```bash
curl http://localhost:5000/health
```

**الاستجابة المتوقعة:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### 2. اختبر Frontend
افتح `http://localhost:5173` في المتصفح

**يجب أن ترى:**
- ✓ صفحة تسجيل الدخول
- ✓ لوحة التحكم
- ✓ محطات التشخيص

### 3. اختبر Python Analytics
```bash
python adaptive_writing_system/tests/test_help_seeking_bayesian.py
```

**يجب أن ترى:**
```
=== Test 1: Help-Seeking Basic Detection ===
✓ PASSED: Help-seeking states computed

=== Test 2: Bayesian Posterior Inference ===
✓ PASSED: Bayesian posteriors computed
...
RESULTS: 7 passed, 0 failed
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا يعمل Python
```bash
# تحقق من البيئة الافتراضية
which python
python --version

# إعادة التثبيت
pip install --upgrade pip
pip install -r requirements.txt
```

### المشكلة: Port مشغول
```bash
# تغيير Port في backend
export PORT=5001
node server.js

# أو في .env
PORT=5001
```

### المشكلة: Module not found
```bash
# تحديث المسار
export PYTHONPATH=.

# أو للنوافذ
set PYTHONPATH=.
```

### المشكلة: لا يوجد قاعدة بيانات
```bash
# إعادة إنشاء قاعدة البيانات
cd backend
npm run migrate  # إن وجد
# أو
node -e "require('better-sqlite3')('writelens.db')"
```

---

## 📁 هيكل البيانات المتوقع

```
projectpr/
├── adaptive_writing_system/
│   ├── data/              ← ضع ملفات Excel هنا
│   ├── outputs/           ← ستُنشأ النتائج هنا
│   ├── config/
│   │   ├── adaptive_rulebook.yaml
│   │   ├── competence_model.yaml
│   │   ├── feedback_templates.yaml
│   │   └── +3 ملفات إضافية
│   ├── app/               ← المحركات الأساسية
│   ├── tests/             ← الاختبارات
│   └── requirements.txt
├── backend/
│   ├── server.js
│   ├── adaptiveDecision.js
│   ├── rulebook.js
│   ├── package.json
│   └── node_modules/      ← سيُنشأ بـ npm install
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/      ← سيُنشأ بـ npm install
├── docs/                  ← التوثيق
├── writelens.db           ← قاعدة البيانات
├── .venv/                 ← سيُنشأ بـ python -m venv
└── .env                   ← المتغيرات (أنشئها يدوياً)
```

---

## 🎓 الخطوات التالية

### 1. قراءة التوثيق
```bash
# البدء السريع
cat docs/QUICK_START.md

# شرح النظام
cat docs/SYSTEM_READY.md

# دليل الميزات
cat DEVELOPMENT_BEST_PRACTICES.md
```

### 2. استكشاف الكود
```bash
# بنية البيانات
cat SYSTEM_ARCHITECTURE.md

# قوائم التحقق
cat WriteLens_Master_Checklist.md
```

### 3. التطوير والتحسين
- [`adaptive_writing_system/README.md`](./adaptive_writing_system)
- [`backend/`](./backend)
- [`frontend/README.md`](./frontend)

---

## ✨ ملخص سريع

| الخطوة | الأمر | الوقت |
|------|------|------|
| 1️⃣ Python | `pip install -r requirements.txt` | 2 دقيقة |
| 2️⃣ npm | `npm install` (في كل مجلد) | 3 دقائق |
| 3️⃣ البيئة | أنشئ ملف `.env` | 1 دقيقة |
| 4️⃣ الاختبار | `python test_help_seeking_bayesian.py` | 30 ثانية |
| 5️⃣ التشغيل | `python full_system_launcher.py` | 10 ثوانٍ |
| **المجموع** | - | **~7 دقائق** |

---

## 🆘 طلب المساعدة

إذا واجهت مشاكل:

1. **تحقق من السجلات** - `logs/app.log`
2. **اقرأ التوثيق** - `docs/QUICK_START.md`
3. **افحص الأخطاء** - رسائل الخطأ واضحة جداً
4. **جرّب الاختبارات** - قد يعطيك نصائح

---

## 🎉 مبروك!

أنت الآن جاهز لـ:
- ✅ تشغيل النظام
- ✅ معالجة البيانات
- ✅ عرض التقارير
- ✅ تطوير ميزات جديدة
- ✅ المساهمة في المشروع

**Let's build something great! 🚀**
