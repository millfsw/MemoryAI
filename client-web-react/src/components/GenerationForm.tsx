import { useState, FormEvent, ChangeEvent } from 'react';

interface GenerationFormProps {
  onGenerate: (text: string, numCards: number) => void;
  onFileUpload: (file: File, numCards: number) => void;
  loading: boolean;
  mode: 'flashcards' | 'summary' | 'both';
  onModeChange: (mode: 'flashcards' | 'summary' | 'both') => void;
}

function GenerationForm({ onGenerate, onFileUpload, loading, mode, onModeChange }: GenerationFormProps) {
  const [text, setText] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (uploadedFile) {
      onFileUpload(uploadedFile, numCards);
    } else if (text.trim()) {
      onGenerate(text, numCards);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Read file content and display in textarea (for text files only)
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        file.text().then(content => {
          setText(content);
        });
      } else {
        setText(''); // Clear text for images/PDFs
      }
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setText('');
  };

  return (
    <div className="card">
      <h2>Generate Study Material</h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Generation Mode:
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className={mode === 'flashcards' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onModeChange('flashcards')}
            disabled={loading}
            style={{ flex: 1 }}
          >
            🎴 Flashcards Only
          </button>
          <button
            type="button"
            className={mode === 'summary' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onModeChange('summary')}
            disabled={loading}
            style={{ flex: 1 }}
          >
            📝 Summary Only
          </button>
          <button
            type="button"
            className={mode === 'both' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onModeChange('both')}
            disabled={loading}
            style={{ flex: 1 }}
          >
            🎯 Flashcards and Summary
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Upload File (.txt, .pdf, .docx, .png, .jpg):
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.md,.text"
            onChange={handleFileChange}
            disabled={loading}
            style={{ padding: '8px' }}
          />
          {uploadedFile && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              ✅ File: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
              <button
                type="button"
                onClick={clearFile}
                style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="text-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Or paste your text:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your lecture notes, textbook material, or any study content here..."
            disabled={loading}
          />
        </div>

        {(mode === 'flashcards' || mode === 'both') && (
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
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || (!text.trim() && !uploadedFile)}
        >
          {loading ? 'Generating...' : mode === 'both' ? '✨ Generate Summary & Flashcards' : mode === 'summary' ? '📝 Generate Summary' : '✨ Generate Flashcards'}
        </button>
      </form>
    </div>
  );
}

export default GenerationForm;
