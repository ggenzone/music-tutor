// Rhythm pattern data structure
export interface RhythmPattern {
  name: string
  description: string
  timeSignature: string
  measures: number
  tempo: number
  // Percussion parts - each array represents hits in a measure (values from 0 to 1)
  // For example, [0, 0.25, 0.5, 0.75] represents 4 evenly spaced hits in a measure
  parts: {
    high: number[][] // High percussion (e.g., clave, hi-hat)
    mid: number[][] // Mid percussion (e.g., snare, conga)
    low: number[][] // Low percussion (e.g., bass drum)
  }
  notation: {
    // VexFlow notation data for each part
    high: string[]
    mid: string[]
    low: string[]
  }
}

export const RHYTHM_PATTERNS: Record<string, RhythmPattern> = {
  "Bossa Nova": {
    name: "Bossa Nova",
    description: "The classic Brazilian rhythm popularized by Antonio Carlos Jobim and João Gilberto",
    timeSignature: "4/4",
    measures: 2,
    tempo: 120,
    parts: {
      high: [
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], // Hi-hat/ride pattern
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      ],
      mid: [
        [1, 2, 3.5], // Snare/rim pattern
        [1, 2, 3.5],
      ],
      low: [
        [0, 2], // Bass drum pattern
        [0, 2],
      ],
    },
    notation: {
      high: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      mid: ["4n", "4n", "8n", "8n", "4n", "4n", "8n", "8n"],
      low: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n"],
    },
  },
  Samba: {
    name: "Samba",
    description: "Energetic Brazilian rhythm with syncopated patterns",
    timeSignature: "4/4",
    measures: 2,
    tempo: 130,
    parts: {
      high: [
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], // Hi-hat/ride pattern
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
      ],
      mid: [
        [0.5, 1.5, 2.5, 3.5], // Snare/rim pattern
        [0.5, 1.5, 2.5, 3.5],
      ],
      low: [
        [0, 1, 2, 3], // Bass drum pattern
        [0, 1, 2, 3],
      ],
    },
    notation: {
      high: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      mid: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      low: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n"],
    },
  },
  Zamba: {
    name: "Zamba",
    description: "Traditional Argentine folk rhythm in 6/8 time",
    timeSignature: "6/8",
    measures: 2,
    tempo: 90,
    parts: {
      high: [
        [0, 1, 2, 3, 4, 5], // Hi-hat/ride pattern
        [0, 1, 2, 3, 4, 5],
      ],
      mid: [
        [0, 3], // Snare/rim pattern
        [0, 3],
      ],
      low: [
        [0, 3], // Bass drum pattern
        [0, 3],
      ],
    },
    notation: {
      high: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      mid: ["4n.", "4n.", "4n.", "4n."],
      low: ["4n.", "4n.", "4n.", "4n."],
    },
  },
  Chacarera: {
    name: "Chacarera",
    description: "Lively Argentine folk rhythm with hemiola patterns",
    timeSignature: "6/8",
    measures: 2,
    tempo: 110,
    parts: {
      high: [
        [0, 1, 2, 3, 4, 5], // Hi-hat/ride pattern
        [0, 1, 2, 3, 4, 5],
      ],
      mid: [
        [0, 2, 3, 5], // Snare/rim pattern
        [0, 2, 3, 5],
      ],
      low: [
        [0, 3], // Bass drum pattern
        [0, 3],
      ],
    },
    notation: {
      high: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      mid: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n"],
      low: ["4n.", "4n.", "4n.", "4n."],
    },
  },
  "Afro-Cuban 6/8": {
    name: "Afro-Cuban 6/8",
    description: "Traditional Afro-Cuban bell pattern in 6/8",
    timeSignature: "6/8",
    measures: 1,
    tempo: 120,
    parts: {
      high: [[0, 1.5, 3, 4, 5]],
      mid: [[0, 3]],
      low: [[0, 2, 4]],
    },
    notation: {
      high: ["8n", "8n", "8n", "8n", "8n"],
      mid: ["4n.", "4n."],
      low: ["8n", "8n", "8n"],
    },
  },
}
