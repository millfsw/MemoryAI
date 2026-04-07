import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashcardDisplay from '../components/FlashcardDisplay';

interface DeckDetail {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
  summary?: string;
}

function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeckDetail();
  }, [id]);

  const fetchDeckDetail = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/decks/${id}/detail`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deck details');
      }

      const data = await response.json();
      setDeck(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>📚 Loading Deck...</h1>
        </header>
        <main className="container">
          <div className="loading">Loading deck details...</div>
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>📚 Error</h1>
        </header>
        <main className="container">
          <div className="error">{error || 'Deck not found'}</div>
          <button onClick={() => navigate('/my-decks')} className="btn-primary">
            ← Back to My Decks
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div>
            <h1>📖 {deck.title}</h1>
            <p>{deck.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => navigate('/my-decks')} className="btn-secondary" style={{ padding: '8px 16px' }}>
              ← Back to Decks
            </button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="deck-detail-header">
          <p className="deck-detail-date">
            📅 Created on {new Date(deck.created_at).toLocaleDateString()} at{' '}
            {new Date(deck.created_at).toLocaleTimeString()}
          </p>
        </div>

        {deck.summary && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2>📝 Study Summary</h2>
            <div className="summary-content">
              {deck.summary}
            </div>
          </div>
        )}

        {deck.flashcards && deck.flashcards.length > 0 && (
          <FlashcardDisplay flashcards={deck.flashcards} />
        )}
      </main>
    </div>
  );
}

export default DeckDetailPage;
