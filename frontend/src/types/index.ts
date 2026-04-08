/**
 * Central Type Definitions for WriteLens Frontend
 */

// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student' | 'researcher'
  createdAt: Date
}

// Student Types
export interface Student {
  id: string
  name: string
  email: string
  cohortId?: string
  createdAt: Date
}

export interface StudentSubmission {
  id: string
  studentId: string
  text: string
  submittedAt: Date
  wordCount: number
}

// Report Types
export interface Report {
  id: string
  studentId: string
  submissionId: string
  metrics: ReportMetrics
  feedback: string
  generatedAt: Date
}

export interface ReportMetrics {
  readability: number
  complexity: number
  clarity: number
  engagement: number
}

// Feedback Types
export interface Feedback {
  id: string
  submissionId: string
  templateId: string
  content: string
  severity: 'low' | 'medium' | 'high'
}

export interface FeedbackTemplate {
  id: string
  name: string
  content: string
  category: string
  isActive: boolean
}
