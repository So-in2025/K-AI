

import { IMessage, IResource, MessageCategory, IExercise, IMeditation, IMovementVideo, INeuroQuest, IQuote } from './types';

// STORAGE KEYS
export const CRAVINGS_STORAGE_KEY = 'cravingsHistory';
export const PROGRESS_STORAGE_KEY = 'sobrietyStartDate';
export const JOURNAL_STORAGE_KEY = 'journalEntry';
export const WELLNESS_LOG_STORAGE_KEY = 'wellnessLog';
export const REMINDERS_STORAGE_KEY = 'remindersList';
export const LAST_INTERACTION_KEY = 'lastInteractionTimestamp';
export const ONBOARDING_DATA_STORAGE_KEY = 'onboardingData';
export const SUBSCRIPTION_STORAGE_KEY = 'isKiaSubscribed';
export const ACTIVATION_CODE_KEY = 'activationCode';
export const GARDEN_GROWTH_POINTS_KEY = 'gardenGrowthPoints';
export const THOUGHT_LAB_STORAGE_KEY = 'thoughtLabEntries';
export const TRUST_CIRCLE_STORAGE_KEY = 'trustCircleConfig';
export const KAI_MEMORY_KEY = 'kaiMemory';
export const DOPAMINE_DIET_KEY = 'dopamineDiet';
export const HABIT_LOOPS_KEY = 'habitLoops';
export const MOOD_JOURNAL_KEY = 'moodJournalData';
export const KAI_CONVERSATION_KEY = 'kaiConversationHistory';
export const THERAPY_SESSIONS_KEY = 'kiaTherapySessions';
export const TTS_SETTINGS_KEY = 'kiaTtsSettings';

// Monetization Keys
export const FEATURE_USAGE_KEY = 'kiaFeatureUsage';
export const THERAPY_TRIAL_USED_KEY = 'kiaTherapyTrialUsed';


export const MESSAGES: Record<MessageCategory, IMessage[]> = {
  [MessageCategory.Morning]: [
    { id: 1, category: MessageCategory.Morning, title: 'Un Nuevo Comienzo', content: 'Hoy es una nueva oportunidad. Elige la recuperación. Tu futuro yo te lo agradecerá. Respira hondo y enfócate en el ahora.' },
    { id: 2, category: MessageCategory.Morning, title: 'Tu Fortaleza Interior', content: 'Despiertas con una fuerza que no conocías. Cada día sobrio es una victoria que construyes. Eres más fuerte de lo que crees.' },
    { id: 3, category: MessageCategory.Morning, title: 'Propósito del Día', content: 'Define una pequeña meta para hoy. Puede ser leer un capítulo, caminar 15 minutos o llamar a un amigo. Pequeños pasos, grandes cambios.' },
  ],
  [MessageCategory.Afternoon]: [
    { id: 4, category: MessageCategory.Afternoon, title: 'Pausa y Reflexiona', content: 'Has llegado a la mitad del día. ¿Cómo te sientes? Tómate 5 minutos para ti, sin juicios. Solo observa tus pensamientos y déjalos ir.' },
    { id: 5, category: MessageCategory.Afternoon, title: 'Mantén el Rumbo', content: 'Las tardes pueden ser un desafío. Recuerda por qué empezaste este camino. Visualiza la vida que estás construyendo.' },
    { id: 6, category: MessageCategory.Afternoon, title: 'Hidratación y Energía', content: 'Bebe un vaso de agua. A veces, la deshidratación se confunde con ansiedad o antojos. Cuida tu cuerpo, es tu mejor aliado.' },
  ],
  [MessageCategory.Evening]: [
    { id: 7, category: MessageCategory.Evening, title: 'Cierre del Día', content: 'Felicítate por las batallas que ganaste hoy, grandes y pequeñas. Cada decisión consciente es un triunfo. Estás sanando.' },
    { id: 8, category: MessageCategory.Evening, title: 'Gratitud', content: 'Piensa en tres cosas por las que te sientas agradecido hoy. La gratitud cambia tu perspectiva y te ancla en lo positivo.' },
    { id: 9, category: MessageCategory.Evening, title: 'Prepara un Descanso Reparador', content: 'Tu cuerpo y mente necesitan descansar para seguir fuertes. Crea un ambiente tranquilo para dormir. Te lo mereces.' },
  ],
  [MessageCategory.Night]: [
    { id: 10, category: MessageCategory.Night, title: 'Estás a Salvo', content: 'La noche puede traer pensamientos difíciles. Recuerda que estás seguro y en control. Mañana será un nuevo día lleno de posibilidades.' },
    { id: 11, category: MessageCategory.Night, title: 'Paz Interior', content: 'Cierra los ojos y concéntrate en tu respiración. Inhala paz, exhala tensión. Eres un ser resiliente.' },
  ],
  [MessageCategory.Craving]: [
    { id: 12, category: MessageCategory.Craving, title: 'Esto También Pasará', content: 'El deseo es una ola: intensa pero temporal. No tienes que surfearla. Obsérvala desde la orilla hasta que pierda su fuerza. Respira.' },
    { id: 13, category: MessageCategory.Craving, title: 'Técnica de 5 Minutos', content: 'Pospón la decisión por solo 5 minutos. Durante ese tiempo, cambia de ambiente, llama a alguien o escucha tu canción favorita. El deseo disminuirá.' },
    { id: 14, category: MessageCategory.Craving, title: 'Recuerda tu Porqué', content: 'Conecta con tu motivación más profunda. ¿Por quién o por qué estás haciendo esto? Tu razón es más fuerte que cualquier antojo.' },
  ],
};

