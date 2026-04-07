// Frontend Types - Central location for all frontend type definitions
export type { User } from './user'
export type { Student, StudentSubmission } from './student'
export type { Report, ReportMetrics } from './report'
export type { Feedback, FeedbackTemplate } from './feedback'

// Re-export all types as namespace if needed
export * as Types from './types'
