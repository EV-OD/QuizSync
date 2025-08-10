
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer in the options array
  researchPaperId: string;
}

export interface User {
  id: string; // This is the user's email
  quizId: string; // This is the unique, random ID for the quiz URL
  name: string;
  quizUrl: string;
  researchPaperId: string;
  score?: number;
  completed?: boolean;
  totalQuestions?: number;
}

export interface LastResult {
  score: number;
  total: number;
  questions: Question[];
  answers: Record<number, number>; // questionId -> selected option index
}

export interface QuizState {
  status: 'not-started' | 'active' | 'finished';
  users: User[];
  questions: Question[];
  userAssignments: Record<string, number[]>; // userId -> questionIds
  lastResult: LastResult | null;
}
