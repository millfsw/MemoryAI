import { useState } from 'react';
import GenerationForm from './components/GenerationForm';
import FlashcardDisplay from './components/FlashcardDisplay';
import './App.css';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (text: string, numCards: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          num_cards: numCards,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
          loading={loading}
        />

        {error && <div className="error">{error}</div>}

        {flashcards.length > 0 && (
          <FlashcardDisplay flashcards={flashcards} />
        )}
      </main>
    </div>
  );
}

export default App;
