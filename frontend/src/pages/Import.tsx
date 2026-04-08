import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Database,
  CloudUpload,
  Search,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadWorkbooks } from '../services/workbookApi';
import { mapParsedCaseToStudyCase, useStudyScopeStore, type TeacherStudyCase } from '../store/studyScope';

export const Import: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importCases = useStudyScopeStore((state) => state.importCases);
  
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedCases, setParsedCases] = useState<TeacherStudyCase[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    { id: 1, label: 'Data Ingestion', icon: CloudUpload, desc: 'Upload Moodle/Excel workbooks' },
    { id: 2, label: 'Evidence Review', icon: Search, desc: 'Verify detected learner cases' },
    { id: 3, label: 'Finalize Workspace', icon: CheckCircle2, desc: 'Commit to research registry' },
  ];

  const totals = useMemo(() => {
    return parsedCases.reduce(
      (sum, studyCase) => ({
        students: sum.students + 1,
        tasks: sum.tasks + studyCase.writing.artifacts.length,
      }),
      { students: 0, tasks: 0 }
    );
  }, [parsedCases]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one dataset before proceeding.');
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      const parsed = await uploadWorkbooks(selectedFiles);
      const mappedCases = parsed.map(mapParsedCaseToStudyCase);
      setParsedCases(mappedCases);
      setStep(2);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Ingestion failed. Check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const finalizeImport = () => {
    if (parsedCases.length === 0) {
      setErrorMessage('No valid evidence cases to import.');
      return;
    }

    importCases(parsedCases);
    setStep(3);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <CloudUpload className="w-4 h-4 text-[var(--lav)]" />
              <span className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-muted)]">Data Acquisition</span>
           </div>
           <h1 className="font-editorial text-5xl italic text-[var(--text-primary)]">
             Import <span className="text-[var(--lav)]">Workspace</span>
           </h1>
        </div>
        
        <p className="max-w-md text-sm text-[var(--text-sec)] leading-relaxed italic">
          Standardized intake wizard for Moodle logs, Excel rubrics, and student writing samples.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.id} className={`p-6 rounded-2xl border transition-all duration-500 ${
            step === s.id ? 'bg-[var(--bg-high)] border-[var(--lav-border)] shadow-[0_0_20px_var(--lav-glow)]' : 
            step > s.id ? 'bg-[var(--bg-sidebar)] border-[var(--teal-dim)] opacity-80' : 
            'bg-[var(--bg-sidebar)] border-[var(--border)] opacity-40'
          }`}>
             <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${step >= s.id ? 'bg-[var(--lav-dim)] text-[var(--lav)]' : 'bg-[var(--bg-deep)] text-[var(--text-muted)]'}`}>
                   <s.icon className="w-5 h-5" />
                </div>
                {step > s.id && <CheckCircle2 className="w-4 h-4 text-[var(--teal)]" />}
             </div>
             <h4 className="font-navigation text-xs uppercase tracking-widest font-bold mb-1">{s.label}</h4>
             <p className="text-xs text-[var(--text-muted)] truncate">{s.desc}</p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass-card p-12 border-dashed border-2 border-[var(--border-bright)] flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(255,255,255,0.05)] overflow-hidden">
               {isUploading && <div className="h-full bg-[var(--lav)] animate-shimmer" style={{ width: '40%' }}></div>}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-high)] flex items-center justify-center mb-8 shadow-inner">
               <Database className="w-10 h-10 text-[var(--lav)]" />
            </div>

            <h2 className="font-editorial text-3xl italic mb-4 text-[var(--text-primary)]">Drop Analytical Datasets</h2>
            <p className="text-[var(--text-sec)] max-w-xl mb-10 leading-relaxed font-body">
              Select one or more .xlsx / .xls files exported from Moodle or private research logs. 
              The system will automatically map behaviors, writing signals, and communication traces.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              className="hidden"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
            />

            <div className="flex flex-col gap-4 w-full max-w-md">
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost py-4 rounded-xl flex items-center justify-center gap-3 border-[var(--border-bright)] group"
               >
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-navigation text-xs uppercase tracking-widest font-bold">Select Local Files</span>
               </button>

               {selectedFiles.length > 0 && (
                 <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[var(--border)] text-left animate-in zoom-in-95">
                    <div className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">Queued for Ingestion</div>
                    <div className="space-y-2">
                       {selectedFiles.map(f => (
                         <div key={f.name} className="flex items-center gap-2 text-xs text-[var(--text-sec)] font-forensic">
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{f.name}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               <button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="btn-primary py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                  <span className="font-navigation text-xs uppercase tracking-widest font-bold">Process Evidence</span>
               </button>
            </div>

            {errorMessage && (
              <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-[var(--red-dim)] border border-[var(--red-glow)] text-[var(--red)] text-xs font-navigation font-bold uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="glass-card overflow-hidden">
               <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
                  <div>
                    <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">Evidence Review Matrix</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest font-navigation font-bold">Verify parsed cases before commit</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="px-4 py-2 bg-[var(--bg-high)] rounded-lg text-xs font-navigation font-bold uppercase tracking-widest text-[var(--lav)] border border-[var(--lav-border)]">
                        {totals.students} Cases Detected
                     </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left font-body">
                   <thead className="bg-[var(--bg-deep)] text-[var(--text-muted)] border-b border-[var(--border)]">
                     <tr>
                       <th className="p-6 font-navigation text-xs uppercase tracking-widest font-bold">Identifier</th>
                       <th className="p-6 font-navigation text-xs uppercase tracking-widest font-bold">Student Name</th>
                       <th className="p-6 font-navigation text-xs uppercase tracking-widest font-bold">Tasks</th>
                       <th className="p-6 font-navigation text-xs uppercase tracking-widest font-bold">Time Depth</th>
                       <th className="p-6 font-navigation text-xs uppercase tracking-widest font-bold">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[var(--border)]">
                     {parsedCases.map((c) => (
                       <tr key={c.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                         <td className="p-6 font-forensic text-xs text-[var(--lav)]">{c.id.split(':')[0]}</td>
                         <td className="p-6 font-editorial text-lg italic text-[var(--text-primary)]">{c.meta.studentName}</td>
                         <td className="p-6 text-xs text-[var(--text-sec)]">{c.writing.artifacts.length} artifacts</td>
                         <td className="p-6 text-xs text-[var(--text-sec)] italic">{c.meta.periodCovered}</td>
                         <td className="p-6">
                            <span className="chip chip-teal text-xs">Verified</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="p-8 bg-[rgba(0,0,0,0.1)] flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-[var(--text-muted)] hover:text-white text-xs font-navigation uppercase font-bold tracking-widest">Back to upload</button>
                  <button 
                    onClick={finalizeImport}
                    className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_var(--lav-glow)] group"
                  >
                     <span className="font-navigation text-xs uppercase tracking-widest font-bold">Commit to Registry</span>
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-16 text-center border-[var(--teal-dim)] glow-teal"
          >
             <div className="w-24 h-24 rounded-full bg-[var(--teal-dim)] border border-[var(--teal)]/20 flex items-center justify-center text-[var(--teal)] mx-auto mb-8 shadow-[0_0_30px_var(--teal-dim)]">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             
             <h2 className="font-editorial text-4xl italic mb-4 text-[var(--text-primary)]">Registry Provisioned</h2>
             <p className="text-[var(--text-sec)] max-w-2xl mx-auto mb-12 leading-relaxed">
               The learner cases have been successfully integrated into the teacher repository. 
               You can now utilize the scope controls to initiate high-resolution diagnostics.
             </p>

             <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_var(--lav-glow)] group"
                >
                  <span className="font-navigation text-xs uppercase tracking-widest font-bold">Enter Dashboard</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/students')}
                  className="btn-ghost px-10 py-4 rounded-xl text-xs uppercase font-navigation font-bold tracking-widest border-[var(--border-bright)]"
                >
                  View Case Registry
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

