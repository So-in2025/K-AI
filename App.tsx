import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { Header } from './components/Header';
import { SOSCard } from './components/SOSCard';
import { SettingsModal } from './components/SettingsModal';
import { NavigationBar, View } from './components/NavigationBar';
import { HomeView } from './views/HomeView';
import { KaiView } from './views/KaiView';
import { ToolsView } from './views/ToolsView';
import { ProgressView } from './views/ProgressView';
import { ICraving, IConversationTurn, IGoal, GoalType, IWellnessActivity, UserFocus, GuardianAnalysisResult, IGuardianAnalysis, OnboardingData, IReminder, IThoughtLabEntry, ITrustCircleConfig, IDopamineHit, IHabitLoop, IMoodJournal, ITherapySession, UsageTracker, FeatureID } from './types';
import { getGeminiResponse, getApiKey } from './services/geminiService';
import ttsService from './services/ttsService';
import { OnboardingModal } from './components/OnboardingModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import {
    CRAVINGS_STORAGE_KEY, PROGRESS_STORAGE_KEY, JOURNAL_STORAGE_KEY,
    WELLNESS_LOG_STORAGE_KEY, REMINDERS_STORAGE_KEY, LAST_INTERACTION_KEY,
    ONBOARDING_DATA_STORAGE_KEY, SUBSCRIPTION_STORAGE_KEY, ACTIVATION_CODE_KEY,
    GARDEN_GROWTH_POINTS_KEY, THOUGHT_LAB_STORAGE_KEY, TRUST_CIRCLE_STORAGE_KEY,
    KAI_MEMORY_KEY, DOPAMINE_DIET_KEY, HABIT_LOOPS_KEY, MOOD_JOURNAL_KEY,
    KAI_CONVERSATION_KEY, THERAPY_SESSIONS_KEY, FEATURE_USAGE_KEY, THERAPY_TRIAL_USED_KEY
} from './constants';


const GUARDIAN_CONFIG_KEY = 'guardianConfig';


// Helper to encode audio data for Gemini Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Reducer for Guardian Mode state management
type GuardianState = {
  status: 'idle' | 'starting' | 'active' | 'stopping' | 'analyzing' | 'error';
  transcript: string;
  analysis: GuardianAnalysisResult | null;
  error: string | null;
};

type GuardianAction =
  | { type: 'START' }
  | { type: 'ACTIVATE' }
  | { type: 'APPEND_TRANSCRIPT'; payload: string }
  | { type: 'STOP' }
  | { type: 'START_ANALYSIS' }
  | { type: 'SET_ANALYSIS'; payload: GuardianAnalysisResult | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialGuardianState: GuardianState = {
  status: 'idle',
  transcript: '',
  analysis: null,
  error: null,
};

function guardianReducer(state: GuardianState, action: GuardianAction): GuardianState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'starting', analysis: null, transcript: '', error: null };
    case 'ACTIVATE':
      return { ...state, status: 'active' };
    case 'APPEND_TRANSCRIPT':
      return { ...state, transcript: state.transcript + action.payload };
    case 'STOP':
      return { ...state, status: 'stopping' };
    case 'START_ANALYSIS':
      return { ...state, status: 'analyzing' };
    case 'SET_ANALYSIS':
      return { ...state, status: 'idle', analysis: action.payload, transcript: '' };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'RESET':
      return initialGuardianState;
    default:
      return state;
  }
}


