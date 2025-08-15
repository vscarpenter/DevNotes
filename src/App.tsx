import { FileText } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">DevNotes</h1>
        </div>
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            A developer-focused note-taking application
          </p>
          <p className="text-sm text-muted-foreground">
            Project foundation successfully set up with Vite, React, TypeScript, Tailwind CSS, and core dependencies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App