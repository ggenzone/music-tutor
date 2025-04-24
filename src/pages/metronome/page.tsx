import { PlayerLayout } from "@/components/player-layout"
import { Metronome } from "@/components/metronome"

export default function MetronomePage() {
  return (
    <PlayerLayout title="Metronome">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto p-4">
          <Metronome />
        </div>
      </div>
    </PlayerLayout>
  )
}
