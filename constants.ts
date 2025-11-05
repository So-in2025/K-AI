
import { IMessage, IResource, MessageCategory, IExercise, IMeditation, IMovementVideo } from './types';

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
export const FREEDOM_VAULT_KEY = 'freedomVault';


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

export const BREATHING_EXERCISES: IExercise[] = [
  {
    id: 'box',
    name: 'Respiración Cuadrada',
    description: 'Para calmar el sistema nervioso y enfocar la mente.',
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
    steps: [
      { name: 'Inhala', duration: 4000, instruction: 'Inhala en silencio por la nariz contando hasta 4.' },
      { name: 'Sostén', duration: 7000, instruction: 'Sostén la respiración contando hasta 7.' },
      { name: 'Exhala', duration: 8000, instruction: 'Exhala completamente por la boca, haciendo un sonido de soplo, contando hasta 8.' },
    ],
  },
  {
    id: 'rhythmic',
    name: 'Respiración Rítmica',
    description: 'Para energizar el cuerpo y mejorar la concentración.',
    steps: [
      { name: 'Inhala', duration: 5000, instruction: 'Inhala de forma constante durante 5 segundos.' },
      { name: 'Exhala', duration: 5000, instruction: 'Exhala de forma constante durante 5 segundos.' },
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
        id: 'grounding-presence',
        name: 'Presencia Anclada',
        description: 'Ancla tu atención en el presente a través de las sensaciones de tu cuerpo.',
        script: [
            { text: 'Comencemos esta práctica de presencia anclada.', pause: 1000 },
            { text: 'Encuentra una posición cómoda.', pause: 2000 },
            { text: 'Lleva tu atención a los sonidos a tu alrededor. Solo nótalos, sin juzgarlos.', pause: 5000 },
            { text: 'Ahora, lleva tu atención a las sensaciones de tu cuerpo.', pause: 3000 },
            { text: 'Siente el contacto de tu cuerpo con la silla o el suelo. Siente el peso, la presión.', pause: 5000 },
            { text: 'Siente el aire en tu piel. ¿Es cálido, es frío?', pause: 5000 },
            { text: 'Ahora, enfoca toda tu atención en tus pies. Siente el contacto con tus calcetines, tus zapatos, el suelo.', pause: 6000 },
            { text: 'Imagina raíces creciendo desde las plantas de tus pies, conectándote con la tierra. Fuerte. Estable.', pause: 6000 },
            { text: 'Estás aquí. Estás ahora. Estás a salvo.', pause: 4000 },
            { text: 'Respira profundamente, y cuando estés listo, regresa tu atención a la habitación. La práctica ha terminado.', pause: 1000 },
        ]
    }
];

export const MOVEMENT_VIDEOS: IMovementVideo[] = [
    {
        id: 'full-body-stretch',
        youtubeId: 's-t0N1s2RGA', // Video: "10 min FULL BODY STRETCH for Flexibility, Pain Relief & Recovery" by MadFit
        name: 'Estiramiento Corporal Completo',
        description: 'Una rutina de 10 minutos para mejorar la flexibilidad, aliviar el dolor y acelerar la recuperación.',
        duration: 10
    },
    {
        id: 'morning-yoga',
        youtubeId: 'v7AYKMP6rOE', // Video: "Yoga Morning Fresh" by Yoga With Adriene
        name: 'Yoga Suave de Mañana',
        description: 'Comienza tu día con energía y calma con esta práctica de yoga de 15 minutos apta para todos.',
        duration: 15
    },
    {
        id: 'chair-yoga',
        youtubeId: 'tAUf7aajBWE', // Video: "5-Minute Chair Yoga" by Yoga With Adriene
        name: 'Yoga en Silla',
        description: 'Una pausa activa de 5 minutos que puedes hacer en tu escritorio para liberar tensión.',
        duration: 5
    }
];

// NEW CONSTANTS
export const DOPAMINE_ACTIVITIES = [
    'Completé una tarea', 'Hice ejercicio', 'Recibí luz solar', 'Medité / Respiré', 
    'Contacto social', 'Pequeña victoria', 'Acto de amabilidad', 'Aprendí algo nuevo', 'Otro'
];
