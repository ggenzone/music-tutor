import { useEffect, useRef } from "react"

interface MusicScoreProps {
  chords: string[]
  currentChordIndex: number
}

export function MusicScore({ chords, currentChordIndex }: MusicScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

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

        // Calculate measures per line based on chord count
        const measuresPerLine = chords.length <= 4 ? chords.length : 4
        const staveWidth = 900 / measuresPerLine

        // Create staves for each measure
        for (let i = 0; i < chords.length; i++) {
          const lineIndex = Math.floor(i / measuresPerLine)
          const xPosition = (i % measuresPerLine) * staveWidth
          const yPosition = lineIndex * 120

          const stave = new Vex.default.Stave(xPosition + 50, yPosition + 50, staveWidth - 10)

          // Add clef only to the first measure of each line
          if (i % measuresPerLine === 0) {
            stave.addClef("treble")
          }

          // Add time signature to the first measure
          if (i === 0) {
            stave.addTimeSignature("4/4")
          }

          // Add bar lines
          if ((i + 1) % measuresPerLine === 0 || i === chords.length - 1) {
            stave.setEndBarType(Vex.default.Barline.type.END)
          }

          stave.setContext(context).draw()

          // Create a whole note for each chord
          const chord = chords[i]
          const note = new Vex.default.StaveNote({
            clef: "treble",
            keys: ["b/4"],
            duration: "w",
          })

          // Add the chord symbol
          try {
            const annotation = new Vex.default.Annotation(chord)
            annotation.setFont("Arial", 14)

            // Handle potential API differences
            if (Vex.default.Annotation.VerticalJustify) {
              annotation.setVerticalJustification(Vex.default.Annotation.VerticalJustify.TOP)
            } else if (
              annotation.setVerticalJustification &&
              typeof annotation.setVerticalJustification === "function"
            ) {
              annotation.setVerticalJustification(1) // TOP = 1 in some versions
            }

            note.addModifier(annotation)
          } catch (annotError) {
            console.warn("Could not add chord annotation:", annotError)
          }

          // Highlight the current chord
          if (i === currentChordIndex) {
            note.setStyle({
              fillStyle: "rgba(255, 0, 0, 0.3)",
              strokeStyle: "rgba(255, 0, 0, 0.3)",
            })
          }

          // Create a voice and formatter
          const voice = new Vex.default.Voice({ num_beats: 4, beat_value: 4 })
          voice.addTickable(note)

          // Format and draw
          new Vex.default.Formatter().joinVoices([voice]).format([voice], staveWidth - 20)
          voice.draw(context, stave)
        }
      } catch (error) {
        console.error("Error rendering music score:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error rendering music notation. Please check console for details.</div>`
        }
      }
    }

    renderScore()
  }, [chords, currentChordIndex])

  return <div id="music-score" ref={containerRef} className="w-full overflow-auto" />
}
