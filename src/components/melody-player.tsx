import { useEffect, useRef, useState } from "react"
import * as Tone from "tone"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MelodyScore } from "@/components/melody-score"
import { Play, Pause, SkipBack, Shuffle, Upload } from "lucide-react"
import { MELODIES } from "@/lib/melody-data"
import { MusicXMLLoader } from "@/components/music-xml-loader"

// Instrument types for melody
const MELODY_INSTRUMENTS = {
  Saxophone: "saxophone",
  Trumpet: "trumpet",
  Clarinet: "clarinet",
  Flute: "flute",
  Piano: "piano",
}

interface MelodyPlayerProps {
  initialMelody?: string
  initialTempo?: number
  initialInstrument?: string
  initialSwingEnabled?: boolean
}

export function MelodyPlayer({
  initialMelody = "Autumn Leaves",
  initialTempo,
  initialInstrument = "Saxophone",
  initialSwingEnabled = true,
}: MelodyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMelody, setCurrentMelody] = useState(initialMelody)
  const [tempo, setTempo] = useState(initialTempo || MELODIES[initialMelody]?.tempo || 120)
  const [volume, setVolume] = useState([-5])
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)
  const [currentInstrument, setCurrentInstrument] = useState(initialInstrument)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [swingEnabled, setSwingEnabled] = useState(initialSwingEnabled)
  const [swingAmount, setSwingAmount] = useState(0.3)
  const [customMelody, setCustomMelody] = useState<any>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Refs for audio components
  const instrumentRef = useRef<any>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const compressorRef = useRef<Tone.Compressor | null>(null)
  const eqRef = useRef<Tone.EQ3 | null>(null)

  // Initialize audio context and effects
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Initialize Tone.js context
        await Tone.start()
        Tone.context.resume()

        // Create audio effects chain
        reverbRef.current = new Tone.Reverb({
          decay: 2.5,
          wet: 0.3,
          preDelay: 0.01,
        }).toDestination()

        compressorRef.current = new Tone.Compressor({
          threshold: -20,
          ratio: 3,
          attack: 0.05,
          release: 0.1,
        }).connect(reverbRef.current)

        eqRef.current = new Tone.EQ3({
          low: 0,
          mid: 1,
          high: 2,
          lowFrequency: 300,
          highFrequency: 2500,
        }).connect(compressorRef.current)

        // Set swing feel based on swingEnabled and swingAmount
        updateSwingFeel()

        setAudioInitialized(true)
      } catch (error) {
        console.error("Error initializing audio:", error)
      }
    }

    initAudio()

    return () => {
      // Clean up all audio resources
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
      if (reverbRef.current) {
        reverbRef.current.dispose()
      }
      if (compressorRef.current) {
        compressorRef.current.dispose()
      }
      if (eqRef.current) {
        eqRef.current.dispose()
      }
      if (instrumentRef.current) {
        instrumentRef.current.dispose()
      }
    }
  }, [])

  // Update swing feel when changed
  useEffect(() => {
    updateSwingFeel()
  }, [swingEnabled, swingAmount])

  // Function to update swing feel
  const updateSwingFeel = () => {
    if (swingEnabled) {
      Tone.Transport.swing = swingAmount
      Tone.Transport.swingSubdivision = "16n"
    } else {
      Tone.Transport.swing = 0 // No swing
    }
  }

  // Load instrument samples
  useEffect(() => {
    if (!audioInitialized) return

    setIsLoading(true)

    const loadInstrument = async () => {
      // Dispose of previous instrument if it exists
      if (instrumentRef.current) {
        // Make sure to stop any playing notes before disposing
        if (isPlaying) {
          Tone.Transport.stop()
          setIsPlaying(false)
        }
        instrumentRef.current.dispose()
        instrumentRef.current = null
      }

      try {
        // Create a simple synth first as a fallback
        const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.4,
          },
        }).connect(eqRef.current)

        instrumentRef.current = fallbackSynth
        instrumentRef.current.volume.value = volume[0]

        // Then try to load the sampler
        let sampler: Tone.Sampler | null = null

        try {
          // Create appropriate instrument based on selection
          switch (currentInstrument) {
            case "Saxophone":
              sampler = new Tone.Sampler({
                urls: {
                  A4: "A4.mp3",
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                },
                release: 0.8,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  if (instrumentRef.current !== sampler) {
                    instrumentRef.current?.dispose()
                    instrumentRef.current = sampler
                    instrumentRef.current.volume.value = volume[0]
                  }
                  setIsLoading(false)
                },
              }).connect(eqRef.current)
              break

            case "Trumpet":
              sampler = new Tone.Sampler({
                urls: {
                  A4: "A4.mp3",
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                },
                release: 0.5,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  if (instrumentRef.current !== sampler) {
                    instrumentRef.current?.dispose()
                    instrumentRef.current = sampler
                    instrumentRef.current.volume.value = volume[0]
                  }
                  setIsLoading(false)
                },
              }).connect(eqRef.current)
              break

            case "Clarinet":
            case "Flute":
              // Using piano samples but with EQ to simulate wind instruments
              sampler = new Tone.Sampler({
                urls: {
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                  A4: "A4.mp3",
                },
                release: 0.4,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  if (instrumentRef.current !== sampler) {
                    instrumentRef.current?.dispose()
                    instrumentRef.current = sampler
                    instrumentRef.current.volume.value = volume[0]
                  }

                  // Adjust EQ for wind instrument sound
                  if (eqRef.current) {
                    if (currentInstrument === "Clarinet") {
                      eqRef.current.low.value = -3
                      eqRef.current.mid.value = 2
                      eqRef.current.high.value = -1
                    } else {
                      // Flute
                      eqRef.current.low.value = -6
                      eqRef.current.mid.value = -2
                      eqRef.current.high.value = 4
                    }
                  }

                  setIsLoading(false)
                },
              }).connect(eqRef.current)
              break

            case "Piano":
              sampler = new Tone.Sampler({
                urls: {
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                  A4: "A4.mp3",
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  if (instrumentRef.current !== sampler) {
                    instrumentRef.current?.dispose()
                    instrumentRef.current = sampler
                    instrumentRef.current.volume.value = volume[0]
                  }

                  // Reset EQ for piano
                  if (eqRef.current) {
                    eqRef.current.low.value = 0
                    eqRef.current.mid.value = 0
                    eqRef.current.high.value = 0
                  }

                  setIsLoading(false)
                },
              }).connect(eqRef.current)
              break

            default:
              // We already have the fallback synth
              setIsLoading(false)
          }
        } catch (samplerError) {
          console.error("Error loading sampler:", samplerError)
          // We already have the fallback synth
          setIsLoading(false)
        }

        // Set a timeout to ensure we don't get stuck in loading state
        setTimeout(() => {
          setIsLoading(false)
        }, 3000)
      } catch (error) {
        console.error("Error loading instrument:", error)
        // Create a simple fallback synth
        instrumentRef.current = new Tone.PolySynth(Tone.Synth).connect(eqRef.current)
        instrumentRef.current.volume.value = volume[0]
        setIsLoading(false)
      }
    }

    loadInstrument()

    return () => {
      // This cleanup will run when the instrument changes
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
        sequencerRef.current = null
      }
    }
  }, [currentInstrument, audioInitialized])

  // Update volume when changed
  useEffect(() => {
    if (instrumentRef.current) {
      instrumentRef.current.volume.value = volume[0]
    }
  }, [volume])

  // Update tempo when changed
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  // Create and manage the sequencer
  useEffect(() => {
    if (!instrumentRef.current || isLoading || !audioInitialized) return

    // Use custom melody if available, otherwise use the selected melody from the library
    const melody = customMelody || MELODIES[currentMelody]
    if (!melody) return

    // Clean up previous sequencer
    if (sequencerRef.current) {
      sequencerRef.current.dispose()
      sequencerRef.current = null
    }

    // Create a sequence of notes from the melody
    const notes = melody.notes
    const durations = melody.durations
    const totalSteps = notes.length

    // Create a new sequencer with proper error handling
    try {
      sequencerRef.current = new Tone.Sequence(
        (time, step) => {
          try {
            // Update current note index for visualization
            setCurrentNoteIndex(step)

            // Get the current note and duration
            const note = notes[step]
            const duration = durations[step]

            // Skip rests (null notes)
            if (note !== null && instrumentRef.current) {
              // Add humanization to velocity and timing
              const velocity = Math.random() * 0.2 + 0.8 // Between 0.8 and 1.0
              const timeOffset = Math.random() * 0.02 - 0.01 // Small random timing offset

              // Play the note with humanized parameters
              // Use a try-catch block to handle potential errors
              try {
                instrumentRef.current.triggerAttackRelease(note, duration, time + timeOffset, velocity)
              } catch (noteError) {
                console.error("Error playing note:", noteError)
              }
            }
          } catch (stepError) {
            console.error("Error in sequencer step:", stepError)
          }
        },
        Array.from({ length: totalSteps }, (_, i) => i),
        "8n", // Use eighth notes as the base subdivision
      )
    } catch (sequencerError) {
      console.error("Error creating sequencer:", sequencerError)
    }

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
        sequencerRef.current = null
      }
    }
  }, [currentMelody, isLoading, customMelody, audioInitialized])

  // Handle play/pause
  const togglePlay = async () => {
    if (!audioInitialized) {
      try {
        await Tone.start()
        Tone.context.resume()
        setAudioInitialized(true)
      } catch (error) {
        console.error("Error initializing audio context:", error)
        return
      }
    }

    try {
      if (Tone.Transport.state === "started") {
        Tone.Transport.pause()
        setIsPlaying(false)
      } else {
        // Make sure we have a valid sequencer
        if (!sequencerRef.current) {
          console.error("No sequencer available")
          return
        }

        await Tone.start()
        Tone.context.resume()

        // Start the sequencer
        try {
          sequencerRef.current.start(0)
          Tone.Transport.start()
          setIsPlaying(true)
        } catch (error) {
          console.error("Error starting sequencer:", error)
        }
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
    }
  }

  // Reset playback
  const resetPlayback = () => {
    try {
      Tone.Transport.stop()
      setCurrentNoteIndex(-1)
      setIsPlaying(false)
    } catch (error) {
      console.error("Error resetting playback:", error)
    }
  }

  // Generate a random melody
  const randomizeMelody = () => {
    resetPlayback()
    setCustomMelody(null)
    const melodies = Object.keys(MELODIES)
    const randomIndex = Math.floor(Math.random() * melodies.length)
    setCurrentMelody(melodies[randomIndex])
  }

  // Handle loading custom melody
  const handleLoadCustomMelody = (data: any) => {
    resetPlayback()
    setCustomMelody(data)
    setShowUploader(false)
  }

  // Handle melody selection
  const handleMelodyChange = (value: string) => {
    resetPlayback()
    setCustomMelody(null)
    setCurrentMelody(value)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200 flex-grow flex flex-col">
        {/* Music sheet */}
        <div className="flex-grow bg-stone-50 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-stone-400">Loading instrument samples...</div>
            </div>
          ) : (
            <div className="w-full h-full">
              {(() => {
                try {
                  return (
                    <MelodyScore melody={customMelody || MELODIES[currentMelody]} currentNoteIndex={currentNoteIndex} />
                  )
                } catch (error) {
                  console.error("Error rendering melody score:", error)
                  return (
                    <div className="p-4 text-red-500 text-center">
                      There was an error rendering the music notation.
                      <br />
                      You can still play the melody using the controls below.
                    </div>
                  )
                }
              })()}
            </div>
          )}
        </div>

        {/* Quick controls */}
        <div className="bg-stone-100 p-3 border-t border-stone-200">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium mr-2">Rhythm Feel:</span>
                <div className="inline-flex items-center gap-2 bg-stone-200 p-1 rounded-md">
                  <span className={`text-xs px-2 py-1 rounded ${!swingEnabled ? "bg-white shadow" : ""}`}>
                    Straight
                  </span>
                  <Switch checked={swingEnabled} onCheckedChange={setSwingEnabled} />
                  <span className={`text-xs px-2 py-1 rounded ${swingEnabled ? "bg-white shadow" : ""}`}>Swing</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploader(!showUploader)}
                className="text-xs flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                {showUploader ? "Hide Uploader" : "Upload Melody"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-xs">
                {showSettings ? "Hide Settings" : "Show Settings"}
              </Button>
            </div>
          </div>
        </div>

        {/* File uploader */}
        {showUploader && (
          <div className="bg-stone-100 p-4 border-t border-stone-200">
            <MusicXMLLoader onLoad={handleLoadCustomMelody} />
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div className="bg-stone-100 p-4 border-t border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Instrument</label>
                <Select value={currentInstrument} onValueChange={setCurrentInstrument}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(MELODY_INSTRUMENTS).map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tempo</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempo(Math.max(60, tempo - 5))}
                    className="text-xs"
                  >
                    -5
                  </Button>
                  <Slider
                    value={[tempo]}
                    min={60}
                    max={220}
                    step={1}
                    onValueChange={(value) => setTempo(value[0])}
                    className="w-full"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempo(Math.min(220, tempo + 5))}
                    className="text-xs"
                  >
                    +5
                  </Button>
                </div>
              </div>
              <div>
                {swingEnabled && (
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">
                      Swing Amount: {Math.round(swingAmount * 100)}%
                    </label>
                    <Slider
                      value={[swingAmount]}
                      min={0}
                      max={0.5}
                      step={0.01}
                      onValueChange={(value) => setSwingAmount(value[0])}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instrument Volume</label>
                <Slider value={volume} min={-40} max={0} step={1} onValueChange={setVolume} className="w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Controls - fixed at bottom */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetPlayback} disabled={isLoading} aria-label="Reset">
              <SkipBack className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={customMelody ? "custom" : currentMelody} onValueChange={handleMelodyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select melody">{customMelody ? "Custom Melody" : currentMelody}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(MELODIES).map((melody) => (
                  <SelectItem key={melody} value={melody}>
                    {melody}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={randomizeMelody}
              disabled={isLoading}
              aria-label="Randomize melody"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MelodyPlayer
