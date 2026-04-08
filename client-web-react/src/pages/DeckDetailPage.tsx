import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPath } from '../config/api';
import FlashcardDisplay from '../components/FlashcardDisplay';
import AIChatSidebar from '../components/AIChatSidebar';
import SummaryDisplay from '../components/SummaryDisplay';
import HeaderBar from '../components/HeaderBar';

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

interface QuizQuestion {
  flashcard: { id: number; question: string; answer: string };
  options: string[];
  correctIndex: number;
}

function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [viewKey, setViewKey] = useState(0);

  const exitQuiz = () => {
    setQuizMode(false);
    setQuizStarted(false);
    setQuizFinished(false);
    setStudyMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setUnknownCount(0);
    setQuizQuestions([]);
    setViewKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchDeckDetail();
  }, [id]);

  const fetchDeckDetail = async () => {
    try {
      const response = await fetch(apiPath(`/decks/${id}/detail`), {
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

  const handleReviewCard = async (isKnown: boolean) => {
    if (!deck || !token || !deck.flashcards[currentCardIndex]) return;

    const flashcardId = deck.flashcards[currentCardIndex].id;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      await fetch(`${apiUrl}/study/review/${flashcardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ flashcard_id: flashcardId, is_known: isKnown }),
      });

      if (isKnown) {
        setKnownCount(prev => prev + 1);
      } else {
        setUnknownCount(prev => prev + 1);
      }

      if (currentCardIndex < deck.flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setStudyMode(false);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        alert(`Study session complete! ✅ Known: ${knownCount + (isKnown ? 1 : 0)} | ❌ Need practice: ${unknownCount + (isKnown ? 0 : 1)}`);
      }
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const goToNextCard = () => {
    if (deck && currentCardIndex < deck.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const startQuiz = () => {
    if (!deck || deck.flashcards.length < 2) {
      alert('Quiz mode requires at least 2 flashcards. Add more cards to enable this feature.');
      return;
    }
    
    const questions: QuizQuestion[] = deck.flashcards.map((fc, i) => {
      const correctAnswer = fc.answer;
      const wrongAnswers: string[] = [];
      const others = deck.flashcards.filter((_, j) => j !== i);
      
      // Shuffle others and pick up to 3 wrong answers
      const shuffled = others.sort(() => 0.5 - Math.random());
      for (let k = 0; k < Math.min(3, shuffled.length); k++) {
        wrongAnswers.push(shuffled[k].answer);
      }
      
      const options = [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(correctAnswer);
      
      return { flashcard: fc, options, correctIndex };
    });
    
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setQuizStarted(true);
    setQuizMode(true);
    setStudyMode(false);
  };

  const handleQuizAnswer = async (selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);
    const isCorrect = selectedIndex === quizQuestions[currentQuizIndex].correctIndex;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Record review
    if (deck && token) {
      const flashcardId = quizQuestions[currentQuizIndex].flashcard.id;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      try {
        await fetch(`${apiUrl}/study/review/${flashcardId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ flashcard_id: flashcardId, is_known: isCorrect }),
        });
      } catch (err) {
        console.error('Quiz review error:', err);
      }
    }
    
    setTimeout(() => {
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="app">
        <HeaderBar title="Loading..." showAIChat onChatOpen={() => {}} />
        <main className="container">
          <div className="loading">Loading deck details...</div>
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="app">
        <HeaderBar title="Error" showAIChat onChatOpen={() => {}} />
        <main className="container">
          <div className="error">{error || 'Deck not found'}</div>
          <button onClick={() => navigate('/my-decks')} className="btn-primary">
            ← Back to All Generations
          </button>
        </main>
      </div>
    );
  }

  const currentCard = deck.flashcards[currentCardIndex];

  // Quiz finished screen
  if (quizFinished) {
    const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
    return (
      <div className="app">
        <HeaderBar title={deck.title} subtitle="Quiz Results" />
        <main className="container">
          <div className="card quiz-results-card">
            <h2>📊 Quiz Results</h2>
            <div className="quiz-score">
              <div className="score-circle" style={{ borderColor: percentage >= 70 ? '#2d936c' : '#e53e3e' }}>
                <span className="score-number">{percentage}%</span>
                <span className="score-label">Score</span>
              </div>
            </div>
            <p className="quiz-detail">
              ✅ Correct: <strong>{correctAnswers}</strong> / {quizQuestions.length}
            </p>
            <p className="quiz-detail">
              ❌ Wrong: <strong>{quizQuestions.length - correctAnswers}</strong> / {quizQuestions.length}
            </p>
            <div className="quiz-actions">
              <button onClick={startQuiz} className="btn-primary">🔄 Retake Quiz</button>
              <button onClick={exitQuiz} className="btn-secondary">📖 Regular View</button>
              <button onClick={() => navigate('/my-decks')} className="btn-secondary">← Back to All</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz active
  if (quizMode && quizStarted && quizQuestions.length > 0) {
    const currentQ = quizQuestions[currentQuizIndex];
    return (
      <div className="app">
        <HeaderBar title={deck.title} subtitle="Quiz Mode" />
        <main className="container">
          <div className="card quiz-card">
            <div className="quiz-header">
              <h3>🎯 Quiz Mode</h3>
              <button onClick={() => { setQuizMode(false); setQuizStarted(false); }} className="btn-secondary" style={{ padding: '6px 12px' }}>
                Exit Quiz
              </button>
            </div>
            <div className="study-progress-bar">
              <div className="study-progress-fill" style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }} />
            </div>
            <p className="study-progress-text">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
            
            <div className="quiz-question">
              <h4>{currentQ.flashcard.question}</h4>
            </div>

            <div className="quiz-options">
              {currentQ.options.map((option, i) => {
                let className = 'quiz-option';
                if (selectedAnswer !== null) {
                  if (i === currentQ.correctIndex) className += ' quiz-option-correct';
                  else if (i === selectedAnswer) className += ' quiz-option-wrong';
                }
                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => selectedAnswer === null && handleQuizAnswer(i)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Normal deck view or study mode
  return (
    <div className="app">
      <HeaderBar title={deck.title} subtitle={deck.description || ''} showAIChat onChatOpen={() => setChatOpen(true)} />

      <main className="container" style={{ maxWidth: chatOpen ? '70%' : '1200px', transition: 'max-width 0.3s ease' }}>
        {deck.summary && (
          <SummaryDisplay summary={deck.summary} />
        )}

        {/* Study Mode */}
        {studyMode && deck.flashcards.length > 0 && (
          <div className="card study-mode-card">
            <div className="study-header">
              <h3>📖 Study Mode</h3>
              <div className="study-stats">
                <span className="stat-known">✅ {knownCount}</span>
                <span className="stat-unknown">❌ {unknownCount}</span>
              </div>
              <button 
                onClick={() => { setStudyMode(false); setCurrentCardIndex(0); setIsFlipped(false); setKnownCount(0); setUnknownCount(0); }} 
                className="btn-secondary" 
                style={{ padding: '6px 12px' }}
              >
                Exit
              </button>
            </div>
            
            <div className="study-progress-bar">
              <div className="study-progress-fill" style={{ width: `${((currentCardIndex + 1) / deck.flashcards.length) * 100}%` }} />
            </div>
            <p className="study-progress-text">Card {currentCardIndex + 1} of {deck.flashcards.length}</p>
            
            <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)} style={{ cursor: 'pointer', marginBottom: '20px' }}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h3>{currentCard.question}</h3>
                  <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '16px' }}>Click to reveal answer</p>
                </div>
                <div className="flip-card-back">
                  <h3>{currentCard.answer}</h3>
                </div>
              </div>
            </div>

            <div className="study-nav">
              <button onClick={goToPrevCard} className="btn-secondary" disabled={currentCardIndex === 0} style={{ padding: '10px 20px' }}>← Previous</button>
              <button onClick={goToNextCard} className="btn-secondary" disabled={currentCardIndex === deck.flashcards.length - 1} style={{ padding: '10px 20px' }}>Next →</button>
            </div>

            <div className="study-buttons">
              <button onClick={() => handleReviewCard(false)} className="btn-study btn-study-hard">❌ Don't Know</button>
              <button onClick={() => handleReviewCard(true)} className="btn-study btn-study-easy">✅ Know It</button>
            </div>
          </div>
        )}

        {/* Regular flashcards display */}
        {!studyMode && deck.flashcards && deck.flashcards.length > 0 && (
          <FlashcardDisplay flashcards={deck.flashcards} />
        )}

        {!studyMode && deck.flashcards.length > 0 && (
          <div className="study-mode-toggle">
            <button onClick={() => { setStudyMode(true); setCurrentCardIndex(0); setIsFlipped(false); setKnownCount(0); setUnknownCount(0); }} className="btn-primary">
              📖 Start Study Mode
            </button>
            <button onClick={startQuiz} className="btn-secondary quiz-btn">
              🎯 Start Quiz Mode
            </button>
          </div>
        )}
      </main>

      <AIChatSidebar
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contextText={deck.summary || deck.description || ''}
        token={token}
      />
    </div>
  );
}

export default DeckDetailPage;
