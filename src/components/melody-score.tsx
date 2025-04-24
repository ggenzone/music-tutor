import { useEffect, useRef } from "react"

interface MelodyScoreProps {
  melody: {
    notes: (string | null)[]
    durations: string[]
    timeSignature: string
    key: string
  }
  currentNoteIndex: number
}

export function MelodyScore({ melody, currentNoteIndex }: MelodyScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !melody) return

    // Clear previous rendering
    containerRef.current.innerHTML = ""

    // Dynamically import VexFlow to avoid SSR issues
    const renderScore = async () => {
      try {
        // Import VexFlow correctly
        const Vex = await import("vexflow")

        // Create renderer
        const renderer = new Vex.default.Renderer(containerRef.current, Vex.default.Renderer.Backends.SVG)

        renderer.resize(1000, 250)
        const context = renderer.getContext()
        context.setFont("Arial", 10)

        // Parse time signature
        const [numerator, denominator] = melody.timeSignature.split("/").map(Number)
        const measuresPerLine = 4

        // Helper function to convert Tone.js duration to VexFlow duration
        const convertDuration = (toneDuration) => {
          // Remove 'n' from duration (e.g., '4n' -> '4')
          const vexDuration = toneDuration.replace("n", "")

          // Handle dotted notes
          const isDotted = toneDuration.includes(".")

          return { vexDuration, isDotted }
        }

        // Helper function to get duration value in beats
        const getDurationValue = (duration) => {
          if (duration.includes("n")) {
            const base = Number.parseInt(duration.replace(/[^0-9]/g, "")) || 4
            let value = 4 / base
            if (duration.includes(".")) {
              value *= 1.5
            }
            return value
          }
          return 0
        }

        // Simplified approach: render each note individually with its own stave
        // This avoids the "Too many ticks" error by not trying to fit notes into measures
        const staveHeight = 80
        const staveWidth = 900
        const notesPerLine = 16
        const totalNotes = melody.notes.length
        const totalLines = Math.ceil(totalNotes / notesPerLine)

        for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
          // Create a stave for this line
          const stave = new Vex.default.Stave(50, lineIndex * staveHeight + 50, staveWidth)

          // Add clef and key signature to each line
          stave.addClef("treble")

          // Add time signature to the first line only
          if (lineIndex === 0) {
            stave.addTimeSignature(melody.timeSignature)
          }

          // Add key signature if provided
          if (melody.key) {
            try {
              const keySignature = new Vex.default.KeySignature(melody.key)
              keySignature.addToStave(stave)
            } catch (keyError) {
              console.warn("Could not add key signature:", keyError)
            }
          }

          stave.setContext(context).draw()

          // Create notes for this line
          const staveNotes = []
          const startNoteIndex = lineIndex * notesPerLine
          const endNoteIndex = Math.min(startNoteIndex + notesPerLine, totalNotes)

          for (let i = startNoteIndex; i < endNoteIndex; i++) {
            const note = melody.notes[i]
            const duration = melody.durations[i]
            const { vexDuration, isDotted } = convertDuration(duration)

            if (note === null) {
              // Create a rest
              const restDuration = vexDuration.includes("r") ? vexDuration : vexDuration + "r"
              try {
                const rest = new Vex.default.StaveNote({
                  clef: "treble",
                  keys: ["b/4"],
                  duration: restDuration,
                })

                // Add dot if needed
                if (isDotted) {
                  try {
                    if (typeof rest.addDot === "function") {
                      rest.addDot(0)
                    }
                  } catch (dotError) {
                    console.warn("Could not add dot to rest:", dotError)
                  }
                }

                // Highlight the current note
                if (i === currentNoteIndex) {
                  rest.setStyle({
                    fillStyle: "rgba(255, 0, 0, 0.3)",
                    strokeStyle: "rgba(255, 0, 0, 0.3)",
                  })
                }

                staveNotes.push(rest)
              } catch (restError) {
                console.warn("Could not create rest:", restError)
                // Skip this note if we can't create it
                continue
              }
            } else {
              // Parse the note to get the key and octave
              const [key, octave] = note.split(/(\d+)/)

              try {
                // Create a note
                const staveNote = new Vex.default.StaveNote({
                  clef: "treble",
                  keys: [`${key.toLowerCase()}/${octave}`],
                  duration: vexDuration,
                })

                // Add accidentals if needed
                if (key.includes("#")) {
                  try {
                    if (typeof staveNote.addAccidental === "function") {
                      staveNote.addAccidental(0, new Vex.default.Accidental("#"))
                    }
                  } catch (accError) {
                    console.warn("Could not add sharp accidental:", accError)
                  }
                } else if (key.includes("b")) {
                  try {
                    if (typeof staveNote.addAccidental === "function") {
                      staveNote.addAccidental(0, new Vex.default.Accidental("b"))
                    }
                  } catch (accError) {
                    console.warn("Could not add flat accidental:", accError)
                  }
                }

                // Add dot if needed
                if (isDotted) {
                  try {
                    if (typeof staveNote.addDot === "function") {
                      staveNote.addDot(0)
                    }
                  } catch (dotError) {
                    console.warn("Could not add dot to note:", dotError)
                  }
                }

                // Highlight the current note
                if (i === currentNoteIndex) {
                  staveNote.setStyle({
                    fillStyle: "rgba(255, 0, 0, 0.3)",
                    strokeStyle: "rgba(255, 0, 0, 0.3)",
                  })
                }

                staveNotes.push(staveNote)
              } catch (noteError) {
                console.warn("Could not create note:", noteError, note)
                // Skip this note if we can't create it
                continue
              }
            }
          }

          // Create a voice with a simple 4/4 time signature
          // This avoids the "Too many ticks" error by using a simple time signature
          // that doesn't try to enforce strict measure boundaries
          try {
            const voice = new Vex.default.Voice({
              num_beats: staveNotes.length,
              beat_value: 4,
              resolution: Vex.default.RESOLUTION,
            }).setMode(Vex.default.Voice.Mode.SOFT)

            // Add all notes to the voice
            voice.addTickables(staveNotes)

            // Format and draw
            new Vex.default.Formatter().joinVoices([voice]).format([voice], staveWidth - 100)

            voice.draw(context, stave)
          } catch (voiceError) {
            console.error("Error creating voice:", voiceError)
            // If we can't create a voice, just display the error and continue
            context.save()
            context.font = "12px Arial"
            context.fillStyle = "red"
            context.fillText(
              `Error rendering line ${lineIndex + 1}: ${voiceError.message}`,
              60,
              lineIndex * staveHeight + 80,
            )
            context.restore()
          }
        }
      } catch (error) {
        console.error("Error rendering music score:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 text-red-500">
              Error rendering music notation: ${error.message}. 
              <br>
              <span class="text-sm text-gray-500 mt-2 block">
                The melody will still play correctly even though it can't be displayed.
              </span>
            </div>
          `
        }
      }
    }

    renderScore()
  }, [melody, currentNoteIndex])

  return <div id="melody-score" ref={containerRef} className="w-full overflow-auto" />
}
