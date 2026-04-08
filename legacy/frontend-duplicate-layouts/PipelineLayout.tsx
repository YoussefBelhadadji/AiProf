// LEGACY - Moved during architecture refactor on 2026-04-08
// Duplicate of the canonical file in frontend/src/layouts/PipelineLayout.tsx.
// The layouts/ folder is the authoritative location. Kept for reference only.

﻿import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileEdit, Database, ActivitySquare, Fingerprint, Grid,
  Map, BrainCircuit, Sparkles, AlertOctagon, MessageSquare,
  ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

export const stations = [
  { id: 'S01', name: 'Writing Task Context', icon: FileEdit, path: '/pipeline/S01' },
  { id: 'S02', name: 'Forensic Data Integration', icon: Database, path: '/pipeline/S02' },
  { id: 'S03', name: 'Submission Pattern Analytics', icon: ActivitySquare, path: '/pipeline/S03' },
  { id: 'S04', name: 'Stylometric Fingerprint', icon: Fingerprint, path: '/pipeline/S04' },
  { id: 'S05', name: 'Evidence Alignment Matrix', icon: Grid, path: '/pipeline/S05' },
  { id: 'S06', name: 'Archetypal Mapping', icon: Map, path: '/pipeline/S06' },
  { id: 'S07', name: 'Predictive Model', icon: BrainCircuit, path: '/pipeline/S07' },
  { id: 'S08', name: 'Bayesian Synthesis', icon: Sparkles, path: '/pipeline/S08' },
  { id: 'S09', name: 'Diagnostic Signals', icon: AlertOctagon, path: '/pipeline/S09' },
  { id: 'S10', name: 'Feedback Planning', icon: MessageSquare, path: '/pipeline/S10' },
  { id: 'S11', name: 'Intervention Planning', icon: ShieldAlert, path: '/pipeline/S11' },
  { id: 'S12', name: 'Revision Cycle Evidence', icon: RefreshCw, path: '/pipeline/S12' },
];

interface PipelineLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const PipelineLayout: React.FC<PipelineLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentStationIndex = stations.findIndex(s => location.pathname.startsWith(s.path));
  const currentStation = stations[currentStationIndex] || stations[0];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Station Sub-Navigation */}
      <div className="flex items-center justify-between gap-4 mb-12 p-2 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-2xl overflow-x-auto no-scrollbar">
         <div className="flex items-center gap-1">
            {stations.map((s, idx) => {
              const isActive = location.pathname.startsWith(s.path);
              const isPast = idx < currentStationIndex;
              
              return (
                <Link 
                  key={s.id}
                  to={s.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap group ${
                    isActive 
                      ? 'bg-[var(--lav)] text-white shadow-[0_0_15px_var(--lav-glow)]' 
                      : isPast
                      ? 'text-[var(--teal)] hover:text-[var(--lav)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-sec)]'
                  }`}
                >
                   <s.icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                   <span className={`font-navigation text-xs uppercase tracking-widest font-bold ${isActive ? 'block' : 'hidden lg:block'}`}>
                     {s.id}
                   </span>
                </Link>
              );
            })}
         </div>
         
         <div className="flex items-center gap-2 pr-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse shadow-[0_0_5px_var(--teal)]"></div>
            <span className="font-navigation text-xs uppercase font-bold text-[var(--text-muted)]">Live Pipeline</span>
         </div>
      </div>

      {/* Hero Header for Station */}
      <div className="relative mb-16 pb-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="px-3 py-1 bg-[var(--bg-high)] rounded-lg text-xs font-forensic font-bold uppercase tracking-widest text-[var(--lav)] border border-[var(--lav-border)] shadow-inner">
                 PHASE {currentStation.id}
               </div>
               <span className="text-xs uppercase font-navigation font-bold tracking-[0.3em] text-[var(--text-muted)] opacity-60">
                 Diagnostic Protocol
               </span>
            </div>
            <h1 className="font-editorial text-5xl italic text-[var(--text-primary)] tracking-tight">
              {currentStation.name}
            </h1>
         </div>

         <div className="flex items-center gap-8">
            <div className="text-right">
               <div className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">Methodology</div>
               <div className="flex items-center justify-end gap-2 text-xs font-navigation uppercase tracking-widest">
                  <Fingerprint className="w-4 h-4 text-[var(--lav)]" />
                  <span className="text-[var(--text-sec)] font-bold">Verified Evidence</span>
               </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] flex items-center justify-center text-[var(--lav)]">
               <Activity className="w-5 h-5 animate-pulse" />
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
         <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full pb-32"
            >
              {children}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Station Footer / Navigation */}
      <div className="fixed bottom-0 left-0 lg:left-80 right-0 p-10 flex justify-between items-end pointer-events-none">
         <div className="pointer-events-auto">
            {currentStationIndex > 0 && (
              <Link 
                to={stations[currentStationIndex - 1].path}
                className="btn-ghost px-8 py-3 rounded-xl flex items-center gap-2 border-[var(--border-bright)] group"
              >
                 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 <span className="font-navigation text-xs uppercase tracking-widest font-bold">Review {stations[currentStationIndex - 1].id}</span>
              </Link>
            )}
         </div>

         <div className="flex items-center gap-4 bg-[var(--bg-deep)]/80 backdrop-blur-xl p-3 border border-[var(--border)] rounded-2xl pointer-events-auto shadow-2xl">
            <div className="px-4 border-r border-[var(--border)]">
               <div className="font-navigation text-xs uppercase text-[var(--text-muted)] font-bold">Process Integrity</div>
               <div className="flex items-center gap-1">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i-1 <= currentStationIndex ? 'bg-[var(--lav)]' : 'bg-[var(--border)]'}`}></div>
                  ))}
               </div>
            </div>

            {currentStationIndex < stations.length - 1 && (
              <Link 
                to={stations[currentStationIndex + 1].path}
                className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_var(--lav-glow)] group"
              >
                 <span className="font-navigation text-xs uppercase tracking-widest font-bold capitalize">Advance to Protocol {stations[currentStationIndex + 1].id}</span>
                 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
         </div>
      </div>
    </div>
  );
};

export const StationHeader = () => null;
export const StationFooter = () => null;

