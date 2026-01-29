// Script data types
export type Category =
  | 'Schauspieltext'
  | 'Anweisung'
  | 'Regieanweisung'
  | 'Einblendung'
  | 'Szenenbeginn'
  | 'Technik'
  | 'Licht'
  | 'Einspieler'
  | 'Requisite'
  | 'Mikrofon'

export interface ScriptRow {
  Szene: string
  Kategorie: Category | string
  Charakter: string
  Mikrofon: string
  'Text/Anweisung': string
  // Auto-generated mic cues
  isAutoMic?: boolean
  micCueType?: 'EIN' | 'AUS'
}

export interface Actor {
  role: string
  name: string
}

// Settings types
export type Theme = 'light' | 'dark' | 'pink'

export interface FilterSettings {
  showActorText: boolean
  showDirections: boolean
  showTechnical: boolean
  showLighting: boolean
  showEinspieler: boolean
  showRequisiten: boolean
  showMikrofonCues: boolean
  showMicro: boolean
  directionsContext: number
  technicalContext: number
  lightingContext: number
  einspielContext: number
  requisitenContext: number
  mikrofonContext: number
}

export interface DisplaySettings {
  theme: Theme
  showSceneOverview: boolean
  useActorNames: boolean
  enableNotes: boolean
  blurLines: boolean
  autoScroll: boolean
}

export interface Settings extends FilterSettings, DisplaySettings {
  selectedActor: string
  playId: string
}

// Socket event types
export interface MarkerUpdateData {
  index: number
}

export interface DirectorData {
  name: string
  password?: string
}

export interface SocketEvents {
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  marker_update: (data: MarkerUpdateData) => void
  marker_clear: () => void
  set_director: (data: DirectorData) => void
  unset_director: (data: DirectorData) => void
  director_takeover: (data: DirectorData) => void
}

// Store types
export interface ScriptState {
  playId: string
  scriptData: ScriptRow[]
  actors: Actor[]
  isLoading: boolean
  error: string | null
  setPlayId: (id: string) => void
  setScriptData: (data: ScriptRow[]) => void
  setActors: (actors: Actor[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadScript: (playId: string) => Promise<void>
}

export interface DirectorState {
  isDirector: boolean
  directorName: string
  markedLineIndex: number | null
  isConnected: boolean
  isReconnecting: boolean
  setIsDirector: (value: boolean) => void
  setDirectorName: (name: string) => void
  setMarkedLineIndex: (index: number | null) => void
  setIsConnected: (connected: boolean) => void
  setIsReconnecting: (reconnecting: boolean) => void
}

export interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void
  setSelectedActor: (actor: string) => void
  setPlayId: (id: string) => void
  toggleFilter: (key: keyof FilterSettings) => void
  setContextLines: (key: string, value: number) => void
  updateSettings: (settings: Partial<Settings>) => void
}

// UI State
export interface UIState {
  sidebarOpen: boolean
  settingsOpen: boolean
  currentScene: string
  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setCurrentScene: (scene: string) => void
  toggleSidebar: () => void
  toggleSettings: () => void
}

// Notes
export interface Notes {
  [lineId: string]: string
}

export interface NotesState {
  notes: Notes
  setNote: (lineId: string, note: string) => void
  deleteNote: (lineId: string) => void
  loadNotes: (playId: string) => void
  getNote: (lineId: string) => string | null
}

// Line visibility state
export interface LineState {
  visible: boolean
  isContext: boolean
}

// Play configuration
export interface PlayConfig {
  id: string
  name: string
  csvUrl: string
}
