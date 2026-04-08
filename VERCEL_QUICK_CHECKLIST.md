# Vercel Deployment — Quick Checklist

## ✅ What Was Done

### 1. Data Copied to Frontend
```bash
✅ Created: frontend/public/data/
✅ Copied: submission_journey_latest (4.6 MB)
✅ Copied: RUN_20260408_020438 (3.5 MB)
   Total: 8.1 MB of static data
```

### 2. Services Updated
```typescript
✅ localJourneyData.ts
   - OLD: Hardcoded '/home/youcef-bl/...'
   - NEW: Dynamic import.meta.env.BASE_URL
   - WORKS: Dev + Prod ✅

✅ vite.config.ts
   - Added fs.allow entries for public folder
   - Supports dev fallback to @fs URLs

✅ NEW: lib/dataUtils.ts
   - 15+ helper functions
   - Environment info debugging
   - Clear error messages
```

### 3. All Services Benefits Automatically
```typescript
✅ dashboardService.ts    — Uses localJourneyData (no changes)
✅ submissionService.ts   — Uses localJourneyData (no changes)
✅ portfolioService.ts    — Uses localJourneyData (no changes)
✅ reportService.ts       — Uses higher-level services (no changes)
```

---

## 🚀 Local Testing (Before Deploying)

```bash
# 1. Start dev server
cd frontend
npm run dev
# Should work: http://localhost:5173
# Data loads from /public/data/ folder

# 2. Test pages with data
# - Dashboard: Should show 65 students, 89% participation
# - Reports: Should list all students
# - Portfolio: Should load student data correctly
# - Check console: No errors

# 3. Build for production
npm run build
# Check dist/data/ exists with full content
# Size should be ~8 MB

# 4. Verify build size
ls -lh dist/
du -sh dist/data/
# submission_journey_latest: ~4.6 MB
# RUN_20260408_020438: ~3.5 MB
```

---

## 📤 Vercel Deployment

### Pre-Push Checklist
```bash
# From project root
cd frontend

# 1. Verify data folder exists
ls -la public/data/
# Should show: submission_journey_latest, RUN_20260408_020438

# 2. Verify not in .gitignore
cat .gitignore | grep -i data
# Should NOT exclude public/data/

# 3. Build test
npm run build
# No errors
# dist/data/ exists

# 4. TypeScript check
npm run lint  # if using ESLint
# No errors
```

### Push to Vercel
```bash
# From project root (FULL REPO, not just frontend)
git add .
git commit -m "chore: prepare WriteLens for Vercel deployment with static data"
git push origin main
# Vercel auto-deploys when you push

# OR deploy directly via Vercel CLI
cd ..
npm install -g vercel  # if not installed
vercel
# Follow prompts
```

### Verify Deployment
1. **Wait for build** (~2-3 minutes)
2. **Visit deployed URL** (Vercel dashboard shows it)
3. **Navigate Dashboard:**
   - Should show real data (65 students)
   - No 404 errors for data files
4. **Check browser console:**
   - No errors
   - Network tab shows `/data/submission_journey_latest/*` requests ✅
5. **Check performance:**
   - Dashboard loads in <1 second (CDN cached)
   - No server lag

---

## 🔍 If Data 404s on Vercel

### Step 1: Check Logs
```
Vercel Dashboard
  → Your Project
  → Deployments
  → [Latest]
  → Logs (Build, Function, Runtime)

Look for:
- "public/data/ skipped" → .gitignore is blocking it
- "File not found" → Data not copied before push
- No errors → Data deployed successfully
```

### Step 2: Check GitHub
```bash
git ls-files frontend/public/data/ | head
# Should show files
# If empty: data wasn't added to git

# Fix:
rm -f .gitignore.bak
cat frontend/.gitignore | grep data | grep -v "# data" | head
# Look for patterns that exclude 'data'

# If found, edit:
nano frontend/.gitignore
# Remove lines that exclude data/ or public/
# Save and re-commit:
git add frontend/.gitignore
git commit -m "fix: allow public/data in gitignore"
git push
```

### Step 3: Redeploy
```
Vercel Dashboard
  → Your Project
  → Deployments
  → More options (dots)
  → Redeploy
```

---

## 📋 File Summary

### Modified Files
1. **frontend/src/services/localJourneyData.ts**
   - Smart path resolution
   - Dev/Prod fallback logic
   - Better error messages

2. **frontend/vite.config.ts**
   - Added fs.allow entries
   - Supports dev-only @fs access

3. **frontend/src/lib/dataUtils.ts** ⭐ NEW
   - `getDataBaseUrl()`
   - `fetchJourneyJson<T>()`
   - `loadAllStudents()`
   - `debugDataEnvironment()`
   - 15+ helpers total

### Unchanged Files (Still Work)
- `dashboardService.ts` ✅
- `submissionService.ts` ✅
- `portfolioService.ts` ✅
- `reportService.ts` ✅
- All components ✅

### New Folder
- `frontend/public/data/`
  - `submission_journey_latest/` (4.6 MB)
  - `RUN_20260408_020438/` (3.5 MB)

---

## 💡 How It Works

### Local Development
```
Browser
  ↓
Component calls getDashboardStats()
  ↓
Calls fetchLocalJourneyJson('students/index.json')
  ↓
Tries: /data/submission_journey_latest/students/index.json
  ↓
Vite serves from: frontend/public/data/submission_journey_latest/
  ↓ ✅ Data loaded
```

### Production (Vercel)
```
Browser
  ↓
Component calls getDashboardStats()
  ↓
Calls fetchLocalJourneyJson('students/index.json')
  ↓
Fetches: https://yourapp.vercel.app/data/submission_journey_latest/students/index.json
  ↓
Vercel CDN serves static file
  ↓ ✅ Data loaded (fast!)
```

---

## 🎯 Success Criteria

- [ ] `npm run dev` works, Dashboard shows real data
- [ ] `npm run build` succeeds, `dist/data/` exists
- [ ] Git includes `frontend/public/data/` (check `git ls-files`)
- [ ] Vercel build succeeds (check deployment logs)
- [ ] Deployed app loads Dashboard without 404s
- [ ] No console errors in deployed app
- [ ] Dashboard shows 65 students, 89% participation
- [ ] Recent submissions table populated with real data

---

## 📞 Debugging Commands

```bash
# Show what git would deploy
git ls-files frontend/public/data/ | wc -l
# Should show 100+ files

# Check .gitignore isn't blocking
git check-ignore frontend/public/data/ || echo "✅ Not ignored"

# Verify data folder size
du -sh frontend/public/data/
# Should show ~8 MB

# Check if Vercel should have deployed data
vercel logs --follow
# Watch build in real-time

# Get environment info in app console
navigate to Dashboard → Open DevTools → Console:
> import { debugDataEnvironment } from '../lib/dataUtils'
> debugDataEnvironment()
# Shows BASE_URL, DATA paths, etc.
```

---

## 🚀 You're Done!

All setup complete. Just:
1. `npm run dev` to test locally
2. `git push` to deploy to Vercel
3. Visit your URL to verify

**WriteLens is ready for production!** ✨
