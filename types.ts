
export interface UserProfile {
  name: string;
  dietaryPreferences: string[];
}

export interface HydrationLog {
  date: string;
  amount: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  reps?: string;
  sets?: number;
  time?: number; // seconds
  animationUrl?: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  preparationSteps: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  achieved: boolean;
}

export interface AppState {
  user: UserProfile;
  hydration: HydrationLog[];
  workouts: Workout[];
  meals: Meal[];
  badges: Badge[];
  streak: number;
  lastVisit: string;
}
