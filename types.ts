

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
  category?: 'Breathing' | 'Meditation' | 'Movement' | 'Neuro-Ritual' | 'Shamanic Journey';
}

export interface IExercise {
  id: string;
  name: string;
  description: string;
  setup?: { text: string; pause: number }[]; // <-- ADDED FOR PREPARATION PHASE
  steps: { name: string; duration: number; instruction?: string }[];
  isPremium?: boolean;
}

export interface IMeditation {
    id: string;
    name: string;
    description: string;
    script: { text: string; pause: number }[]; // pause in ms
    isPremium?: boolean;
}

export interface IMovementVideo {
  id: string;
  youtubeId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'movement' | 'rest';
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
    kaiSummary?: string;
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
    category: string;
}

export interface IHabitLoop {
    id: string;
    date: string; // ISO string
    cue: string;      // The trigger
    craving: string;  // The underlying need
    oldRoutine: string;
    newRoutine: string;
    reward: string;
    kaiSummary?: string;
}

// Fix: Add missing IFreedomVaultConfig interface.
export interface IFreedomVaultConfig {
    weeklySpending: number;
    goalAmount: number;
    goalDescription: string;
    lastDepositDate?: string;
}

export interface INeuroQuest { // RENAMED
    id: 'gratitude' | 'victory' | 'savoring' | 'sunlight' | 'positive-memory' | 'self-massage';
    neurotransmitter: 'dopamine' | 'serotonin'; // <-- ADDED
    name: string;
    description: string;
    activityLogName: string;
    category: string;
    script: { step: 'intention' | 'practice' | 'reflection'; text: string; pauseAfter: number }[];
}

// Mood Journal Types
export interface IMoodPlan {
    nutrition: {
        title: string;
        description: string;
        color: string;
    };
    attire: {
        title: string;
        description: string;
    };
    routine: {
        title: string;
        description: string;
    };
}

export interface IMoodJournal {
    date: string; // ISO string
    detectedMood: string;
    transcript: string;
    plan: IMoodPlan;
}

// Oraculo Interior
export type Archetype = 'coach' | 'sabio' | 'guerrero' | 'nino' | 'sanador';

export const ARCHETYPE_NAMES: Record<Archetype, string> = {
  coach: 'Kai Coach',
  sabio: 'El Sabio',
  guerrero: 'El Guerrero',
  nino: 'El Niño Interior',
  sanador: 'El Sanador',
};

// Modo Terapeuta
export type TherapyMode = 'cbt' | 'act' | 'narrative';

export const THERAPY_MODES: Record<TherapyMode, { name: string; description: string }> = {
    cbt: { name: 'Analizar un Pensamiento (TCC)', description: 'Ideal para reestructurar pensamientos recurrentes.' },
    act: { name: 'Explorar una Emoción (ACT)', description: 'Para aceptar y navegar emociones difíciles sin juicio.' },
    narrative: { name: 'Entender una Historia (Narrativa)', description: 'Para re-escribir una creencia limitante sobre ti.' },
};

export interface ITherapySummary {
    insights: string;
    patterns: string;
    actionable: string;
}

export interface ITherapySession {
    id: string;
    date: string; // ISO string
    mode: TherapyMode;
    transcript: IConversationTurn[];
    summary: ITherapySummary;
}

// Monetization - Usage Tracking
export type FeatureID = 'guardian' | 'weekly_analysis' | 'oracle';

export interface FeatureUsage {
    count: number;
    month: number; // e.g., 6 for July
    year: number; // e.g., 2024
}

export type UsageTracker = Record<FeatureID, FeatureUsage>;

// TTS Settings
export interface ITtsSettings {
    voiceName: string | null;
    rate: number; // 0.1 to 10
    pitch: number; // 0 to 2
}

export interface IQuote {
    text: string;
    author: string;
}