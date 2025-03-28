import { ContentGenerator } from "@/components/content-generator"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">YouTube Shorts Generator</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Generate engaging YouTube Shorts content with AI. Enter a topic, and we'll create a script, relevant images, and
        text-to-speech audio for your next viral short.
      </p>
      <ContentGenerator />
    </main>
  )
}