const App: React.FC = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<View>('home');
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState(false); // Monetization state
  const [isDevMode, setIsDevMode] = useState(false); // Temporary dev mode state

  const [cravings, setCravings] = useState<ICraving[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [daysSober, setDaysSober] = useState<number>(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [conversation, setConversation] = useState<IConversationTurn[]>([]);
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [wellnessLog, setWellnessLog] = useState<IWellnessActivity[]>([]);
  const [reminders, setReminders] = useState<IReminder[]>([]);
  
  // PREVIOUS FEATURES STATE
  const [gardenGrowthPoints, setGardenGrowthPoints] = useState<number>(0);
  const [thoughtLabEntries, setThoughtLabEntries] = useState<IThoughtLabEntry[]>([]);
  const [trustCircleConfig, setTrustCircleConfig] = useState<ITrustCircleConfig | null>(null);
  const [kaiMemory, setKaiMemory] = useState<string>('');

  // NEWEST FEATURES STATE
  const [dopamineHits, setDopamineHits] = useState<IDopamineHit[]>([]);
  const [habitLoops, setHabitLoops] = useState<IHabitLoop[]>([]);
  const [moodJournal, setMoodJournal] = useState<IMoodJournal | null>(null);
  const [therapySessions, setTherapySessions] = useState<ITherapySession[]>([]);

  // Monetization - Usage Tracking State
  const [usageTracker, setUsageTracker] = useState<UsageTracker | null>(null);
  const [therapyTrialUsed, setTherapyTrialUsed] = useState(false);


  // MODAL STATES
  const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);


  // Guardian Mode State with Reducer
  const [guardianState, dispatchGuardian] = useReducer(guardianReducer, initialGuardianState);
  const [guardianTriggerWords, setGuardianTriggerWords] = useState<string[]>([]);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const triggerWordTimeoutRef = useRef<number | null>(null);

  // Derived state for premium access
  const hasPremiumAccess = isSubscribed || isDevMode;

  const updateLastInteraction = useCallback(() => {
    localStorage.setItem(LAST_INTERACTION_KEY, new Date().toISOString());
  }, []);

  const updateGardenGrowth = useCallback((points: number) => {
    setGardenGrowthPoints(prev => {
        const newPoints = prev + points;
        localStorage.setItem(GARDEN_GROWTH_POINTS_KEY, String(newPoints));
        return newPoints;
    });
  }, []);

  // Dev mode effect
  useEffect(() => {
    const devModeActive = sessionStorage.getItem('isDevMode') === 'true';
    if (devModeActive) {
      setIsDevMode(true);
    }
  }, []);

  const handleToggleDevMode = () => {
    const newDevModeState = !isDevMode;
    setIsDevMode(newDevModeState);
    if (newDevModeState) {
      sessionStorage.setItem('isDevMode', 'true');
    } else {
      sessionStorage.removeItem('isDevMode');
    }
  };

  useEffect(() => {
     try {
        const storedKey = getApiKey();
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            setIsApiKeyModalOpen(true);
        }

        const storedData = localStorage.getItem(ONBOARDING_DATA_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && Array.isArray(parsedData.focuses) && parsedData.focuses.length > 0) {
                 setOnboardingData(parsedData);
            } else {
                 setIsOnboardingOpen(true);
            }
        } else {
            setIsOnboardingOpen(true);
        }
    } catch(e) {
        console.error("Failed to read onboarding data", e);
        setIsOnboardingOpen(true);
    }

    ttsService.init();
    updateLastInteraction();
  }, [updateLastInteraction]);

  // Subscription check effect
  useEffect(() => {
    const checkActivation = async () => {
        const activationCode = localStorage.getItem(ACTIVATION_CODE_KEY);
        if (activationCode && !isSubscribed) {
            try {
                const response = await fetch('/.netlify/functions/check-activation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: activationCode }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.activated) {
                        console.log("Subscription activated!");
                        setIsSubscribed(true);
                        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, 'true');
                        localStorage.removeItem(ACTIVATION_CODE_KEY); // Clean up
                    }
                }
            } catch (error) {
                console.error('Error checking activation:', error);
            }
        }
    };

    const storedSubscription = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (storedSubscription === 'true') {
        setIsSubscribed(true);
    } else {
        checkActivation();
    }
  }, [isSubscribed]);

  
  useEffect(() => {
    if (!onboardingData) return;

    const now = new Date();
    
    const checkProactiveIntervention = (type: string, condition: boolean, message: string) => {
      const lastInterventionTime = sessionStorage.getItem(`lastProactive_${type}`);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (condition && (!lastInterventionTime || now.getTime() - new Date(lastInterventionTime).getTime() > twentyFourHours)) {
        setConversation(prev => [...prev, { role: 'model', text: message }]);
        sessionStorage.setItem(`lastProactive_${type}`, now.toISOString());
        return true;
      }
      return false;
    };

    if (onboardingData.focuses.includes('addiction')) {
        const milestones = [7, 14, 30, 60, 90, 180, 365];
        if (milestones.includes(daysSober)) {
            if (checkProactiveIntervention(`milestone_${daysSober}`, true,
            `¡Felicidades por alcanzar ${daysSober} días! Este es un logro increíble y un testimonio de tu fuerza. Estoy muy orgulloso de ti. Sigamos construyendo sobre esta energía.`)) {
                return;
            }
        }
    }
    
    const lastInteraction = localStorage.getItem(LAST_INTERACTION_KEY);
    if (lastInteraction) {
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      if (checkProactiveIntervention('inactivity', now.getTime() - new Date(lastInteraction).getTime() > twoDays,
      "Solo pasaba a ver cómo estabas. Recuerda que no tienes que llevar todo el peso solo. Estoy aquí para escucharte cuando quieras hablar.")) {
          return;
      }
    }

  }, [cravings, daysSober, onboardingData]);


  const calculateDaysSober = useCallback((start: Date) => {
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  useEffect(() => {
    try {
      const storedCravings = localStorage.getItem(CRAVINGS_STORAGE_KEY);
      if (storedCravings) setCravings(JSON.parse(storedCravings));
    } catch (error) { console.error("Failed to parse cravings from localStorage", error); }

    const savedEntry = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (savedEntry) setJournalEntry(savedEntry);

    try {
        const storedConversation = localStorage.getItem(KAI_CONVERSATION_KEY);
        if(storedConversation) setConversation(JSON.parse(storedConversation));
    } catch(e) { console.error("Failed to parse conversation history", e); }
    
    try {
        const storedLog = localStorage.getItem(WELLNESS_LOG_STORAGE_KEY);
        if (storedLog) setWellnessLog(JSON.parse(storedLog));
    } catch (error) { console.error("Failed to parse wellness log from localStorage", error); }

    try {
        const storedReminders = localStorage.getItem(REMINDERS_STORAGE_KEY);
        if (storedReminders) setReminders(JSON.parse(storedReminders));
    } catch (error) { console.error("Failed to parse reminders from localStorage", error); }

    // Load feature data
    let loadedPoints = 0;
    const storedPoints = localStorage.getItem(GARDEN_GROWTH_POINTS_KEY);
    if (storedPoints) {
        loadedPoints = parseInt(storedPoints, 10);
        setGardenGrowthPoints(loadedPoints);
    }

    const storedDate = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (storedDate) {
      const date = new Date(storedDate);
      setStartDate(date);
      const currentSoberDays = calculateDaysSober(date);
      setDaysSober(currentSoberDays);
      
      // Safeguard against garden reset
      if (currentSoberDays > loadedPoints) {
        setGardenGrowthPoints(currentSoberDays);
        localStorage.setItem(GARDEN_GROWTH_POINTS_KEY, String(currentSoberDays));
      }
    }


    try {
        const storedEntries = localStorage.getItem(THOUGHT_LAB_STORAGE_KEY);
        if (storedEntries) setThoughtLabEntries(JSON.parse(storedEntries));
    } catch(e) { console.error("Failed to parse thought lab entries", e); }

    try {
        const storedConfig = localStorage.getItem(TRUST_CIRCLE_STORAGE_KEY);
        if (storedConfig) setTrustCircleConfig(JSON.parse(storedConfig));
    } catch(e) { console.error("Failed to parse trust circle config", e); }
    
    const storedMemory = localStorage.getItem(KAI_MEMORY_KEY);
    if(storedMemory) setKaiMemory(storedMemory);

    try {
        const storedDopamineHits = localStorage.getItem(DOPAMINE_DIET_KEY);
        if (storedDopamineHits) setDopamineHits(JSON.parse(storedDopamineHits));
    } catch(e) { console.error("Failed to parse dopamine hits", e); }
    
    try {
        const storedHabitLoops = localStorage.getItem(HABIT_LOOPS_KEY);
        if (storedHabitLoops) setHabitLoops(JSON.parse(storedHabitLoops));
    } catch(e) { console.error("Failed to parse habit loops", e); }
    
    try {
        const storedGuardianConfig = localStorage.getItem(GUARDIAN_CONFIG_KEY);
        if(storedGuardianConfig) setGuardianTriggerWords(JSON.parse(storedGuardianConfig));
    } catch(e) { console.error("Failed to parse guardian config", e); }

    try {
        const storedMoodJournal = localStorage.getItem(MOOD_JOURNAL_KEY);
        if(storedMoodJournal) setMoodJournal(JSON.parse(storedMoodJournal));
    } catch(e) { console.error("Failed to parse mood journal data", e); }
    
    try {
        const storedTherapySessions = localStorage.getItem(THERAPY_SESSIONS_KEY);
        if(storedTherapySessions) setTherapySessions(JSON.parse(storedTherapySessions));
    } catch(e) { console.error("Failed to parse therapy sessions", e); }


  }, [calculateDaysSober]);

  // Load usage tracking data
    useEffect(() => {
        try {
            const storedTracker = localStorage.getItem(FEATURE_USAGE_KEY);
            const now = new Date();
            const initialTracker: UsageTracker = {
                guardian: { count: 0, month: now.getMonth(), year: now.getFullYear() },
                weekly_analysis: { count: 0, month: now.getMonth(), year: now.getFullYear() },
                oracle: { count: 0, month: now.getMonth(), year: now.getFullYear() },
            };

            if (storedTracker) {
                const parsed = JSON.parse(storedTracker);
                // Basic validation and reset if month/year is old
                if(parsed.guardian.year !== now.getFullYear() || parsed.guardian.month !== now.getMonth()) {
                     setUsageTracker(initialTracker);
                     localStorage.setItem(FEATURE_USAGE_KEY, JSON.stringify(initialTracker));
                } else {
                    setUsageTracker(parsed);
                }
            } else {
                setUsageTracker(initialTracker);
                localStorage.setItem(FEATURE_USAGE_KEY, JSON.stringify(initialTracker));
            }
        } catch (e) { console.error("Failed to load usage tracker", e); }

        const trialUsed = localStorage.getItem(THERAPY_TRIAL_USED_KEY) === 'true';
        setTherapyTrialUsed(trialUsed);
    }, []);

  // Reminder notification effect
  useEffect(() => {
    const checkReminders = () => {
        if (Notification.permission !== 'granted') return;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        reminders.forEach(reminder => {
            if (reminder.time === currentTime) {
                const notifiedKey = `notified-${reminder.id}-${now.toDateString()}`;
                if (!sessionStorage.getItem(notifiedKey)) {
                    new Notification('KIA Recordatorio', {
                        body: reminder.text,
                    });
                    sessionStorage.setItem(notifiedKey, 'true');
                }
            }
        });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [reminders]);

  const handleSaveOnboarding = (data: OnboardingData) => {
      setOnboardingData(data);
      localStorage.setItem(ONBOARDING_DATA_STORAGE_KEY, JSON.stringify(data));
      setIsOnboardingOpen(false);
  };
  
  // Monetization - Usage Check and Consume Logic
    const checkAndConsumeUsage = useCallback((featureId: FeatureID): boolean => {
        if (hasPremiumAccess) {
            return true;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Create a new tracker object to avoid state mutation issues
        const newTracker = { ...usageTracker } as UsageTracker;
        let featureUsage = newTracker[featureId];

        if (!featureUsage || featureUsage.year !== currentYear || featureUsage.month !== currentMonth) {
            featureUsage = { count: 0, month: currentMonth, year: currentYear };
        }

        if (featureUsage.count < 1) {
            featureUsage.count += 1;
            newTracker[featureId] = featureUsage;
            setUsageTracker(newTracker);
            localStorage.setItem(FEATURE_USAGE_KEY, JSON.stringify(newTracker));
            return true;
        } else {
            return false;
        }
    }, [hasPremiumAccess, usageTracker]);


  const updateKaiMemory = useCallback(async (conversationHistory: IConversationTurn[], currentMemory: string) => {
    if (!hasPremiumAccess) return; // Only for Plus users

    const recentConversation = conversationHistory.slice(-10).map(t => `${t.role}: ${t.text}`).join('\n');
    const prompt = `
        Eres un sistema de memoria. Tu tarea es analizar la memoria existente y la conversación reciente de un usuario, y luego generar una versión actualizada y concisa de la memoria. La memoria debe ser un resumen de los puntos clave, patrones, logros y desafíos del usuario, en no más de 150 palabras.
        
        MEMORIA EXISTENTE:
        "${currentMemory || 'No hay memoria previa.'}"

        CONVERSACIÓN RECIENTE (últimos 10 turnos):
        "${recentConversation}"

        Extrae los insights más importantes de la conversación reciente e intégralos en la memoria existente. Elimina detalles obsoletos o irrelevantes. La nueva memoria debe ser un párrafo coherente.

        NUEVA MEMORIA ACTUALIZADA:
    `;

    try {
        const newMemory = await getGeminiResponse(apiKey, prompt);
        setKaiMemory(newMemory);
        localStorage.setItem(KAI_MEMORY_KEY, newMemory);
        console.log("Kai's memory updated.");
    } catch(e) {
        console.error("Failed to update Kai's memory:", e);
    }

  }, [hasPremiumAccess, apiKey]);
  
  const handleNewConversationTurn = useCallback((turn: IConversationTurn) => {
    setConversation(prev => {
        const newConversation = [...prev, turn];
        localStorage.setItem(KAI_CONVERSATION_KEY, JSON.stringify(newConversation));
        return newConversation;
    });
    if(turn.role === 'user') {
        updateLastInteraction();
        // Do not switch view automatically to allow background actions
        // setActiveView('kai'); 
    }
  }, [updateLastInteraction]);
  
  const handleClearChat = useCallback(() => {
    if (window.confirm("¿Estás seguro de que quieres borrar todo el historial de esta conversación?")) {
        setConversation([]);
        localStorage.removeItem(KAI_CONVERSATION_KEY);
    }
  }, []);

  const handleRequestMemoryUpdate = useCallback(() => {
    if (conversation.length > 0 && hasPremiumAccess) {
      updateKaiMemory(conversation, kaiMemory);
      ttsService.speak("Entendido. Recordaré esta conversación.");
    }
  }, [conversation, kaiMemory, updateKaiMemory, hasPremiumAccess]);
  
  const handleLogCraving = (cravingData: ICraving) => {
    const updatedCravings = [cravingData, ...cravings];
    setCravings(updatedCravings);
    localStorage.setItem(CRAVINGS_STORAGE_KEY, JSON.stringify(updatedCravings));
    
    const summary = `[ANTOJO REGISTRADO] Intensidad: ${cravingData.intensity}. Detonantes: ${cravingData.triggers.join(', ')}. Estrategia: ${cravingData.copingStrategy}.${cravingData.note ? ` Nota: ${cravingData.note}` : ''}`;
    handleNewConversationTurn({ role: 'user', text: summary });
    ttsService.speak("Antojo registrado. Has hecho un gran trabajo al reconocerlo y enfrentarlo.");
    updateLastInteraction();
  };

  const handleStartDate = () => {
    const now = new Date();
    localStorage.setItem(PROGRESS_STORAGE_KEY, now.toISOString());
    setStartDate(now);
    setDaysSober(0);
    setGardenGrowthPoints(0); // Reset garden on new start
    localStorage.setItem(GARDEN_GROWTH_POINTS_KEY, '0');
    handleNewConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de empezar mi contador de progreso hoy.' });
  };

  const handleResetProgress = () => {
     if (window.confirm("¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.")) {
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
        setStartDate(null);
        setDaysSober(0);
        setGardenGrowthPoints(0);
        localStorage.setItem(GARDEN_GROWTH_POINTS_KEY, '0');
        handleNewConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de reiniciar mi progreso.' });
    }
  };

  const handleJournalChange = (newEntry: string) => {
    setJournalEntry(newEntry);
  };

  const handleJournalSave = () => {
    const summary = `[ENTRADA DE DIARIO GUARDADA] "${journalEntry.substring(0, 100)}..."`;
    handleNewConversationTurn({ role: 'user', text: summary });
    ttsService.speak("Diario guardado. Reflexionar es un paso poderoso en tu camino.");
    updateGardenGrowth(3); // Add points for journaling
  };
  
  const handleGenerateGoal = async (type: GoalType) => {
    if (!onboardingData) return;
    setIsGoalsLoading(true);
    ttsService.speak(`Creando tu meta ${type === 'daily' ? 'diaria' : type === 'weekly' ? 'semanal' : 'mensual'}...`);
    
    const prompt = `
        Actúa como un coach de bienestar. Basado en los siguientes datos de un usuario, crea una meta ${type} específica, medible, alcanzable, relevante y con un plazo determinado (SMART).
        - Enfoque del usuario: ${onboardingData.focuses.join(', ')}
        - Días de progreso: ${daysSober}
        - Antojos recientes: ${cravings.slice(0, 3).map(c => `Intensidad ${c.intensity} detonado por ${c.triggers.join(', ')}`).join('; ') || 'Ninguno'}
        - Diario reciente: "${journalEntry.substring(0, 100)}..."

        La meta debe ser una sola frase corta y accionable. No incluyas explicaciones ni la palabra "Meta:".
        Ejemplo: "Hoy, dedica 5 minutos a la respiración consciente cuando sientas estrés."
        Responde ahora:
    `;
    
    const content = await getGeminiResponse(apiKey, prompt);
    const newGoal: IGoal = { type, content };

    setGoals(prev => {
        const otherGoals = prev.filter(g => g.type !== type);
        return [...otherGoals, newGoal];
    });
    
    setIsGoalsLoading(false);
    ttsService.speak("Tu nueva meta está lista. ¡Puedes lograrlo!");
    
    const summary = `[META CREADA - ${type}] He creado una nueva meta: "${content}"`;
    handleNewConversationTurn({ role: 'user', text: summary });

    updateLastInteraction();
  };

  const handleLogWellnessActivity = (activity: IWellnessActivity) => {
    const updatedLog = [activity, ...wellnessLog];
    setWellnessLog(updatedLog);
    localStorage.setItem(WELLNESS_LOG_STORAGE_KEY, JSON.stringify(updatedLog));
    
    const summary = `[ACCIÓN DEL USUARIO] Acabo de completar un ejercicio de ${activity.durationMinutes} minuto(s) de ${activity.exerciseName}.`;
    handleNewConversationTurn({ role: 'user', text: summary });
    updateGardenGrowth(3);
    updateLastInteraction();
  };
  
  const handleAddReminder = async (text: string, time: string) => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Para recibir recordatorios, necesitas permitir las notificaciones en la configuración de tu navegador.');
            return;
        }
    }
    
    if (Notification.permission === 'denied') {
        alert('Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración de tu navegador para usar esta función.');
        return;
    }

    const newReminder: IReminder = { id: crypto.randomUUID(), text, time };
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
  };

  const handleDeleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
  };
  
  const handleAddThoughtLabEntry = (entry: IThoughtLabEntry) => {
    const updatedEntries = [entry, ...thoughtLabEntries];
    setThoughtLabEntries(updatedEntries);
    localStorage.setItem(THOUGHT_LAB_STORAGE_KEY, JSON.stringify(updatedEntries));
    updateGardenGrowth(5); 
    const summary = `[LABORATORIO DE PENSAMIENTOS] He analizado un pensamiento sobre "${entry.situation.substring(0, 50)}..." y he encontrado una alternativa: "${entry.alternativeThought.substring(0, 50)}...".`;
    handleNewConversationTurn({ role: 'user', text: summary });
  };
  
  const handleUpdateTrustCircleConfig = (config: ITrustCircleConfig) => {
    setTrustCircleConfig(config);
    localStorage.setItem(TRUST_CIRCLE_STORAGE_KEY, JSON.stringify(config));
    const summary = `[CÍRCULO DE CONFIANZA] He configurado mi Círculo de Confianza. Mi contacto de apoyo es ${config.contactName}.`;
    handleNewConversationTurn({ role: 'user', text: summary });
  };

  const handleLogDopamineHit = (hit: IDopamineHit) => {
    const updatedHits = [hit, ...dopamineHits.slice(0, 19)]; // Keep last 20
    setDopamineHits(updatedHits);
    localStorage.setItem(DOPAMINE_DIET_KEY, JSON.stringify(updatedHits));
    updateGardenGrowth(5);
    ttsService.speak(`Ritual completado: ${hit.activity}. ¡Excelente trabajo!`);
  };

  const handleAddHabitLoop = (loop: IHabitLoop) => {
    const updatedLoops = [loop, ...habitLoops];
    setHabitLoops(updatedLoops);
    localStorage.setItem(HABIT_LOOPS_KEY, JSON.stringify(updatedLoops));
    updateGardenGrowth(5);
    const summary = `[ARQUITECTO DE HÁBITOS] Acabo de rediseñar un hábito. Ante la señal de "${loop.cue}", en lugar de "${loop.oldRoutine}", mi nueva rutina será "${loop.newRoutine}".`;
    handleNewConversationTurn({ role: 'user', text: summary });
  };
  
  const handleUpdateGuardianConfig = (words: string[]) => {
      setGuardianTriggerWords(words);
      localStorage.setItem(GUARDIAN_CONFIG_KEY, JSON.stringify(words));
      const summary = `[MODO GUARDIÁN] He actualizado mis palabras clave de alerta.`;
      handleNewConversationTurn({ role: 'user', text: summary });
  };

  const handleUpdateMoodJournal = (journal: IMoodJournal | null) => {
      setMoodJournal(journal);
      if (journal) {
          localStorage.setItem(MOOD_JOURNAL_KEY, JSON.stringify(journal));
          const summary = `[DIARIO ANÍMICO] Acabo de registrar mi estado de ánimo. Me siento: "${journal.detectedMood}".`;
          handleNewConversationTurn({ role: 'user', text: summary });
          updateGardenGrowth(2);
      } else {
          localStorage.removeItem(MOOD_JOURNAL_KEY);
      }
  };


  // Guardian Mode Handlers
  const handleStartGuardian = async () => {
    if (!apiKey) {
        dispatchGuardian({ type: 'SET_ERROR', payload: 'La API Key no está configurada.' });
        setIsApiKeyModalOpen(true);
        return;
    }
    dispatchGuardian({ type: 'START' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const newSessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: { inputAudioTranscription: {} },
        callbacks: {
          onopen: () => {
            console.log('Guardian mode connection opened.');
            dispatchGuardian({ type: 'ACTIVATE' });
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            audioSourceRef.current = source;
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            audioProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              newSessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              dispatchGuardian({ type: 'APPEND_TRANSCRIPT', payload: text });
              
              if(hasPremiumAccess && guardianTriggerWords.length > 0) {
                 const lowerCaseText = text.toLowerCase();
                 const foundTrigger = guardianTriggerWords.some(word => lowerCaseText.includes(word.toLowerCase()));
                 if (foundTrigger && !triggerWordTimeoutRef.current) {
                     console.log("Trigger word detected!");
                     navigator.vibrate([100, 50, 100]); // Haptic alert
                     // Throttle alerts to once every 10 seconds
                     triggerWordTimeoutRef.current = window.setTimeout(() => {
                         triggerWordTimeoutRef.current = null;
                     }, 10000);
                 }
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Guardian mode error:', e);
            dispatchGuardian({ type: 'SET_ERROR', payload: 'Error de conexión del Modo Guardián.' });
            handleStopGuardian();
          },
          onclose: () => {
            console.log('Guardian mode connection closed.');
            if (triggerWordTimeoutRef.current) {
                clearTimeout(triggerWordTimeoutRef.current);
                triggerWordTimeoutRef.current = null;
            }
          }
        }
      });
      sessionPromiseRef.current = newSessionPromise;

    } catch (err) {
      console.error('Error getting microphone access:', err);
      dispatchGuardian({ type: 'SET_ERROR', payload: 'No se pudo acceder al micrófono.' });
    }
  };

  const handleStopGuardian = async () => {
    dispatchGuardian({ type: 'STOP' });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioSourceRef.current) audioSourceRef.current.disconnect();
    if (audioProcessorRef.current) audioProcessorRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      sessionPromiseRef.current = null;
    }
    
    const finalTranscript = guardianState.transcript;

    if (!finalTranscript.trim()) {
      dispatchGuardian({ type: 'RESET' });
      return;
    }
    
    dispatchGuardian({ type: 'START_ANALYSIS' });

    if (!hasPremiumAccess) {
        if (!checkAndConsumeUsage('guardian')) {
            dispatchGuardian({ type: 'SET_ANALYSIS', payload: { isLocked: true } });
            return;
        }
    }

    const prompt = `
        Eres Kai, un terapeuta experto en adicciones y TCC. Analiza la siguiente transcripción de una situación social de alto riesgo para un usuario. Tu objetivo es identificar patrones de comportamiento y pensamiento que llevaron a un posible consumo.

        TRANSCRIPCIÓN:
        "${finalTranscript}"

        Analiza la transcripción y extrae la siguiente información:
        1.  **trigger**: ¿Cuál fue el detonante principal? (Ej: "La conversación sobre problemas económicos generó estrés.")
        2.  **socialPressure**: ¿Hubo presión social? Descríbela. (Ej: "Juan le ofreció directamente y se burló cuando dudó.")
        3.  **justification**: ¿Qué justificaciones o pensamientos permisivos usó el usuario o otros para racionalizar el consumo? (Ej: "El usuario dijo 'solo por hoy no pasa nada' para minimizar las consecuencias.")
        4.  **turningPoint**: ¿Cuál fue el punto de inflexión donde la decisión de consumir se volvió casi inevitable? (Ej: "Cuando aceptó quedarse 'solo cinco minutos más' después de que sacaron la droga.")
        5.  **escapeStrategy**: ¿Qué estrategia concreta podría haber usado para evitar el consumo en esa situación? (Ej: "Podría haber dicho 'Tengo un compromiso temprano mañana, debo irme' en el momento en que la conversación se volvió incómoda.")

        Responde únicamente con un objeto JSON, sin explicaciones adicionales. El formato debe ser:
        {
          "trigger": "...",
          "socialPressure": "...",
          "justification": "...",
          "turningPoint": "...",
          "escapeStrategy": "..."
        }
    `;

    try {
        const response = await getGeminiResponse(apiKey, prompt);
        const cleanedResponse = response.replace(/```json\n|```/g, '').trim();
        const parsedAnalysis: IGuardianAnalysis = JSON.parse(cleanedResponse);
        dispatchGuardian({ type: 'SET_ANALYSIS', payload: parsedAnalysis });
        const summary = `[MODO GUARDIÁN] Acabo de usar el Modo Guardián. Kai analizó la situación. El detonante principal fue: "${parsedAnalysis.trigger}".`;
        handleNewConversationTurn({ role: 'user', text: summary });
    } catch(error) {
        console.error("Error parsing guardian analysis:", error);
        const errorAnalysis: IGuardianAnalysis = {
            trigger: "Error",
            socialPressure: "Error",
            justification: "Error",
            turningPoint: "Error",
            escapeStrategy: "No se pudo procesar el análisis de la transcripción. Por favor, inténtalo de nuevo."
        };
        dispatchGuardian({ type: 'SET_ANALYSIS', payload: errorAnalysis });
    }
  };

  // Therapy Session Handlers
  const handleSaveTherapySession = (session: ITherapySession) => {
    if (!hasPremiumAccess && !therapyTrialUsed) {
        setTherapyTrialUsed(true);
        localStorage.setItem(THERAPY_TRIAL_USED_KEY, 'true');
    }
    const updatedSessions = [session, ...therapySessions];
    setTherapySessions(updatedSessions);
    localStorage.setItem(THERAPY_SESSIONS_KEY, JSON.stringify(updatedSessions));
    updateGardenGrowth(15);
    const summary = `[SESIÓN PRIVADA] Acabo de completar una sesión de terapia sobre ${session.mode}. El principal insight fue: "${session.summary.insights.substring(0, 80)}..."`;
    handleNewConversationTurn({ role: 'user', text: summary });
    setIsTherapyModalOpen(false);
  };

  const handleDeleteTherapyHistory = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar TODO tu historial de sesiones privadas? Esta acción es irreversible.")) {
        setTherapySessions([]);
        localStorage.removeItem(THERAPY_SESSIONS_KEY);
    }
  };
  
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  if (isOnboardingOpen || !onboardingData) {
      return <OnboardingModal onSave={handleSaveOnboarding} />;
  }
  
  if (!apiKey && isApiKeyModalOpen) {
      return <ApiKeyModal onClose={() => { if(getApiKey()) setIsApiKeyModalOpen(false) }} onSave={handleSaveApiKey} />;
  }


  const renderView = () => {
    switch(activeView) {
      case 'home':
        return <HomeView 
                  apiKey={apiKey}
                  startDate={startDate}
                  daysSober={daysSober}
                  onStartDate={handleStartDate}
                  onReset={handleResetProgress}
                  onLogWellnessActivity={handleLogWellnessActivity}
                  onboardingData={onboardingData}
                  guardianState={guardianState}
                  onStartGuardian={handleStartGuardian}
                  onStopGuardian={handleStopGuardian}
                  dopamineHits={dopamineHits}
                  onLogDopamineHit={handleLogDopamineHit}
                  guardianTriggerWords={guardianTriggerWords}
                  onUpdateGuardianConfig={handleUpdateGuardianConfig}
                  isSubscribed={hasPremiumAccess}
                  moodJournal={moodJournal}
                  onUpdateMoodJournal={handleUpdateMoodJournal}
                  usageTracker={usageTracker}
                />;
      case 'kai':
        return <KaiView 
                  apiKey={apiKey}
                  conversation={conversation}
                  onNewTurn={handleNewConversationTurn}
                  onboardingData={onboardingData}
                  kaiMemory={kaiMemory}
                  isSubscribed={hasPremiumAccess}
                  onRequestMemoryUpdate={handleRequestMemoryUpdate}
                  isTherapyModalOpen={isTherapyModalOpen}
                  onOpenTherapyModal={() => setIsTherapyModalOpen(true)}
                  onCloseTherapyModal={() => setIsTherapyModalOpen(false)}
                  onSaveTherapySession={handleSaveTherapySession}
                  therapyTrialUsed={therapyTrialUsed}
                  usageTracker={usageTracker}
                  checkAndConsumeUsage={checkAndConsumeUsage}
                  onClearChat={handleClearChat}
                />;
      case 'tools':
        return <ToolsView
                  apiKey={apiKey}
                  goals={goals}
                  onGenerateGoal={handleGenerateGoal}
                  isGoalsLoading={isGoalsLoading}
                  cravings={cravings}
                  onLogCraving={handleLogCraving}
                  journalEntry={journalEntry}
                  onJournalChange={handleJournalChange}
                  onJournalSave={handleJournalSave}
                  reminders={reminders}
                  onAddReminder={handleAddReminder}
                  onDeleteReminder={handleDeleteReminder}
                  thoughtLabEntries={thoughtLabEntries}
                  onAddThoughtLabEntry={handleAddThoughtLabEntry}
                  habitLoops={habitLoops}
                  onAddHabitLoop={handleAddHabitLoop}
                  isSubscribed={hasPremiumAccess}
                />;
      case 'progress':
        return <ProgressView 
                  apiKey={apiKey}
                  cravings={cravings}
                  journalEntry={journalEntry}
                  wellnessLog={wellnessLog}
                  daysSober={daysSober}
                  onboardingData={onboardingData}
                  isSubscribed={hasPremiumAccess}
                  gardenGrowthPoints={gardenGrowthPoints}
                  trustCircleConfig={trustCircleConfig}
                  onUpdateTrustCircleConfig={handleUpdateTrustCircleConfig}
                  dopamineHits={dopamineHits}
                  therapySessions={therapySessions}
                  onDeleteTherapyHistory={handleDeleteTherapyHistory}
                  usageTracker={usageTracker}
                  checkAndConsumeUsage={checkAndConsumeUsage}
                />;
      default:
        return <HomeView 
                  apiKey={apiKey}
                  startDate={startDate}
                  daysSober={daysSober}
                  onStartDate={handleStartDate}
                  onReset={handleResetProgress}
                  onLogWellnessActivity={handleLogWellnessActivity}
                  onboardingData={onboardingData}
                  guardianState={guardianState}
                  onStartGuardian={handleStartGuardian}
                  onStopGuardian={handleStopGuardian}
                  dopamineHits={dopamineHits}
                  onLogDopamineHit={handleLogDopamineHit}
                  guardianTriggerWords={guardianTriggerWords}
                  onUpdateGuardianConfig={handleUpdateGuardianConfig}
                  isSubscribed={hasPremiumAccess}
                  moodJournal={moodJournal}
                  onUpdateMoodJournal={handleUpdateMoodJournal}
                  usageTracker={usageTracker}
                />;
    }
  }
  
  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col">
      {isApiKeyModalOpen && <ApiKeyModal onClose={() => { if(getApiKey()) setIsApiKeyModalOpen(false) }} onSave={handleSaveApiKey} />}
      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />}
      <Header 
        onSettingsClick={() => setIsSettingsModalOpen(true)} 
        onboardingData={onboardingData} 
        onDevClick={handleToggleDevMode}
        isDevMode={isDevMode}
      />
      
      <main className="flex-grow overflow-y-auto p-4 md:p-6 w-full max-w-screen-2xl mx-auto pb-24">
        {onboardingData.focuses.includes('addiction') && <SOSCard />}
        <div className="mt-6">
          {renderView()}
        </div>
      </main>

      <NavigationBar activeView={activeView} setActiveView={setActiveView} />

      <footer className="text-center p-4 text-slate-500 text-sm hidden">
        <p>Cada momento es una elección. Estás eligiendo bien.</p>
      </footer>
    </div>
  );
};

export default App;