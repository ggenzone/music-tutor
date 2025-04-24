import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, Trash2, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add this function at the beginning of the component, before the useState declarations
// This will help with lazy loading VexFlow
const loadVexFlow = async () => {
  try {
    return await import("vexflow")
  } catch (error) {
    console.error("Failed to load VexFlow:", error)
    throw new Error("Failed to load music notation library")
  }
}

// Note durations and their VexFlow equivalents
const NOTE_DURATIONS = {
  Whole: { value: "w", label: "Whole Note" },
  Half: { value: "h", label: "Half Note" },
  Quarter: { value: "q", label: "Quarter Note" },
  Eighth: { value: "8", label: "Eighth Note" },
  Sixteenth: { value: "16", label: "Sixteenth Note" },
}

// Note pitches with octaves
const NOTE_PITCHES = [
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
]

// Accidentals
const ACCIDENTALS = {
  None: { value: "none", label: "Natural" },
  Sharp: { value: "#", label: "Sharp" },
  Flat: { value: "b", label: "Flat" },
}

// Time signatures
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "9/8", "12/8"]

// Key signatures
const KEY_SIGNATURES = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "Cb",
  "Am",
  "Em",
  "Bm",
  "F#m",
  "C#m",
  "G#m",
  "D#m",
  "A#m",
  "Dm",
  "Gm",
  "Cm",
  "Fm",
  "Bbm",
  "Ebm",
  "Abm",
]

interface Note {
  pitch: string
  duration: string
  accidental: string
  isRest: boolean
  dotted: boolean
}

interface Measure {
  notes: Note[]
  timeSignature?: string
  keySignature?: string
}

interface Score {
  title: string
  composer: string
  measures: Measure[]
  timeSignature: string
  keySignature: string
}

interface PartitureEditorProps {
  initialScoreId?: string
}

