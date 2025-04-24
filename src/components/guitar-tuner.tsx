import { useState, useEffect, useRef } from "react"
import * as Tone from "tone"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Volume2, VolumeX, RefreshCw } from "lucide-react"

// Standard guitar tuning frequencies in Hz
const STANDARD_TUNING = {
  E2: 82.41,
  A2: 110.0,
  D3: 146.83,
  G3: 196.0,
  B3: 246.94,
  E4: 329.63,
}

// Other common tunings
const TUNINGS = {
  "Standard (E A D G B E)": ["E2", "A2", "D3", "G3", "B3", "E4"],
  "Drop D (D A D G B E)": ["D2", "A2", "D3", "G3", "B3", "E4"],
  "Half Step Down (Eb Ab Db Gb Bb Eb)": ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"],
  "Full Step Down (D G C F A D)": ["D2", "G2", "C3", "F3", "A3", "D4"],
  "Open G (D G D G B D)": ["D2", "G2", "D3", "G3", "B3", "D4"],
  "Open D (D A D F# A D)": ["D2", "A2", "D3", "F#3", "A3", "D4"],
}

// Note frequencies in Hz
const NOTE_FREQUENCIES: Record<string, number> = {
  C2: 65.41,
  "C#2": 69.3,
  Db2: 69.3,
  D2: 73.42,
  "D#2": 77.78,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  Gb2: 92.5,
  G2: 98.0,
  "G#2": 103.83,
  Ab2: 103.83,
  A2: 110.0,
  "A#2": 116.54,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  Db3: 138.59,
  D3: 146.83,
  "D#3": 155.56,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  Gb3: 185.0,
  G3: 196.0,
  "G#3": 207.65,
  Ab3: 207.65,
  A3: 220.0,
  "A#3": 233.08,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  Db4: 277.18,
  D4: 293.66,
  "D#4": 311.13,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  Gb4: 369.99,
  G4: 392.0,
  "G#4": 415.3,
  Ab4: 415.3,
  A4: 440.0,
  "A#4": 466.16,
  Bb4: 466.16,
  B4: 493.88,
}

interface GuitarTunerProps {
  initialTuning?: string
}

