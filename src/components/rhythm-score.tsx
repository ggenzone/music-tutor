import { useEffect, useRef } from "react"
import type { RhythmPattern } from "@/lib/rhythm-pattern-data"

interface RhythmScoreProps {
  pattern: RhythmPattern
  currentBeat: number
}

export function RhythmScore({ pattern, currentBeat }: RhythmScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !pattern) return

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
        const [numerator, denominator] = pattern.timeSignature.split("/").map(Number)

        // Calculate positions
        const staveWidth = 900 / pattern.measures
        const staveHeight = 60

        // Create staves for each percussion part
        const partNames = ["High", "Mid", "Low"]
        const partColors = ["#3b82f6", "#10b981", "#ef4444"] // Blue, Green, Red

        for (let partIndex = 0; partIndex < 3; partIndex++) {
          // Create staves for each measure
          for (let measureIndex = 0; measureIndex < pattern.measures; measureIndex++) {
            const xPosition = measureIndex * staveWidth
            const yPosition = partIndex * staveHeight

            // Create stave
            const stave = new Vex.default.Stave(xPosition + 50, yPosition + 50, staveWidth - 10)

            // Add clef and time signature only to the first measure of each part
            if (measureIndex === 0) {
              stave.addClef("percussion")
              stave.addTimeSignature(pattern.timeSignature)

              // Add part name
              context.save()
              context.font = "12px Arial"
              context.fillStyle = partColors[partIndex]
              context.fillText(partNames[partIndex], 10, yPosition + 65)
              context.restore()
            }

            // Add bar lines
            if (measureIndex === pattern.measures - 1) {
              stave.setEndBarType(Vex.default.Barline.type.END)
            }

            stave.setContext(context).draw()

            // Create notes for this measure
            try {
              // Get the part data
              const partKey = partIndex === 0 ? "high" : partIndex === 1 ? "mid" : "low"
              const partData = pattern.parts[partKey][measureIndex]

              if (!partData || partData.length === 0) {
                // If no notes, add a whole rest
                const rest = new Vex.default.StaveNote({
                  clef: "percussion",
                  keys: ["b/4"],
                  duration: "wr",
                })

                const voice = new Vex.default.Voice({
                  num_beats: numerator,
                  beat_value: denominator,
                }).setMode(Vex.default.Voice.Mode.SOFT)

                voice.addTickable(rest)
                new Vex.default.Formatter().joinVoices([voice]).format([voice], staveWidth - 20)
                voice.draw(context, stave)
                continue
              }

              // Create notes based on the rhythm pattern
              const staveNotes = []

              // For simplicity, we'll use quarter and eighth notes
              // In a real implementation, you'd need more complex logic to determine note durations
              for (let beatIndex = 0; beatIndex < numerator; beatIndex++) {
                if (partData.includes(beatIndex)) {
                  // This beat has a hit
                  const note = new Vex.default.StaveNote({
                    clef: "percussion",
                    keys: ["b/4"], // Use a standard position for percussion
                    duration: "q", // Quarter note
                  })

                  // Highlight the current beat
                  const globalBeatIndex = measureIndex * numerator + beatIndex
                  if (globalBeatIndex === currentBeat) {
                    note.setStyle({
                      fillStyle: partColors[partIndex],
                      strokeStyle: partColors[partIndex],
                    })
                  }

                  staveNotes.push(note)
                } else {
                  // This beat is a rest
                  const rest = new Vex.default.StaveNote({
                    clef: "percussion",
                    keys: ["b/4"],
                    duration: "qr", // Quarter rest
                  })
                  staveNotes.push(rest)
                }
              }

              // Create a voice
              const voice = new Vex.default.Voice({
                num_beats: numerator,
                beat_value: denominator,
              }).setMode(Vex.default.Voice.Mode.SOFT)

              // Add notes to the voice
              voice.addTickables(staveNotes)

              // Format and draw
              new Vex.default.Formatter().joinVoices([voice]).format([voice], staveWidth - 20)
              voice.draw(context, stave)
            } catch (error) {
              console.error("Error rendering measure:", error)
              // Draw error message
              context.save()
              context.font = "10px Arial"
              context.fillStyle = "red"
              context.fillText("Error rendering", xPosition + 60, yPosition + 70)
              context.restore()
            }
          }
        }

        // Add a legend
        context.save()
        context.font = "12px Arial"
        context.fillStyle = "#333"
        context.fillText("Legend:", 50, 240)

        for (let i = 0; i < partNames.length; i++) {
          context.fillStyle = partColors[i]
          context.fillText(`${partNames[i]}`, 120 + i * 100, 240)
        }
        context.restore()
      } catch (error) {
        console.error("Error rendering rhythm score:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 text-red-500">
              Error rendering rhythm notation: ${error.message}. 
              <br>
              <span class="text-sm text-gray-500 mt-2 block">
                The rhythm will still play correctly even though it can't be displayed.
              </span>
            </div>
          `
        }
      }
    }

    renderScore()
  }, [pattern, currentBeat])

  return <div id="rhythm-score" ref={containerRef} className="w-full overflow-auto" />
}
