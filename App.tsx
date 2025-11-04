
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SOSCard } from './components/SOSCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { NavigationBar, View } from './components/NavigationBar';
import { HomeView } from './views/HomeView';
import { KaiView } from './views/KaiView';
import { ToolsView } from './views/ToolsView';
import { ProgressView } from './views/ProgressView';
import { ICraving, IConversationTurn, IGoal, GoalType, IWellnessActivity, UserFocus, IGuardianAnalysis } from './types';
import { getApiKey, getGeminiResponse } from './services/geminiService';
import ttsService from './services/ttsService';
import { OnboardingModal } from './components/OnboardingModal';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';


const CRAVINGS_STORAGE_KEY = 'cravingsHistory';
const PROGRESS_STORAGE_KEY = 'sobrietyStartDate';
const JOURNAL_STORAGE_KEY = 'journalEntry';
const WELLNESS_LOG_STORAGE_KEY = 'wellnessLog';
const LAST_INTERACTION_KEY = 'lastInteractionTimestamp';
const USER_FOCUS_STORAGE_KEY = 'userFocus';

// Helper to encode audio data for Gemini Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  
  const [userFocus, setUserFocus] = useState<UserFocus[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const [cravings, setCravings] = useState<ICraving[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [daysSober, setDaysSober] = useState<number>(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [conversation, setConversation] = useState<IConversationTurn[]>([]);
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [wellnessLog, setWellnessLog] = useState<IWellnessActivity[]>([]);

  // Guardian Mode State
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const [guardianTranscript, setGuardianTranscript] = useState('');
  const [guardianAnalysis, setGuardianAnalysis] = useState<IGuardianAnalysis | null>(null);
  const [isGuardianLoading, setIsGuardianLoading] = useState(false);
  const [sessionPromise, setSessionPromise] = useState<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const updateLastInteraction = useCallback(() => {
    localStorage.setItem(LAST_INTERACTION_KEY, new Date().toISOString());
  }, []);

  useEffect(() => {
    const existingApiKey = getApiKey();
    if (existingApiKey) {
      setApiKey(existingApiKey);
    } else {
      setIsApiKeyModalOpen(true);
    }

     try {
        const storedFocus = localStorage.getItem(USER_FOCUS_STORAGE_KEY);
        if (storedFocus) {
            const parsedFocus = JSON.parse(storedFocus);
            if (Array.isArray(parsedFocus) && parsedFocus.length > 0) {
                 setUserFocus(parsedFocus);
            } else {
                 setIsOnboardingOpen(true);
            }
        } else {
            setIsOnboardingOpen(true);
        }
    } catch(e) {
        console.error("Failed to read user focus", e);
        setIsOnboardingOpen(true);
    }

    ttsService.init();
    updateLastInteraction();
  }, [updateLastInteraction]);
  
  useEffect(() => {
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

    if (userFocus.includes('addiction')) {
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

  }, [cravings, daysSober, userFocus]);


  const calculateDaysSober = useCallback((start: Date) => {
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysSober(diffDays);
  }, []);

  useEffect(() => {
    try {
      const storedCravings = localStorage.getItem(CRAVINGS_STORAGE_KEY);
      if (storedCravings) setCravings(JSON.parse(storedCravings));
    } catch (error) { console.error("Failed to parse cravings from localStorage", error); }

    const storedDate = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (storedDate) {
      const date = new Date(storedDate);
      setStartDate(date);
      calculateDaysSober(date);
    }

    const savedEntry = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (savedEntry) setJournalEntry(savedEntry);
    
    try {
        const storedLog = localStorage.getItem(WELLNESS_LOG_STORAGE_KEY);
        if (storedLog) setWellnessLog(JSON.parse(storedLog));
    } catch (error) { console.error("Failed to parse wellness log from localStorage", error); }

  }, [calculateDaysSober]);

  const handleSaveFocus = (focuses: UserFocus[]) => {
      setUserFocus(focuses);
      localStorage.setItem(USER_FOCUS_STORAGE_KEY, JSON.stringify(focuses));
      setIsOnboardingOpen(false);
  };

  const handleSaveApiKey = (key: string, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('geminiApiKey', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const handleOpenApiKeyModal = () => setIsApiKeyModalOpen(true);
  
  const handleNewConversationTurn = useCallback((turn: IConversationTurn) => {
    setConversation(prev => [...prev, turn]);
    if(turn.role === 'user') {
        updateLastInteraction();
        setActiveView('kai');
    }
  }, [updateLastInteraction]);
  
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
    handleNewConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de empezar mi contador de progreso hoy.' });
  };

  const handleResetProgress = () => {
     if (window.confirm("¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.")) {
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
        setStartDate(null);
        setDaysSober(0);
        handleNewConversationTurn({ role: 'user', text: '[ACCIÓN DEL USUARIO] Acabo de reiniciar mi progreso.' });
    }
  };

  const handleJournalChange = (newEntry: string) => {
    setJournalEntry(newEntry);
    localStorage.setItem(JOURNAL_STORAGE_KEY, newEntry);
    updateLastInteraction();
  };

  const handleJournalSave = () => {
    const summary = `[ENTRADA DE DIARIO GUARDADA] "${journalEntry.substring(0, 100)}..."`;
    handleNewConversationTurn({ role: 'user', text: summary });
    ttsService.speak("Diario guardado. Reflexionar es un paso poderoso en tu camino.");
  };
  
  const handleGenerateGoal = async (type: GoalType) => {
    setIsGoalsLoading(true);
    ttsService.speak(`Creando tu meta ${type === 'daily' ? 'diaria' : type === 'weekly' ? 'semanal' : 'mensual'}...`);
    
    const prompt = `
        Actúa como un coach de bienestar. Basado en los siguientes datos de un usuario, crea una meta ${type} específica, medible, alcanzable, relevante y con un plazo determinado (SMART).
        - Enfoque del usuario: ${userFocus.join(', ')}
        - Días de progreso: ${daysSober}
        - Antojos recientes: ${cravings.slice(0, 3).map(c => `Intensidad ${c.intensity} detonado por ${c.triggers.join(', ')}`).join('; ') || 'Ninguno'}
        - Diario reciente: "${journalEntry.substring(0, 100)}..."

        La meta debe ser una sola frase corta y accionable. No incluyas explicaciones ni la palabra "Meta:".
        Ejemplo: "Hoy, dedica 5 minutos a la respiración consciente cuando sientas estrés."
        Responde ahora:
    `;
    
    const content = await getGeminiResponse(prompt);
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
    ttsService.speak("Excelente trabajo. Has completado tu ejercicio. Cada práctica es un paso hacia tu bienestar.");
    updateLastInteraction();
  };

  // Guardian Mode Handlers
  const handleStartGuardian = async () => {
    if (!apiKey) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const newSessionPromise = ai.live.connect({
        // FIX: Added the required 'model' property for the Live API connection.
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: { inputAudioTranscription: {} },
        callbacks: {
          onopen: () => {
            console.log('Guardian mode connection opened.');
            setIsGuardianActive(true);
            setGuardianAnalysis(null);
            setGuardianTranscript('');

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
              setGuardianTranscript(prev => prev + text);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Guardian mode error:', e);
            handleStopGuardian();
          },
          onclose: () => {
            console.log('Guardian mode connection closed.');
          }
        }
      });
      setSessionPromise(newSessionPromise);

    } catch (err) {
      console.error('Error getting microphone access:', err);
      alert("No se pudo acceder al micrófono. Por favor, revisa los permisos.");
    }
  };

  const handleStopGuardian = async () => {
    setIsGuardianActive(false);
    setIsGuardianLoading(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioSourceRef.current) audioSourceRef.current.disconnect();
    if (audioProcessorRef.current) audioProcessorRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }


    if (sessionPromise) {
      try {
        const session = await sessionPromise;
        session.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      setSessionPromise(null);
    }
    
    if (!guardianTranscript.trim()) {
      setGuardianTranscript('');
      setIsGuardianLoading(false);
      return;
    }

    const prompt = `
        Eres Kai, un terapeuta experto en adicciones y TCC. Analiza la siguiente transcripción de una situación social de alto riesgo para un usuario. Tu objetivo es identificar patrones de comportamiento y pensamiento que llevaron a un posible consumo.

        TRANSCRIPCIÓN:
        "${guardianTranscript}"

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
        const response = await getGeminiResponse(prompt);
        const parsedAnalysis: IGuardianAnalysis = JSON.parse(response);
        setGuardianAnalysis(parsedAnalysis);
    } catch(error) {
        console.error("Error parsing guardian analysis:", error);
        setGuardianAnalysis({
            trigger: "Error",
            socialPressure: "Error",
            justification: "Error",
            turningPoint: "Error",
            escapeStrategy: "No se pudo procesar el análisis de la transcripción. Por favor, inténtalo de nuevo."
        });
    }

    setGuardianTranscript('');
    setIsGuardianLoading(false);
  };


  if (!apiKey) {
    return (
        <div className="bg-slate-900 min-h-screen">
             {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} onClose={() => {if(apiKey) setIsApiKeyModalOpen(false)}} />}
        </div>
    );
  }
  
  if (isOnboardingOpen) {
      return <OnboardingModal onSave={handleSaveFocus} />;
  }

  const renderView = () => {
    switch(activeView) {
      case 'home':
        return <HomeView 
                  startDate={startDate}
                  daysSober={daysSober}
                  onStartDate={handleStartDate}
                  onReset={handleResetProgress}
                  onLogWellnessActivity={handleLogWellnessActivity}
                  userFocus={userFocus}
                  isGuardianActive={isGuardianActive}
                  guardianAnalysis={guardianAnalysis}
                  isGuardianLoading={isGuardianLoading}
                  onStartGuardian={handleStartGuardian}
                  onStopGuardian={handleStopGuardian}
                />;
      case 'kai':
        return <KaiView 
                  daysSober={daysSober}
                  cravings={cravings}
                  journalEntry={journalEntry}
                  wellnessLog={wellnessLog}
                  conversation={conversation}
                  onNewTurn={handleNewConversationTurn}
                  goals={goals}
                  userFocus={userFocus}
                />;
      case 'tools':
        return <ToolsView
                  goals={goals}
                  onGenerateGoal={handleGenerateGoal}
                  isGoalsLoading={isGoalsLoading}
                  cravings={cravings}
                  onLogCraving={handleLogCraving}
                  journalEntry={journalEntry}
                  onJournalChange={handleJournalChange}
                  onJournalSave={handleJournalSave}
                />;
      case 'progress':
        return <ProgressView 
                  cravings={cravings}
                  journalEntry={journalEntry}
                  wellnessLog={wellnessLog}
                  daysSober={daysSober}
                  userFocus={userFocus}
                />;
      default:
        return <HomeView 
                  startDate={startDate}
                  daysSober={daysSober}
                  onStartDate={handleStartDate}
                  onReset={handleResetProgress}
                  onLogWellnessActivity={handleLogWellnessActivity}
                  userFocus={userFocus}
                  isGuardianActive={isGuardianActive}
                  guardianAnalysis={guardianAnalysis}
                  isGuardianLoading={isGuardianLoading}
                  onStartGuardian={handleStartGuardian}
                  onStopGuardian={handleStopGuardian}
                />;
    }
  }
  
  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col">
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} onClose={() => setIsApiKeyModalOpen(false)} />}
      <Header onSettingsClick={handleOpenApiKeyModal} userFocus={userFocus} />
      
      <main className="flex-grow p-4 md:p-6 w-full max-w-screen-2xl mx-auto overflow-y-auto pb-28">
        {userFocus.includes('addiction') && <SOSCard />}
        <div className="mt-6 h-full">
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
