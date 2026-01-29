// Category constants matching the Flask backend
export const CATEGORIES = {
  ACTOR: 'Schauspieltext',
  INSTRUCTION: 'Anweisung',
  SCENE_START: 'Szenenbeginn',
  TECHNICAL: 'Technik',
  LIGHTING: 'Licht',
  AUDIO: 'Einspieler',
  PROPS: 'Requisite',
  MICROPHONE: 'Mikrofon',
} as const

// Storage keys for localStorage
export const STORAGE_KEYS = {
  THEME: 'skript-theme',
  SETTINGS: 'skript-settings',
  PLAY_ID: 'skript-play-id',
  SELECTED_ACTOR: 'skript-selected-actor',
  DIRECTOR_NAME: 'skript-director-name',
  NOTES_PREFIX: 'skript-notes',
} as const

// Socket configuration
// In production, NEXT_PUBLIC_SOCKET_URL should point to the Flask backend
export const SOCKET_CONFIG = {
  URL:
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : '',
  OPTIONS: {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'] as string[],
  },
}

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  playId: 'default',
  selectedActor: '',
  showActorText: true,
  showDirections: true,
  showTechnical: true,
  showLighting: true,
  showEinspieler: true,
  showRequisiten: true,
  showMikrofonCues: true,
  showMicro: true,
  showSceneOverview: true,
  useActorNames: false,
  enableNotes: false,
  blurLines: false,
  autoScroll: false,
  directionsContext: 0,
  technicalContext: 0,
  lightingContext: 0,
  einspielContext: 0,
  requisitenContext: 0,
  mikrofonContext: 0,
}

// Category colors for styling
export const CATEGORY_COLORS = {
  instruction: {
    bg: 'bg-instruction-bg dark:bg-instruction-bg-dark',
    border: 'border-instruction/20',
    tag: 'bg-instruction text-white',
  },
  technical: {
    bg: 'bg-technical-bg dark:bg-technical-bg-dark',
    border: 'border-technical/20',
    tag: 'bg-technical text-white',
  },
  lighting: {
    bg: 'bg-lighting-bg dark:bg-lighting-bg-dark',
    border: 'border-lighting/20',
    tag: 'bg-lighting text-white',
  },
  audio: {
    bg: 'bg-audio-bg dark:bg-audio-bg-dark',
    border: 'border-audio/20',
    tag: 'bg-audio text-white',
  },
  props: {
    bg: 'bg-props-bg dark:bg-props-bg-dark',
    border: 'border-props/20',
    tag: 'bg-props text-white',
  },
  microphone: {
    bg: 'bg-microphone-bg dark:bg-microphone-bg-dark',
    border: 'border-microphone/20',
    tag: 'bg-microphone text-white',
  },
} as const
