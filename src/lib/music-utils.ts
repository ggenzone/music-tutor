// Helper function to get chord root and type
export function parseChord(chordName: string) {
  // Basic chord parsing - can be expanded for more complex chords
  const root = chordName.replace(/maj7|m7b5|m7|7/g, "")
  return { root }
}

// Helper function to transpose voicings
export function transposeVoicing(voicing: string[], semitones: number) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  return voicing.map((note) => {
    const noteName = note.replace(/[0-9]/g, "")
    const octave = Number.parseInt(note.match(/[0-9]/g)?.[0] || "4")

    let noteIndex = notes.indexOf(noteName)
    if (noteIndex === -1) {
      // Handle flats by converting to equivalent sharps
      noteIndex = notes.indexOf(
        noteName.replace("Db", "C#").replace("Eb", "D#").replace("Gb", "F#").replace("Ab", "G#").replace("Bb", "A#"),
      )
    }

    let newIndex = (noteIndex + semitones) % 12
    if (newIndex < 0) newIndex += 12

    let newOctave = octave + Math.floor((noteIndex + semitones) / 12)
    if (semitones < 0 && noteIndex + semitones < 0 && (noteIndex + semitones) % 12 !== 0) {
      newOctave -= 1
    }

    return `${notes[newIndex]}${newOctave}`
  })
}

// Helper function to calculate semitone difference between notes
export function getTransposition(fromRoot: string, toRoot: string) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  // Handle flats by converting to equivalent sharps
  const normalizedFromRoot = fromRoot
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#")
    .replace("Bb", "A#")

  const normalizedToRoot = toRoot
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#")
    .replace("Bb", "A#")

  const fromIndex = notes.indexOf(normalizedFromRoot)
  const toIndex = notes.indexOf(normalizedToRoot)

  if (fromIndex === -1 || toIndex === -1) {
    console.error(`Could not find note index for ${fromRoot} or ${toRoot}`)
    return 0
  }

  return toIndex - fromIndex
}
