export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Subject {
  id: string;
  name: string;
  examDate: string;
  difficulty: Difficulty;
  hoursPerWeek: number;
  progress: number; // 0 to 100
  color: string; // Tailwind class identifier or custom color name
  icon: string; // Lucide icon identifier
}

export type SessionStatus = 'Done' | 'Today' | 'Pending';

export interface StudySession {
  id: string;
  day: string; // e.g., "Mon", "Tue"
  time: string; // e.g., "09:00", "14:00"
  subjectName: string; // To match the display
  topic: string;
  duration: number; // in minutes
  status: SessionStatus;
}

export interface PomodoroTask {
  id: string;
  subjectName: string;
  topic: string;
  duration: number; // in minutes
  completed: boolean;
}
