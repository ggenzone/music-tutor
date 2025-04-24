import { PlayerLayout } from "@/components/player-layout"
import { RhythmPatterns } from "@/components/rhythm-patterns"

export default function RhythmPatternsPage() {
  return (
    <PlayerLayout title="Rhythm Patterns Practice">
      <div className="flex flex-col h-full">
        {/* Main content area - takes all available space */}
        <div className="flex-grow overflow-auto p-4">
          <RhythmPatterns />
        </div>
      </div>
    </PlayerLayout>
  )
}