export const RESOURCES: IResource[] = [
  {
    id: 1,
    name: 'Narcóticos Anónimos',
    description: 'Comunidad de apoyo mutuo para adictos en recuperación.',
    url: 'https://na.org/',
  },
  {
    id: 2,
    name: 'Línea de la Vida (México)',
    description: 'Apoyo gubernamental para salud mental y adicciones.',
    phone: '800 911 2000',
  },
    {
    id: 3,
    name: 'Proyecto Hombre (España)',
    description: 'Organización dedicada a la prevención y tratamiento de adicciones.',
    url: 'https://proyectohombre.es/',
  },
  {
    id: 4,
    name: 'SAMHSA National Helpline (USA)',
    description: 'Línea de ayuda gratuita y confidencial para tratamiento y referencia.',
    phone: '1-800-662-HELP (4357)',
  }
];

export const CRAVING_TRIGGERS: string[] = [
  'Estrés', 'Aburrimiento', 'Lugar o Recuerdo', 'Ver a alguien consumir',
  'Hambre', 'Cansancio', 'Discusión', 'Celebración', 'Otro',
];

export const COPING_STRATEGIES: string[] = [
  'Respiración profunda', 'Llamé a un amigo', 'Usé la app', 'Salí a caminar',
  'Escuché música', 'Vi una película', 'Me enfoqué en una tarea', 'Otro',
];

export const JOURNAL_PROMPTS: Record<string, { title: string; prompts: string[] }> = {
  sentimientos: {
    title: 'Sentimientos',
    prompts: [
      'Hoy me siento agradecido/a por...',
      'Sentí ansiedad cuando...',
      'Me sentí orgulloso/a de mí cuando...',
      'Lo que más me costó hoy fue...',
      'Una pequeña alegría de hoy fue...'
    ]
  },
  actividades: {
    title: 'Actividades',
    prompts: [
      'Hoy, para cuidar de mí, hice...',
      'Una actividad que disfruté fue...',
      'Evité una situación de riesgo al...',
      'Aprendí algo nuevo sobre...',
      'Me conecté con alguien y...'
    ]
  },
  reflexiones: {
    title: 'Reflexiones',
    prompts: [
      'Mi mayor fortaleza hoy ha sido...',
      'Estoy construyendo un futuro donde...',
      'Una lección que estoy aprendiendo es...',
      'Mi "porqué" para recuperarme es...',
      'Comparado con la semana pasada, noto que...'
    ]
  }
};

const preparationScript = [
    { text: 'Preparando.', pause: 500 },
    { text: 'Comenzamos en 3...', pause: 1000 },
    { text: '2...', pause: 1000 },
    { text: '1...', pause: 1000 },
];

