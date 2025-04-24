import { type Step, TOOL_CONFIGS } from "@/lib/routine-types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronUp, ChevronDown, Clock } from "lucide-react"

interface StepListProps {
  steps: Step[]
  onEdit: (index: number) => void
  onRemove: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function StepList({ steps, onEdit, onRemove, onMoveUp, onMoveDown }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>No steps added yet. Click "Add Step" to create your routine.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const toolConfig = TOOL_CONFIGS[step.tool]
        return (
          <div key={step.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="bg-stone-100 text-stone-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2">
                    {index + 1}
                  </span>
                  <h3 className="font-medium">{step.name || toolConfig.displayName}</h3>
                </div>
                <div className="mt-2 text-sm text-stone-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.timeLimit > 0 ? `${step.timeLimit} minutes` : "No time limit"}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-stone-600">
                    {Object.entries(step.props)
                      .filter(([_, value]) => value !== null && value !== undefined && value !== "")
                      .map(([key, value]) => {
                        const property = toolConfig.properties.find((p) => p.name === key)
                        if (!property) return null
                        return (
                          <div key={key} className="inline-block mr-4 mb-1">
                            <span className="font-medium">{property.displayName}:</span>{" "}
                            {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="h-7 w-7"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMoveDown(index)}
                    disabled={index === steps.length - 1}
                    className="h-7 w-7"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(index)} className="h-7 w-7">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
