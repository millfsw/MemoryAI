import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🧠</span>
          </div>
          <div className="nav-buttons">
            {isAuthenticated ? (
              <button onClick={() => navigate('/home')} className="btn-nav btn-nav-primary">
                Go to Generator
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-nav">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="btn-nav btn-nav-primary">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">🧠 MemoryAI</h1>
          <p className="landing-subtitle">
            Turn your study materials into interactive flashcards for effective exam preparation
          </p>
          <div className="landing-cta">
            {isAuthenticated ? (
              <button onClick={() => navigate('/home')} className="btn-landing-primary">
                Go to Generator
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/register')} className="btn-landing-primary">
                  Get Started Free
                </button>
                <button onClick={() => navigate('/login')} className="btn-landing-secondary">
                  Already have an account? Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="section-title">What can you do?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Generate Flashcards</h3>
            <p>Upload text or a file — we'll automatically create flashcards with questions and answers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Study Summaries</h3>
            <p>Get structured summaries with highlighted key concepts and main ideas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Ask questions about the material and get clear explanations from an AI tutor</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Save & Revisit</h3>
            <p>All your generations are saved — come back to them anytime</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Multiple Formats</h3>
            <p>Support for .txt, .pdf, .docx, .png, .jpg — upload materials in any format</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Interactive Learning</h3>
            <p>Flip cards with prev/next navigation — study efficiently and enjoy the process</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <h2 className="section-title">How does it work?</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create an account in seconds — it's free</p>
          </div>
          <div className="how-step">
            <div className="step-number">2</div>
            <h3>Upload Material</h3>
            <p>Paste text or upload files with lectures, textbooks, or notes</p>
          </div>
          <div className="how-step">
            <div className="step-number">3</div>
            <h3>Get Flashcards</h3>
            <p>AI creates flashcards and summaries — ready for studying!</p>
          </div>
          <div className="how-step">
            <div className="step-number">4</div>
            <h3>Start Learning</h3>
            <p>Review cards, ask the AI questions, and prepare for exams</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <h2>Ready to get started?</h2>
        <p>Join now and study more effectively!</p>
        <div className="landing-cta">
          <button onClick={() => navigate('/register')} className="btn-landing-primary">
            Sign Up Free
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
