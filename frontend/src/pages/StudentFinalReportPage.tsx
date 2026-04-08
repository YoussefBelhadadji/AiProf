import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { StudentFinalReport } from '../components/reports/StudentFinalReport';

export const StudentFinalReportPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  if (!studentId) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Missing student ID
        </div>
        <p className="mt-2 text-sm">No student ID was provided in the URL.</p>
      </div>
    );
  }

  return <StudentFinalReport studentId={studentId} />;
};

export default StudentFinalReportPage;
