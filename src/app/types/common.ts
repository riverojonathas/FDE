export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface IQuestion {
  id: string;
  title: string;
  description: string;
  promptId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrompt {
  id: string;
  title: string;
  content: string;
  version: number;
  questionIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface IStudentResponse {
  id: string;
  questionId: string;
  studentId: string;
  content: string;
  platform: string;
  metadata: {
    examId: string;
    timestamp: string;
    platformData: Record<string, unknown>;
  };
  createdAt: Date;
}

export interface IEvaluation {
  id: string;
  responseId: string;
  promptVersion: number;
  score: number;
  studentFeedback: string;
  teacherFeedback: string;
  evaluationCriteria: Record<string, number>;
  status: 'pending' | 'completed' | 'approved' | 'revision';
  createdAt: Date;
  updatedAt: Date;
} 