export const BREATHING_EXERCISES: IExercise[] = [
  {
    id: 'box',
    name: 'Respiración Cuadrada',
    description: 'Para calmar el sistema nervioso y enfocar la mente.',
    setup: preparationScript,
    steps: [
      { name: 'Inhala', duration: 4000, instruction: 'Inhala profundamente por la nariz durante 4 segundos.' },
      { name: 'Sostén', duration: 4000, instruction: 'Sostén la respiración durante 4 segundos.' },
      { name: 'Exhala', duration: 4000, instruction: 'Exhala lentamente por la boca durante 4 segundos.' },
      { name: 'Sostén', duration: 4000, instruction: 'Mantén los pulmones vacíos durante 4 segundos.' },
    ],
  },
  {
    id: '478',
    name: 'Respiración 4-7-8',
    description: 'Técnica de relajación profunda para combatir el insomnio y la ansiedad.',
    setup: preparationScript,
    steps: [
      { name: 'Inhala', duration: 4000, instruction: 'Inhala en silencio por la nariz contando hasta 4.' },
      { name: 'Sostén', duration: 7000, instruction: 'Sostén la respiración contando hasta 7.' },
      { name: 'Exhala', duration: 8000, instruction: 'Exhala completamente por la boca, haciendo un sonido de soplo, contando hasta 8.' },
    ],
  },
  {
    id: 'wim-hof',
    name: 'Respiración Cíclica Energizante',
    description: 'Inspirada en el método Wim Hof para reducir inflamación y aumentar la energía.',
    setup: preparationScript,
    steps: [
      { name: 'Inhala', duration: 1500, instruction: 'Inhala profundamente por la boca.' },
      { name: 'Exhala', duration: 1500, instruction: 'Exhala de forma natural, sin forzar.' },
    ],
  },
  {
    id: 'coherent',
    name: 'Respiración Coherente (Resonancia)',
    description: 'Sincroniza corazón y cerebro para un estado de calma y equilibrio óptimo (5 seg. dentro, 5 seg. fuera).',
    isPremium: true,
    setup: preparationScript,
    steps: [
      { name: 'Inhala', duration: 5000 },
      { name: 'Exhala', duration: 5000 },
    ],
  },
  {
    id: 'tummo-breathwork',
    name: 'Respiración de Fuego Interior',
    description: 'Ciclos de respiración potente para generar calor, vitalidad y una sensación de poder interno.',
    isPremium: true,
    setup: preparationScript,
    steps: [
        { name: 'Inhala Vientre', duration: 1000 }, 
        { name: 'Inhala Pecho', duration: 1000 }, 
        { name: 'Exhala Relajado', duration: 2000 }
    ],
  },
  {
    id: 'bhramari',
    name: 'Respiración de Zumbido de Abeja (Bhramari)',
    description: 'Calma la mente y alivia la agitación y la ansiedad a través de una suave vibración sonora.',
    isPremium: true,
    setup: preparationScript,
    steps: [
      { name: 'Inhala', duration: 4000 },
      { name: 'Zumba al Exhalar', duration: 8000, instruction: 'Tápate los oídos y exhala lentamente produciendo un zumbido grave, como una abeja.' },
    ],
  },
];

