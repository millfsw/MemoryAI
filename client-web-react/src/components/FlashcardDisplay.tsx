import { useState } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardDisplayProps {
  flashcards: Flashcard[];
}

function FlashcardDisplay({ flashcards }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Flashcards</h2>
        <p style={{ color: '#666' }}>
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      <div 
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <h3>Question</h3>
            <p>{flashcards[currentIndex].question}</p>
            <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
              Click to reveal answer
            </p>
          </div>
          <div className="flip-card-back">
            <h3>Answer</h3>
            <p>{flashcards[currentIndex].answer}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
        <button className="btn-secondary" onClick={handlePrev}>
          ← Previous
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default FlashcardDisplay;
