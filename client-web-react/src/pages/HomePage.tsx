import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GenerationForm from '../components/GenerationForm';
import FlashcardDisplay from '../components/FlashcardDisplay';
import SummaryDisplay from '../components/SummaryDisplay';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

function HomePage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'flashcards' | 'summary' | 'both'>('both');
  const [generatedDeckId, setGeneratedDeckId] = useState<number | null>(null);

  const handleGenerate = async (text: string, numCards: number) => {
    setLoading(true);
    setError(null);
    setFlashcards([]);
    setSummary('');
    setGeneratedDeckId(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers,
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
      if (data.deck) {
        setGeneratedDeckId(data.deck.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, numCards: number) => {
    setLoading(true);
    setError(null);
    setFlashcards([]);
    setSummary('');
    setGeneratedDeckId(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('num_cards', numCards.toString());
      formData.append('mode', generationMode);
      
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/generate/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to generate content from file');
      }

      const data = await response.json();
      
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.deck) {
        setGeneratedDeckId(data.deck.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div>
            <h1>🧠 MemoryAI</h1>
            <p>AI-powered flashcard generator for efficient exam preparation</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user && (
              <>
                <span style={{ color: 'white', fontWeight: 600 }}>👋 Hi, {user.username}!</span>
                <button onClick={() => navigate('/my-decks')} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  📚 My Decks
                </button>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
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

export default HomePage;
