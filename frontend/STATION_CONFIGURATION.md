# Station Configuration & Debugging Guide

## Overview
The diagnostic stations are 12 interactive pages that provide comprehensive student analysis. They are routed through the pipeline system.

## Station Mapping

| Station ID | File | Route | Purpose |
|-----------|------|-------|---------|
| S01 | Station01.tsx | `/pipeline/S01` | Writing Features & Text Analysis |
| S02 | Station02.tsx | `/pipeline/S02` | Self-Regulated Learning |
| S03 | Station03.tsx | `/pipeline/S03` | Competence Assessment |
| S04 | Station04.tsx | `/pipeline/S04` | Success Prediction |
| S05 | Station05.tsx | `/pipeline/S05` | Feedback Analysis |
| S06 | Station06.tsx | `/pipeline/S06` | Engagement Tracking |
| S07 | Station07.tsx | `/pipeline/S07` | Writing Profile |
| S08 | Station08.tsx | `/pipeline/S08` | Performance Trends |
| S09 | Station09.tsx | `/pipeline/S09` | Learning Patterns |
| S10 | Station10.tsx | `/pipeline/S10` | Quality Metrics |
| S11 | Station11.tsx | `/pipeline/S11` | Progress Analytics |
| S12 | Station12.tsx | `/pipeline/S12` | Holistic Assessment |

## File Locations
```
frontend/src/pages/
├── Station01.tsx
├── Station02.tsx
├── ...
├── Station12.tsx
├── StationRouter.tsx     (Router for all stations)
└── Diagnostics.tsx       (Hub/entry point)
```

## Navigation Flow

### 1. Entry Point
- User clicks on a diagnostic card in `Diagnostics.tsx`
- Each card maps to a station ID (e.g., 'writing-analysis' → 'S01')

### 2. Routing
```
Diagnostics.tsx
    ↓ (1) User clicks station
StationRouter.tsx (./pages/StationRouter.tsx)
    ↓ (2) Routes to /pipeline/:id
Station0X.tsx (./pages/Station0X.tsx)
    ↓ (3) Displays station content
User views analysis
```

### 3. ID Mapping in Diagnostics.tsx
```typescript
const stationMap: Record<string, string> = {
  'writing-analysis': 'S01',
  'self-regulated-learning': 'S02',
  'competence-assessment': 'S03',
  'success-prediction': 'S04',
  'feedback-analysis': 'S05',
  'engagement-tracking': 'S06',
};
```

## Exports Configuration

### Station Files (Station01.tsx - Station12.tsx)
**Format:**
```typescript
export const Station01: React.FC = () => {
  // Component code
};

export default Station01;
```

**Key Points:**
- Named export: `export const StationXX`
- Default export: `export default StationXX`
- Must be at END of file

### StationRouter.tsx
**Format:**
```typescript
const Station01 = React.lazy(() => import('./Station01'));
const Station02 = React.lazy(() => import('./Station02'));
// ... continues through Station12

export function StationRouter() {
  const { id } = useParams<{ id: string }>();
  let StationComponent;
  
  switch (id) {
    case 'S01': StationComponent = Station01; break;
    case 'S02': StationComponent = Station02; break;
    // ... continues
    default: return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<StationLoader />}>
        <StationComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Common Issues & Fixes

### Issue 1: "Default export not found"
**Problem:** Station component doesn't have `export default`
**Fix:** Add to end of Station file:
```typescript
export default Station01;
```

### Issue 2: Route not working
**Problem:** Navigation isn't finding the station
**Possible Causes:**
1. Station ID doesn't match in mapping
2. Route path is wrong
3. Component not imported in StationRouter

**Solution:**
- Verify ID is in stationMap (Diagnostics.tsx)
- Check `/pipeline/:id` route exists (App.tsx)
- Verify import in StationRouter.tsx

### Issue 3: Station doesn't load data
**Problem:** Student data not appearing
**Possible Causes:**
1. No studentId in URL params
2. API call failed
3. Data structure mismatch

**Solution:**
```typescript
useEffect(() => {
  const id = studentId || '9263'; // Default student ID
  // Fetch data
}, [studentId, token]);
```

### Issue 4: Styling or theme not applied
**Problem:** Station looks broken
**Check:**
- CSS variables defined: `--bg-deep`, `--text-primary`, etc.
- Tailwind CSS configured
- GlassCard component imported

## Testing Stations

### Manual Testing
1. Navigate to `/diagnostics`
2. Click on a station card
3. Verify it routes to `/pipeline/S0X`
4. Check student data loads

### Quick Test URL
```
http://localhost:5173/pipeline/S01
http://localhost:5173/pipeline/S02
... etc
```

## Performance Optimization

### Lazy Loading
All stations use React.lazy() for code splitting:
```typescript
const Station01 = React.lazy(() => import('./Station01'));
```

### Loading UI
Shows while station loads:
```typescript
const StationLoader = () => (
  <div>Loading station...</div>
);
```

## Database Integration

### Student Data Fields Expected
```typescript
{
  student_id: string;
  name: string;
  total_score: number;
  argumentation: number;
  cohesion: number;
  grammar_accuracy: number;
  lexical_resource: number;
  word_count: number;
  ttr: number;
  // ... more fields
}
```

### API Endpoint
```javascript
GET /api/student/:id
Authorization: Bearer {token}
```

## Future Improvements

1. **Real-time Data:**
   - WebSocket updates for live metrics
   - Real-time collaboration views

2. **Export Features:**
   - PDF report generation
   - CSV data export
   - Email reports

3. **Advanced Visualizations:**
   - 3D competence charts
   - Timeline views
   - Comparative analytics

4. **Mobile Support:**
   - Responsive station layouts
   - Touch-friendly controls

## Related Files

- **API:** `backend/adaptiveDecision.js`
- **Auth:** `frontend/src/api/authApi.ts`
- **Styles:** `frontend/src/index.css`
- **Router:** `frontend/src/App.tsx`

---

**Last Updated:** 2026-04-02  
**Status:** ✅ All stations configured and routing fixed