export function PartitureEditor({ initialScoreId }: PartitureEditorProps) {
  // Editor state
  const [score, setScore] = useState<Score>({
    title: "Untitled Score",
    composer: "Composer",
    measures: [{ notes: [] }, { notes: [] }, { notes: [] }, { notes: [] }],
    timeSignature: "4/4",
    keySignature: "C",
  })

  // Load score if initialScoreId is provided
  useEffect(() => {
    if (initialScoreId) {
      // In a real app, you would fetch the score from an API or local storage
      console.log(`Loading score with ID: ${initialScoreId}`)
      // For now, we'll just log the ID
    }
  }, [initialScoreId])

  // Current editing state
  const [currentMeasure, setCurrentMeasure] = useState(0)
  const [currentNote, setCurrentNote] = useState<Note>({
    pitch: "C4",
    duration: "q",
    accidental: "none",
    isRest: false,
    dotted: false,
  })
  const [notification, setNotification] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("edit")

  // Refs
  const scoreContainerRef = useRef<HTMLDivElement>(null)

  // Render the score using VexFlow
  useEffect(() => {
    if (!scoreContainerRef.current) return

    // Clear previous rendering
    scoreContainerRef.current.innerHTML = ""

    const renderScore = async () => {
      try {
        // Import VexFlow with error handling
        let Vex
        try {
          Vex = await loadVexFlow()
        } catch (importError) {
          console.error("Error importing VexFlow:", importError)
          if (scoreContainerRef.current) {
            scoreContainerRef.current.innerHTML = `
            <div class="p-4 text-red-500">
              Error loading music notation library. Please try refreshing the page.
            </div>
          `
          }
          return
        }

        // Create renderer with error handling
        let renderer
        try {
          renderer = new Vex.default.Renderer(scoreContainerRef.current, Vex.default.Renderer.Backends.SVG)
        } catch (rendererError) {
          console.error("Error creating renderer:", rendererError)
          if (scoreContainerRef.current) {
            scoreContainerRef.current.innerHTML = `
            <div class="p-4 text-red-500">
              Error initializing music notation renderer.
            </div>
          `
          }
          return
        }

        // Configure renderer
        renderer.resize(800, 250)
        const context = renderer.getContext()
        context.setFont("Arial", 10)

        // Calculate layout
        const measuresPerLine = 4
        const staveWidth = 180

        // Render title and composer
        context.setFont("Arial", 16)
        context.fillText(score.title, 10, 30)
        context.setFont("Arial", 12)
        context.fillText(score.composer, 10, 50)
        context.setFont("Arial", 10)

        // Create staves for each measure
        for (let i = 0; i < score.measures.length; i++) {
          const measure = score.measures[i]
          const lineIndex = Math.floor(i / measuresPerLine)
          const xPosition = (i % measuresPerLine) * staveWidth
          const yPosition = lineIndex * 100 + 80

          // Create stave
          const stave = new Vex.default.Stave(xPosition + 10, yPosition, staveWidth - 10)

          // Add clef and time signature to first measure of each line
          if (i % measuresPerLine === 0) {
            stave.addClef("treble")

            // Add time signature to first measure only
            if (i === 0 || measure.timeSignature) {
              const timeSignature = measure.timeSignature || score.timeSignature
              stave.addTimeSignature(timeSignature)
            }

            // Add key signature to first measure only
            if (i === 0 || measure.keySignature) {
              const keySignature = measure.keySignature || score.keySignature
              try {
                const keySignatureObj = new Vex.default.KeySignature(keySignature)
                keySignatureObj.addToStave(stave)
              } catch (error) {
                console.warn("Could not add key signature:", error)
              }
            }
          }

          // Add bar lines
          if ((i + 1) % measuresPerLine === 0 || i === score.measures.length - 1) {
            stave.setEndBarType(Vex.default.Barline.type.END)
          }

          // Draw stave
          stave.setContext(context).draw()

          // Highlight current measure
          if (i === currentMeasure) {
            context.save()
            context.fillStyle = "rgba(0, 123, 255, 0.1)"
            context.fillRect(xPosition + 10, yPosition, staveWidth - 10, 40)
            context.restore()
          }

          // Create notes for this measure
          if (measure.notes.length > 0) {
            try {
              const staveNotes = []

              // Process each note individually with error handling
              for (const note of measure.notes) {
                try {
                  if (note.isRest) {
                    // Create a rest
                    const vfNote = new Vex.default.StaveNote({
                      clef: "treble",
                      keys: ["b/4"], // Position of the rest
                      duration: note.duration + "r", // 'r' suffix for rest
                    })

                    // Add dot if needed
                    if (note.dotted) {
                      try {
                        vfNote.addDot(0)
                      } catch (error) {
                        console.warn("Could not add dot to rest:", error)
                      }
                    }

                    staveNotes.push(vfNote)
                  } else {
                    // Create a regular note
                    const noteName = note.pitch.replace(/[0-9]/g, "")
                    const octave = note.pitch.match(/[0-9]/g)?.[0] || "4"
                    // Handle the "none" accidental case
                    const accidental = note.accidental === "none" ? "" : note.accidental
                    const key = `${noteName.toLowerCase()}${accidental}/${octave}`

                    const vfNote = new Vex.default.StaveNote({
                      clef: "treble",
                      keys: [key],
                      duration: note.duration,
                    })

                    // Add accidental if needed
                    if (accidental) {
                      try {
                        vfNote.addAccidental(0, new Vex.default.Accidental(accidental))
                      } catch (error) {
                        console.warn("Could not add accidental:", error)
                      }
                    }

                    // Add dot if needed
                    if (note.dotted) {
                      try {
                        vfNote.addDot(0)
                      } catch (error) {
                        console.warn("Could not add dot to note:", error)
                      }
                    }

                    staveNotes.push(vfNote)
                  }
                } catch (noteError) {
                  console.warn("Error creating note:", noteError)
                  // Continue with other notes
                }
              }

              // Only proceed if we have notes to render
              if (staveNotes.length > 0) {
                // Create a voice with error handling
                try {
                  const voice = new Vex.default.Voice({
                    num_beats: Number.parseInt(score.timeSignature.split("/")[0]),
                    beat_value: Number.parseInt(score.timeSignature.split("/")[1]),
                    resolution: Vex.default.RESOLUTION,
                  }).setMode(Vex.default.Voice.Mode.SOFT)

                  // Add notes to the voice
                  voice.addTickables(staveNotes)

                  // Format and draw
                  new Vex.default.Formatter().joinVoices([voice]).format([voice], staveWidth - 50)

                  voice.draw(context, stave)
                } catch (voiceError) {
                  console.error("Error rendering voice:", voiceError)
                  // Draw error message
                  context.save()
                  context.fillStyle = "red"
                  context.fillText("Error: Too many notes for time signature", xPosition + 20, yPosition + 30)
                  context.restore()
                }
              }
            } catch (measureError) {
              console.error("Error rendering measure:", measureError)
              // Draw error message
              context.save()
              context.fillStyle = "red"
              context.fillText("Error rendering measure", xPosition + 20, yPosition + 30)
              context.restore()
            }
          }
        }
      } catch (error) {
        console.error("Error rendering score:", error)
        if (scoreContainerRef.current) {
          scoreContainerRef.current.innerHTML = `
          <div class="p-4 text-red-500">
            Error rendering music notation: ${error instanceof Error ? error.message : String(error)}
          </div>
        `
        }
      }
    }

    // Use a small delay to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      renderScore()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [score, currentMeasure, initialScoreId])

  // Add a note to the current measure
  const addNote = () => {
    try {
      const updatedScore = { ...score }
      const measure = { ...updatedScore.measures[currentMeasure] }

      // Add the current note to the measure, converting "none" accidental to empty string for rendering
      const noteToAdd = { ...currentNote }
      if (noteToAdd.accidental === "none") {
        noteToAdd.accidental = ""
      }

      measure.notes = [...measure.notes, noteToAdd]
      updatedScore.measures[currentMeasure] = measure

      setScore(updatedScore)
    } catch (error) {
      console.error("Error adding note:", error)
      setNotification("Error adding note. Please try again.")
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Remove the last note from the current measure
  const removeLastNote = () => {
    const updatedScore = { ...score }
    const measure = { ...updatedScore.measures[currentMeasure] }

    if (measure.notes.length > 0) {
      measure.notes = measure.notes.slice(0, -1)
      updatedScore.measures[currentMeasure] = measure
      setScore(updatedScore)
    }
  }

  // Clear the current measure
  const clearMeasure = () => {
    const updatedScore = { ...score }
    updatedScore.measures[currentMeasure] = { notes: [] }
    setScore(updatedScore)
  }

  // Add a new measure
  const addMeasure = () => {
    const updatedScore = { ...score }
    updatedScore.measures = [...updatedScore.measures, { notes: [] }]
    setScore(updatedScore)
  }

  // Navigate to previous measure
  const previousMeasure = () => {
    if (currentMeasure > 0) {
      setCurrentMeasure(currentMeasure - 1)
    }
  }

  // Navigate to next measure
  const nextMeasure = () => {
    if (currentMeasure < score.measures.length - 1) {
      setCurrentMeasure(currentMeasure + 1)
    } else {
      // Add a new measure if we're at the last one
      addMeasure()
      setCurrentMeasure(currentMeasure + 1)
    }
  }

  // Update score title
  const updateTitle = (title: string) => {
    setScore({ ...score, title })
  }

  // Update score composer
  const updateComposer = (composer: string) => {
    setScore({ ...score, composer })
  }

  // Update time signature
  const updateTimeSignature = (timeSignature: string) => {
    setScore({ ...score, timeSignature })
  }

  // Update key signature
  const updateKeySignature = (keySignature: string) => {
    setScore({ ...score, keySignature })
  }

  // Export score to MusicXML
  const exportToMusicXML = () => {
    try {
      // Create a basic MusicXML structure
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${score.title}</work-title>
  </work>
  <identification>
    <creator type="composer">${score.composer}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">
`

      // Add measures
      score.measures.forEach((measure, measureIndex) => {
        xml += `    <measure number="${measureIndex + 1}">\n`

        // Add attributes for the first measure
        if (measureIndex === 0) {
          xml += `      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>${getKeySignatureFifths(score.keySignature)}</fifths>
          <mode>${score.keySignature.includes("m") ? "minor" : "major"}</mode>
        </key>
        <time>
          <beats>${score.timeSignature.split("/")[0]}</beats>
          <beat-type>${score.timeSignature.split("/")[1]}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>\n`
        }

        // Add notes
        measure.notes.forEach((note) => {
          if (note.isRest) {
            xml += `      <note>
        <rest/>
        <duration>${getDurationValue(note.duration)}</duration>
        <type>${getDurationType(note.duration)}</type>
        ${note.dotted ? "<dot/>" : ""}
      </note>\n`
          } else {
            const [step, octave] = parseNotePitch(note.pitch, note.accidental)
            const accidental = note.accidental === "none" ? "" : note.accidental
            xml += `      <note>
        <pitch>
          <step>${step}</step>
          <octave>${octave}</octave>
          ${accidental ? `<alter>${accidental === "#" ? "1" : "-1"}</alter>` : ""}
        </pitch>
        <duration>${getDurationValue(note.duration)}</duration>
        <type>${getDurationType(note.duration)}</type>
        ${note.dotted ? "<dot/>" : ""}
        ${accidental ? `<accidental>${accidental === "#" ? "sharp" : "flat"}</accidental>` : ""}
      </note>\n`
          }
        })

        xml += `    </measure>\n`
      })

      xml += `  </part>
</score-partwise>`

      // Create a download link
      const blob = new Blob([xml], { type: "application/xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${score.title.replace(/\s+/g, "_")}.musicxml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setNotification("Score exported successfully!")
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error("Error exporting to MusicXML:", error)
      setNotification("Error exporting score. Please try again.")
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Export score to JSON
  const exportToJSON = () => {
    try {
      const json = JSON.stringify(score, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${score.title.replace(/\s+/g, "_")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setNotification("Score exported successfully!")
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error("Error exporting to JSON:", error)
      setNotification("Error exporting score. Please try again.")
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Helper function to get key signature fifths
  const getKeySignatureFifths = (keySignature: string): number => {
    const keyMap: Record<string, number> = {
      C: 0,
      G: 1,
      D: 2,
      A: 3,
      E: 4,
      B: 5,
      "F#": 6,
      "C#": 7,
      F: -1,
      Bb: -2,
      Eb: -3,
      Ab: -4,
      Db: -5,
      Gb: -6,
      Cb: -7,
      Am: 0,
      Em: 1,
      Bm: 2,
      "F#m": 3,
      "C#m": 4,
      "G#m": 5,
      "D#m": 6,
      "A#m": 7,
      Dm: -1,
      Gm: -2,
      Cm: -3,
      Fm: -4,
      Bbm: -5,
      Ebm: -6,
      Abm: -7,
    }

    return keyMap[keySignature] || 0
  }

  // Helper function to get duration value for MusicXML
  const getDurationValue = (duration: string): number => {
    const durationMap: Record<string, number> = {
      w: 16,
      h: 8,
      q: 4,
      "8": 2,
      "16": 1,
    }

    return durationMap[duration] || 4
  }

  // Helper function to get duration type for MusicXML
  const getDurationType = (duration: string): string => {
    const typeMap: Record<string, string> = {
      w: "whole",
      h: "half",
      q: "quarter",
      "8": "eighth",
      "16": "16th",
    }

    return typeMap[duration] || "quarter"
  }

  // Helper function to parse note pitch
  const parseNotePitch = (pitch: string, accidental: string): [string, string] => {
    const noteName = pitch.replace(/[0-9]/g, "")
    const octave = pitch.match(/[0-9]/g)?.[0] || "4"

    return [noteName, octave]
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200 flex-grow flex flex-col">
        {/* Score display */}
        <div className="flex-grow bg-stone-50 overflow-auto p-4">
          <div ref={scoreContainerRef} className="w-full min-h-[300px]"></div>
        </div>

        {/* Editor tabs */}
        <div className="border-t border-stone-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-stone-100 p-0 rounded-none">
              <TabsTrigger value="edit" className="data-[state=active]:bg-white rounded-none">
                Edit Notes
              </TabsTrigger>
              <TabsTrigger value="properties" className="data-[state=active]:bg-white rounded-none">
                Score Properties
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-white rounded-none">
                Export
              </TabsTrigger>
            </TabsList>

            {/* Edit notes tab */}
            <TabsContent value="edit" className="p-4 border-none m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Note Properties</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Pitch</label>
                      <Select
                        value={currentNote.pitch}
                        onValueChange={(value) => setCurrentNote({ ...currentNote, pitch: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pitch" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_PITCHES.map((pitch) => (
                            <SelectItem key={pitch} value={pitch}>
                              {pitch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Duration</label>
                      <Select
                        value={currentNote.duration}
                        onValueChange={(value) => setCurrentNote({ ...currentNote, duration: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(NOTE_DURATIONS).map(([key, { value, label }]) => (
                            <SelectItem key={key} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Accidental</label>
                      <Select
                        value={currentNote.accidental}
                        onValueChange={(value) => setCurrentNote({ ...currentNote, accidental: value })}
                        disabled={currentNote.isRest}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select accidental" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ACCIDENTALS).map(([key, { value, label }]) => (
                            <SelectItem key={key} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm">Rest</label>
                      <input
                        type="checkbox"
                        checked={currentNote.isRest}
                        onChange={(e) => setCurrentNote({ ...currentNote, isRest: e.target.checked })}
                        className="form-checkbox h-4 w-4"
                      />

                      <label className="text-sm ml-4">Dotted</label>
                      <input
                        type="checkbox"
                        checked={currentNote.dotted}
                        onChange={(e) => setCurrentNote({ ...currentNote, dotted: e.target.checked })}
                        className="form-checkbox h-4 w-4"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button onClick={addNote} className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Note
                    </Button>
                    <Button variant="outline" onClick={removeLastNote} className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      Remove Last
                    </Button>
                    <Button variant="outline" onClick={clearMeasure} className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      Clear Measure
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Measure Navigation</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Button variant="outline" onClick={previousMeasure} disabled={currentMeasure === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>
                      Measure {currentMeasure + 1} of {score.measures.length}
                    </span>
                    <Button variant="outline" onClick={nextMeasure}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={addMeasure} className="ml-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Measure
                    </Button>
                  </div>

                  <h3 className="text-sm font-medium mb-2">Current Measure Settings</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Time Signature</label>
                      <Select
                        value={score.measures[currentMeasure].timeSignature || score.timeSignature}
                        onValueChange={(value) => {
                          const updatedScore = { ...score }
                          updatedScore.measures[currentMeasure] = {
                            ...updatedScore.measures[currentMeasure],
                            timeSignature: value,
                          }
                          setScore(updatedScore)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Time signature" />
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
                      <label className="text-xs text-stone-500 mb-1 block">Key Signature</label>
                      <Select
                        value={score.measures[currentMeasure].keySignature || score.keySignature}
                        onValueChange={(value) => {
                          const updatedScore = { ...score }
                          updatedScore.measures[currentMeasure] = {
                            ...updatedScore.measures[currentMeasure],
                            keySignature: value,
                          }
                          setScore(updatedScore)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Key signature" />
                        </SelectTrigger>
                        <SelectContent>
                          {KEY_SIGNATURES.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Score properties tab */}
            <TabsContent value="properties" className="p-4 border-none m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Score Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Title</label>
                      <input
                        type="text"
                        value={score.title}
                        onChange={(e) => updateTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Composer</label>
                      <input
                        type="text"
                        value={score.composer}
                        onChange={(e) => updateComposer(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Default Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">Default Time Signature</label>
                      <Select value={score.timeSignature} onValueChange={updateTimeSignature}>
                        <SelectTrigger>
                          <SelectValue placeholder="Time signature" />
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
                      <label className="text-xs text-stone-500 mb-1 block">Default Key Signature</label>
                      <Select value={score.keySignature} onValueChange={updateKeySignature}>
                        <SelectTrigger>
                          <SelectValue placeholder="Key signature" />
                        </SelectTrigger>
                        <SelectContent>
                          {KEY_SIGNATURES.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Export tab */}
            <TabsContent value="export" className="p-4 border-none m-0">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Export Options</h3>
                <div className="flex space-x-4">
                  <Button onClick={exportToMusicXML} className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export to MusicXML
                  </Button>
                  <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export to JSON
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-stone-600">
                    MusicXML files can be imported into most music notation software like MuseScore, Finale, or
                    Sibelius.
                  </p>
                  <p className="text-sm text-stone-600 mt-2">
                    JSON files can be imported back into this editor or used for custom applications.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
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

export default PartitureEditor