export function GuitarTuner({ initialTuning = "Standard (E A D G B E)" }: GuitarTunerProps) {
  // State
  const [isListening, setIsListening] = useState(false)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null)
  const [currentNote, setCurrentNote] = useState<string | null>(null)
  const [tuningAccuracy, setTuningAccuracy] = useState<number>(0) // -100 to 100, 0 is in tune
  const [selectedTuning, setSelectedTuning] = useState(initialTuning)
  const [selectedString, setSelectedString] = useState(0) // 0-5 for the six strings
  const [playReference, setPlayReference] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)

  // Refs
  const analyserRef = useRef<Tone.Analyser | null>(null)
  const microphoneRef = useRef<Tone.UserMedia | null>(null)
  const referenceOscillatorRef = useRef<Tone.Oscillator | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dataArrayRef = useRef<Float32Array | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Initialize audio context and analyzer
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Check if browser supports Web Audio API
        if (!window.AudioContext && !window.webkitAudioContext) {
          console.error("Web Audio API is not supported in this browser")
          return
        }

        // Create analyzer
        analyserRef.current = new Tone.Analyser("waveform", 2048)
        dataArrayRef.current = new Float32Array(2048)

        // Create reference oscillator for playback
        referenceOscillatorRef.current = new Tone.Oscillator({
          type: "sine",
          volume: -15,
        }).toDestination()
      } catch (error) {
        console.error("Error initializing audio:", error)
      }
    }

    initAudio()

    return () => {
      // Clean up
      if (microphoneRef.current) {
        microphoneRef.current.close()
      }
      if (analyserRef.current) {
        analyserRef.current.dispose()
      }
      if (referenceOscillatorRef.current) {
        referenceOscillatorRef.current.dispose()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Handle microphone access
  const requestMicrophoneAccess = async () => {
    try {
      // Request microphone access
      if (!microphoneRef.current) {
        microphoneRef.current = new Tone.UserMedia()
      }

      await microphoneRef.current.open()
      setMicPermission(true)

      // Connect microphone to analyzer
      microphoneRef.current.connect(analyserRef.current!)

      // Start listening
      setIsListening(true)
      startListening()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicPermission(false)
    }
  }

  // Stop listening
  const stopListening = () => {
    if (microphoneRef.current) {
      microphoneRef.current.close()
    }
    setIsListening(false)
    setCurrentFrequency(null)
    setCurrentNote(null)
    setTuningAccuracy(0)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  // Start listening and analyzing audio
  const startListening = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    const analyzeAudio = () => {
      if (!isListening || !analyserRef.current || !dataArrayRef.current) return

      // Get audio data
      analyserRef.current.getValue()
      const buffer = analyserRef.current.value as Float32Array

      // Copy buffer to our data array
      dataArrayRef.current.set(buffer)

      // Calculate frequency using autocorrelation
      const frequency = detectPitch(dataArrayRef.current, Tone.context.sampleRate)

      if (frequency > 0) {
        setCurrentFrequency(frequency)

        // Find the closest note
        const note = findClosestNote(frequency)
        setCurrentNote(note.name)

        // Calculate tuning accuracy
        const targetFreq = NOTE_FREQUENCIES[note.name]
        const centsOff = 1200 * Math.log2(frequency / targetFreq)
        setTuningAccuracy(centsOff)

        // Draw waveform
        drawWaveform(buffer)
      }

      // Continue analyzing
      animationFrameRef.current = requestAnimationFrame(analyzeAudio)
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }

  // Draw waveform on canvas
  const drawWaveform = (buffer: Float32Array) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw center line
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Draw waveform
    ctx.beginPath()
    const sliceWidth = (canvas.width * 1.0) / buffer.length
    let x = 0

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i]
      const y = (v + 1) * (canvas.height / 2)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Detect pitch using autocorrelation
  const detectPitch = (buffer: Float32Array, sampleRate: number): number => {
    // Simple autocorrelation-based pitch detection
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    const THRESHOLD = 0.2

    let bestOffset = -1
    let bestCorrelation = 0
    let rms = 0

    // Calculate RMS (volume)
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)

    // Not enough signal
    if (rms < THRESHOLD) return -1

    // Find the best correlation
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset])
      }

      correlation = 1 - correlation / MAX_SAMPLES

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestOffset = offset
      }
    }

    // Not enough correlation
    if (bestCorrelation < 0.5) return -1

    // Interpolate to get a more accurate offset
    let shift = 0
    if (bestOffset > 0 && bestOffset < MAX_SAMPLES - 1) {
      const before = buffer[bestOffset - 1]
      const after = buffer[bestOffset + 1]
      const delta = after - before
      shift = delta !== 0 ? (buffer[bestOffset] - before) / delta : 0
    }

    // Convert to frequency
    return sampleRate / (bestOffset + shift)
  }

  // Find the closest note to a frequency
  const findClosestNote = (frequency: number): { name: string; frequency: number } => {
    let closestNote = ""
    let closestDistance = Number.POSITIVE_INFINITY

    for (const [note, noteFreq] of Object.entries(NOTE_FREQUENCIES)) {
      const distance = Math.abs(Math.log2(frequency / noteFreq))
      if (distance < closestDistance) {
        closestDistance = distance
        closestNote = note
      }
    }

    return {
      name: closestNote,
      frequency: NOTE_FREQUENCIES[closestNote],
    }
  }

  // Play reference tone
  const toggleReferenceTone = () => {
    if (!referenceOscillatorRef.current) return

    if (playReference) {
      // Stop playing
      referenceOscillatorRef.current.stop()
      setPlayReference(false)
    } else {
      // Start playing
      const tuning = TUNINGS[selectedTuning as keyof typeof TUNINGS]
      const stringNote = tuning[selectedString]
      const frequency = NOTE_FREQUENCIES[stringNote]

      referenceOscillatorRef.current.frequency.value = frequency
      referenceOscillatorRef.current.start()
      setPlayReference(true)
    }
  }

  // Calibrate the tuner
  const calibrate = () => {
    setIsCalibrating(true)

    // Reset the analyzer
    if (analyserRef.current) {
      analyserRef.current.dispose()
      analyserRef.current = new Tone.Analyser("waveform", 2048)

      if (microphoneRef.current && isListening) {
        microphoneRef.current.connect(analyserRef.current)
      }
    }

    // Wait a bit and then stop calibrating
    setTimeout(() => {
      setIsCalibrating(false)
    }, 1000)
  }

  // Handle tuning change
  const handleTuningChange = (value: string) => {
    setSelectedTuning(value)
    setSelectedString(0)

    // Stop reference tone if playing
    if (playReference && referenceOscillatorRef.current) {
      referenceOscillatorRef.current.stop()
      setPlayReference(false)
    }
  }

  // Get the current string note
  const getCurrentStringNote = () => {
    const tuning = TUNINGS[selectedTuning as keyof typeof TUNINGS]
    return tuning[selectedString]
  }

  // Get tuning status text and color
  const getTuningStatus = () => {
    if (tuningAccuracy === 0) return { text: "In Tune", color: "text-green-500" }

    const absAccuracy = Math.abs(tuningAccuracy)

    if (absAccuracy < 5) {
      return { text: "In Tune", color: "text-green-500" }
    } else if (absAccuracy < 15) {
      return {
        text: tuningAccuracy > 0 ? "Slightly Sharp" : "Slightly Flat",
        color: "text-yellow-500",
      }
    } else if (absAccuracy < 30) {
      return {
        text: tuningAccuracy > 0 ? "Sharp" : "Flat",
        color: "text-orange-500",
      }
    } else {
      return {
        text: tuningAccuracy > 0 ? "Very Sharp" : "Very Flat",
        color: "text-red-500",
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200 flex-grow flex flex-col">
        {/* Tuner visualization */}
        <div className="flex-grow bg-stone-50 overflow-auto p-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            {/* Microphone permission status */}
            {micPermission === false && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>Microphone access denied. Please allow microphone access to use the tuner.</p>
              </div>
            )}

            {/* Tuner display */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Guitar Tuner</h3>
                <div className="flex items-center">
                  <Button variant="outline" size="sm" onClick={calibrate} disabled={!isListening} className="mr-2">
                    <RefreshCw className={`h-4 w-4 ${isCalibrating ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={isListening ? stopListening : requestMicrophoneAccess}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Current note display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-2">{currentNote || "-"}</div>
                <div className="text-sm text-stone-500">
                  {currentFrequency ? `${currentFrequency.toFixed(2)} Hz` : "No signal"}
                </div>
              </div>

              {/* Tuning meter */}
              <div className="relative h-8 bg-stone-100 rounded-full mb-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 w-1 h-full bg-black z-10"></div>

                {/* Tuning indicator */}
                {isListening && currentFrequency && (
                  <div
                    className="absolute top-0 h-full bg-blue-500 transition-all duration-100"
                    style={{
                      left: `${50 + Math.max(-50, Math.min(50, tuningAccuracy))}%`,
                      width: "4px",
                      transform: "translateX(-2px)",
                    }}
                  ></div>
                )}

                {/* Tuning zones */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-10 bg-green-200"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-full h-full w-20 bg-yellow-200"></div>
                <div className="absolute top-0 left-1/2 h-full w-20 bg-yellow-200"></div>
              </div>

              {/* Tuning status */}
              {isListening && currentFrequency && (
                <div className={`text-center mb-6 ${getTuningStatus().color} font-semibold`}>
                  {getTuningStatus().text}
                </div>
              )}

              {/* Waveform visualization */}
              <div className="mb-6">
                <canvas
                  ref={canvasRef}
                  width="300"
                  height="100"
                  className="w-full h-24 bg-stone-50 border border-stone-200 rounded"
                ></canvas>
              </div>
            </div>

            {/* String selection */}
            <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-md mb-6">
              <h3 className="text-sm font-semibold mb-3">String Selection</h3>

              <div className="flex justify-between mb-4">
                {TUNINGS[selectedTuning as keyof typeof TUNINGS].map((note, index) => (
                  <Button
                    key={index}
                    variant={selectedString === index ? "default" : "outline"}
                    className="w-12 h-12 rounded-full"
                    onClick={() => {
                      setSelectedString(index)
                      if (playReference && referenceOscillatorRef.current) {
                        referenceOscillatorRef.current.stop()
                        setPlayReference(false)
                      }
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                {TUNINGS[selectedTuning as keyof typeof TUNINGS].map((note, index) => (
                  <div key={index} className="text-center w-12">
                    <div className={`text-xs font-semibold ${selectedString === index ? "text-blue-500" : ""}`}>
                      {note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference tone */}
            <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold">Reference Tone</h3>
                  <p className="text-xs text-stone-500">
                    {getCurrentStringNote()} - {NOTE_FREQUENCIES[getCurrentStringNote()].toFixed(2)} Hz
                  </p>
                </div>
                <Button
                  variant={playReference ? "default" : "outline"}
                  onClick={toggleReferenceTone}
                  className="flex items-center gap-2"
                >
                  {playReference ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {playReference ? "Stop" : "Play"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        <div className="bg-white border-t border-stone-200 p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tuning</label>
              <Select value={selectedTuning} onValueChange={handleTuningChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tuning" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TUNINGS).map((tuning) => (
                    <SelectItem key={tuning} value={tuning}>
                      {tuning}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuitarTuner
