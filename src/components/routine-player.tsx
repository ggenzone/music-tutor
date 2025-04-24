import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Clock, Upload, Pause, Play } from "lucide-react"
import { StepDisplay } from "@/components/step-display"
import type { Routine } from "@/lib/routine-types"
import { PlayerLayout } from "@/components/player-layout"

export function RoutinePlayer() {
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (routine && routine.steps.length > 0) {
      const step = routine.steps[currentStepIndex]
      setTimeRemaining(step.timeLimit * 60) // Convert minutes to seconds
      startTimer()
    }
  }, [routine, currentStepIndex])

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const step = routine?.steps[currentStepIndex]
    if (!step || step.timeLimit === 0) return

    setIsPaused(false)
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const togglePause = () => {
    if (isPaused) {
      startTimer()
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        setIsPaused(true)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedRoutine = JSON.parse(content) as Routine

        // Basic validation
        if (!parsedRoutine.name || !Array.isArray(parsedRoutine.steps)) {
          throw new Error("Invalid routine format")
        }

        // Debug the loaded routine
        console.log("Loaded routine:", parsedRoutine)

        // Check if steps have the expected properties
        if (parsedRoutine.steps.length > 0) {
          const firstStep = parsedRoutine.steps[0]
          console.log("First step:", firstStep)
          console.log("Tool type:", firstStep.tool)
          console.log("Props:", firstStep.props)
        }

        setRoutine(parsedRoutine)
        setCurrentStepIndex(0)
        setError(null)
      } catch (err) {
        setError("Failed to load routine. Please check the file format.")
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  const nextStep = () => {
    if (!routine) return

    if (currentStepIndex < routine.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (!routine) return

    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentStep = routine?.steps[currentStepIndex]
  const progress = currentStep?.timeLimit
    ? ((currentStep.timeLimit * 60 - timeRemaining) / (currentStep.timeLimit * 60)) * 100
    : 0

  return (
    <PlayerLayout title="Routine Player">
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {!routine ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-semibold">Upload Routine</h2>
            <p className="text-center text-gray-500">Upload a routine JSON file to begin your practice session</p>
            <Button onClick={() => fileInputRef.current?.click()} className="mt-2">
              Select File
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <h1 className="text-2xl font-bold mb-2">{routine.name}</h1>
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  Step {currentStepIndex + 1} of {routine.steps.length}
                </span>
                {currentStep?.timeLimit > 0 && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
            </div>

            {currentStep && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">{currentStep.name}</h2>
                  {currentStep.description && <p className="text-gray-600 mt-1">{currentStep.description}</p>}
                </div>

                {currentStep.timeLimit > 0 && (
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Time Remaining</span>
                      <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-center mt-2">
                      <Button variant="outline" size="sm" onClick={togglePause} className="flex items-center">
                        {isPaused ? (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <StepDisplay step={currentStep} />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button onClick={prevStep} disabled={currentStepIndex === 0} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStepIndex === routine.steps.length - 1}
                className="flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </PlayerLayout>
  )
}
