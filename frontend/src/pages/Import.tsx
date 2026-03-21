import { useMemo, useRef, useState } from 'react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { Button, StatusChip } from '../components/Atoms';
import { Upload, FileType, CheckCircle2, AlertCircle, ArrowRight, Users, BookOpenText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { uploadWorkbooks } from '../services/workbookApi';
import { mapParsedCaseToStudyCase, useStudyScopeStore, type TeacherStudyCase } from '../state/studyScope';

export function Import() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importCases = useStudyScopeStore((state) => state.importCases);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedCases, setParsedCases] = useState<TeacherStudyCase[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Review', icon: Users },
    { id: 3, label: 'Finalize', icon: CheckCircle2 },
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
      setErrorMessage('Select at least one workbook before starting the import.');
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
      setErrorMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const finalizeImport = () => {
    if (parsedCases.length === 0) {
      setErrorMessage('No parsed cases are available to import.');
      return;
    }

    importCases(parsedCases);
    setStep(3);
  };

  return (
    <ResearchShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-editorial text-4xl text-[var(--text-primary)] mb-2">Teacher Intake Wizard</h1>
          <p className="text-[var(--text-sec)] font-body">
            Upload one or more student workbooks, review the detected cases, then choose them from the dashboard and student registry.
          </p>
        </header>

        <div className="flex items-center gap-4 mb-10">
          {steps.map((stepItem, idx) => (
            <div key={stepItem.id} className="flex items-center gap-4 flex-1">
              <div className={`flex items-center gap-2 ${step >= stepItem.id ? 'text-[var(--lav)]' : 'text-[var(--text-muted)]'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${step >= stepItem.id ? 'border-[var(--lav)] bg-[var(--lav-glow)]' : 'border-[var(--border)]'}`}>
                  <stepItem.icon size={16} />
                </div>
                <span className="font-navigation text-sm uppercase tracking-wider font-medium">{stepItem.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-px flex-1 transition-colors ${step > stepItem.id ? 'bg-[var(--lav)]' : 'bg-[var(--border)]'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard elevation="high" className="p-12 border-dashed border-2 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--lav-glow)] flex items-center justify-center text-[var(--lav)] mb-6">
                  <FileType size={32} />
                </div>
                <h2 className="text-2xl font-editorial text-[var(--text-primary)] mb-2">Upload student workbooks</h2>
                <p className="text-[var(--text-sec)] mb-8 max-w-2xl">
                  You can select one workbook for a single case study or several workbooks to build a teacher-side registry of students.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setSelectedFiles(files);
                    setErrorMessage('');
                  }}
                />

                <div className="flex flex-col gap-4 w-full max-w-xl">
                  <Button
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload size={16} /> Select workbook files
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleUpload}
                    className="w-full relative overflow-hidden"
                    isLoading={isUploading}
                    disabled={selectedFiles.length === 0 || isUploading}
                  >
                    {isUploading ? 'Parsing workbooks...' : 'Parse selected files'}
                    {isUploading && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-[var(--lav-glow)]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.4 }}
                      />
                    )}
                  </Button>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-4 text-left">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Selected files</span>
                      <StatusChip variant="lav">{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</StatusChip>
                    </div>
                    <div className="space-y-2">
                      {selectedFiles.length > 0 ? selectedFiles.map((file) => (
                        <div key={file.name} className="font-forensic text-xs text-[var(--text-sec)]">
                          {file.name}
                        </div>
                      )) : (
                        <div className="font-body text-xs text-[var(--text-muted)]">No workbook selected yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {errorMessage && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-[var(--gold-dim)] border border-[var(--gold)]/20 text-[var(--gold)] text-sm">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-navigation text-[var(--text-primary)] font-medium">Detected student cases</h3>
                    <p className="font-body text-xs text-[var(--text-sec)] mt-2">
                      Review the detected students before adding them to the study workspace.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <StatusChip variant="teal">{totals.students} students</StatusChip>
                    <StatusChip variant="lav">{totals.tasks} tasks</StatusChip>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body">
                    <thead>
                      <tr className="bg-[var(--bg-raised)] text-[var(--text-sec)]">
                        <th className="p-4 font-medium uppercase text-xs">Workbook</th>
                        <th className="p-4 font-medium uppercase text-xs">Student</th>
                        <th className="p-4 font-medium uppercase text-xs">Course</th>
                        <th className="p-4 font-medium uppercase text-xs">Tasks</th>
                        <th className="p-4 font-medium uppercase text-xs">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {parsedCases.map((studyCase) => (
                        <tr key={studyCase.id} className="hover:bg-[var(--bg-raised)] transition-colors">
                          <td className="p-4 font-mono text-[var(--lav)] text-xs">{studyCase.workbookName}</td>
                          <td className="p-4">
                            <div className="font-navigation text-[var(--text-primary)]">{studyCase.meta.studentName}</div>
                            <div className="font-forensic text-[10px] text-[var(--text-muted)]">User {studyCase.meta.userId}</div>
                          </td>
                          <td className="p-4 text-[var(--text-sec)]">{studyCase.meta.courseTitle}</td>
                          <td className="p-4 text-[var(--text-sec)]">{studyCase.writing.artifacts.length}</td>
                          <td className="p-4">
                            <StatusChip variant={studyCase.riskLevel === 'critical' ? 'red' : studyCase.riskLevel === 'monitor' ? 'gold' : 'teal'}>
                              {studyCase.riskLevel}
                            </StatusChip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-[var(--bg-raised)]/50 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" onClick={finalizeImport}>Add to workspace <ArrowRight size={16} /></Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--teal-dim)] text-[var(--teal)] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-editorial text-[var(--text-primary)] mb-2">Teacher workspace updated</h3>
                    <p className="text-[var(--text-sec)] mb-6">
                      {parsedCases.length} student case{parsedCases.length !== 1 ? 's were' : ' was'} added. You can now select any imported student, choose a specific exercise, and activate the variables you want to examine from the dashboard.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Students added</div>
                        <div className="text-[var(--teal)] font-mono">{totals.students}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Detected tasks</div>
                        <div className="text-[var(--lav)] font-mono">{totals.tasks}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Ready for scope selection</div>
                        <div className="text-[var(--gold)] font-mono">Yes</div>
                      </div>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                      <Button variant="primary" onClick={() => navigate('/dashboard')}>
                        Open dashboard controls <ArrowRight size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/students')}>
                        Open student registry
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-[var(--gold-dim)] border border-[var(--gold)]/20 text-[var(--gold)] text-sm">
                <BookOpenText size={18} />
                <span>The next step is not re-importing the same file. Use the dashboard controls to choose the student, the exercise, and the variables to study.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ResearchShell>
  );
}
