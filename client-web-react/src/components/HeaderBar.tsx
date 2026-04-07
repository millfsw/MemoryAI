import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  variant?: 'public' | 'authenticated';
  hideGenerate?: boolean;
  showAIChat?: boolean;
  onChatOpen?: () => void;
}

function HeaderBar({ title, subtitle, variant = 'authenticated', hideGenerate = false, showAIChat = false, onChatOpen }: HeaderBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Public header (thin nav bar)
  if (variant === 'public') {
    return (
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🧠</span>
          </div>
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')} className="btn-nav">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-nav btn-nav-primary">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated header
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">🧠</span>
          <div className="header-title-group">
            <h1 className="header-title">{title || 'MemoryAI'}</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="header-right">
          {!hideGenerate && (
            <button onClick={() => navigate('/home')} className="btn-header">
              ✨ Generate
            </button>
          )}
          <button onClick={() => navigate('/my-decks')} className="btn-header">
            📚 My Cards
          </button>
          {showAIChat && onChatOpen && (
            <button onClick={onChatOpen} className="btn-header">
              🤖 Ask AI
            </button>
          )}
          {!showAIChat && (
            <button onClick={() => navigate('/ai-assistant')} className="btn-header">
              🤖 Ask AI
            </button>
          )}
          <button onClick={() => navigate('/settings')} className="btn-header">
            ⚙️ Settings
          </button>
          <button onClick={handleLogout} className="btn-header btn-header-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;
