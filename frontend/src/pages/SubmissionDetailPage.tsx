import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { getSubmissionDetail } from '../services/submissionService';
import { SubmissionDetail } from '../components/submissions/SubmissionDetail';
import type { SubmissionDetail as SubmissionDetailType } from '../../shared/types';

export const SubmissionDetailPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [data, setData] = useState<SubmissionDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!submissionId) return;
    setError(null);
    setData(null);
    getSubmissionDetail(submissionId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load'))
    return () => { alive = false; };
  }, [submissionId]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Could not load submission
        </div>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading submission…
        </div>
      </div>
    );
  }

  return <SubmissionDetail detail={data} />;
};

export default SubmissionDetailPage;

