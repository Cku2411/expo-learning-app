export interface Lesson {
  id: string;
  title: string;
  icon: string;
  completionCount: number;
  questions: Question[];
}

export interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  review?: Lesson;
}

export interface CourseData {
  chapters: Chapter[];
  scenarios: ConversationScenario[];
}

// ✅ fix typo
export interface ConversationScenario {
  id: string;
  title: string;
  icon: string;
  isFree: boolean;
  description: string;
  goal: string;
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  phrasebook?: PhrasebookEntry[];
}

interface PhrasebookEntry {
  hanzi: string;
  pinyin: string;
  english: string;
}

// ======================
// COMMON TYPES
// ======================

export interface Word {
  hanzi: string;
  pinyin: string;
  english: string;
}

export interface MandarinPrompt {
  hanzi: string;
  pinyin: string;
}

export interface MandarinFull extends MandarinPrompt {
  words: Word[];
  breakdown: string;
}

export interface SpeakingOption {
  id: number;
  english: string;
  mandarin: MandarinFull;
}

export interface ListeningOption {
  id: number;
  english: string;
}

// ======================
// QUESTION TYPES (FIXED)
// ======================

interface BaseQuestion {
  id: number;
}

// ✅ SINGLE RESPONSE
export interface SingleResponseQuestion extends BaseQuestion {
  type: "single_response";
  mandarin: MandarinPrompt;
  options: SpeakingOption[];
}

// ✅ MULTIPLE CHOICE
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  mandarin: MandarinPrompt;
  options: SpeakingOption[];
  correctOptionId: number;
}

// ✅ LISTENING MC
export interface ListeningMCQuestion extends BaseQuestion {
  type: "listening_mc";
  mandarin: MandarinFull;
  options: ListeningOption[];
  correctOptionId: number;
}

// ✅ UNION
export type Question =
  | SingleResponseQuestion
  | MultipleChoiceQuestion
  | ListeningMCQuestion;

// ======================

import courseData from "@/assets/data/course_content.json";

export const COURSE_DATA = courseData as CourseData;
