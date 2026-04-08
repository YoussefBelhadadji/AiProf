import React from 'react';
import { Download, Printer, LayoutGrid, Target, Activity, Zap, ShieldCheck } from 'lucide-react';
import { STUDY_STATIONS } from '../../store/studyScope';
import type { TeacherStudyCase } from '../../store/studyScope';
import type { ReportSelectedTask, ReportStationAvailability } from './reportTypes';

interface ReportOverviewProps {
  selectedCase: TeacherStudyCase;
  selectedTask: ReportSelectedTask;
  visibleStationIds: number[];
  executiveSummary: string;
  stationAvailability: ReportStationAvailability;
  downloadPdfReport: () => void;
  isExportingPdf: boolean;
  printReport: () => void;
  downloadHtmlReport: () => void;
  pdfError: string | null;
}

export const ReportOverview: React.FC<ReportOverviewProps> = ({
  selectedCase,
  selectedTask,
  visibleStationIds,
  executiveSummary,
  stationAvailability,
  downloadPdfReport,
  isExportingPdf,
  printReport,
  downloadHtmlReport,
  pdfError,
}) => {
  const selectedStations = STUDY_STATIONS.filter((station) => visibleStationIds.includes(station.id));

  return (
    <div className="space-y-12 pb-20">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <ShieldCheck className="w-4 h-4 text-[var(--lav)]" />
               <span className="text-xs font-navigation uppercase tracking-[0.3em] font-bold text-[var(--lav)]">Verified Dossier</span>
            </div>
            <h2 className="font-editorial text-4xl italic text-[var(--text-primary)]">Analytical Package Synthesis</h2>
         </div>
         <div className="flex flex-wrap gap-4">
            <button 
              onClick={downloadPdfReport}
              disabled={isExportingPdf}
              className="px-6 py-3 rounded-xl bg-[var(--bg-high)] border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors"
            >
               <Download className="w-4 h-4" />
               {isExportingPdf ? 'Generating...' : 'Export PDF'}
            </button>
            <button 
              onClick={printReport}
              className="px-6 py-3 rounded-xl bg-[var(--bg-high)] border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors"
            >
               <Printer className="w-4 h-4" />
               System Print
            </button>
            <button 
              onClick={downloadHtmlReport}
              className="px-8 py-3 rounded-xl bg-[var(--lav)] text-white text-xs font-navigation font-bold uppercase tracking-widest shadow-[0_0_20px_var(--lav-glow)] flex items-center gap-2 hover:scale-105 transition-all"
            >
               <LayoutGrid className="w-4 h-4" />
               Final Dossier
            </button>
         </div>
      </div>

      {pdfError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-forensic flex items-center gap-3">
           <Zap className="w-4 h-4" /> {pdfError}
        </div>
      )}

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Subject Case', val: selectedCase.meta.studentName, detail: selectedCase.meta.courseTitle, icon: Target, color: 'var(--lav)' },
           { label: 'Temporal Scope', val: selectedTask ? selectedTask.title : 'Full Semester', detail: selectedTask ? selectedTask.date : selectedCase.meta.periodCovered, icon: Activity, color: 'var(--blue)' },
           { label: 'Evidence Density', val: `${selectedCase.meta.activityLogEntries} Log Entries`, detail: `${selectedCase.meta.chatMessages} Teacher Interacts`, icon: Zap, color: 'var(--teal)' },
         ].map((item, i) => (
           <div key={i} className="glass-card p-8 border-[var(--border)] hover:border-[var(--lav-border)] group transition-all">
              <div className="flex items-center gap-3 mb-6">
                 <item.icon className="w-4 h-4 opacity-50" style={{ color: item.color }} />
                 <span className="font-navigation text-xs uppercase font-bold tracking-widest text-[var(--text-muted)]">{item.label}</span>
              </div>
              <p className="font-editorial text-2xl italic text-[var(--text-primary)] mb-2">{item.val}</p>
              <p className="font-forensic text-xs text-[var(--text-muted)] opacity-60 group-hover:opacity-100 transition-opacity">{item.detail}</p>
           </div>
         ))}
      </div>

      {/* Executive Summary Section */}
      <div className="glass-card p-12 bg-[var(--bg-deep)] border-[var(--lav-border)] border-[0.5px] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <LayoutGrid className="w-64 h-64" />
         </div>
         <div className="relative z-10">
            <h3 className="font-navigation text-xs uppercase font-bold tracking-widest text-[var(--lav)] mb-8">Executive Forensic Summary</h3>
            <p className="font-editorial text-3xl italic text-[var(--text-primary)] leading-relaxed mb-12 max-w-5xl">
               &quot;{executiveSummary}&quot;
            </p>
            
            <div className="pt-10 border-t border-[var(--border)]">
               <h4 className="font-navigation text-xs uppercase font-extrabold text-[var(--text-muted)] mb-6 tracking-widest">Verified Analytical Components</h4>
               <div className="flex flex-wrap gap-4">
                  {selectedStations.map(station => {
                    const isAvailable = stationAvailability.get(station.id)?.available ?? true;
                    return (
                      <div 
                        key={station.id} 
                        className={`px-4 py-2 rounded-xl text-xs font-navigation font-bold uppercase tracking-widest border transition-all ${
                          isAvailable 
                          ? 'bg-[var(--teal-dim)] text-[var(--teal)] border-[var(--teal-border)]' 
                          : 'bg-[var(--bg-high)] text-[var(--text-muted)] border-[var(--border)]'
                        }`}
                      >
                         <span className="font-forensic mr-3 opacity-60">S{String(station.id).padStart(2, '0')}</span>
                         {station.label}
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

