// Available tools in the application
export type ToolType =
  | "chordProgression"
  | "melodyPlayer"
  | "metronome"
  | "rhythmPatterns"
  | "guitarTuner"
  | "partitureEditor"

// Base step interface
export interface BaseStep {
  id: string
  tool: ToolType
  timeLimit: number // in minutes, 0 means no time limit
  name?: string // Optional custom name for the step
}

// Chord progression step
export interface ChordProgressionStep extends BaseStep {
  tool: "chordProgression"
  props: {
    progressionId: string
    tempo: number
    instrument: string
    drumsEnabled?: boolean
    swingEnabled?: boolean
  }
}

// Melody player step
export interface MelodyPlayerStep extends BaseStep {
  tool: "melodyPlayer"
  props: {
    melodyId: string
    tempo?: number
    instrument?: string
    swingEnabled?: boolean
  }
}

// Metronome step
export interface MetronomeStep extends BaseStep {
  tool: "metronome"
  props: {
    timeSignature: string
    tempo: number
    accentPattern?: string
    countIn?: boolean
  }
}

// Rhythm patterns step
export interface RhythmPatternsStep extends BaseStep {
  tool: "rhythmPatterns"
  props: {
    patternId: string
    tempo?: number
    practiceMode?: string
  }
}

// Guitar tuner step
export interface GuitarTunerStep extends BaseStep {
  tool: "guitarTuner"
  props: {
    tuning?: string
  }
}

// Partiture editor step
export interface PartitureEditorStep extends BaseStep {
  tool: "partitureEditor"
  props: {
    scoreId?: string
  }
}

// Union type for all possible steps
export type Step =
  | ChordProgressionStep
  | MelodyPlayerStep
  | MetronomeStep
  | RhythmPatternsStep
  | GuitarTunerStep
  | PartitureEditorStep

// Routine interface
export interface Routine {
  id: string
  name: string
  description?: string
  steps: Step[]
  createdAt: string
  updatedAt: string
  version: string
}

// Tool configuration with display name and available properties
export interface ToolConfig {
  type: ToolType
  displayName: string
  description: string
  icon: string
  hasTimeLimit: boolean
  defaultTimeLimit: number
  properties: ToolProperty[]
}

// Property configuration for tool steps
export interface ToolProperty {
  name: string
  displayName: string
  type: "string" | "number" | "boolean" | "select"
  required: boolean
  default?: any
  options?: { value: string; label: string }[]
}