export const GUIDED_MEDITATIONS: IMeditation[] = [
    {
        id: 'self-compassion',
        name: 'Momento de Autocompasión',
        description: 'Una breve pausa para tratarte con la misma amabilidad que le darías a un buen amigo.',
        script: [
            { text: 'Bienvenido a este momento de autocompasión.', pause: 1000 },
            { text: 'Busca una postura cómoda, sentado o acostado.', pause: 2000 },
            { text: 'Cierra suavemente los ojos si te sientes cómodo haciéndolo.', pause: 2000 },
            { text: 'Lleva tu mano a tu corazón, sintiendo el calor y la suave presión.', pause: 3000 },
            { text: 'Reconoce que este es un momento de sufrimiento o dificultad. Y eso está bien.', pause: 4000 },
            { text: 'El sufrimiento es parte de la vida. Es parte de la experiencia de ser humano.', pause: 4000 },
            { text: 'Ahora, repite internamente después de mí...', pause: 1500 },
            { text: 'Que pueda ser amable conmigo mismo en este momento.', pause: 3000 },
            { text: 'Que pueda aceptarme tal como soy.', pause: 3000 },
            { text: 'Que pueda darme la compasión que necesito.', pause: 4000 },
            { text: 'Quédate con esta sensación de calidez y cuidado por un momento más.', pause: 5000 },
            { text: 'Cuando estés listo, abre lentamente los ojos. La práctica ha terminado.', pause: 1000 },
        ]
    },
    {
        id: 'body-scan',
        name: 'Escaneo Corporal',
        description: 'Reconecta con tu cuerpo y libera tensiones a través de la atención plena.',
        script: [
            { text: 'Comencemos este escaneo corporal. Encuentra una posición cómoda.', pause: 2000 },
            { text: 'Lleva tu atención a la sensación de tu cuerpo como un todo. Nota tu respiración.', pause: 4000 },
            { text: 'Ahora, dirige tu atención a los dedos de tu pie izquierdo. Simplemente nota cualquier sensación.', pause: 5000 },
            { text: 'Lentamente, expande tu atención para incluir toda la planta del pie... el talón... el tobillo.', pause: 6000 },
            { text: 'Sigue subiendo por tu pierna izquierda... la pantorrilla... la rodilla... el muslo.', pause: 7000 },
            { text: 'Ahora, lleva tu atención a tu pie derecho y repite el proceso.', pause: 5000 },
            { text: 'Ve subiendo por tu pierna derecha, notando cualquier sensación sin juicio.', pause: 7000 },
            { text: 'Continúa este viaje de atención por tu cadera, tu abdomen, tu pecho, tu espalda.', pause: 8000 },
            { text: 'Siente tus brazos, tus manos, hasta la punta de los dedos.', pause: 6000 },
            { text: 'Finalmente, tu cuello, tu rostro, tu cabeza. Permite que cualquier tensión se disuelva.', pause: 7000 },
            { text: 'Descansa en la conciencia de tu cuerpo como un todo. Estás presente. La práctica ha terminado.', pause: 2000 },
        ]
    },
    {
        id: 'yoga-nidra',
        name: 'Yoga Nidra (Sueño Yóguico)',
        description: 'Una poderosa práctica de relajación profunda (NSDR) para restaurar cuerpo y mente.',
        script: [
            { text: 'Bienvenido a Yoga Nidra, el sueño yóguico. Acuéstate cómodamente y cierra los ojos.', pause: 3000 },
            { text: 'Permite que tu cuerpo se sienta pesado y completamente sostenido por el suelo.', pause: 4000 },
            { text: 'Lleva tu conciencia a los sonidos lejanos... y luego a los sonidos cercanos.', pause: 6000 },
            { text: 'Ahora, establece una intención para tu práctica. Una afirmación corta y positiva. Repítela mentalmente tres veces.', pause: 8000 },
            { text: 'Comienza una rotación de la conciencia por tu cuerpo. Simplemente nombra la parte y siente. Pulgar derecho, segundo dedo, tercero, cuarto, quinto...', pause: 10000 },
            { text: 'Palma de la mano, muñeca, codo, hombro... todo el brazo derecho.', pause: 8000 },
            { text: 'Ahora el pulgar izquierdo... y sigue el mismo recorrido por tu lado izquierdo.', pause: 10000 },
            { text: 'Lleva tu conciencia a tu respiración. Siente el aire entrar y salir, sin cambiar nada.', pause: 8000 },
            { text: 'Ahora, siente la sensación de pesadez en todo tu cuerpo. Y luego, la sensación de ligereza.', pause: 8000 },
            { text: 'Vuelve a tu intención. Repítela mentalmente tres veces. La semilla ha sido plantada.', pause: 8000 },
            { text: 'Poco a poco, comienza a mover los dedos de las manos y los pies. Regresa a tu cuerpo.', pause: 6000 },
            { text: 'Cuando estés listo, abre suavemente los ojos. La práctica de Yoga Nidra ha concluido.', pause: 2000 },
        ]
    },
    {
        id: 'metta',
        name: 'Meditación Metta (Amor Benevolente)',
        description: 'Cultiva la compasión y el amor incondicional hacia ti mismo y hacia los demás.',
        isPremium: true,
        script: [
            { text: 'Encuentra una postura cómoda y cierra los ojos.', pause: 3000 },
            { text: 'Trae tu atención a tu corazón. Repite mentalmente, dirigiéndote a ti mismo:', pause: 4000 },
            { text: 'Que yo esté a salvo.', pause: 4000 },
            { text: 'Que yo sea feliz.', pause: 4000 },
            { text: 'Que yo esté sano.', pause: 4000 },
            { text: 'Que yo viva con calma.', pause: 5000 },
            { text: 'Ahora, visualiza a un ser querido. Ofrécele los mismos deseos:', pause: 6000 },
            { text: 'Que estés a salvo. Que seas feliz. Que estés sano. Que vivas con calma.', pause: 8000 },
            { text: 'Ahora, expande este sentimiento a todos los seres, sin excepción.', pause: 6000 },
            { text: 'Que todos los seres estén a salvo. Que todos los seres sean felices. Que todos los seres vivan con calma.', pause: 9000 },
            { text: 'Permanece con este sentimiento de conexión. Cuando estés listo, abre los ojos.', pause: 5000 },
        ]
    },
    {
        id: 'rain',
        name: 'Meditación RAIN (Para Emociones Difíciles)',
        description: 'Una práctica de mindfulness para navegar emociones intensas con autocompasión.',
        isPremium: true,
        script: [
            { text: 'Trae a tu mente, con gentileza, una situación que te cause dificultad.', pause: 5000 },
            { text: 'R: Reconoce lo que estás sintiendo. Nómbralo en tu mente. "Esto es ansiedad", "esto es tristeza".', pause: 8000 },
            { text: 'A: Acepta. Permite que la emoción esté aquí, sin luchar. Dale espacio para existir.', pause: 8000 },
            { text: 'I: Investiga con curiosidad. ¿Cómo se siente esto en tu cuerpo? ¿Dónde está la tensión? Observa, sin juicio.', pause: 12000 },
            { text: 'N: Nutre. Ofrece un gesto de autocompasión. Una mano en el corazón. Pregúntate: ¿Qué necesito ahora mismo?', pause: 12000 },
            { text: 'Reconocer, Aceptar, Investigar, Nutrir. Estás aprendiendo a estar contigo. La práctica ha terminado.', pause: 5000 },
        ]
    },
    {
        id: 'deep-focus',
        name: 'Meditación de Enfoque Profundo (Tercer Ojo)',
        description: 'Calma la mente y mejora la intuición y la claridad enfocando tu energía en el centro de tu frente.',
        isPremium: true,
        script: [
            { text: 'Adopta una postura erguida pero relajada y cierra los ojos.', pause: 4000 },
            { text: 'Lleva tu atención al flujo de tu respiración.', pause: 8000 },
            { text: 'Ahora, suavemente, lleva tu atención al punto en el centro de tu frente, justo por encima de tus cejas.', pause: 8000 },
            { text: 'Simplemente descansa tu conciencia en este punto. Imagina una pequeña luz o una vibración suave.', pause: 12000 },
            { text: 'Si tu mente se distrae, amablemente, tráela de vuelta a este punto de enfoque.', pause: 8000 },
            { text: 'Este es tu centro de intuición y claridad. Al descansar tu atención aquí, calmas el ruido mental.', pause: 10000 },
            { text: 'Ahora, suelta el punto de enfoque. Cuando estés listo, abre los ojos. La práctica ha terminado.', pause: 6000 },
        ]
    },
];

