
export enum MessageCategory {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Night = 'night',
  Craving = 'craving',
}

export interface IMessage {
  id: number;
  category: MessageCategory;
  title: string;
  content: string;
}

export interface IResource {
  id: number;
  name: string;
  description: string;
  phone?: string;
  url?: string;
}

export type CravingIntensity = 'Leve' | 'Moderado' | 'Intenso';

export interface ICraving {
  date: string; // ISO string
  intensity: CravingIntensity;
  triggers: string[];
  copingStrategy: string;
  note?: string;
}

export interface IConversationTurn {
    role: 'user' | 'model';
    text: string;
}

export type KaiEmotion = 'empathetic' | 'celebratory' | 'concerned' | 'frustrated';

export type KaiGesture = 'idle' | 'nod' | 'shake';

export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface IGoal {
  type: GoalType;
  content: string;
}

export interface IWellnessActivity {
  date: string; // ISO string
  exerciseName: string;
  durationMinutes: number;
}

export interface IExercise {
  id: string;
  name: string;
  description: string;
  steps: { name: string; duration: number; instruction?: string }[];
}

export interface IMeditation {
    id: string;
    name: string;
    description: string;
    script: { text: string; pause: number }[]; // pause in ms
}

export interface IMovementVideo {
  id: string;
  youtubeId: string;
  name: string;
  description: string;
  duration: number; // in minutes
}

export interface IReminder {
    id: string;
    text: string;
    time: string; // HH:mm format
}

export type UserFocus = 'addiction' | 'depression' | 'grief';

export const USER_FOCUS_OPTIONS: Record<UserFocus, string> = {
  addiction: 'Superar una Adicción',
  depression: 'Gestionar Depresión/Ansiedad',
  grief: 'Sanar una Pérdida',
};

export interface IGuardianAnalysis {
  trigger: string;
  socialPressure: string;
  justification: string;
  turningPoint: string;
  escapeStrategy: string;
}

export type GuardianAnalysisResult = IGuardianAnalysis | { isLocked: true };

export interface OnboardingData {
    focuses: UserFocus[];
    // Addiction
    addictionFrequency?: string;
    addictionGoal?: string;
    // Depression
    depressionManifestation?: string;
    depressionMotivation?: string;
    // Grief
    griefRecency?: string;
    griefFeeling?: string;
    // Open question
    mainChallenge: string;
}

export interface IThoughtLabEntry {
    id: string;
    date: string; // ISO string
    situation: string;
    automaticThought: string;
    kaiAnalysis: string;
    alternativeThought: string;
}

export interface ITrustCircleConfig {
    contactName: string;
    contactEmail: string;
    sendWeeklyReport: boolean;
    sendCravingAlerts: boolean;
}

// NEWEST TYPES FOR NEWEST FEATURES
export interface IDopamineHit {
    id: string;
    date: string; // ISO string
    activity: string;
}

export interface IHabitLoop {
    id: string;
    date: string; // ISO string
    cue: string;      // The trigger
    craving: string;  // The underlying need
    oldRoutine: string;
    newRoutine: string;
    reward: string;
}

export interface IFreedomVaultConfig {
    weeklySpending: number;
    goalAmount: number;
    goalDescription: string;
}
