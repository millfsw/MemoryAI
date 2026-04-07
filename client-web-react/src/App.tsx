import { useState } from 'react';
import GenerationForm from './components/GenerationForm';
import FlashcardDisplay from './components/FlashcardDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import './App.css';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

function App() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'flashcards' | 'summary' | 'both'>('both');

  const handleGenerate = async (text: string, numCards: number) => {
    setLoading(true);
    setError(null);
    setFlashcards([]);
    setSummary('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          num_cards: numCards,
          mode: generationMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const data = await response.json();
      
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, numCards: number) => {
    const text = await file.text();
    await handleGenerate(text, numCards);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 MemoryAI</h1>
        <p>AI-powered flashcard generator for efficient exam preparation</p>
      </header>

      <main className="container">
        <GenerationForm 
          onGenerate={handleGenerate}
          onFileUpload={handleFileUpload}
          loading={loading}
          mode={generationMode}
          onModeChange={setGenerationMode}
        />

        {error && <div className="error">{error}</div>}

        {summary && generationMode !== 'flashcards' && (
          <SummaryDisplay summary={summary} />
        )}

        {flashcards.length > 0 && generationMode !== 'summary' && (
          <FlashcardDisplay flashcards={flashcards} />
        )}
      </main>
    </div>
  );
}

export default App;