// Videos de YouTube curados para prácticas de movimiento y descanso.
export const MOVEMENT_VIDEOS: IMovementVideo[] = [
    // Movimiento
    {
        id: 'mov-yoga-suave',
        youtubeId: 'bKwt_6DvTA0', // Funciona
        name: 'Yoga Suave para Empezar Desde Cero',
        description: 'Una clase de 24 minutos ideal para principiantes. Ritmo pausado y guiado para crear un espacio seguro y terapéutico.',
        duration: 24,
        category: 'movement'
    },
    {
        id: 'mov-yoga-ansiedad',
        youtubeId: 'ID_DE_YOUTUBE_A_REEMPLAZAR',
        name: 'Yoga para la Ansiedad y el Estrés',
        description: 'Práctica de 20 minutos que comienza en el suelo, facilitando el grounding para calmar la mente y el cuerpo.',
        duration: 20,
        category: 'movement'
    },
    {
        id: 'mov-yoga-energia',
        youtubeId: 'ID_DE_YOUTUBE_A_REEMPLAZAR',
        name: 'Yoga para Empezar el Día con Energía',
        description: 'Rutina fluida de 15 minutos para despertar el cuerpo de forma gentil y consciente, con un tono positivo.',
        duration: 15,
        category: 'movement'
    },
    // Ritual de Descanso
    {
        id: 'des-estiramiento-cama',
        youtubeId: 'i2WsfawlmTY', // Funciona
        name: 'Yoga en la Cama Antes de Dormir',
        description: 'Rutina de 11 minutos con una voz excepcionalmente calmada, 100% realizable en la cama para liberar tensión.',
        duration: 11,
        category: 'rest'
    },
    {
        id: 'des-meditacion-dormir',
        youtubeId: 'ID_DE_YOUTUBE_A_REEMPLAZAR',
        name: 'Meditación Guiada para Dormir Profundamente',
        description: 'Meditación de 20 minutos con una voz muy suave, guiando un escaneo corporal para calmar la mente.',
        duration: 20,
        category: 'rest'
    },
    {
        id: 'des-yoga-caderas',
        youtubeId: 'ID_DE_YOUTUBE_A_REEMPLAZAR',
        name: 'Yin Yoga para Soltar Caderas y Emociones',
        description: 'Sesión de Yin Yoga de 15 minutos con posturas pasivas para una relajación física y emocional profunda.',
        duration: 15,
        category: 'rest'
    }
];

