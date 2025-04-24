import { Link } from "wouter";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Music Practice Tools</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Jazz Comping */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Jazz Comping</h2>
              <p className="text-gray-600 mb-4">Practice jazz chord progressions with various voicings and rhythms.</p>
              <Link href="/jazz-comping">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Melody Player */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Melody Player</h2>
              <p className="text-gray-600 mb-4">Practice and analyze jazz melodies with interactive playback.</p>
              <Link href="/melody-player">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Rhythm Patterns */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Rhythm Patterns</h2>
              <p className="text-gray-600 mb-4">Practice common jazz rhythm patterns with visual notation.</p>
              <Link href="/rhythm-patterns">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Partiture Editor */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Partiture Editor</h2>
              <p className="text-gray-600 mb-4">Create and edit music scores with an interactive editor.</p>
              <Link href="/partiture-editor">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Metronome */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Metronome</h2>
              <p className="text-gray-600 mb-4">
                Practice with a customizable metronome featuring multiple time signatures.
              </p>
              <Link href="/metronome">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Guitar Tuner */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Guitar Tuner</h2>
              <p className="text-gray-600 mb-4">Tune your guitar with precision using real-time pitch detection.</p>
              <Link href="/guitar-tuner">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Routine Editor */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Routine Editor</h2>
              <p className="text-gray-600 mb-4">Create custom practice routines with multiple tools and time limits.</p>
              <Link href="/routine-editor">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>

          {/* Routine Player */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Routine Player</h2>
              <p className="text-gray-600 mb-4">Play through your saved practice routines with timed steps.</p>
              <Link href="/routine-player">
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
