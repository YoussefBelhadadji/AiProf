import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';

const Station01 = React.lazy(() => import('./Station01'));
const Station02 = React.lazy(() => import('./Station02'));
const Station03 = React.lazy(() => import('./Station03'));
const Station04 = React.lazy(() => import('./Station04'));
const Station05 = React.lazy(() => import('./Station05'));
const Station06 = React.lazy(() => import('./Station06'));
const Station07 = React.lazy(() => import('./Station07'));
const Station08 = React.lazy(() => import('./Station08'));
const Station09 = React.lazy(() => import('./Station09'));
const Station10 = React.lazy(() => import('./Station10'));
const Station11 = React.lazy(() => import('./Station11'));
const Station12 = React.lazy(() => import('./Station12'));

// Loading fallback UI for individual stations
const StationLoader = () => (
  <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--lav)] rounded-full animate-spin"></div>
      <div className="font-navigation text-xs uppercase tracking-widest text-[var(--lav)] animate-pulse">
        Initializing Station
      </div>
    </div>
  </div>
);

export const StationHeader = (_props: { id: string | number, title: string }) => null;
export const StationFooter = (_props: { nextPath?: string }) => null;

export function StationRouter() {
  const { id } = useParams<{ id: string }>();

  let StationComponent;
  switch (id) {
    case 'S01': StationComponent = Station01; break;
    case 'S02': StationComponent = Station02; break;
    case 'S03': StationComponent = Station03; break;
    case 'S04': StationComponent = Station04; break;
    case 'S05': StationComponent = Station05; break;
    case 'S06': StationComponent = Station06; break;
    case 'S07': StationComponent = Station07; break;
    case 'S08': StationComponent = Station08; break;
    case 'S09': StationComponent = Station09; break;
    case 'S10': StationComponent = Station10; break;
    case 'S11': StationComponent = Station11; break;
    case 'S12': StationComponent = Station12; break;
    default:
      return <Navigate to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<StationLoader />}>
        <StationComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

