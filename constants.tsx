
import { UserProfile, Badge } from './types';

export const COLORS = {
  primary: '#3b82f6', // blue
  secondary: '#10b981', // green
  accent: '#f59e0b', // orange
};

export const INITIAL_USER: UserProfile = {
  name: '', // Será preenchido pelo Auth
  dietaryPreferences: [],
};

export const INITIAL_BADGES: Badge[] = [
  { id: 'h2o-master', name: 'H2O Master', icon: '💧', description: 'Beba 3L de água em um dia', achieved: false },
  { id: 'early-bird', name: 'Madrugador', icon: '🌅', description: 'Complete um treino antes das 8h', achieved: false },
  { id: 'chef', name: 'Chef Saudável', icon: '🥗', description: 'Registre 5 refeições saudáveis', achieved: false },
  { id: 'streak-7', name: 'Semana Ativa', icon: '🔥', description: 'Mantenha atividade por 7 dias', achieved: false },
];
