# Dashboard Page - Deep Inspection Report

**Report Date:** April 2, 2026  
**File:** `src/pages/Dashboard.tsx` & `src/pages/Dashboard.css`  
**Status:** ⚠️ ISSUES IDENTIFIED

---

## 🎯 CRITICAL ISSUES FOUND

### Issue #1: Chart Text Not Visible on Dark Background ❌
**Severity:** CRITICAL  
**Problem:**
- Recharts uses default dark text colors (dark gray/black)
- On dark theme background, text becomes invisible
- Axis labels, tooltips, and legend text are unreadable

**Affected Elements:**
- XAxis labels (bottom of bar charts)
- YAxis labels (left side of charts)
- Tooltip text on hover
- Legend elements
- Chart titles

**Evidence:**
```typescript
<BarChart data={aiStates}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />  // ← Dark text, invisible on dark bg
  <YAxis />                 // ← Dark text, invisible on dark bg
  <Tooltip />               // ← Dark tooltip on dark bg
  <Bar dataKey="value" ...>
```

---

### Issue #2: Heatmap Bar Colors Not Visible ❌
**Severity:** HIGH  
**Problem:**
```jsx
<div className="heatmap-bar" style={{ width: `${Math.max(item.intensity, 6)}%` }} />
```
The `.heatmap-bar` has gradient colors that may blend with dark background

---

### Issue #3: Empty State Message Hard to Read ❌
**Severity:** MEDIUM  
**Problem:**
```jsx
{Object.keys(charts).length === 0 && (
  <section className="chart-panel empty-state">
    <p>Loading live data from server...</p>  // ← Light gray text on dark bg
    <p>If this persists, ensure backend API is running on port 5000.</p>
  </section>
)}
```
Text color too dim on dark background

---

## 📋 DETAILED FINDINGS

### Code Quality Issues
1. **No error boundary** - Dashboard crashes if API fails
2. **Console.error only** - Users don't see error messages
3. **Hard-coded API endpoint** - Should use environment variable
4. **No loading skeleton** - Only shows "Loading..." text
5. **No retry mechanism** - Failed API calls not retryable
6. **useMemo without dependency safety** - Could cause stale data

### Accessibility Issues
1. Missing `aria-label` on buttons
2. Missing `role="presentation"` on decorative elements
3. No screen reader text for chart data
4. Chart colors don't have sufficient contrast

### Visual/UX Issues
1. Text in charts invisible on dark background
2. Heatmap bars may blend with background
3. No loading spinner animation
4. No error state UI
5. API error message too technical for users

---

## 🔧 REQUIRED FIXES

### Fix #1: Make Chart Text Visible
Update all Recharts components to use light text colors:

```typescriptx
<BarChart data={aiStates}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
  <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
  <YAxis tick={{ fill: '#cbd5e1' }} />
  <Tooltip 
    contentStyle={{ 
      backgroundColor: '#1e293b', 
      border: '1px solid #475569',
      color: '#f9fafb'
    }} 
  />
  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
```

### Fix #2: Improve Empty/Loading State
Add proper loading UI and error handling

### Fix #3: Environment Variables
Use `.env.local` for API endpoints instead of hard-coded URLs

---

## 📊 SUMMARY

| Category | Issue | Severity | Fix Required |
|----------|-------|----------|--------------|
| **Chart Rendering** | Invisible text | CRITICAL | ✅ YES |
| **Error Handling** | No error UI | HIGH | ✅ YES |
| **Loading State** | Poor UX | MEDIUM | ✅ YES |
| **Accessibility** | Missing labels | HIGH | ✅ YES |
| **Performance** | No error retry | MEDIUM | ⏳ Optional |

---

**Status:** Ready for fixes  
**Estimated Fix Time:** 2-3 hours
