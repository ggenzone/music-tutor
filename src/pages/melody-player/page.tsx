import { PlayerLayout } from "@/components/player-layout"
import { MelodyPlayer } from "@/components/melody-player"

export default function MelodyPlayerPage() {
  return (
    <PlayerLayout title="Jazz Melody Practice">
      <div className="flex flex-col h-full">
        {/* Main content area - takes all available space */}
        <div className="flex-grow overflow-auto p-4">
          <MelodyPlayer />
        </div>
      </div>
    </PlayerLayout>
  )
}
