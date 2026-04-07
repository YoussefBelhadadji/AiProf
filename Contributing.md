# 🤝 CONTRIBUTING — WriteLens Team Guide

> قواعد العمل الجماعي لفريق WriteLens. اقرأ هذا الملف قبل ما تكتب أي سطر كود.

---

## 👥 توزيع المسؤوليات

| الشخص | الجزء | المجلد |
|-------|-------|--------|
| **Youssef** | Frontend — React + TypeScript | `frontend/` |
| **Adnane** | Backend — Node.js + Express | `backend/` |
| **Kader** | AI Engine — Python | `ai_engine/` |

> ⚠️ لا أحد يعدل في جزء الآخر بدون إذن مسبق.

---

## 🌿 قواعد Git

### هيكل الـ Branches

```
main          ← النسخة المستقرة فقط، لا أحد يكتب هنا مباشرة
dev           ← كل الشغل يتجمع هنا
  └── feature/xxx   ← ميزة جديدة
  └── fix/xxx       ← إصلاح مشكلة
  └── docs/xxx      ← تعديل توثيق
```

### تسمية الـ Branches

```bash
# ✅ صح
feature/auth-login
feature/student-dashboard
feature/ai-bayesian-network
fix/api-timeout
fix/dashboard-crash
docs/readme-update

# ❌ غلط
youssef
my-branch
update
fix
```

### خطوات العمل اليومية

```bash
# 1. تأكد إنك على dev محدث
git checkout dev
git pull origin dev

# 2. افتح branch جديد من dev
git checkout -b feature/اسم-المهمة

# 3. اشتغل وعمل commits واضحة
git add .
git commit -m "feat: add student login screen"

# 4. ارفع للـ remote
git push origin feature/اسم-المهمة

# 5. افتح Pull Request إلى dev
# 6. انتظر review من شخص ثاني
# 7. بعد الموافقة → merge
```

---

## 📝 قواعد الـ Commits

### الصيغة

```
type: وصف قصير واضح
```

### الأنواع المتاحة

| النوع | متى تستخدمه |
|-------|------------|
| `feat` | ميزة جديدة |
| `fix` | إصلاح مشكلة |
| `docs` | تعديل توثيق |
| `refactor` | تحسين كود بدون تغيير سلوك |
| `style` | تنسيق فقط |
| `test` | إضافة اختبارات |

### أمثلة

```bash
# ✅ صح
feat: add user authentication with JWT
fix: resolve map crash on Android
docs: update API endpoints in README
refactor: simplify feedback generator logic

# ❌ غلط
update
fix bug
aaaaaa
worked on stuff
```

---

## 🔗 قواعد الـ Pull Request

1. **لا merge بدون review** من شخص ثاني على الأقل
2. **وصف واضح** — ماذا أضفت أو صلحت؟
3. **لا conflicts** — حل التعارضات قبل طلب الـ review
4. **الكود يشتغل** — اختبر قبل ما تفتح PR

### قالب PR

```
## ماذا فعلت؟
وصف مختصر للتغييرات

## كيف تختبره؟
خطوات للاختبار

## ملاحظات
أي شيء مهم يعرفه الفريق
```

---

## 💻 معايير الكود

### تسمية المتغيرات والدوال

```javascript
// ✅ صح — أسماء واضحة
const activeStudents = students.filter(s => s.isActive)
function getUserFeedback(userId) { ... }

// ❌ غلط — أسماء غامضة
const x = students.filter(s => s.a)
function guf(id) { ... }
```

### دوال صغيرة — كل دالة تعمل شيء واحد

```javascript
// ✅ صح
function validateEmail(email) { ... }
function hashPassword(password) { ... }
function createUser(userData) { ... }

// ❌ غلط — دالة تعمل كل شيء
function handleUser(data) {
  // validate + hash + save + send email + log ...
}
```

### لا Magic Numbers

```javascript
// ✅ صح
const MAX_ESSAY_LENGTH = 5000
if (essay.length > MAX_ESSAY_LENGTH) { ... }

// ❌ غلط
if (essay.length > 5000) { ... }
```

### Error Handling دائماً

```javascript
// ✅ صح
try {
  const result = await analyzeEssay(text)
  return res.status(200).json({ data: result })
} catch (error) {
  console.error('Essay analysis failed:', error)
  return res.status(500).json({ message: 'Analysis failed, try again' })
}
```

---

## 🔐 قواعد الأمان

```bash
# ❌ ممنوع تماماً — لا ترفع هذه الملفات أبداً
.env
*.key
secrets.json

# ✅ استخدم دائماً
.env.example   ← نموذج بدون قيم حقيقية
```

### مثال `.env.example`

```
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
PYTHON_BRIDGE_PATH=./ai_engine/main.py
PORT=3000
```

---

## 📁 shared/ — قواعد مهمة

> هذا المجلد هو **العقد** بين Frontend وBackend وAI

```
shared/
├── contracts/    ← شكل البيانات المتبادلة
├── types/        ← TypeScript types مشتركة
└── constants/    ← ثوابت يستخدمها الكل
```

**⚠️ قاعدة:** أي تعديل في `shared/` يستلزم إخبار الفريق كامل أولاً.

---

## 🚀 كيف تشغل المشروع

```bash
# 1. Clone المشروع
git clone [repo-url]
cd WriteLens

# 2. نسخ ملف البيئة
cp .env.example .env
# عدّل القيم الحقيقية في .env

# 3. تشغيل Frontend
cd frontend
npm install
npm run dev

# 4. تشغيل Backend
cd backend
npm install
npm run dev

# 5. تشغيل AI Engine
cd ai_engine
pip install -r requirements.txt
python main.py
```

---

## ❓ عند المشاكل

- **مشكلة في Frontend** → Youssef
- **مشكلة في Backend/API** → Adnane
- **مشكلة في AI/Python** → Kader
- **مشكلة في shared/** → نقاش الفريق كامل

---

> 💡 **القاعدة الذهبية:** اتفقوا على شكل البيانات في `shared/contracts/` **قبل** ما تبدأوا التطوير.
> هذا الملف الواحد يمنع 80% من مشاكل التكامل.

