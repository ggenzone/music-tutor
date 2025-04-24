import { PlayerLayout } from "@/components/player-layout"
import { PartitureEditor } from "@/components/partiture-editor"

export default function PartitureEditorPage() {
  return (
    <PlayerLayout title="Partiture Editor">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto p-4">
          <PartitureEditor />
        </div>
      </div>
    </PlayerLayout>
  )
}
