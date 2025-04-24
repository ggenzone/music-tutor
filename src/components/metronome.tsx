import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw } from "lucide-react"

// Time signatures
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "5/4", "7/8"]

// Accent patterns
const ACCENT_PATTERNS = {
  "4/4": [
    { name: "Standard", pattern: [true, false, false, false] },
    { name: "Backbeat", pattern: [true, false, true, false] },
    { name: "All Beats", pattern: [true, true, true, true] },
  ],
  "3/4": [
    { name: "Standard", pattern: [true, false, false] },
    { name: "All Beats", pattern: [true, true, true] },
  ],
  "2/4": [
    { name: "Standard", pattern: [true, false] },
    { name: "All Beats", pattern: [true, true] },
  ],
  "6/8": [
    { name: "Standard", pattern: [true, false, false, true, false, false] },
    { name: "All Beats", pattern: [true, true, true, true, true, true] },
  ],
  "5/4": [
    { name: "Standard", pattern: [true, false, false, true, false] },
    { name: "All Beats", pattern: [true, true, true, true, true] },
  ],
  "7/8": [
    { name: "Standard", pattern: [true, false, false, true, false, true, false] },
    { name: "All Beats", pattern: [true, true, true, true, true, true, true] },
  ],
}

// Helper function to safely load Tone.js
const loadToneJs = async () => {
  try {
    return await import("tone").then((module) => module.default || module)
  } catch (error) {
    console.error("Failed to load Tone.js:", error)
    throw new Error("Failed to load audio library")
  }
}

interface MetronomeProps {
  initialTimeSignature?: string
  initialTempo?: number
  initialAccentPattern?: string
  initialCountIn?: boolean
}

