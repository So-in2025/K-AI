import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useReducer } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { createUserProfileDocument, getUserProfile, updateUserProfile } from '../services/firestoreService';
import { GeminiService } from '../services/geminiService';
import { ICraving, IConversationTurn, IUserProfile, FeatureID, UsageTracker, IGoal, GoalType, IWellnessActivity, IReminder, IThoughtLabEntry, ITrustCircleConfig, IDopamineHit, IHabitLoop, IMoodJournal, ITherapySession, GuardianAnalysisResult, IGuardianAnalysis, OnboardingData } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Guardian Mode Types (kept with context as it's complex state) ---
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
        case 'START': return { ...state, status: 'starting', analysis: null, transcript: '', error: null };
        case 'ACTIVATE': return { ...state, status: 'active' };
        case 'APPEND_TRANSCRIPT': return { ...state, transcript: state.transcript + action.payload };
        case 'STOP': return { ...state, status: 'stopping' };
        case 'START_ANALYSIS': return { ...state, status: 'analyzing' };
        case 'SET_ANALYSIS': return { ...state, status: 'idle', analysis: action.payload, transcript: '' };
        case 'SET_ERROR': return { ...state, status: 'error', error: action.payload };
        case 'RESET': return initialGuardianState;
        default: return state;
    }
}

// Helper to encode audio data for Gemini Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Context Definition ---
interface UserContextType {
    user: User | null;
    userData: IUserProfile | null;
    loading: boolean;
    geminiService: GeminiService | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserData: (data: Partial<IUserProfile>) => Promise<void>;
    daysSober: number;
    
    // Actions
    addConversationTurn: (turn: IConversationTurn) => void;
    clearKaiChat: () => void;
    logCraving: (craving: ICraving) => void;
    startProgress: () => void;
    resetProgress: () => void;
    generateGoal: (type: GoalType) => Promise<void>;
    logWellnessActivity: (activity: IWellnessActivity) => void;
    addReminder: (text: string, time: string) => Promise<void>;
    deleteReminder: (id: string) => void;
    addThoughtLabEntry: (entry: IThoughtLabEntry) => void;
    updateTrustCircleConfig: (config: ITrustCircleConfig) => void;
    logDopamineHit: (hit: IDopamineHit) => void;
    addHabitLoop: (loop: IHabitLoop) => void;
    updateGuardianConfig: (config: Partial<Pick<IUserProfile, 'guardianTriggerWords' | 'guardianAutoStopTimer' | 'guardianVibrationFeedback'>>) => void;
    updateMoodJournal: (journal: IMoodJournal | null) => void;
    saveTherapySession: (session: ITherapySession) => void;
    deleteTherapyHistory: () => void;
    updateKaiMemory: () => Promise<void>;
    
    // Usage Tracking
    checkAndConsumeUsage: (featureId: FeatureID, limit?: number) => boolean;

    // Guardian Mode State & Actions
    guardianState: GuardianState;
    startGuardian: () => void;
    stopGuardian: () => void;
    resetGuardian: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [geminiService, setGeminiService] = useState<GeminiService | null>(null);

    // --- Guardian Mode ---
    const [guardianState, dispatchGuardian] = useReducer(guardianReducer, initialGuardianState);
    const guardianTranscriptRef = React.useRef(guardianState.transcript);
    useEffect(() => { guardianTranscriptRef.current = guardianState.transcript; }, [guardianState.transcript]);
    const sessionPromiseRef = React.useRef<Promise<any> | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const audioProcessorRef = React.useRef<ScriptProcessorNode | null>(null);
    const audioSourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
    const triggerWordTimeoutRef = React.useRef<number | null>(null);
    const lastTranscriptTimeRef = React.useRef<number | null>(null);
    const autoStopCheckIntervalRef = React.useRef<number | null>(null);

