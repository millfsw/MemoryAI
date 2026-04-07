import { useState, FormEvent } from 'react';

interface GenerationFormProps {
  onGenerate: (text: string, numCards: number) => void;
  loading: boolean;
}

function GenerationForm({ onGenerate, loading }: GenerationFormProps) {
  const [text, setText] = useState('');
  const [numCards, setNumCards] = useState(10);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text, numCards);
    }
  };

  return (
    <div className="card">
      <h2>Generate Flashcards</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="text-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Enter your study material:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your lecture notes, textbook material, or any study content here..."
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="num-cards" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Number of flashcards:
          </label>
          <input
            type="number"
            id="num-cards"
            value={numCards}
            onChange={(e) => setNumCards(Number(e.target.value))}
            min={1}
            max={50}
            disabled={loading}
            style={{ width: '100px' }}
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading || !text.trim()}
        >
          {loading ? 'Generating...' : '✨ Generate Flashcards'}
        </button>
      </form>
    </div>
  );
}

export default GenerationForm;
