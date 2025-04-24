// Enhanced rhythm patterns for jazz comping with swing feel
export const RHYTHM_PATTERNS = [
  // Quarter notes
  [0, 1, 2, 3],
  // Syncopated patterns
  [0, 1.5, 2, 3.5],
  [0.5, 1, 2.5, 3],
  // Charleston rhythm
  [0, 2.5],
  // Freddie Green style
  [0, 1, 2, 3],
  // Comping hits
  [0.5, 2.5],
  [0, 2],
  [1, 3],
  // More complex patterns
  [0, 0.75, 2, 2.75],
  [0.5, 1.5, 2.5, 3.5],
  [0, 1.5, 2],
  [0.5, 2],
  [0.75, 2.75],
]

// Drum patterns - different patterns for swing and straight feel
export const DRUM_PATTERNS = {
  swing: {
    // Swing patterns
    ride: [
      [0, 0.66, 1, 1.66, 2, 2.66, 3, 3.66], // Basic swing ride pattern
      [0, 0.66, 1, 1.66, 2, 2.33, 2.66, 3, 3.66], // Swing ride with extra notes
      [0, 0.33, 0.66, 1, 1.66, 2, 2.66, 3, 3.66], // More complex swing
    ],
    hihat: [
      [1, 3], // Basic hi-hat on 2 and 4
      [1, 3, 3.66], // Hi-hat with pickup
      [1, 2.33, 3], // Syncopated hi-hat
    ],
    kick: [
      [0, 2], // Basic kick on 1 and 3
      [0, 2.66], // Kick with anticipation
      [0, 1.66, 2.33], // Syncopated kick
      [0, 1.33, 2.66, 3.33], // Walking kick
    ],
    snare: [
      [1, 3], // Basic snare on 2 and 4
      [1, 2.33, 3], // Snare with ghost note
      [1, 1.66, 3, 3.66], // More ghost notes
    ],
  },
  straight: {
    // Straight patterns
    ride: [
      [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], // Basic straight eighths
      [0, 0.5, 1, 1.5, 2, 2.25, 2.5, 2.75, 3, 3.5], // Straight with fills
      [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5], // More complex straight
    ],
    hihat: [
      [1, 3], // Basic hi-hat on 2 and 4
      [1, 3, 3.5], // Hi-hat with pickup
      [1, 2.5, 3], // Syncopated hi-hat
    ],
    kick: [
      [0, 2], // Basic kick on 1 and 3
      [0, 2.5], // Kick with anticipation
      [0, 1.5, 2.5], // Syncopated kick
      [0, 1, 2, 3], // Four on the floor
    ],
    snare: [
      [1, 3], // Basic snare on 2 and 4
      [1, 2.5, 3], // Snare with ghost note
      [1, 1.5, 3, 3.5], // More ghost notes
    ],
  },
}

// Drum pattern styles
export const DRUM_STYLES = {
  "Jazz Swing": 0,
  Bebop: 1,
  Ballad: 2,
  Latin: 3,
  Funk: 4,
}
