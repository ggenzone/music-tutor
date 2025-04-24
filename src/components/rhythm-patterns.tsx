import { useEffect, useRef, useState } from "react"
import * as Tone from "tone"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, SkipBack } from "lucide-react"
import { RHYTHM_PATTERNS } from "@/lib/rhythm-pattern-data"
import { RhythmScore } from "@/components/rhythm-score"

interface RhythmPatternsProps {
  initialPattern?: string
  initialTempo?: number
  initialPracticeMode?: string
}

export function RhythmPatterns({
  initialPattern = "Bossa Nova",
  initialTempo,
  initialPracticeMode = "normal",
}: RhythmPatternsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPattern, setCurrentPattern] = useState(initialPattern)
  const [tempo, setTempo] = useState(initialTempo || RHYTHM_PATTERNS[initialPattern].tempo)
  const [volume, setVolume] = useState([-5])
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(true)
  const [practiceMode, setPracticeMode] = useState(initialPracticeMode)

  // Refs for audio components
  const highSoundRef = useRef<Tone.Sampler | Tone.MetalSynth | null>(null)
  const midSoundRef = useRef<Tone.Sampler | Tone.MembraneSynth | null>(null)
  const lowSoundRef = useRef<Tone.Sampler | Tone.MembraneSynth | null>(null)
  const metronomeRef = useRef<Tone.MetalSynth | null>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)

  // Initialize audio effects
  useEffect(() => {
    // Create audio effects chain
    reverbRef.current = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2,
    }).toDestination()

    // Create percussion sounds
    highSoundRef.current = new Tone.MetalSynth({
      frequency: 800,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(reverbRef.current)
    highSoundRef.current.volume.value = volume[0]

    midSoundRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.05,
        release: 0.5,
        attackCurve: "exponential",
      },
    }).connect(reverbRef.current)
    midSoundRef.current.volume.value = volume[0]

    lowSoundRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 0.8,
        attackCurve: "exponential",
      },
    }).connect(reverbRef.current)
    lowSoundRef.current.volume.value = volume[0]

    // Create metronome sound
    metronomeRef.current = new Tone.MetalSynth({
      frequency: 600,
      envelope: {
        attack: 0.001,
        decay: 0.05,
        release: 0.05,
      },
      harmonicity: 1,
      modulationIndex: 2,
      resonance: 800,
      octaves: 1,
    }).toDestination()
    metronomeRef.current.volume.value = -15 // Quieter metronome

    setIsLoading(false)

    return () => {
      if (reverbRef.current) reverbRef.current.dispose()
      if (highSoundRef.current) highSoundRef.current.dispose()
      if (midSoundRef.current) midSoundRef.current.dispose()
      if (lowSoundRef.current) lowSoundRef.current.dispose()
      if (metronomeRef.current) metronomeRef.current.dispose()
    }
  }, [])

  // Update volume when changed
  useEffect(() => {
    if (highSoundRef.current) highSoundRef.current.volume.value = volume[0]
    if (midSoundRef.current) midSoundRef.current.volume.value = volume[0]
    if (lowSoundRef.current) lowSoundRef.current.volume.value = volume[0]
  }, [volume])

  // Update tempo when changed
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  // Update tempo when pattern changes
  useEffect(() => {
    const pattern = RHYTHM_PATTERNS[currentPattern]
    setTempo(pattern.tempo)
  }, [currentPattern])

  // Create and manage the sequencer
  useEffect(() => {
    if (isLoading) return

    const pattern = RHYTHM_PATTERNS[currentPattern]
    if (!pattern) return

    if (sequencerRef.current) {
      sequencerRef.current.dispose()
    }

    // Calculate total steps based on time signature and measures
    const [numerator] = pattern.timeSignature.split("/").map(Number)
    const totalSteps = numerator * pattern.measures
    const subdivision = pattern.timeSignature.includes("8") ? "8n" : "4n"

    // Create a sequence of percussion hits
    sequencerRef.current = new Tone.Sequence(
      (time, step) => {
        // Update current beat for visualization
        setCurrentBeat(step)

        // Calculate which measure we're in
        const measureIndex = Math.floor(step / numerator) % pattern.measures
        const beatInMeasure = step % numerator

        // Play metronome on downbeats if enabled
        if (metronomeEnabled && beatInMeasure === 0 && metronomeRef.current) {
          const accentVolume = beatInMeasure === 0 ? -10 : -15
          metronomeRef.current.volume.value = accentVolume
          metronomeRef.current.triggerAttackRelease("C5", "32n", time, 0.7)
        }

        // Play high percussion part
        if (pattern.parts.high[measureIndex]?.includes(beatInMeasure) && highSoundRef.current) {
          const velocity = Math.random() * 0.2 + 0.7
          highSoundRef.current.triggerAttackRelease("C6", "32n", time, velocity)
        }

        // Play mid percussion part
        if (pattern.parts.mid[measureIndex]?.includes(beatInMeasure) && midSoundRef.current) {
          const velocity = Math.random() * 0.2 + 0.8
          midSoundRef.current.triggerAttackRelease("C4", "16n", time, velocity)
        }

        // Play low percussion part
        if (pattern.parts.low[measureIndex]?.includes(beatInMeasure) && lowSoundRef.current) {
          const velocity = Math.random() * 0.1 + 0.9
          lowSoundRef.current.triggerAttackRelease("C2", "8n", time, velocity)
        }
      },
      Array.from({ length: totalSteps }, (_, i) => i),
      subdivision,
    )

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
    }
  }, [currentPattern, isLoading, metronomeEnabled])

  // Handle play/pause
  const togglePlay = async () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause()
      setIsPlaying(false)
    } else {
      try {
        await Tone.start()

        // Set practice mode tempo
        if (practiceMode === "slow") {
          Tone.Transport.bpm.value = tempo * 0.6 // 60% of normal tempo
        } else if (practiceMode === "gradual") {
          // Start at 60% and gradually increase
          Tone.Transport.bpm.value = tempo * 0.6

          // Schedule tempo increases
          const pattern = RHYTHM_PATTERNS[currentPattern]
          const [numerator] = pattern.timeSignature.split("/").map(Number)
          const totalSteps = numerator * pattern.measures
          const loopDuration = (60 / tempo) * totalSteps

          // Increase tempo every 4 loops
          setTimeout(
            () => {
              Tone.Transport.bpm.value = tempo * 0.7
            },
            loopDuration * 4 * 1000,
          )

          setTimeout(
            () => {
              Tone.Transport.bpm.value = tempo * 0.8
            },
            loopDuration * 8 * 1000,
          )

          setTimeout(
            () => {
              Tone.Transport.bpm.value = tempo * 0.9
            },
            loopDuration * 12 * 1000,
          )

          setTimeout(
            () => {
              Tone.Transport.bpm.value = tempo
            },
            loopDuration * 16 * 1000,
          )
        } else {
          Tone.Transport.bpm.value = tempo
        }

        if (sequencerRef.current) {
          sequencerRef.current.start(0)
        }
        Tone.Transport.start()
        setIsPlaying(true)
      } catch (error) {
        console.error("Error starting audio:", error)
        alert("There was an error starting the audio. Please try again or check your browser's audio settings.")
      }
    }
  }

  // Reset playback
  const resetPlayback = () => {
    Tone.Transport.stop()
    setCurrentBeat(-1)
    setIsPlaying(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main score display area */}
      <div className="flex-grow overflow-auto p-4 bg-stone-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-stone-400">Loading sounds...</div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{RHYTHM_PATTERNS[currentPattern].name}</h2>
              <p className="text-stone-600">{RHYTHM_PATTERNS[currentPattern].description}</p>
            </div>

            <RhythmScore pattern={RHYTHM_PATTERNS[currentPattern]} currentBeat={currentBeat} />
          </div>
        )}
      </div>

      {/* Fixed controls at bottom */}
      <div className="bg-white border-t border-stone-200 shadow-lg">
        {/* Quick controls */}
        <div className="bg-stone-100 p-3 border-b border-stone-200">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium mr-2">Metronome:</span>
                <div className="inline-flex items-center gap-2 bg-stone-200 p-1 rounded-md">
                  <span className={`text-xs px-2 py-1 rounded ${!metronomeEnabled ? "bg-white shadow" : ""}`}>Off</span>
                  <Switch checked={metronomeEnabled} onCheckedChange={setMetronomeEnabled} />
                  <span className={`text-xs px-2 py-1 rounded ${metronomeEnabled ? "bg-white shadow" : ""}`}>On</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium mr-2">Practice Mode:</span>
                <Select value={practiceMode} onValueChange={setPracticeMode}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Practice Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Speed</SelectItem>
                    <SelectItem value="slow">Slow Practice</SelectItem>
                    <SelectItem value="gradual">Gradual Increase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-xs">
              {showSettings ? "Hide Advanced Settings" : "Show Advanced Settings"}
            </Button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="bg-stone-100 p-4 border-b border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Volume</label>
                <Slider value={volume} min={-40} max={0} step={1} onValueChange={setVolume} className="w-full" />
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
                    max={200}
                    step={1}
                    onValueChange={(value) => setTempo(value[0])}
                    className="w-full"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempo(Math.min(200, tempo + 5))}
                    className="text-xs"
                  >
                    +5
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main controls */}
        <div className="p-4 bg-white flex flex-wrap gap-4 items-center justify-between">
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
            <Select value={currentPattern} onValueChange={setCurrentPattern}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select rhythm pattern" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(RHYTHM_PATTERNS).map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>
                    {pattern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RhythmPatterns
