import { create } from 'zustand';
import { IUser, IPrompt, IQuestion } from '@/types/common';

interface AppState {
  user: IUser | null;
  prompts: IPrompt[];
  questions: IQuestion[];
  setUser: (user: IUser | null) => void;
  setPrompts: (prompts: IPrompt[]) => void;
  setQuestions: (questions: IQuestion[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  prompts: [],
  questions: [],
  setUser: (user) => set({ user }),
  setPrompts: (prompts) => set({ prompts }),
  setQuestions: (questions) => set({ questions }),
})); 