import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"

interface MusicXMLLoaderProps {
  onLoad: (data: any) => void
}

export function MusicXMLLoader({ onLoad }: MusicXMLLoaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Check file extension
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "xml" || fileExtension === "musicxml") {
        // Handle MusicXML
        const text = await file.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, "text/xml")

        // Basic validation to check if it's a MusicXML file
        const root = xmlDoc.documentElement
        if (root.nodeName !== "score-partwise" && root.nodeName !== "score-timewise") {
          throw new Error("Invalid MusicXML file format")
        }

        // Convert to a simplified format for our app
        const melody = parseMusicXML(xmlDoc)
        onLoad(melody)
      } else if (fileExtension === "json") {
        // Handle JSON
        const text = await file.text()
        const data = JSON.parse(text)

        // Basic validation
        if (!data.notes || !data.durations || !data.timeSignature) {
          throw new Error("Invalid melody JSON format")
        }

        onLoad(data)
      } else {
        throw new Error("Unsupported file format. Please upload a MusicXML or JSON file.")
      }
    } catch (err) {
      console.error("Error loading file:", err)
      setError(err instanceof Error ? err.message : "Unknown error loading file")
    } finally {
      setLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Very basic MusicXML parser - in a real app, you'd want a more robust parser
  const parseMusicXML = (xmlDoc: Document) => {
    const notes: (string | null)[] = []
    const durations: string[] = []

    // Try to get key signature
    const keyElement = xmlDoc.querySelector("key")
    const fifths = keyElement?.querySelector("fifths")?.textContent || "0"
    const mode = keyElement?.querySelector("mode")?.textContent || "major"

    // Map fifths to key
    const keyMap: Record<string, string> = {
      "0": mode === "major" ? "C" : "Am",
      "1": mode === "major" ? "G" : "Em",
      "2": mode === "major" ? "D" : "Bm",
      "3": mode === "major" ? "A" : "F#m",
      "4": mode === "major" ? "E" : "C#m",
      "5": mode === "major" ? "B" : "G#m",
      "6": mode === "major" ? "F#" : "D#m",
      "7": mode === "major" ? "C#" : "A#m",
      "-1": mode === "major" ? "F" : "Dm",
      "-2": mode === "major" ? "Bb" : "Gm",
      "-3": mode === "major" ? "Eb" : "Cm",
      "-4": mode === "major" ? "Ab" : "Fm",
      "-5": mode === "major" ? "Db" : "Bbm",
      "-6": mode === "major" ? "Gb" : "Ebm",
      "-7": mode === "major" ? "Cb" : "Abm",
    }

    // Get time signature
    const timeElement = xmlDoc.querySelector("time")
    const beats = timeElement?.querySelector("beats")?.textContent || "4"
    const beatType = timeElement?.querySelector("beat-type")?.textContent || "4"
    const timeSignature = `${beats}/${beatType}`

    // Extract notes
    const noteElements = xmlDoc.querySelectorAll("note")
    noteElements.forEach((noteElement) => {
      // Check if it's a rest
      const isRest = noteElement.querySelector("rest") !== null

      if (isRest) {
        notes.push(null)
      } else {
        // Get pitch
        const step = noteElement.querySelector("step")?.textContent || "C"
        const octave = noteElement.querySelector("octave")?.textContent || "4"
        const alter = noteElement.querySelector("alter")?.textContent

        let noteName = step
        if (alter === "1") noteName += "#"
        else if (alter === "-1") noteName += "b"

        notes.push(`${noteName}${octave}`)
      }

      // Get duration
      const type = noteElement.querySelector("type")?.textContent || "quarter"
      const dot = noteElement.querySelector("dot") !== null

      // Map note type to our duration format
      let duration
      switch (type) {
        case "whole":
          duration = "w"
          break
        case "half":
          duration = "h"
          break
        case "quarter":
          duration = "4n"
          break
        case "eighth":
          duration = "8n"
          break
        case "sixteenth":
          duration = "16n"
          break
        default:
          duration = "4n"
      }

      if (dot) duration += "."

      durations.push(duration)
    })

    return {
      notes,
      durations,
      timeSignature,
      key: keyMap[fifths] || "C",
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xml,.musicxml,.json"
        className="hidden"
      />

      <Button
        onClick={handleButtonClick}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin">
            <Upload className="h-4 w-4" />
          </div>
        ) : (
          <>
            <FileUp className="h-4 w-4" />
            Upload MusicXML or JSON
          </>
        )}
      </Button>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <div className="text-xs text-stone-500 mt-2">Supported formats: MusicXML (.xml, .musicxml) and JSON</div>
    </div>
  )
}
