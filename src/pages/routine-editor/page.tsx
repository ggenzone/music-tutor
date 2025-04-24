import { PlayerLayout } from "@/components/player-layout"
import { RoutineEditor } from "@/components/routine-editor"

export default function RoutineEditorPage() {
  return (
    <PlayerLayout title="Routine Editor">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto p-4">
          <RoutineEditor />
        </div>
      </div>
    </PlayerLayout>
  )
}
