
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface UserData {
  userId?: string;
  email: string;
  xp: number;
  treeLevel: number;
  completedTasks: CompletedTask[];
  // MVP motivation: daily streak
  streakCount?: number;
  lastActionDateKey?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  detectionClass: string;
  icon: string;
  // Optional metadata for MVP daily tasks
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CompletedTask {
  taskId: string;
  completedAt: string | Date;
  xpEarned: number;
}

export interface TreeStage {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  image: string;
}

export interface DetectionResult {
  class: string;
  confidence: number;
  signals?: {
    plant?: {
      present: boolean;
      confidence: number;
    };
  };
}

export interface AppSettings {
  language: 'ua' | 'en';
  theme: 'light' | 'dark';
  soundEnabled: boolean;
}