export const NEURO_QUESTS: INeuroQuest[] = [
    // Rituales de Dopamina
    {
        id: 'gratitude',
        neurotransmitter: 'dopamine',
        name: 'Ritual de Gratitud Profunda',
        description: 'Siente la gratitud en tu cuerpo para re-cablear tu cerebro hacia la positividad.',
        activityLogName: 'Ritual de Gratitud',
        category: 'Gratitud',
        script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Gratitud. El objetivo no es solo pensar, sino sentir. Cierra los ojos y respira hondo. Tu intención es encontrar un momento de genuino agradecimiento.', pauseAfter: 5000 },
            { step: 'practice', text: 'Ahora, trae a tu mente a una persona, un lugar, o una pequeña cosa que te traiga una chispa de calor. Permite que esa sensación de gratitud llene tu pecho. Quédate ahí por un momento.', pauseAfter: 10000 },
            { step: 'reflection', text: 'Excelente. Ahora, abre los ojos y usa el espacio de abajo para describir ese sentimiento. Anclarlo en palabras potencia su efecto neuronal.', pauseAfter: 1000 },
        ]
    },
    {
        id: 'victory',
        neurotransmitter: 'dopamine',
        name: 'Ritual de Logro Consciente',
        description: 'Celebra una pequeña victoria para solidificar el bucle de recompensa neuronal del logro.',
        activityLogName: 'Ritual de Logro',
        category: 'Logro',
        script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Logro. Vamos a enseñarle a tu cerebro a reconocer tu propia fuerza. Piensa en una cosa, por pequeña que sea, que hayas completado hoy.', pauseAfter: 6000 },
            { step: 'practice', text: 'Ahora, cierra los ojos y revive ese momento. Siente el orgullo, el alivio, la capacidad. Conecta con ese sentimiento de "yo hice esto". Permite que esa sensación te llene.', pauseAfter: 8000 },
            { step: 'reflection', text: 'Maravilloso. Ahora, abre los ojos y describe esa victoria. Celebrarlo conscientemente es un acto de auto-reconocimiento.', pauseAfter: 1000 },
        ]
    },
    {
        id: 'savoring',
        neurotransmitter: 'dopamine',
        name: 'Ritual de Saboreo (Savoring)',
        description: 'Extrae la máxima recompensa de una experiencia sensorial simple.',
        activityLogName: 'Ritual de Saboreo',
        category: 'Mindfulness',
         script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Saboreo. Esta práctica entrena a tu cerebro para encontrar placer en el presente. Toma una bebida o un pequeño trozo de comida.', pauseAfter: 6000 },
            { step: 'practice', text: 'Ahora, antes de probarlo, obsérvalo. Nota su color, su aroma. Finalmente, dale un pequeño sorbo o mordisco, y explóralo con tu atención plena, como si fuera la primera vez. Hazlo lentamente.', pauseAfter: 12000 },
            { step: 'reflection', text: 'Bien. Ahora, usa el espacio de abajo para describir un detalle que notaste. Esto enseña a tu cerebro a encontrar novedad y placer en lo simple.', pauseAfter: 1000 },
        ]
    },
    // Rituales de Serotonina
    {
        id: 'sunlight',
        neurotransmitter: 'serotonin',
        name: 'Ritual de Baño de Luz Solar',
        description: 'Una meditación mindfulness para absorber los beneficios de la luz solar.',
        activityLogName: 'Ritual de Luz Solar',
        category: 'Naturaleza',
        script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Luz Solar. Si es posible, acércate a una ventana o sal afuera. La luz solar es un potente regulador del estado de ánimo. Tu intención es absorber conscientemente esta energía.', pauseAfter: 7000 },
            { step: 'practice', text: 'Cierra los ojos. Siente el calor del sol en tu piel. Imagina que cada rayo de luz disuelve la tensión y llena tus células de calma y bienestar. Respira esta luz. Quédate aquí, simplemente sintiendo, por un momento.', pauseAfter: 12000 },
            { step: 'reflection', text: 'Perfecto. Abre los ojos. ¿Qué sensación te deja esta práctica? Escribe una palabra para describirla. Anclar este sentimiento te ayuda a volver a él más tarde.', pauseAfter: 1000 },
        ]
    },
    {
        id: 'positive-memory',
        neurotransmitter: 'serotonin',
        name: 'Ritual de Recuerdo Positivo',
        description: 'Revive y siente en tu cuerpo una memoria feliz para elevar tu estado de ánimo.',
        activityLogName: 'Ritual de Recuerdo Positivo',
        category: 'Reflexión',
        script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Recuerdo Positivo. Tu cerebro no distingue entre una experiencia real y una vívidamente imaginada. Vamos a usar ese poder. Tu intención es revivir una memoria genuinamente feliz.', pauseAfter: 7000 },
            { step: 'practice', text: 'Cierra los ojos. Trae a tu mente un recuerdo feliz. No solo la imagen, sino los sonidos, los olores, y más importante, la emoción. ¿Cómo se sentía en tu cuerpo? ¿Una calidez en el pecho, una sonrisa en tu rostro? Sumérgete en esa sensación por completo.', pauseAfter: 12000 },
            { step: 'reflection', text: 'Maravilloso. Mantén esa sensación mientras abres los ojos. Escribe el nombre de esa memoria. Será tu ancla, un lugar seguro al que tu mente puede regresar.', pauseAfter: 1000 },
        ]
    },
    {
        id: 'self-massage',
        neurotransmitter: 'serotonin',
        name: 'Ritual de Autocompasión Táctil',
        description: 'Un ritual de auto-masaje para liberar oxitocina y serotonina, reduciendo el estrés.',
        activityLogName: 'Ritual de Autocompasión Táctil',
        category: 'Cuerpo',
        script: [
            { step: 'intention', text: 'Bienvenido al Ritual de Autocompasión Táctil. El tacto es una de las formas más primarias de calmar el sistema nervioso. Tu intención es darte a ti mismo el cuidado que mereces.', pauseAfter: 7000 },
            { step: 'practice', text: 'Comienza masajeando suavemente tu mano izquierda con tu pulgar derecho, prestando atención a cada músculo. Luego, cambia de mano. Ahora, lleva tus manos a tu cuello y hombros, y aplica una presión suave donde sientas tensión. Hazlo con amabilidad, como lo harías con un ser querido.', pauseAfter: 12000 },
            { step: 'reflection', text: 'Bien. ¿Qué notaste? ¿Había más tensión de la que pensabas? Describe brevemente la sensación de soltar, aunque sea un poco. Este es un acto de profundo cuidado propio.', pauseAfter: 1000 },
        ]
    }
];