// Available tools configuration
export const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  chordProgression: {
    type: "chordProgression",
    displayName: "Chord Progression",
    description: "Practice jazz chord voicings and comping patterns",
    icon: "music",
    hasTimeLimit: true,
    defaultTimeLimit: 5,
    properties: [
      {
        name: "progressionId",
        displayName: "Progression",
        type: "select",
        required: true,
        options: [
          { value: "ii-V-I", label: "ii-V-I" },
          { value: "I-vi-ii-V", label: "I-vi-ii-V" },
          { value: "Rhythm Changes A", label: "Rhythm Changes A" },
          { value: "Blues in F", label: "Blues in F" },
          { value: "Autumn Leaves", label: "Autumn Leaves" },
        ],
      },
      {
        name: "tempo",
        displayName: "Tempo (BPM)",
        type: "number",
        required: true,
        default: 120,
      },
      {
        name: "instrument",
        displayName: "Instrument",
        type: "select",
        required: true,
        default: "Piano",
        options: [
          { value: "Piano", label: "Piano" },
          { value: "Jazz Guitar", label: "Jazz Guitar" },
          { value: "Electric Piano", label: "Electric Piano" },
          { value: "Vibraphone", label: "Vibraphone" },
        ],
      },
      {
        name: "drumsEnabled",
        displayName: "Enable Drums",
        type: "boolean",
        required: false,
        default: true,
      },
      {
        name: "swingEnabled",
        displayName: "Enable Swing",
        type: "boolean",
        required: false,
        default: true,
      },
    ],
  },
  melodyPlayer: {
    type: "melodyPlayer",
    displayName: "Melody Player",
    description: "Practice jazz melodies with interactive notation",
    icon: "music-2",
    hasTimeLimit: true,
    defaultTimeLimit: 5,
    properties: [
      {
        name: "melodyId",
        displayName: "Melody",
        type: "select",
        required: true,
        options: [
          { value: "Autumn Leaves", label: "Autumn Leaves" },
          { value: "Blue Bossa", label: "Blue Bossa" },
          { value: "Take Five", label: "Take Five" },
          { value: "So What", label: "So What" },
          { value: "All Blues", label: "All Blues" },
        ],
      },
      {
        name: "tempo",
        displayName: "Tempo (BPM)",
        type: "number",
        required: false,
        default: 120,
      },
      {
        name: "instrument",
        displayName: "Instrument",
        type: "select",
        required: false,
        default: "Saxophone",
        options: [
          { value: "Saxophone", label: "Saxophone" },
          { value: "Trumpet", label: "Trumpet" },
          { value: "Clarinet", label: "Clarinet" },
          { value: "Flute", label: "Flute" },
          { value: "Piano", label: "Piano" },
        ],
      },
      {
        name: "swingEnabled",
        displayName: "Enable Swing",
        type: "boolean",
        required: false,
        default: true,
      },
    ],
  },
  metronome: {
    type: "metronome",
    displayName: "Metronome",
    description: "Practice with a customizable metronome",
    icon: "clock",
    hasTimeLimit: true,
    defaultTimeLimit: 5,
    properties: [
      {
        name: "timeSignature",
        displayName: "Time Signature",
        type: "select",
        required: true,
        default: "4/4",
        options: [
          { value: "4/4", label: "4/4" },
          { value: "3/4", label: "3/4" },
          { value: "2/4", label: "2/4" },
          { value: "6/8", label: "6/8" },
          { value: "5/4", label: "5/4" },
          { value: "7/8", label: "7/8" },
        ],
      },
      {
        name: "tempo",
        displayName: "Tempo (BPM)",
        type: "number",
        required: true,
        default: 120,
      },
      {
        name: "accentPattern",
        displayName: "Accent Pattern",
        type: "select",
        required: false,
        default: "Standard",
        options: [
          { value: "Standard", label: "Standard" },
          { value: "Backbeat", label: "Backbeat" },
          { value: "All Beats", label: "All Beats" },
        ],
      },
      {
        name: "countIn",
        displayName: "Count In",
        type: "boolean",
        required: false,
        default: false,
      },
    ],
  },
  rhythmPatterns: {
    type: "rhythmPatterns",
    displayName: "Rhythm Patterns",
    description: "Practice world music rhythm patterns",
    icon: "drumstick",
    hasTimeLimit: true,
    defaultTimeLimit: 5,
    properties: [
      {
        name: "patternId",
        displayName: "Pattern",
        type: "select",
        required: true,
        options: [
          { value: "Bossa Nova", label: "Bossa Nova" },
          { value: "Samba", label: "Samba" },
          { value: "Zamba", label: "Zamba" },
          { value: "Chacarera", label: "Chacarera" },
          { value: "Afro-Cuban 6/8", label: "Afro-Cuban 6/8" },
        ],
      },
      {
        name: "tempo",
        displayName: "Tempo (BPM)",
        type: "number",
        required: false,
      },
      {
        name: "practiceMode",
        displayName: "Practice Mode",
        type: "select",
        required: false,
        default: "normal",
        options: [
          { value: "normal", label: "Normal Speed" },
          { value: "slow", label: "Slow Practice" },
          { value: "gradual", label: "Gradual Increase" },
        ],
      },
    ],
  },
  guitarTuner: {
    type: "guitarTuner",
    displayName: "Guitar Tuner",
    description: "Tune your guitar with precision",
    icon: "guitar",
    hasTimeLimit: false,
    defaultTimeLimit: 0,
    properties: [
      {
        name: "tuning",
        displayName: "Tuning",
        type: "select",
        required: false,
        default: "Standard (E A D G B E)",
        options: [
          { value: "Standard (E A D G B E)", label: "Standard (E A D G B E)" },
          { value: "Drop D (D A D G B E)", label: "Drop D (D A D G B E)" },
          { value: "Half Step Down (Eb Ab Db Gb Bb Eb)", label: "Half Step Down (Eb Ab Db Gb Bb Eb)" },
          { value: "Full Step Down (D G C F A D)", label: "Full Step Down (D G C F A D)" },
          { value: "Open G (D G D G B D)", label: "Open G (D G D G B D)" },
          { value: "Open D (D A D F# A D)", label: "Open D (D A D F# A D)" },
        ],
      },
    ],
  },
  partitureEditor: {
    type: "partitureEditor",
    displayName: "Partiture Editor",
    description: "Create and edit music notation",
    icon: "file-music",
    hasTimeLimit: true,
    defaultTimeLimit: 10,
    properties: [
      {
        name: "scoreId",
        displayName: "Score",
        type: "string",
        required: false,
      },
    ],
  },
}
