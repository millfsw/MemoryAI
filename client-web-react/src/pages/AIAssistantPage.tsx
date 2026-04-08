import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPath } from '../config/api';
import HeaderBar from '../components/HeaderBar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function AIAssistantPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI assistant. Ask me any question about your study material, and I\'ll help you understand! 🎓',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiPath('/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: input,
          context: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to get response' }));
        throw new Error(errorData.detail || 'Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <HeaderBar title="AI Assistant" subtitle="Ask questions about any study material" />

      <main className="container ai-assistant-container">
        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-bubble">
                  <p>{message.content}</p>
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant-message">
                <div className="message-bubble loading">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error">{error}</div>}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="chat-input"
              disabled={loading}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              {loading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AIAssistantPage;
