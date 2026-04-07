import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Deck {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

function MyDecksPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/decks`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }

      const data = await response.json();
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeckClick = (deckId: number) => {
    navigate(`/deck/${deckId}`);
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
            <h1>📚 My Decks</h1>
            <p>Your generated study materials</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '8px 16px' }}>
              ✨ Generate New
            </button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {loading && <div className="loading">Loading your decks...</div>}
        
        {error && <div className="error">{error}</div>}

        {!loading && !error && decks.length === 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>No decks yet</h3>
            <p style={{ color: '#8b6f47', marginBottom: '20px' }}>
              Generate your first flashcard deck to start studying!
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              ✨ Create Your First Deck
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="card deck-list-item"
              onClick={() => handleDeckClick(deck.id)}
            >
              <h3>{deck.title}</h3>
              {deck.description && (
                <p style={{ color: '#8b6f47', fontSize: '14px' }}>{deck.description}</p>
              )}
              <p style={{ color: '#8b6f47', fontSize: '12px', marginTop: '12px' }}>
                📅 {new Date(deck.created_at).toLocaleDateString()} at{' '}
                {new Date(deck.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyDecksPage;
