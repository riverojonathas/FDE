export interface Prompt {
  id: string
  title: string
  content: string
  version: string
  createdAt: Date
  updatedAt: Date
  metrics?: {
    accuracy: number
    avgDifference: number
    maxDifference: number
    totalTests: number
  }
} 