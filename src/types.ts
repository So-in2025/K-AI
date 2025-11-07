import { User as FirebaseUser } from 'firebase/auth';

export type User = FirebaseUser;

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
  setup?: { text: string; pause: number }[];
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
  // Also support integrated analysis fields
  chainReaction?: string;
  coreBelief?: string;
  holisticInsight?: string;
  integrativeStrategy?: string;
  // Also support depression/grief fields
  coreEmotion?: string;
  thoughtPattern?: string;
  compassionOpportunity?: string;
  gentleAction?: string;
}

export type GuardianAnalysisResult = IGuardianAnalysis | { isLocked: true };

export interface OnboardingData {
    focuses: UserFocus[];
    addictionFrequency?: string;
    addictionGoal?: string;
    depressionManifestation?: string;
    depressionMotivation?: string;
    griefRecency?: string;
    griefFeeling?: string;
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

export interface IDopamineHit {
    id: string;
    date: string; // ISO string
    activity: string;
    category: string;
}

export interface IHabitLoop {
    id: string;
    date: string; // ISO string
    cue: string;
    craving: string;
    oldRoutine: string;
    newRoutine: string;
    reward: string;
    kaiSummary?: string;
}

export interface IFreedomVaultConfig {
    weeklySpending: number;
    goalAmount: number;
    goalDescription: string;
    lastDepositDate?: string;
}

export interface INeuroQuest {
    id: 'gratitude' | 'victory' | 'savoring' | 'sunlight' | 'positive-memory' | 'self-massage';
    neurotransmitter: 'dopamine' | 'serotonin';
    name: string;
    description: string;
    activityLogName: string;
    category: string;
    script: { step: 'intention' | 'practice' | 'reflection'; text: string; pauseAfter: number }[];
}

export interface IMoodPlan {
    nutrition: { title: string; description: string; color: string; };
    attire: { title: string; description: string; };
    routine: { title: string; description: string; };
}

export interface IMoodJournal {
    date: string; // ISO string
    detectedMood: string;
    transcript: string;
    plan: IMoodPlan;
}

export type Archetype = 'coach' | 'sabio' | 'guerrero' | 'nino' | 'sanador';

export const ARCHETYPE_NAMES: Record<Archetype, string> = {
  coach: 'Kai Coach',
  sabio: 'El Sabio',
  guerrero: 'El Guerrero',
  nino: 'El Niño Interior',
  sanador: 'El Sanador',
};

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

export type FeatureID = 'guardian' | 'weekly_analysis' | 'oracle' | 'thought_lab' | 'habit_architect' | 'affirmation_generator' | 'soundtrack';

export interface FeatureUsage {
    count: number;
    month: number;
    year: number;
}

export type UsageTracker = Record<FeatureID, FeatureUsage>;

export interface ITtsSettings {
    voiceName: string | null;
    rate: number; // 0.1 to 10
    pitch: number; // 0 to 2
}

export interface IQuote {
    text: string;
    author: string;
    tags?: UserFocus[];
}

export interface IMusicPreferences {
    genres: string[];
    artists: string;
}

export interface ISongRecommendation {
    title: string;
    artist: string;
    reason: string;
}

// --- Main User Profile Data Structure for Firestore ---
export interface IUserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: any; // Firestore ServerTimestamp

    geminiApiKey?: string | null;
    onboardingData?: OnboardingData | null;
    isSubscribed?: boolean;
    
    cravings?: ICraving[];
    startDate?: string | null; // ISO string
    journalEntry?: string;
    kaiConversation?: IConversationTurn[];
    goals?: IGoal[];
    wellnessLog?: IWellnessActivity[];
    reminders?: IReminder[];
    
    gardenGrowthPoints?: number;
    thoughtLabEntries?: IThoughtLabEntry[];
    trustCircleConfig?: ITrustCircleConfig | null;
    kaiMemory?: string;

    dopamineHits?: IDopamineHit[];
    habitLoops?: IHabitLoop[];
    moodJournal?: IMoodJournal | null;
    therapySessions?: ITherapySession[];

    usageTracker?: UsageTracker | null;
    therapyTrialUsed?: boolean;
    guardianTriggerWords?: string[];
    
    musicPreferences?: IMusicPreferences;
}
