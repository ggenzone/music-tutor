import type { Step } from "@/lib/routine-types"
import ChordProgression from "@/components/jazz-book"
import MelodyPlayer from "@/components/melody-player"
import RhythmPatterns from "@/components/rhythm-patterns" 
import Metronome from "@/components/metronome"
import GuitarTuner from "@/components/guitar-tuner"
import PartitureEditor from "@/components/partiture-editor"
import { useState, useEffect } from "react"

interface StepDisplayProps {
  step: Step
}

export function StepDisplay({ step }: StepDisplayProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="p-8 text-center">Loading tool...</div>
  }

  // Render the appropriate component based on the step type
  switch (
    step.tool // Changed from step.toolType to step.tool to match routine-types.ts
  ) {
    case "chordProgression": // Changed from "jazzComping" to "chordProgression"
      return <ChordProgression {...step.props} />

    case "melodyPlayer":
      return <MelodyPlayer {...step.props} />

    case "rhythmPatterns":
      return <RhythmPatterns {...step.props} />

    case "metronome":
      return <Metronome {...step.props} />

    case "guitarTuner":
      return <GuitarTuner {...step.props} />

    case "partitureEditor":
      return <PartitureEditor {...step.props} />

    default:
      return (
        <div className="p-8 text-center">
          <p className="text-red-500">Unknown tool type: {step.tool}</p>
        </div>
      )
  }
}
