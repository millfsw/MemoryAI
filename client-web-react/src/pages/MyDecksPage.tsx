import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeaderBar from '../components/HeaderBar';

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
  const [selectedDecks, setSelectedDecks] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDecks();
  }, []);

  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => {
    const query = searchQuery.toLowerCase();
    return (
      deck.title.toLowerCase().includes(query) ||
      (deck.description && deck.description.toLowerCase().includes(query))
    );
  });

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

  const toggleSelectDeck = (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedDecks);
    if (newSelected.has(deckId)) {
      newSelected.delete(deckId);
    } else {
      newSelected.add(deckId);
    }
    setSelectedDecks(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedDecks.size === 0) return;

    const confirmMessage = selectedDecks.size === 1
      ? 'Delete selected generation?'
      : `Delete selected generations (${selectedDecks.size} items)?`;

    if (!confirm(confirmMessage)) return;

    setDeleting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const deletePromises = Array.from(selectedDecks).map(async (deckId) => {
        return fetch(`${apiUrl}/decks/${deckId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
      });

      await Promise.all(deletePromises);

      // Remove deleted decks from state
      setDecks(decks.filter(deck => !selectedDecks.has(deck.id)));
      setSelectedDecks(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete decks');
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDecks(new Set(decks.map(d => d.id)));
    } else {
      setSelectedDecks(new Set());
    }
  };

  return (
    <div className="app">
      <HeaderBar title="My Cards" subtitle="Your generated study materials" />

      <main className="container">
        {loading && <div className="loading">Loading...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && decks.length === 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>No generations yet</h3>
            <p style={{ color: '#8b6f47', marginBottom: '20px' }}>
              Generate your first flashcards to start studying!
            </p>
            <button onClick={() => navigate('/home')} className="btn-primary">
              ✨ Create Your First Generation
            </button>
          </div>
        )}

        {!loading && !error && decks.length > 0 && (
          <>
            <div className="decks-toolbar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedDecks.size === decks.length && decks.length > 0}
                />
                Select All
              </label>
              {selectedDecks.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="btn-danger"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : `🗑️ Delete Selected (${selectedDecks.size})`}
                </button>
              )}
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search decks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {filteredDecks.length === 0 && searchQuery && (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#4a6f8c', fontSize: '16px' }}>No decks match "{searchQuery}"</p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="card deck-list-item"
                  onClick={() => handleDeckClick(deck.id)}
                >
                  <div className="deck-item-header">
                    <input
                      type="checkbox"
                      checked={selectedDecks.has(deck.id)}
                      onClick={(e) => toggleSelectDeck(deck.id, e)}
                      onChange={() => {}}
                    />
                    <h3>{deck.title}</h3>
                  </div>
                  {deck.description && (
                    <p style={{ color: '#8b6f47', fontSize: '14px' }}>{deck.description}</p>
                  )}
                  <p style={{ color: '#8b6f47', fontSize: '12px', marginTop: '12px' }}>
                    📅 {new Date(deck.created_at).toLocaleDateString()} at{' '}
                    {new Date(deck.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MyDecksPage;