export const EPIC_QUOTES: IQuote[] = [
    { text: "El obstáculo es el camino.", author: "Marco Aurelio" },
    { text: "No se nos da una vida corta, sino que la acortamos. No somos indigentes, sino que la malgastamos.", author: "Séneca" },
    { text: "Aquel que tiene un porqué para vivir se puede enfrentar a todos los 'cómos'.", author: "Friedrich Nietzsche" },
    { text: "El hombre que se levanta es más grande que el que no ha caído.", author: "Concepción Arenal" },
    { text: "La herida es el lugar por donde la luz entra en ti.", author: "Rumi" },
    { text: "No soy lo que me ha pasado, soy lo que elijo ser.", author: "Carl Jung" },
    { text: "La única persona en la que estás destinado a convertirte es la persona que decides ser.", author: "Ralph Waldo Emerson" },
    { text: "El secreto del cambio es enfocar toda tu energía, no en luchar contra lo viejo, sino en construir lo nuevo.", author: "Sócrates" },
    { text: "Entre el estímulo y la respuesta hay un espacio. En ese espacio reside nuestro poder de elegir nuestra respuesta. En nuestra respuesta yace nuestro crecimiento y nuestra libertad.", author: "Viktor Frankl" },
    { text: "La vida se encoge o se expande en proporción a tu coraje.", author: "Anaïs Nin" },
    { text: "Un viaje de mil millas comienza con un solo paso.", author: "Lao Tzu" },
    { text: "Lo que no me mata, me hace más fuerte.", author: "Friedrich Nietzsche" },
];