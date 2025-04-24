import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Step, type ToolType, TOOL_CONFIGS } from "@/lib/routine-types"

interface StepEditorProps {
  toolType: ToolType
  step?: Step | null
  onSave: (step: Step) => void
  onCancel: () => void
}

export function StepEditor({ toolType, step, onSave, onCancel }: StepEditorProps) {
  const toolConfig = TOOL_CONFIGS[toolType]

  // Initialize state with default values or values from existing step
  const [name, setName] = useState(step?.name || "")
  const [timeLimit, setTimeLimit] = useState(step?.timeLimit ?? toolConfig.defaultTimeLimit)
  const [props, setProps] = useState<Record<string, any>>(
    step?.props ||
      toolConfig.properties.reduce(
        (acc, prop) => {
          acc[prop.name] = prop.default !== undefined ? prop.default : null
          return acc
        },
        {} as Record<string, any>,
      ),
  )

  // Handle property change
  const handlePropertyChange = (name: string, value: any) => {
    setProps({
      ...props,
      [name]: value,
    })
  }

  // Handle save
  const handleSave = () => {
    const newStep: Step = {
      id: step?.id || uuidv4(),
      tool: toolType,
      name,
      timeLimit,
      props,
    } as Step

    onSave(newStep)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="step-name">Step Name (Optional)</Label>
        <Input
          id="step-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${toolConfig.displayName} Practice`}
          className="mt-1"
        />
      </div>

      {toolConfig.hasTimeLimit && (
        <div>
          <Label htmlFor="time-limit">Time Limit (minutes)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="time-limit"
              type="number"
              min="0"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-stone-500">{timeLimit === 0 ? "No time limit" : `${timeLimit} minutes`}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Tool Properties</h3>
        {toolConfig.properties.map((property) => (
          <div key={property.name}>
            <Label htmlFor={`prop-${property.name}`}>{property.displayName}</Label>
            <div className="mt-1">
              {property.type === "string" && (
                <Input
                  id={`prop-${property.name}`}
                  value={props[property.name] || ""}
                  onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                  required={property.required}
                />
              )}
              {property.type === "number" && (
                <Input
                  id={`prop-${property.name}`}
                  type="number"
                  value={props[property.name] || 0}
                  onChange={(e) => handlePropertyChange(property.name, Number(e.target.value))}
                  required={property.required}
                />
              )}
              {property.type === "boolean" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`prop-${property.name}`}
                    checked={!!props[property.name]}
                    onCheckedChange={(checked) => handlePropertyChange(property.name, checked)}
                  />
                  <Label htmlFor={`prop-${property.name}`}>{props[property.name] ? "Enabled" : "Disabled"}</Label>
                </div>
              )}
              {property.type === "select" && property.options && (
                <Select
                  value={props[property.name] || ""}
                  onValueChange={(value) => handlePropertyChange(property.name, value)}
                >
                  <SelectTrigger id={`prop-${property.name}`}>
                    <SelectValue placeholder={`Select ${property.displayName}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {property.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>{step ? "Update Step" : "Add Step"}</Button>
      </div>
    </div>
  )
}