export function Metronome({
  initialTimeSignature = "4/4",
  initialTempo = 120,
  initialAccentPattern = "Standard",
  initialCountIn = false,
}: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(initialTempo)
  const [volume, setVolume] = useState([-10])
  const [timeSignature, setTimeSignature] = useState(initialTimeSignature)
  const [accentPattern, setAccentPattern] = useState(initialAccentPattern)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [countIn, setCountIn] = useState(initialCountIn)
  const [countInBeats, setCountInBeats] = useState(4)
  const [remainingCountIn, setRemainingCountIn] = useState(0)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const clickHighRef = useRef<any>(null)
  const clickLowRef = useRef<any>(null)
  const sequencerRef = useRef<any>(null)
  const transportRef = useRef<any>(null)
  const beatFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const toneRef = useRef<any>(null)

  // Initialize audio
  useEffect(() => {
    let isMounted = true

    const initAudio = async () => {
      try {
        // Dynamically import Tone.js
        const Tone = await loadToneJs()
        toneRef.current = Tone

        if (!isMounted) return

        // Store Transport reference
        transportRef.current = Tone.Transport
        transportRef.current.bpm.value = tempo

        // Create fallback synths first
        const highSynth = new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 1,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0,
            release: 0.1,
          },
        }).toDestination()
        highSynth.volume.value = volume[0]
        clickHighRef.current = highSynth

        const lowSynth = new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 1,
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0,
            release: 0.1,
          },
        }).toDestination()
        lowSynth.volume.value = volume[0]
        clickLowRef.current = lowSynth

        // Set audio as initialized with fallback synths
        setIsLoaded(true)
        setAudioInitialized(true)

        // Try to load actual samples
        try {
          // Create high click (accented beat)
          const highClick = new Tone.Player({
            url: "https://tonejs.github.io/audio/berklee/highclick.mp3",
            onload: () => {
              if (!isMounted) return
              highClick.volume.value = volume[0]
              clickHighRef.current = highClick
            },
          }).toDestination()

          // Create low click (unaccented beat)
          const lowClick = new Tone.Player({
            url: "https://tonejs.github.io/audio/berklee/lowclick.mp3",
            onload: () => {
              if (!isMounted) return
              lowClick.volume.value = volume[0]
              clickLowRef.current = lowClick
            },
          }).toDestination()
        } catch (sampleError) {
          console.warn("Could not load click samples, using fallback synths:", sampleError)
          // We already have fallback synths, so no need to do anything here
        }
      } catch (error) {
        console.error("Error initializing metronome audio:", error)
        setError("Could not initialize audio. Please try refreshing the page.")
        setIsLoaded(true) // Set as loaded even with error so UI is not stuck
      }
    }

    initAudio()

    return () => {
      isMounted = false

      // Clean up
      if (clickHighRef.current && clickHighRef.current.dispose) {
        clickHighRef.current.dispose()
      }
      if (clickLowRef.current && clickLowRef.current.dispose) {
        clickLowRef.current.dispose()
      }
      if (sequencerRef.current && sequencerRef.current.dispose) {
        sequencerRef.current.dispose()
      }
      if (beatFlashTimeoutRef.current) {
        clearTimeout(beatFlashTimeoutRef.current)
      }
    }
  }, [])

  // Update volume when changed
  useEffect(() => {
    if (clickHighRef.current && clickHighRef.current.volume) {
      clickHighRef.current.volume.value = volume[0]
    }
    if (clickLowRef.current && clickLowRef.current.volume) {
      clickLowRef.current.volume.value = volume[0]
    }
  }, [volume])

  // Update tempo when changed
  useEffect(() => {
    if (transportRef.current) {
      transportRef.current.bpm.value = tempo
    }
  }, [tempo])

  // Create and manage the sequencer
  useEffect(() => {
    if (!isLoaded || !audioInitialized || !toneRef.current) return

    // Get the number of beats from the time signature
    const [numerator] = timeSignature.split("/").map(Number)
    const totalBeats = numerator

    // Get the accent pattern
    const patterns = ACCENT_PATTERNS[timeSignature as keyof typeof ACCENT_PATTERNS] || ACCENT_PATTERNS["4/4"]
    const selectedPattern = patterns.find((p) => p.name === accentPattern) || patterns[0]
    const accents = selectedPattern.pattern

    // Clean up previous sequencer
    if (sequencerRef.current && sequencerRef.current.dispose) {
      sequencerRef.current.dispose()
      sequencerRef.current = null
    }

    try {
      // Create a new sequencer
      const Tone = toneRef.current

      sequencerRef.current = new Tone.Sequence(
        (time: number, beat: number) => {
          try {
            // Handle count-in
            if (countIn && remainingCountIn > 0) {
              setRemainingCountIn((prev) => prev - 1)

              // Play click for count-in
              if (clickHighRef.current) {
                if (typeof clickHighRef.current.start === "function") {
                  clickHighRef.current.start(time)
                } else if (typeof clickHighRef.current.triggerAttackRelease === "function") {
                  clickHighRef.current.triggerAttackRelease("C5", "32n", time)
                }
              }

              // Update visual beat
              setCurrentBeat(beat)

              // Flash the beat visualization
              if (beatFlashTimeoutRef.current) {
                clearTimeout(beatFlashTimeoutRef.current)
              }
              beatFlashTimeoutRef.current = setTimeout(() => {
                setCurrentBeat(-1)
              }, 100)

              return
            }

            // If count-in is complete, disable it
            if (countIn && remainingCountIn === 0) {
              setCountIn(false)
            }

            // Play the appropriate click sound based on accent pattern
            const isAccent = accents[beat]

            try {
              if (isAccent) {
                // Play accented beat
                if (clickHighRef.current) {
                  if (typeof clickHighRef.current.start === "function") {
                    clickHighRef.current.start(time)
                  } else if (typeof clickHighRef.current.triggerAttackRelease === "function") {
                    clickHighRef.current.triggerAttackRelease("C5", "32n", time)
                  }
                }
              } else {
                // Play unaccented beat
                if (clickLowRef.current) {
                  if (typeof clickLowRef.current.start === "function") {
                    clickLowRef.current.start(time)
                  } else if (typeof clickLowRef.current.triggerAttackRelease === "function") {
                    clickLowRef.current.triggerAttackRelease("G4", "32n", time)
                  }
                }
              }
            } catch (playError) {
              console.error("Error playing metronome click:", playError)
            }

            // Update visual beat
            setCurrentBeat(beat)

            // Flash the beat visualization
            if (beatFlashTimeoutRef.current) {
              clearTimeout(beatFlashTimeoutRef.current)
            }
            beatFlashTimeoutRef.current = setTimeout(() => {
              setCurrentBeat(-1)
            }, 100)
          } catch (stepError) {
            console.error("Error in sequencer step:", stepError)
          }
        },
        Array.from({ length: totalBeats }, (_, i) => i),
        timeSignature.includes("8") ? "8n" : "4n", // Use eighth notes for compound meters
      )
    } catch (sequencerError) {
      console.error("Error creating sequencer:", sequencerError)
      setError("Could not create metronome sequencer. Please try refreshing the page.")
    }

    return () => {
      if (sequencerRef.current && sequencerRef.current.dispose) {
        sequencerRef.current.dispose()
      }
    }
  }, [timeSignature, accentPattern, isLoaded, audioInitialized, countIn, remainingCountIn])

  // Handle play/pause
  const togglePlay = async () => {
    if (!toneRef.current || !audioInitialized) {
      setError("Audio system not initialized. Please try refreshing the page.")
      return
    }

    try {
      const Tone = toneRef.current

      if (isPlaying) {
        // Stop playback
        if (transportRef.current) {
          transportRef.current.pause()
        }
        setIsPlaying(false)
        setCurrentBeat(-1)

        // Reset count-in if active
        if (countIn) {
          setRemainingCountIn(0)
          setCountIn(false)
        }
      } else {
        // Start playback
        try {
          await Tone.start()

          // Handle count-in
          if (countIn) {
            setRemainingCountIn(countInBeats)
          }

          if (sequencerRef.current) {
            sequencerRef.current.start(0)
          }

          if (transportRef.current) {
            transportRef.current.start()
          }

          setIsPlaying(true)
        } catch (startError) {
          console.error("Error starting audio context:", startError)
          setError("Could not start audio playback. Please try clicking elsewhere on the page first.")
        }
      }
    } catch (error) {
      console.error("Error toggling metronome:", error)
      setError("An error occurred while controlling the metronome.")
    }
  }

  // Reset metronome
  const resetMetronome = () => {
    if (transportRef.current) {
      transportRef.current.stop()
    }
    setIsPlaying(false)
    setCurrentBeat(-1)

    // Reset count-in if active
    if (countIn) {
      setRemainingCountIn(0)
      setCountIn(false)
    }
  }

  // Handle time signature change
  const handleTimeSignatureChange = (value: string) => {
    resetMetronome()
    setTimeSignature(value)

    // Reset accent pattern to the first available for this time signature
    const patterns = ACCENT_PATTERNS[value as keyof typeof ACCENT_PATTERNS] || ACCENT_PATTERNS["4/4"]
    setAccentPattern(patterns[0].name)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200 flex-grow flex flex-col">
        {/* Metronome visualization */}
        <div className="flex-grow bg-stone-50 overflow-auto p-4 flex flex-col items-center justify-center">
          {!isLoaded ? (
            <div className="animate-pulse text-stone-400">Loading metronome sounds...</div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">
              <p className="mb-2 font-bold">Error</p>
              <p>{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-md">
              {/* Visual metronome */}
              <div className="mb-8">
                <div className="flex justify-center items-center mb-4">
                  <div className="text-4xl font-bold tabular-nums">{tempo} BPM</div>
                </div>

                <div className="flex justify-center items-center mb-6">
                  <div className="text-xl font-semibold">{timeSignature}</div>
                </div>

                {/* Beat visualization */}
                <div className="flex justify-center space-x-2 mb-8">
                  {ACCENT_PATTERNS[timeSignature as keyof typeof ACCENT_PATTERNS][0].pattern.map((isAccent, i) => {
                    // Find the current accent pattern
                    const patterns = ACCENT_PATTERNS[timeSignature as keyof typeof ACCENT_PATTERNS]
                    const currentPattern = patterns.find((p) => p.name === accentPattern) || patterns[0]
                    const isAccentInCurrentPattern = currentPattern.pattern[i]

                    return (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          i === currentBeat
                            ? "bg-blue-500 scale-110"
                            : isAccentInCurrentPattern
                              ? "bg-stone-300"
                              : "bg-stone-200"
                        }`}
                      >
                        {i + 1}
                      </div>
                    )
                  })}
                </div>

                {/* Count-in indicator */}
                {countIn && remainingCountIn > 0 && isPlaying && (
                  <div className="text-center mb-4">
                    <div className="text-lg font-semibold">Count-in: {remainingCountIn}</div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <Button onClick={togglePlay} className="w-20 h-20 rounded-full" disabled={!isLoaded || !!error}>
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetMetronome}
                    className="w-12 h-12 rounded-full self-end mb-4"
                    disabled={!isLoaded || !!error || !isPlaying}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="bg-white border-t border-stone-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tempo</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempo(Math.max(40, tempo - 5))}
                  className="text-xs"
                  disabled={!!error}
                >
                  -5
                </Button>
                <Slider
                  value={[tempo]}
                  min={40}
                  max={240}
                  step={1}
                  onValueChange={(value) => setTempo(value[0])}
                  className="w-full"
                  disabled={!!error}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempo(Math.min(240, tempo + 5))}
                  className="text-xs"
                  disabled={!!error}
                >
                  +5
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Volume</label>
              <Slider
                value={volume}
                min={-40}
                max={0}
                step={1}
                onValueChange={setVolume}
                className="w-full"
                disabled={!!error}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time Signature</label>
              <Select value={timeSignature} onValueChange={handleTimeSignatureChange} disabled={!!error}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time signature" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SIGNATURES.map((sig) => (
                    <SelectItem key={sig} value={sig}>
                      {sig}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Accent Pattern</label>
              <Select value={accentPattern} onValueChange={setAccentPattern} disabled={!!error}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accent pattern" />
                </SelectTrigger>
                <SelectContent>
                  {(ACCENT_PATTERNS[timeSignature as keyof typeof ACCENT_PATTERNS] || ACCENT_PATTERNS["4/4"]).map(
                    (pattern) => (
                      <SelectItem key={pattern.name} value={pattern.name}>
                        {pattern.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="count-in"
                checked={countIn}
                onChange={(e) => setCountIn(e.target.checked)}
                className="form-checkbox h-4 w-4"
                disabled={!!error}
              />
              <label htmlFor="count-in" className="text-sm font-medium">
                Count-in before start
              </label>
              {countIn && (
                <Select
                  value={countInBeats.toString()}
                  onValueChange={(value) => setCountInBeats(Number.parseInt(value))}
                  className="ml-4 w-20"
                  disabled={!!error}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Beats" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Metronome
