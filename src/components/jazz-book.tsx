import { useEffect, useRef, useState } from "react"
import * as Tone from "tone"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MusicScore } from "@/components/music-score"
import { Play, Pause, SkipBack, Shuffle } from "lucide-react"
import { CHORD_PROGRESSIONS, CHORD_VOICINGS, DEFAULT_VOICINGS } from "@/lib/chord-data"
import { RHYTHM_PATTERNS, DRUM_PATTERNS, DRUM_STYLES } from "@/lib/rhythm-data"
import { parseChord, transposeVoicing, getTransposition } from "@/lib/music-utils"

// Instrument types
const INSTRUMENTS = {
  Piano: "piano",
  "Jazz Guitar": "guitar",
  "Electric Piano": "electric-piano",
  Vibraphone: "vibraphone",
}

interface JazzBookProps {
  initialProgression?: string
  initialTempo?: number
  initialInstrument?: string
  initialDrumsEnabled?: boolean
  initialSwingEnabled?: boolean
}

export function JazzBook({
  initialProgression = "ii-V-I",
  initialTempo = 120,
  initialInstrument = "Piano",
  initialDrumsEnabled = true,
  initialSwingEnabled = true,
}: JazzBookProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentProgression, setCurrentProgression] = useState(initialProgression)
  const [tempo, setTempo] = useState(initialTempo)
  const [volume, setVolume] = useState([-10])
  const [drumVolume, setDrumVolume] = useState([-8])
  const [swingEnabled, setSwingEnabled] = useState(initialSwingEnabled)
  const [swingAmount, setSwingAmount] = useState(0.3)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [currentInstrument, setCurrentInstrument] = useState(initialInstrument)
  const [currentDrumStyle, setCurrentDrumStyle] = useState("Jazz Swing")
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [drumsEnabled, setDrumsEnabled] = useState(initialDrumsEnabled)
  const [drumsLoaded, setDrumsLoaded] = useState(false)

  // Refs for audio components
  const instrumentRef = useRef<any>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const drumSequencerRef = useRef<Tone.Sequence | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const compressorRef = useRef<Tone.Compressor | null>(null)
  const eqRef = useRef<Tone.EQ3 | null>(null)

  // Drum kit refs
  const drumKitRef = useRef<{
    ride: Tone.Sampler | null | Tone.Synth | Tone.MetalSynth | Tone.MembraneSynth | Tone.NoiseSynth
    hihat: Tone.Sampler | null | Tone.Synth | Tone.MetalSynth | Tone.MembraneSynth | Tone.NoiseSynth
    kick: Tone.Sampler | null | Tone.Synth | Tone.MetalSynth | Tone.MembraneSynth | Tone.NoiseSynth
    snare: Tone.Sampler | null | Tone.Synth | Tone.MetalSynth | Tone.MembraneSynth | Tone.NoiseSynth
  }>({
    ride: null,
    hihat: null,
    kick: null,
    snare: null,
  })

  // Initialize audio effects
  useEffect(() => {
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

    return () => {
      if (reverbRef.current) reverbRef.current.dispose()
      if (compressorRef.current) compressorRef.current.dispose()
      if (eqRef.current) eqRef.current.dispose()
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
    setIsLoading(true)

    const loadInstrument = async () => {
      // Dispose of previous instrument if it exists
      if (instrumentRef.current) {
        instrumentRef.current.dispose()
      }

      try {
        // Create appropriate instrument based on selection
        switch (currentInstrument) {
          case "Piano":
            instrumentRef.current = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "triangle" },
              envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 1,
              },
            }).connect(eqRef.current)

            // Try to load the sampler after the synth is ready as a fallback
            try {
              const sampler = new Tone.Sampler({
                urls: {
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                  A4: "A4.mp3",
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  // Replace the synth with the sampler once loaded
                  if (instrumentRef.current) instrumentRef.current.dispose()
                  instrumentRef.current = sampler.connect(eqRef.current)
                  instrumentRef.current.volume.value = volume[0]
                },
              })
            } catch (error) {
              console.log("Using fallback synth for piano")
            }
            break

          case "Jazz Guitar":
            instrumentRef.current = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "triangle" },
              envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 0.8,
              },
            }).connect(eqRef.current)

            // Try to load the sampler after the synth is ready as a fallback
            try {
              const sampler = new Tone.Sampler({
                urls: {
                  A3: "A3.mp3",
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                },
                release: 0.8,
                baseUrl: "https://tonejs.github.io/audio/guitar-acoustic/",
                onload: () => {
                  // Replace the synth with the sampler once loaded
                  if (instrumentRef.current) instrumentRef.current.dispose()
                  instrumentRef.current = sampler.connect(eqRef.current)
                  instrumentRef.current.volume.value = volume[0]
                },
              })
            } catch (error) {
              console.log("Using fallback synth for guitar")
            }
            break

          case "Electric Piano":
            instrumentRef.current = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "sine" },
              envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 0.5,
              },
            }).connect(eqRef.current)

            // Try to load the sampler after the synth is ready as a fallback
            try {
              const sampler = new Tone.Sampler({
                urls: {
                  C3: "C3.mp3",
                  C4: "C4.mp3",
                  C5: "C5.mp3",
                },
                release: 0.5,
                baseUrl: "https://tonejs.github.io/audio/casio/",
                onload: () => {
                  // Replace the synth with the sampler once loaded
                  if (instrumentRef.current) instrumentRef.current.dispose()
                  instrumentRef.current = sampler.connect(eqRef.current)
                  instrumentRef.current.volume.value = volume[0]
                },
              })
            } catch (error) {
              console.log("Using fallback synth for electric piano")
            }
            break

          case "Vibraphone":
            instrumentRef.current = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "sine" },
              envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 2,
              },
            }).connect(eqRef.current)

            // Try to load the sampler after the synth is ready as a fallback
            try {
              const sampler = new Tone.Sampler({
                urls: {
                  C4: "C4.mp3",
                  "D#4": "Ds4.mp3",
                  "F#4": "Fs4.mp3",
                  A4: "A4.mp3",
                },
                release: 2,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                  // Replace the synth with the sampler once loaded
                  if (instrumentRef.current) instrumentRef.current.dispose()
                  instrumentRef.current = sampler.connect(eqRef.current)
                  instrumentRef.current.volume.value = volume[0]
                },
              })
            } catch (error) {
              console.log("Using fallback synth for vibraphone")
            }
            break

          default:
            // Fallback to simple synth
            instrumentRef.current = new Tone.PolySynth(Tone.Synth).connect(eqRef.current)
        }

        // Set volume
        instrumentRef.current.volume.value = volume[0]

        // Wait a bit to ensure the synth is ready
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error("Error loading instrument:", error)
        // Fallback to simple synth
        instrumentRef.current = new Tone.PolySynth(Tone.Synth).connect(eqRef.current)
        instrumentRef.current.volume.value = volume[0]
        setIsLoading(false)
      }
    }

    loadInstrument()

    return () => {
      if (instrumentRef.current) {
        instrumentRef.current.dispose()
      }
    }
  }, [currentInstrument])

  // Load drum samples with better error handling
  useEffect(() => {
    setDrumsLoaded(false)

    // Create fallback synths first to ensure we always have something to play
    const createFallbackDrums = () => {
      // Create simple synths as fallbacks
      const metalSynth = new Tone.MetalSynth({
        frequency: 200,
        envelope: {
          attack: 0.001,
          decay: 0.1,
          release: 0.1,
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination()
      metalSynth.volume.value = drumVolume[0]

      const membraneSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
          attackCurve: "exponential",
        },
      }).toDestination()
      membraneSynth.volume.value = drumVolume[0]

      // Assign fallback synths to drum kit
      drumKitRef.current = {
        ride: metalSynth,
        hihat: metalSynth,
        kick: membraneSynth,
        snare: membraneSynth,
      }

      setDrumsLoaded(true)
    }

    // Create fallback drums immediately
    createFallbackDrums()

    // Try to load actual drum samples
    const loadDrumKit = async () => {
      try {
        // Create a simple noise synth for hi-hat
        const hihatSynth = new Tone.NoiseSynth({
          volume: -10,
          envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.005,
            release: 0.05,
          },
        }).toDestination()

        // Create a membrane synth for kick
        const kickSynth = new Tone.MembraneSynth({
          volume: -6,
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 0.4,
          },
        }).toDestination()

        // Create a membrane synth for snare
        const snareSynth = new Tone.NoiseSynth({
          volume: -8,
          noise: { type: "white" },
          envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.02,
            release: 0.2,
          },
        }).toDestination()

        // Create a metal synth for ride
        const rideSynth = new Tone.MetalSynth({
          volume: -8,
          frequency: 200,
          envelope: {
            attack: 0.001,
            decay: 0.1,
            release: 0.3,
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5,
        }).toDestination()

        // Update the drum kit with these synths
        drumKitRef.current = {
          ride: rideSynth,
          hihat: hihatSynth,
          kick: kickSynth,
          snare: snareSynth,
        }

        // Set drum volume
        Object.values(drumKitRef.current).forEach((drum) => {
          if (drum) drum.volume.value = drumVolume[0]
        })

        setDrumsLoaded(true)
      } catch (error) {
        console.error("Error creating drum synths:", error)
        // We already have fallback drums, so no need to do anything here
      }
    }

    loadDrumKit()

    return () => {
      Object.values(drumKitRef.current).forEach((drum) => {
        if (drum) drum.dispose()
      })
    }
  }, [drumVolume])

  // Update volume when changed
  useEffect(() => {
    if (instrumentRef.current) {
      instrumentRef.current.volume.value = volume[0]
    }
  }, [volume])

  // Update drum volume when changed
  useEffect(() => {
    Object.values(drumKitRef.current).forEach((drum) => {
      if (drum) drum.volume.value = drumVolume[0]
    })
  }, [drumVolume])

  // Update tempo when changed
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  // Create and manage the sequencer
  useEffect(() => {
    if (!instrumentRef.current || isLoading) return

    const chords = CHORD_PROGRESSIONS[currentProgression]

    if (sequencerRef.current) {
      sequencerRef.current.dispose()
    }

    sequencerRef.current = new Tone.Sequence(
      (time, step) => {
        // Calculate which chord we're on
        const chordIndex = Math.floor(step / 4) % chords.length
        setCurrentChordIndex(chordIndex)

        // Get the current chord
        const chord = chords[chordIndex]

        // Get available voicings for the chord or use default
        let voicings = CHORD_VOICINGS[chord]

        // If no voicings are defined for this chord, try to create one
        if (!voicings) {
          try {
            // Parse the chord to get its root
            const { root } = parseChord(chord)

            // Find a similar chord type to use as a template
            let templateChord
            let transposition = 0

            if (chord.includes("maj7")) {
              templateChord = "Cmaj7"
              transposition = getTransposition("C", root)
            } else if (chord.includes("m7b5")) {
              templateChord = "Am7b5"
              transposition = getTransposition("A", root)
            } else if (chord.includes("m7")) {
              templateChord = "Dm7"
              transposition = getTransposition("D", root)
            } else if (chord.includes("7")) {
              templateChord = "G7"
              transposition = getTransposition("G", root)
            } else {
              // Default to major if we can't determine the chord type
              templateChord = "Cmaj7"
              transposition = getTransposition("C", root)
            }

            // Use the template chord's voicings and transpose them
            if (CHORD_VOICINGS[templateChord]) {
              voicings = CHORD_VOICINGS[templateChord].map((voicing) => transposeVoicing(voicing, transposition))
            } else {
              // Fallback to default voicings
              voicings = DEFAULT_VOICINGS
            }
          } catch (error) {
            console.error(`Error creating voicings for chord ${chord}:`, error)
            voicings = DEFAULT_VOICINGS
          }
        }

        // Get random voicing for the chord
        const voicing = voicings[Math.floor(Math.random() * voicings.length)]

        // Get random rhythm pattern
        const pattern = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)]

        // Check if we should play on this step (based on the rhythm pattern)
        const stepInBar = step % 4
        if (pattern.includes(stepInBar)) {
          // Add humanization to velocity and timing
          const velocity = Math.random() * 0.3 + 0.7 // Between 0.7 and 1.0
          const timeOffset = Math.random() * 0.03 - 0.015 // Small random timing offset

          // Different note durations for articulation
          let duration = "8n"
          const articulationRandom = Math.random()
          if (articulationRandom > 0.8) duration = "4n"
          else if (articulationRandom < 0.2) duration = "16n"

          // Play the chord with humanized parameters
          try {
            // Check if the instrument is a Sampler or a PolySynth
            if (instrumentRef.current instanceof Tone.Sampler) {
              // For Sampler, we need to play each note individually
              voicing.forEach((note) => {
                instrumentRef.current.triggerAttackRelease(note, duration, time + timeOffset, velocity)
              })
            } else {
              // For PolySynth, we can pass the array of notes
              instrumentRef.current.triggerAttackRelease(voicing, duration, time + timeOffset, velocity)
            }
          } catch (error) {
            console.error("Error playing chord:", error)

            // Fallback method - try playing notes one by one
            try {
              voicing.forEach((note) => {
                instrumentRef.current.triggerAttackRelease(note, duration, time + timeOffset, velocity)
              })
            } catch (fallbackError) {
              console.error("Fallback chord playing also failed:", fallbackError)
            }
          }
        }
      },
      Array.from({ length: chords.length * 4 }, (_, i) => i),
      "4n",
    )

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
    }
  }, [currentProgression, isLoading])

  // Create and manage the drum sequencer
  useEffect(() => {
    if (!drumsLoaded) return

    const chords = CHORD_PROGRESSIONS[currentProgression]
    const totalSteps = chords.length * 4

    if (drumSequencerRef.current) {
      drumSequencerRef.current.dispose()
    }

    drumSequencerRef.current = new Tone.Sequence(
      (time, step) => {
        // Only play drums if enabled and loaded
        if (!drumsEnabled || !drumsLoaded) return

        // Get the current step in the bar (0-3)
        const stepInBar = step % 4

        // Get the appropriate drum patterns based on swing/straight setting
        const patterns = swingEnabled ? DRUM_PATTERNS.swing : DRUM_PATTERNS.straight

        // Get the style index (or default to 0)
        const styleIndex = DRUM_STYLES[currentDrumStyle] || 0

        // Select pattern variations based on the current bar
        const barIndex = Math.floor(step / 4) % (chords.length / 4 || 1)
        const patternVariation = (styleIndex + barIndex) % patterns.ride.length

        try {
          // Play ride cymbal
          if (patterns.ride[patternVariation].includes(stepInBar) && drumKitRef.current.ride) {
            const velocity = Math.random() * 0.2 + 0.7
            const timeOffset = Math.random() * 0.01 - 0.005

            if (drumKitRef.current.ride instanceof Tone.Sampler) {
              drumKitRef.current.ride.triggerAttackRelease("C4", "16n", time + timeOffset, velocity)
            } else if (drumKitRef.current.ride instanceof Tone.MetalSynth) {
              drumKitRef.current.ride.triggerAttackRelease("16n", time + timeOffset, velocity)
            } else {
              drumKitRef.current.ride.triggerAttackRelease("16n", time + timeOffset, velocity)
            }
          }

          // Play hi-hat
          if (
            patterns.hihat[patternVariation % patterns.hihat.length].includes(stepInBar) &&
            drumKitRef.current.hihat
          ) {
            const velocity = Math.random() * 0.15 + 0.6
            const timeOffset = Math.random() * 0.01 - 0.005

            if (drumKitRef.current.hihat instanceof Tone.Sampler) {
              drumKitRef.current.hihat.triggerAttackRelease("C4", "16n", time + timeOffset, velocity)
            } else if (drumKitRef.current.hihat instanceof Tone.NoiseSynth) {
              drumKitRef.current.hihat.triggerAttackRelease("16n", time + timeOffset, velocity)
            } else {
              drumKitRef.current.hihat.triggerAttackRelease("16n", time + timeOffset, velocity)
            }
          }

          // Play kick drum
          if (patterns.kick[patternVariation % patterns.kick.length].includes(stepInBar) && drumKitRef.current.kick) {
            const velocity = Math.random() * 0.1 + 0.8

            if (drumKitRef.current.kick instanceof Tone.Sampler) {
              drumKitRef.current.kick.triggerAttackRelease("C2", "8n", time, velocity)
            } else if (drumKitRef.current.kick instanceof Tone.MembraneSynth) {
              drumKitRef.current.kick.triggerAttackRelease("C2", "8n", time, velocity)
            } else {
              drumKitRef.current.kick.triggerAttackRelease("8n", time, velocity)
            }
          }

          // Play snare drum
          if (
            patterns.snare[patternVariation % patterns.snare.length].includes(stepInBar) &&
            drumKitRef.current.snare
          ) {
            const velocity = Math.random() * 0.15 + 0.7
            const timeOffset = Math.random() * 0.01 - 0.005

            if (drumKitRef.current.snare instanceof Tone.Sampler) {
              // Alternate between snare sounds for variation
              const note = Math.random() > 0.7 ? "D3" : "C3"
              drumKitRef.current.snare.triggerAttackRelease(note, "16n", time + timeOffset, velocity)
            } else if (drumKitRef.current.snare instanceof Tone.NoiseSynth) {
              drumKitRef.current.snare.triggerAttackRelease("16n", time + timeOffset, velocity)
            } else {
              drumKitRef.current.snare.triggerAttackRelease("16n", time + timeOffset, velocity)
            }
          }
        } catch (error) {
          console.error("Error playing drum sound:", error)
        }
      },
      Array.from({ length: totalSteps }, (_, i) => i),
      "4n",
    )

    return () => {
      if (drumSequencerRef.current) {
        drumSequencerRef.current.dispose()
      }
    }
  }, [currentProgression, swingEnabled, currentDrumStyle, drumsEnabled, drumsLoaded])

  // Handle play/pause
  const togglePlay = async () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause()
      setIsPlaying(false)
    } else {
      try {
        await Tone.start()
        if (sequencerRef.current) {
          sequencerRef.current.start(0)
        }
        if (drumSequencerRef.current && drumsLoaded) {
          drumSequencerRef.current.start(0)
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
    setCurrentChordIndex(0)
    setIsPlaying(false)
  }

  // Generate a random progression
  const randomizeProgression = () => {
    const progressions = Object.keys(CHORD_PROGRESSIONS)
    const randomIndex = Math.floor(Math.random() * progressions.length)
    setCurrentProgression(progressions[randomIndex])
    resetPlayback()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main score display area */}
      <div className="flex-grow overflow-auto p-4 bg-stone-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-stone-400">Loading instrument samples...</div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {(() => {
              try {
                return (
                  <MusicScore chords={CHORD_PROGRESSIONS[currentProgression]} currentChordIndex={currentChordIndex} />
                )
              } catch (error) {
                console.error("Error rendering music score:", error)
                return (
                  <div className="p-4 text-center">
                    <div className="text-red-500 mb-4">
                      There was an error rendering the music notation.
                      <br />
                      You can still play the chord progression using the controls below.
                    </div>
                    <div className="text-lg font-bold">
                      Current Chord: {CHORD_PROGRESSIONS[currentProgression][currentChordIndex]}
                    </div>
                  </div>
                )
              }
            })()}
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
                <span className="text-sm font-medium mr-2">Rhythm:</span>
                <div className="inline-flex items-center gap-2 bg-stone-200 p-1 rounded-md">
                  <span className={`text-xs px-2 py-1 rounded ${!swingEnabled ? "bg-white shadow" : ""}`}>
                    Straight
                  </span>
                  <Switch checked={swingEnabled} onCheckedChange={setSwingEnabled} />
                  <span className={`text-xs px-2 py-1 rounded ${swingEnabled ? "bg-white shadow" : ""}`}>Swing</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium mr-2">Drums:</span>
                <div className="inline-flex items-center gap-2 bg-stone-200 p-1 rounded-md">
                  <span className={`text-xs px-2 py-1 rounded ${!drumsEnabled ? "bg-white shadow" : ""}`}>Off</span>
                  <Switch checked={drumsEnabled} onCheckedChange={setDrumsEnabled} />
                  <span className={`text-xs px-2 py-1 rounded ${drumsEnabled ? "bg-white shadow" : ""}`}>On</span>
                </div>
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
                <label className="block text-sm font-medium mb-1">Instrument</label>
                <Select value={currentInstrument} onValueChange={setCurrentInstrument}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(INSTRUMENTS).map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                {swingEnabled && (
                  <div className="mt-2">
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
              {drumsEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Drum Style</label>
                    <Select value={currentDrumStyle} onValueChange={setCurrentDrumStyle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select drum style" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(DRUM_STYLES).map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Drum Volume</label>
                    <Slider
                      value={drumVolume}
                      min={-40}
                      max={0}
                      step={1}
                      onValueChange={setDrumVolume}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Instrument Volume</label>
                <Slider value={volume} min={-40} max={0} step={1} onValueChange={setVolume} className="w-full" />
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
            <Select value={currentProgression} onValueChange={setCurrentProgression}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select progression" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CHORD_PROGRESSIONS).map((prog) => (
                  <SelectItem key={prog} value={prog}>
                    {prog}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={randomizeProgression}
              disabled={isLoading}
              aria-label="Randomize progression"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JazzBook
