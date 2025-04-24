// Common jazz chord progressions
export const CHORD_PROGRESSIONS = {
  "ii-V-I": ["Dm7", "G7", "Cmaj7", "Cmaj7"],
  "I-vi-ii-V": ["Cmaj7", "Am7", "Dm7", "G7"],
  "Rhythm Changes A": ["Bbmaj7", "Gm7", "Cm7", "F7"],
  "Blues in F": ["F7", "Bb7", "F7", "F7", "Bb7", "Bb7", "F7", "F7", "C7", "Bb7", "F7", "C7"],
  "Autumn Leaves": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7", "Gm7", "Gm7"],
}

// Enhanced jazz chord voicings with proper voice leading
export const CHORD_VOICINGS = {
  // Major 7th voicings
  Cmaj7: [
    ["E3", "G3", "B3", "C4"], // Root position
    ["G3", "B3", "C4", "E4"], // 1st inversion
    ["B3", "C4", "E4", "G4"], // 2nd inversion
    ["C4", "E4", "G4", "B4"], // 3rd inversion
    ["E3", "B3", "C4", "G4"], // Spread voicing
    ["G3", "C4", "D4", "B4"], // Quartal voicing
  ],
  Fmaj7: [
    ["A3", "C4", "E4", "F4"],
    ["C3", "E3", "F3", "A3"],
    ["E3", "F3", "A3", "C4"],
    ["F3", "A3", "C4", "E4"],
    ["A3", "E4", "F4", "C5"],
    ["C4", "F4", "G4", "E5"],
  ],
  Bbmaj7: [
    ["D3", "F3", "A3", "Bb3"],
    ["F3", "A3", "Bb3", "D4"],
    ["A3", "Bb3", "D4", "F4"],
    ["Bb3", "D4", "F4", "A4"],
    ["D3", "A3", "Bb3", "F4"],
    ["F3", "Bb3", "C4", "A4"],
  ],
  Ebmaj7: [
    ["G3", "Bb3", "D4", "Eb4"],
    ["Bb3", "D4", "Eb4", "G4"],
    ["D3", "Eb3", "G3", "Bb3"],
    ["Eb3", "G3", "Bb3", "D4"],
    ["G3", "D4", "Eb4", "Bb4"],
    ["Bb3", "Eb4", "F4", "D5"],
  ],

  // Minor 7th voicings
  Dm7: [
    ["F3", "A3", "C4", "D4"],
    ["A3", "C4", "D4", "F4"],
    ["C3", "D3", "F3", "A3"],
    ["D3", "F3", "A3", "C4"],
    ["F3", "C4", "D4", "A4"],
    ["A3", "D4", "E4", "C5"],
  ],
  Gm7: [
    ["Bb3", "D4", "F4", "G4"],
    ["D3", "F3", "G3", "Bb3"],
    ["F3", "G3", "Bb3", "D4"],
    ["G3", "Bb3", "D4", "F4"],
    ["Bb3", "F4", "G4", "D5"],
    ["D4", "G4", "A4", "F5"],
  ],
  Cm7: [
    ["Eb3", "G3", "Bb3", "C4"],
    ["G3", "Bb3", "C4", "Eb4"],
    ["Bb3", "C4", "Eb4", "G4"],
    ["C3", "Eb3", "G3", "Bb3"],
    ["Eb3", "Bb3", "C4", "G4"],
    ["G3", "C4", "D4", "Bb4"],
  ],
  Am7: [
    ["C4", "E4", "G4", "A4"],
    ["E3", "G3", "A3", "C4"],
    ["G3", "A3", "C4", "E4"],
    ["A3", "C4", "E4", "G4"],
    ["C4", "G4", "A4", "E5"],
    ["E4", "A4", "B4", "G5"],
  ],

  // Dominant 7th voicings
  G7: [
    ["B3", "D4", "F4", "G4"],
    ["D3", "F3", "G3", "B3"],
    ["F3", "G3", "B3", "D4"],
    ["G3", "B3", "D4", "F4"],
    ["B3", "F4", "G4", "D5"],
    ["D4", "G4", "A4", "F5"],
    ["F3", "B3", "D4", "G4"], // Altered voicing
  ],
  C7: [
    ["E3", "G3", "Bb3", "C4"],
    ["G3", "Bb3", "C4", "E4"],
    ["Bb3", "C4", "E4", "G4"],
    ["C3", "E3", "G3", "Bb3"],
    ["E3", "Bb3", "C4", "G4"],
    ["G3", "C4", "D4", "Bb4"],
    ["Bb3", "E4", "G4", "C5"], // Altered voicing
  ],
  F7: [
    ["A3", "C4", "Eb4", "F4"],
    ["C3", "Eb3", "F3", "A3"],
    ["Eb3", "F3", "A3", "C4"],
    ["F3", "A3", "C4", "Eb4"],
    ["A3", "Eb4", "F4", "C5"],
    ["C4", "F4", "G4", "Eb5"],
    ["Eb3", "A3", "C4", "F4"], // Altered voicing
  ],
  Bb7: [
    ["D3", "F3", "Ab3", "Bb3"],
    ["F3", "Ab3", "Bb3", "D4"],
    ["Ab3", "Bb3", "D4", "F4"],
    ["Bb3", "D4", "F4", "Ab4"],
    ["D3", "Ab3", "Bb3", "F4"],
    ["F3", "Bb3", "C4", "Ab4"],
    ["Ab3", "D4", "F4", "Bb4"], // Altered voicing
  ],
  D7: [
    ["F#3", "A3", "C4", "D4"],
    ["A3", "C4", "D4", "F#4"],
    ["C3", "D3", "F#3", "A3"],
    ["D3", "F#3", "A3", "C4"],
    ["F#3", "C4", "D4", "A4"],
    ["A3", "D4", "E4", "C5"],
    ["C4", "F#4", "A4", "D5"], // Altered voicing
  ],

  // Half-diminished voicings
  Am7b5: [
    ["C4", "Eb4", "G4", "A4"],
    ["Eb3", "G3", "A3", "C4"],
    ["G3", "A3", "C4", "Eb4"],
    ["A3", "C4", "Eb4", "G4"],
    ["C4", "G4", "A4", "Eb5"],
    ["Eb4", "A4", "B4", "G5"],
  ],
}

// Default voicing for any chord not explicitly defined
export const DEFAULT_VOICINGS = [
  ["C4", "E4", "G4", "B4"],
  ["E4", "G4", "B4", "D5"],
  ["G4", "B4", "D5", "F5"],
]
