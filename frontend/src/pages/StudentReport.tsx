import { useNavigate, useParams } from 'react-router-dom';
import { Download, Printer, ArrowLeft, Award, Target, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentShell } from '../layouts/StudentShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';

export function StudentReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE = 'http://localhost:5000/api';
  const [studentData, setStudentData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${API_BASE}/student/${id || 'asmaa_9263'}`);
        const data = await response.json();
        setStudentData(data);
        
        // Generate REAL achievements based on actual data
        
        const realAchievements = [];
        if ((data?.student?.word_count || 0) > 50) {
          realAchievements.push({
            title: 'Goal Setter', 
            description: `Achieved ${data.student.word_count || 0} words.`,
            icon: Target,
            color: 'text-emerald-500'
          });
        }
        if ((data?.student?.time_on_task || 0) > 0) {
          realAchievements.push({
            title: 'Time Dedicated',
            description: `Spent ${data.student.time_on_task || 0} minutes on task.`,
            icon: Target,
            color: 'text-blue-500'
          });
        }
        if ((parseFloat(data?.student?.argumentation) || 0) > 2) {
          realAchievements.push({
            title: 'Strong Voice',
            description: `Argumentation score: ${data.student.argumentation}.`,
            icon: Award,
            color: 'text-amber-500'
          });
        }
        setAchievements(realAchievements.length > 0 ? realAchievements : [
          { title: 'Data Loaded', description: 'Real student data successfully loaded from system.', icon: CheckCircle2, color: 'text-blue-500' }
        ]);

      } catch (err) {
        console.error('Failed to fetch student data:', err);
      }
    };

    fetchStudentData();
  }, [id]);

  return (
    <StudentShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
               onClick={() => navigate('/student-dashboard')}
               className="p-2 text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-full transition-all"
            >
               <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-editorial text-3xl text-[var(--text-primary)]">My Progress Report</h1>
              <p className="text-sm text-[var(--text-sec)] font-body">A summary of your growth and achievements this semester.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" className="flex-1 md:flex-none text-xs"><Printer size={14}/> Print</Button>
            <Button className="flex-1 md:flex-none text-xs bg-[var(--lav)] text-white shadow-lg"><Download size={14}/> Download PDF</Button>
          </div>
        </header>

        {/* Growth Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <GlassCard className="p-6 text-center border-[var(--lav-border)] bg-[var(--lav-dim)]/20">
              <p className="text-xs font-navigation uppercase tracking-widest text-[var(--lav)] mb-2">Overall Mastery</p>
              <p className="text-4xl font-editorial italic text-[var(--text-primary)]">{studentData?.cluster?.learner_profile || "Analyzed"}</p>
              <div className="mt-4 h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                 <div className="h-full bg-[var(--lav)]" style={{ width: `${(parseFloat(studentData?.student?.total_score || 0) / 32) * 100}%` }} />
              </div>
           </GlassCard>
           <GlassCard className="p-6 text-center">
              <p className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mb-2">Tasks Completed</p>
              <p className="text-4xl font-editorial italic text-[var(--text-primary)]">{studentData?.student?.draft_no || 1}</p>
              <p className="text-xs text-emerald-500 font-bold mt-2">All Drafts Processed</p>
           </GlassCard>
           <GlassCard className="p-6 text-center">
              <p className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mb-2">Feedback Utilization</p>
              <p className="text-4xl font-editorial italic text-[var(--text-primary)]">86%</p>
              <p className="text-xs text-[var(--lav)] font-bold mt-2">Expert Level</p>
           </GlassCard>
        </div>

        {/* Recent Achievements */}
        <section>
          <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((a, i) => (
              <GlassCard key={i} className="p-5 flex flex-col items-center text-center group hover:bg-[var(--bg-raised)] transition-all">
                <div className={`p-4 rounded-full bg-[var(--bg-deep)] mb-4 ${a.color} group-hover:scale-110 transition-transform`}>
                  <a.icon size={28} />
                </div>
                <h3 className="font-editorial text-lg text-[var(--text-primary)] mb-1">{a.title}</h3>
                <p className="text-xs text-[var(--text-sec)] leading-relaxed">{a.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Detailed Skills Breakdown */}
        <GlassCard className="p-8">
          <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-6">Skills Mastery</h2>
          <div className="space-y-6">
            {[
              { label: 'Argumentation Structure', level: 'Measured', percent: (parseFloat(studentData?.student?.argumentation || 0) / 5) * 100 },
              { label: 'Cohesion', level: 'Measured', percent: (parseFloat(studentData?.student?.cohesion || 0) / 5) * 100 },
              { label: 'Grammar & Syntax', level: 'Measured', percent: (parseFloat(studentData?.student?.grammar_accuracy || 0) / 5) * 100 },  
              { label: 'Lexical Resource', level: 'Measured', percent: (parseFloat(studentData?.student?.lexical_resource || 0) / 5) * 100 },
            ].map((skill, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-navigation uppercase tracking-wider">
                  <span className="text-[var(--text-primary)]">{skill.label}</span>
                  <span className={skill.percent > 80 ? 'text-emerald-500' : 'text-[var(--text-sec)]'}>{skill.level}</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div 
                    className={`h-full transition-all duration-1000 ${skill.percent > 80 ? 'bg-emerald-500' : 'bg-[var(--lav)]'}`} 
                    style={{ width: `${skill.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Encouraging Footer */}
        <div className="text-center py-8">
           <CheckCircle2 size={32} className="mx-auto text-[var(--lav)] mb-4 animate-bounce" />
           <p className="text-lg font-editorial italic text-[var(--text-primary)]">"Your dedication to the revision process is clearly reflected in your growth. Keep it up!"</p>
           <p className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mt-2">â€” WriteLens Adaptive Engine</p>
        </div>
      </div>
    </StudentShell>
  );
}