    // Fix: Move daysSober declaration before its usage in generateGoal
    const daysSober = React.useMemo(() => {
        if (!userData?.startDate) return 0;
        const start = new Date(userData.startDate);
        const today = new Date();
        start.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - start.getTime();
        if (diffTime < 0) return 0;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [userData?.startDate]);

    const updateUserData = useCallback(async (data: Partial<IUserProfile>) => {
        if (user && db) {
            // Optimistic update of local state
            const newUserData = { ...(userData as IUserProfile), ...data };
            setUserData(newUserData);
            
            // If API key changes, re-initialize the service
            if (data.geminiApiKey && data.geminiApiKey !== userData?.geminiApiKey) {
                setGeminiService(new GeminiService(data.geminiApiKey));
            }
            // Persist to Firestore
            await updateUserProfile(user.uid, data);
        }
    }, [user, userData]);

    const checkSubscriptionActivation = useCallback(async () => {
        const activationCode = localStorage.getItem('activationCode');
        if (activationCode && user && !userData?.isSubscribed) {
            try {
                const response = await fetch('/.netlify/functions/check-activation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: activationCode }),
                });

                if (response.ok) {
                    const { activated } = await response.json();
                    if (activated) {
                        await updateUserData({ isSubscribed: true });
                        localStorage.removeItem('activationCode');
                        alert("¡Felicidades! KIA Plus ha sido activado en tu cuenta.");
                    }
                }
            } catch (error) {
                console.error("Error al verificar la activación de la suscripción:", error);
            }
        }
    }, [user, userData?.isSubscribed, updateUserData]);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            setLoading(true);
            if (userAuth && db) {
                await createUserProfileDocument(userAuth);
                const profile = await getUserProfile(userAuth.uid);
                setUser(userAuth);
                setUserData(profile);
                
                if (profile?.geminiApiKey) {
                    setGeminiService(new GeminiService(profile.geminiApiKey));
                } else {
                    setGeminiService(null);
                }

            } else {
                setUser(null);
                setUserData(null);
                setGeminiService(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && userData) {
            checkSubscriptionActivation();
        }
    }, [user, userData, checkSubscriptionActivation]);

    const login = async () => {
        if (!auth || !googleProvider) throw new Error("Firebase Auth no está inicializado.");
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error durante el inicio de sesión:", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error durante el cierre de sesión:", error);
        }
    };
    
    // --- Business Logic / Actions ---

    const addConversationTurn = useCallback((turn: IConversationTurn) => {
        if (!userData) return;
        const newConversation = [...(userData.kaiConversation || []), turn];
        updateUserData({ kaiConversation: newConversation });
    }, [userData, updateUserData]);
    
    const clearKaiChat = useCallback(() => {
       if (window.confirm("¿Estás seguro de que quieres borrar todo el historial de esta conversación?")) {
            updateUserData({ kaiConversation: [] });
       }
    }, [updateUserData]);

    const logCraving = useCallback((cravingData: ICraving) => {
        if (!userData) return;
        const updatedCravings = [cravingData, ...(userData.cravings || [])];
        updateUserData({ cravings: updatedCravings });
        const summary = `[ANTOJO REGISTRADO] Intensidad: ${cravingData.intensity}. Detonantes: ${cravingData.triggers.join(', ')}. Estrategia: ${cravingData.copingStrategy}.${cravingData.note ? ` Nota: ${cravingData.note}` : ''}`;
        addConversationTurn({ role: 'user', text: summary });
    }, [userData, updateUserData, addConversationTurn]);

    const startProgress = useCallback(() => {
        updateUserData({ startDate: new Date().toISOString(), gardenGrowthPoints: 0 });
        addConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de empezar mi contador de progreso hoy.' });
    }, [updateUserData, addConversationTurn]);

    const resetProgress = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.")) {
            updateUserData({ startDate: null, gardenGrowthPoints: 0 });
            addConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de reiniciar mi progreso.' });
        }
    }, [updateUserData, addConversationTurn]);
    
    const updateGardenGrowth = useCallback((points: number) => {
        if (!userData) return;
        const newPoints = (userData.gardenGrowthPoints || 0) + points;
        updateUserData({ gardenGrowthPoints: newPoints });
        // Toast logic should be handled in UI, not context
    }, [userData, updateUserData]);

    const generateGoal = useCallback(async (type: GoalType) => {
        if (!userData?.onboardingData || !geminiService) return;
        const prompt = `Actúa como un coach de bienestar. Basado en los siguientes datos de un usuario, crea una meta ${type} específica, medible, alcanzable, relevante y con un plazo determinado (SMART).
        - Enfoque del usuario: ${userData.onboardingData.focuses.join(', ')}
        - Días de progreso: ${daysSober}
        - Antojos recientes: ${userData.cravings?.slice(0, 3).map(c => `Intensidad ${c.intensity} detonado por ${c.triggers.join(', ')}`).join('; ') || 'Ninguno'}
        - Diario reciente: "${(userData.journalEntry || '').substring(0, 100)}..."
        La meta debe ser una sola frase corta y accionable. No incluyas explicaciones ni la palabra "Meta:".
        Ejemplo: "Hoy, dedica 5 minutos a la respiración consciente cuando sientas estrés."
        Responde ahora:`;
        
        try {
            const content = await geminiService.generateContent(prompt);
            const newGoal: IGoal = { type, content };
            const otherGoals = (userData.goals || []).filter(g => g.type !== type);
            const newGoals = [...otherGoals, newGoal];
            updateUserData({ goals: newGoals });
            addConversationTurn({ role: 'user', text: `[META CREADA - ${type}] He creado una nueva meta: "${content}"` });
        } catch(e) { console.error("Error al generar la meta", e); }
    }, [userData, geminiService, updateUserData, addConversationTurn, daysSober]);

    const logWellnessActivity = useCallback((activity: IWellnessActivity) => {
        if (!userData) return;
        const updatedLog = [activity, ...(userData.wellnessLog || [])];
        updateUserData({ wellnessLog: updatedLog });
        updateGardenGrowth(3);
        addConversationTurn({ role: 'user', text: `[ACCIÓN DEL USUARIO] Acabo de completar un ejercicio de ${activity.durationMinutes} minuto(s) de ${activity.exerciseName}.` });
    }, [userData, updateUserData, addConversationTurn, updateGardenGrowth]);

    const addReminder = useCallback(async (text: string, time: string) => {
        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Para recibir recordatorios, necesitas permitir las notificaciones.');
                return;
            }
        }
        const newReminder: IReminder = { id: crypto.randomUUID(), text, time };
        const updatedReminders = [...(userData?.reminders || []), newReminder];
        updateUserData({ reminders: updatedReminders });
    }, [userData, updateUserData]);
    
    const deleteReminder = useCallback((id: string) => {
        if (!userData) return;
        const updatedReminders = (userData.reminders || []).filter(r => r.id !== id);
        updateUserData({ reminders: updatedReminders });
    }, [userData, updateUserData]);
    
    const addThoughtLabEntry = useCallback((entry: IThoughtLabEntry) => {
        if (!userData) return;
        const updatedEntries = [entry, ...(userData.thoughtLabEntries || [])];
        updateUserData({ thoughtLabEntries: updatedEntries });
        updateGardenGrowth(5); 
        const summary = `[LABORATORIO DE PENSAMIENTOS] He analizado un pensamiento sobre "${entry.situation.substring(0, 50)}..." y he encontrado una alternativa: "${entry.alternativeThought.substring(0, 50)}...".`;
        addConversationTurn({ role: 'user', text: summary });
    }, [userData, updateUserData, addConversationTurn, updateGardenGrowth]);

    const updateTrustCircleConfig = useCallback((config: ITrustCircleConfig) => {
        updateUserData({ trustCircleConfig: config });
        const summary = `[CÍRCULO DE CONFIANZA] He configurado mi Círculo de Confianza. Mi contacto de apoyo es ${config.contactName}.`;
        addConversationTurn({ role: 'user', text: summary });
    }, [updateUserData, addConversationTurn]);

    const logDopamineHit = useCallback((hit: IDopamineHit) => {
        if (!userData) return;
        const updatedHits = [hit, ...(userData.dopamineHits || []).slice(0, 19)]; // Keep last 20
        updateUserData({ dopamineHits: updatedHits });
        updateGardenGrowth(5);
    }, [userData, updateUserData, updateGardenGrowth]);
    
    const addHabitLoop = useCallback((loop: IHabitLoop) => {
        if (!userData) return;
        const updatedLoops = [loop, ...(userData.habitLoops || [])];
        updateUserData({ habitLoops: updatedLoops });
        updateGardenGrowth(5);
        const summary = `[ARQUITECTO DE HÁBITOS] Acabo de rediseñar un hábito. Ante la señal de "${loop.cue}", en lugar de "${loop.oldRoutine}", mi nueva rutina será "${loop.newRoutine}".`;
        addConversationTurn({ role: 'user', text: summary });
    }, [userData, updateUserData, addConversationTurn, updateGardenGrowth]);

    const updateGuardianConfig = useCallback((config: Partial<Pick<IUserProfile, 'guardianTriggerWords' | 'guardianAutoStopTimer' | 'guardianVibrationFeedback'>>) => {
        updateUserData(config);
        addConversationTurn({ role: 'user', text: `[MODO GUARDIÁN] He actualizado mi configuración del Modo Guardián.` });
    }, [updateUserData, addConversationTurn]);

    const updateMoodJournal = useCallback((journal: IMoodJournal | null) => {
        updateUserData({ moodJournal: journal });
        if (journal) {
            updateGardenGrowth(2);
            const summary = `[DIARIO ANÍMICO] Acabo de registrar mi estado de ánimo. Me siento: "${journal.detectedMood}".`;
            addConversationTurn({ role: 'user', text: summary });
        }
    }, [updateUserData, addConversationTurn, updateGardenGrowth]);
    
    const saveTherapySession = useCallback((session: ITherapySession) => {
        if (!userData) return;
        if (!userData.isSubscribed && !userData.therapyTrialUsed) {
            updateUserData({ therapyTrialUsed: true });
        }
        const updatedSessions = [session, ...(userData.therapySessions || [])];
        updateUserData({ therapySessions: updatedSessions });
        updateGardenGrowth(15);
        const summary = `[SESIÓN PRIVADA] Acabo de completar una sesión de terapia sobre ${session.mode}. El principal insight fue: "${session.summary.insights.substring(0, 80)}..."`;
        addConversationTurn({ role: 'user', text: summary });
    }, [userData, updateUserData, addConversationTurn, updateGardenGrowth]);
    
    const deleteTherapyHistory = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres borrar TODO tu historial de sesiones privadas? Esta acción es irreversible.")) {
            updateUserData({ therapySessions: [] });
        }
    }, [updateUserData]);
    
    const updateKaiMemory = useCallback(async () => {
        if (!userData?.isSubscribed || !geminiService) return;

        const recentConversation = (userData.kaiConversation || []).slice(-10).map(t => `${t.role}: ${t.text}`).join('\n');
        const prompt = `Eres un sistema de memoria. Tu tarea es analizar la memoria existente y la conversación reciente de un usuario, y luego generar una versión actualizada y concisa de la memoria. La memoria debe ser un resumen de los puntos clave, patrones, logros y desafíos del usuario, en no más de 150 palabras.
        MEMORIA EXISTENTE: "${userData.kaiMemory || 'No hay memoria previa.'}"
        CONVERSACIÓN RECIENTE (últimos 10 turnos): "${recentConversation}"
        Extrae los insights más importantes de la conversación reciente e intégralos en la memoria existente. Elimina detalles obsoletos o irrelevantes. La nueva memoria debe ser un párrafo coherente.
        NUEVA MEMORIA ACTUALIZADA:`;

        try {
            const newMemory = await geminiService.generateContent(prompt);
            updateUserData({ kaiMemory: newMemory });
        } catch (e) { console.error("Error al actualizar la memoria de Kai:", e); }
    }, [userData, geminiService, updateUserData]);

    const checkAndConsumeUsage = useCallback((featureId: FeatureID, limit: number = 1): boolean => {
        if (userData?.isSubscribed) return true;
        if (!userData) return false;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const initialTracker: UsageTracker = { guardian: { count: 0, month: -1, year: 0 }, weekly_analysis: { count: 0, month: -1, year: 0 }, oracle: { count: 0, month: -1, year: 0 }, thought_lab: { count: 0, month: -1, year: 0 }, habit_architect: { count: 0, month: -1, year: 0 }, affirmation_generator: { count: 0, month: -1, year: 0 }, soundtrack: { count: 0, month: -1, year: 0 } };

        const tracker: UsageTracker = { ...initialTracker, ...(userData.usageTracker || {}) };
        
        let featureUsage = tracker[featureId];
        if (!featureUsage || featureUsage.year !== currentYear || featureUsage.month !== currentMonth) {
            featureUsage = { count: 0, month: currentMonth, year: currentYear };
        }

        if (featureUsage.count < limit) {
            featureUsage.count += 1;
            const newTracker = { ...tracker, [featureId]: featureUsage };
            updateUserData({ usageTracker: newTracker });
            return true;
        } else {
            alert(`Has usado tu límite de ${limit} ${limit > 1 ? 'usos' : 'uso'} gratuito de esta herramienta este mes. Actualiza a KIA Plus para usos ilimitados.`);
            return false;
        }
    }, [userData, updateUserData]);

    // --- Guardian Mode Logic ---
     const stopGuardian = useCallback(async () => {
        dispatchGuardian({ type: 'STOP' });

        if (autoStopCheckIntervalRef.current) clearInterval(autoStopCheckIntervalRef.current);
        autoStopCheckIntervalRef.current = null;
        lastTranscriptTimeRef.current = null;

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        audioSourceRef.current?.disconnect();
        audioProcessorRef.current?.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close(); }

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error al cerrar la sesión", e); }
            sessionPromiseRef.current = null;
        }
        
        const transcript = guardianTranscriptRef.current;
        if (!transcript.trim()) {
            dispatchGuardian({ type: 'RESET' });
            return;
        }
        
        dispatchGuardian({ type: 'START_ANALYSIS' });

        if (!userData?.isSubscribed) {
            if (!checkAndConsumeUsage('guardian')) {
                dispatchGuardian({ type: 'SET_ANALYSIS', payload: { isLocked: true } });
                return;
            }
        }
        
        let analysisPrompt = `Eres Kai, un terapeuta experto en adicciones y TCC. Analiza la siguiente transcripción de una situación social de alto riesgo.
            TRANSCRIPCIÓN: "${transcript}"
            Analiza y extrae un objeto JSON con: "trigger" (detonante principal), "socialPressure" (presión social), "justification" (pensamientos permisivos), "turningPoint" (punto de inflexión), y "escapeStrategy" (estrategia de evitación).`;
        // ... more dynamic prompts based on onboardingData if needed ...

        try {
            if (!geminiService) throw new Error("El servicio de Gemini no está disponible");
            const response = await geminiService.generateContent(analysisPrompt, undefined, true);
            const parsedAnalysis: IGuardianAnalysis = JSON.parse(response);
            dispatchGuardian({ type: 'SET_ANALYSIS', payload: parsedAnalysis });
            addConversationTurn({ role: 'user', text: `[MODO GUARDIÁN] Acabo de usar el Modo Guardián. Kai analizó la situación.` });
        } catch (error) {
            console.error("Error al analizar el análisis del guardián:", error);
            dispatchGuardian({ type: 'SET_ERROR', payload: 'No se pudo procesar el análisis.' });
        }
    }, [userData, geminiService, addConversationTurn, checkAndConsumeUsage]);

    const startGuardian = async () => {
        if (!userData?.geminiApiKey) {
            dispatchGuardian({ type: 'SET_ERROR', payload: 'La API Key no está configurada.' });
            return;
        }
        dispatchGuardian({ type: 'START' });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: userData.geminiApiKey });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { inputAudioTranscription: {} },
                callbacks: {
                    onopen: () => {
                        dispatchGuardian({ type: 'ACTIVATE' });
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        audioSourceRef.current = source;
                        const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        audioProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
                            const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            newSessionPromise.then((session) => { session.sendRealtimeInput({ media: pcmBlob }); });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current!.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            if (text.trim()) {
                                lastTranscriptTimeRef.current = Date.now();
                                dispatchGuardian({ type: 'APPEND_TRANSCRIPT', payload: text });
                                if (userData.isSubscribed && userData.guardianVibrationFeedback && (userData.guardianTriggerWords || []).length > 0) {
                                    const lowerCaseText = text.toLowerCase();
                                    const foundTrigger = (userData.guardianTriggerWords || []).some(word => lowerCaseText.includes(word.toLowerCase()));
                                    if (foundTrigger && !triggerWordTimeoutRef.current) {
                                        navigator.vibrate?.([100, 50, 100]);
                                        triggerWordTimeoutRef.current = window.setTimeout(() => { triggerWordTimeoutRef.current = null; }, 10000);
                                    }
                                }
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        dispatchGuardian({ type: 'SET_ERROR', payload: 'Error de conexión del Modo Guardián.' });
                        stopGuardian();
                    },
                    onclose: () => {
                        if (triggerWordTimeoutRef.current) { clearTimeout(triggerWordTimeoutRef.current); triggerWordTimeoutRef.current = null; }
                        if (autoStopCheckIntervalRef.current) clearInterval(autoStopCheckIntervalRef.current);
                    }
                }
            });
            sessionPromiseRef.current = newSessionPromise;

            // Start auto-stop timer if configured
            if (userData.guardianAutoStopTimer && userData.guardianAutoStopTimer > 0) {
                lastTranscriptTimeRef.current = Date.now(); // Initialize timer
                const silenceDurationMs = userData.guardianAutoStopTimer * 60 * 1000;
                autoStopCheckIntervalRef.current = window.setInterval(() => {
                    if (lastTranscriptTimeRef.current && (Date.now() - lastTranscriptTimeRef.current > silenceDurationMs)) {
                        stopGuardian();
                    }
                }, 5000); // Check every 5 seconds
            }

        } catch (err: any) {
            let errorMessage = 'No se pudo acceder al micrófono.';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Permiso de micrófono denegado. Por favor, actívalo en la configuración de tu navegador.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No se encontró un micrófono en tu dispositivo.';
            }
            dispatchGuardian({ type: 'SET_ERROR', payload: errorMessage });
        }
    };

    const resetGuardian = useCallback(() => {
        dispatchGuardian({type: 'RESET' });
    }, []);

    const value = {
        user,
        userData,
        loading,
        geminiService,
        login,
        logout,
        updateUserData,
        daysSober,
        addConversationTurn,
        clearKaiChat,
        logCraving,
        startProgress,
        resetProgress,
        generateGoal,
        logWellnessActivity,
        addReminder,
        deleteReminder,
        addThoughtLabEntry,
        updateTrustCircleConfig,
        logDopamineHit,
        addHabitLoop,
        updateGuardianConfig,
        updateMoodJournal,
        saveTherapySession,
        deleteTherapyHistory,
        updateKaiMemory,
        checkAndConsumeUsage,
        guardianState,
        startGuardian,
        stopGuardian,
        resetGuardian,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};