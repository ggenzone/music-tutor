import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Routine, type Step, type ToolType, TOOL_CONFIGS } from "@/lib/routine-types"
import { StepEditor } from "@/components/step-editor"
import { StepList } from "@/components/step-list"
import { Save, FileUp, Clock, Play, Plus, Check } from "lucide-react"

// Create a new empty routine
const createEmptyRoutine = (): Routine => {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    name: "New Routine",
    description: "",
    steps: [],
    createdAt: now,
    updatedAt: now,
    version: "1.0.0",
  }
}

export function RoutineEditor() {
  const [routine, setRoutine] = useState<Routine>(createEmptyRoutine())
  const [activeTab, setActiveTab] = useState("edit")
  const [notification, setNotification] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [selectedToolType, setSelectedToolType] = useState<ToolType | null>(null)

  // Calculate total routine time
  const totalTime = routine.steps.reduce((total, step) => total + step.timeLimit, 0)

  // Handle routine name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoutine({ ...routine, name: e.target.value, updatedAt: new Date().toISOString() })
  }

  // Handle routine description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRoutine({ ...routine, description: e.target.value, updatedAt: new Date().toISOString() })
  }

  // Add a new step to the routine
  const addStep = (step: Step) => {
    const updatedSteps = [...routine.steps, step]
    setRoutine({
      ...routine,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    })
    setIsAddingStep(false)
    setSelectedToolType(null)
    showNotification("Step added successfully")
  }

  // Update an existing step
  const updateStep = (updatedStep: Step, index: number) => {
    const updatedSteps = [...routine.steps]
    updatedSteps[index] = updatedStep
    setRoutine({
      ...routine,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    })
    setEditingStep(null)
    setEditingStepIndex(null)
    showNotification("Step updated successfully")
  }

  // Remove a step from the routine
  const removeStep = (index: number) => {
    const updatedSteps = routine.steps.filter((_, i) => i !== index)
    setRoutine({
      ...routine,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    })
    showNotification("Step removed")
  }

  // Move a step up in the list
  const moveStepUp = (index: number) => {
    if (index === 0) return
    const updatedSteps = [...routine.steps]
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[index - 1]
    updatedSteps[index - 1] = temp
    setRoutine({
      ...routine,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    })
  }

  // Move a step down in the list
  const moveStepDown = (index: number) => {
    if (index === routine.steps.length - 1) return
    const updatedSteps = [...routine.steps]
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[index + 1]
    updatedSteps[index + 1] = temp
    setRoutine({
      ...routine,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    })
  }

  // Edit an existing step
  const editStep = (index: number) => {
    setEditingStep(routine.steps[index])
    setEditingStepIndex(index)
  }

  // Cancel step editing
  const cancelEditStep = () => {
    setEditingStep(null)
    setEditingStepIndex(null)
    setIsAddingStep(false)
    setSelectedToolType(null)
  }

  // Start adding a new step
  const startAddStep = (toolType: ToolType) => {
    setSelectedToolType(toolType)
    setIsAddingStep(true)
  }

  // Save routine to a JSON file
  const saveRoutine = () => {
    try {
      const routineJson = JSON.stringify(routine, null, 2)
      const blob = new Blob([routineJson], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${routine.name.replace(/\s+/g, "_")}_routine.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showNotification("Routine saved successfully")
    } catch (error) {
      console.error("Error saving routine:", error)
      showNotification("Error saving routine")
    }
  }

  // Load routine from a JSON file
  const loadRoutine = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const loadedRoutine = JSON.parse(event.target?.result as string) as Routine

        // Validate the loaded routine
        if (!loadedRoutine.id || !loadedRoutine.name || !Array.isArray(loadedRoutine.steps)) {
          throw new Error("Invalid routine format")
        }

        setRoutine({
          ...loadedRoutine,
          updatedAt: new Date().toISOString(),
        })
        showNotification("Routine loaded successfully")
      } catch (error) {
        console.error("Error loading routine:", error)
        showNotification("Error loading routine: Invalid format")
      }
    }
    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  // Create a new routine
  const createNewRoutine = () => {
    if (routine.steps.length > 0) {
      if (!confirm("Are you sure you want to create a new routine? Any unsaved changes will be lost.")) {
        return
      }
    }
    setRoutine(createEmptyRoutine())
    showNotification("New routine created")
  }

  // Show a notification message
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-xl overflow-hidde border border-stone-200 flex-grow flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <div className="bg-stone-100 border-b border-stone-200 p-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit">Edit Routine</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="flex-grow flex flex-col overflow-auto p-4">
            {/* Routine Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Routine Details</CardTitle>
                <CardDescription>Define your practice routine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input value={routine.name} onChange={handleNameChange} placeholder="Enter routine name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={routine.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Enter routine description"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center text-sm text-stone-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Total time: {totalTime} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Editor */}
            {isAddingStep || editingStep ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{isAddingStep ? "Add New Step" : "Edit Step"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAddingStep && !selectedToolType ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(TOOL_CONFIGS).map((tool) => (
                        <Button
                          key={tool.type}
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center justify-center text-center"
                          onClick={() => startAddStep(tool.type)}
                        >
                          <div className="text-2xl mb-2">{tool.icon}</div>
                          <div className="font-medium">{tool.displayName}</div>
                          <div className="text-xs text-stone-500 mt-1">{tool.description}</div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <StepEditor
                      toolType={selectedToolType || (editingStep?.tool as ToolType)}
                      step={editingStep}
                      onSave={(step) => {
                        if (editingStepIndex !== null) {
                          updateStep(step, editingStepIndex)
                        } else {
                          addStep(step)
                        }
                      }}
                      onCancel={cancelEditStep}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Steps List */}
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Steps</CardTitle>
                      <CardDescription>Manage your routine steps</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddingStep(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <StepList
                      steps={routine.steps}
                      onEdit={editStep}
                      onRemove={removeStep}
                      onMoveUp={moveStepUp}
                      onMoveDown={moveStepDown}
                    />
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Routine Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <Button onClick={saveRoutine}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Routine
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          id="load-routine"
                          accept=".json"
                          onChange={loadRoutine}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline">
                          <FileUp className="h-4 w-4 mr-1" />
                          Load Routine
                        </Button>
                      </div>
                      <Button variant="outline" onClick={createNewRoutine}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="preview" className="flex-grow overflow-auto p-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{routine.name}</CardTitle>
                {routine.description && <CardDescription>{routine.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Total time: {totalTime} minutes</span>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-stone-100">
                        <tr>
                          <th className="px-4 py-2 text-left">#</th>
                          <th className="px-4 py-2 text-left">Tool</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Time</th>
                          <th className="px-4 py-2 text-left">Properties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routine.steps.map((step, index) => {
                          const toolConfig = TOOL_CONFIGS[step.tool]
                          return (
                            <tr key={step.id} className="border-t">
                              <td className="px-4 py-3">{index + 1}</td>
                              <td className="px-4 py-3">{toolConfig.displayName}</td>
                              <td className="px-4 py-3">{step.name || "-"}</td>
                              <td className="px-4 py-3">{step.timeLimit > 0 ? `${step.timeLimit} min` : "No limit"}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-stone-600">
                                  {Object.entries(step.props).map(([key, value]) => {
                                    const property = toolConfig.properties.find((p) => p.name === key)
                                    if (!property) return null
                                    return (
                                      <div key={key} className="mb-1">
                                        <span className="font-medium">{property.displayName}:</span>{" "}
                                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                                      </div>
                                    )
                                  })}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {routine.steps.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-center text-stone-500">
                              No steps added yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={routine.steps.length === 0}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Routine
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification */}
      {notification && (
        <Alert className="fixed bottom-4 right-4 w-auto max-w-sm bg-white shadow-lg border border-green-200">
          <AlertDescription className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            {notification}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
