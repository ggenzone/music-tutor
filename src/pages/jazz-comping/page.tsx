import { PlayerLayout } from "@/components/player-layout"
import { JazzBook } from "@/components/jazz-book"

export default function JazzCompingPage() {
  return (
    <PlayerLayout title="Jazz Comping Practice">
      <div className="flex flex-col h-full">
        {/* Main content area - takes all available space */}
        <div className="flex-grow overflow-auto p-4">
          <JazzBook />
        </div>
      </div>
    </PlayerLayout>
  )
}
