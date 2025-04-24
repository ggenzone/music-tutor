import { PlayerLayout } from "@/components/player-layout"
import { GuitarTuner } from "@/components/guitar-tuner"

export default function GuitarTunerPage() {
  return (
    <PlayerLayout title="Guitar Tuner">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto p-4">
          <GuitarTuner />
        </div>
      </div>
    </PlayerLayout>
  )
}
