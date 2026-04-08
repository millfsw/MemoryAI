import { useState, useRef, useEffect } from 'react';
import { apiPath } from '../config/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
  token: string | null;
}

function AIChatSidebar({ isOpen, onClose, contextText, token }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! Ask me any question about the material, and I\'ll help you understand it better.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !uploadedFile) return;

    const userMessage: Message = {
      role: 'user',
      content: input + (uploadedFile ? `\n\n📎 Attached file: ${uploadedFile.name}` : ''),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = contextText
        ? `You are a helpful tutor. The user is studying this material:\n\n${contextText}\n\nAnswer questions based on this material. Be clear and concise.`
        : 'You are a helpful tutor. Answer questions clearly and concisely.';

      const response = await fetch(apiPath('/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: input,
          context: contextText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I could not process your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
      setUploadedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-sidebar" style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '30%',
      height: '100vh',
      background: 'white',
      boxShadow: '-4px 0 20px rgba(13, 110, 139, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      borderLeft: '3px solid #0d6e8b',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #0d6e8b 0%, #0a5a73 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, color: 'white' }}>🤖 AI Assistant</h3>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #0d6e8b 0%, #0a5a73 100%)'
                : '#f0f4f8',
              color: msg.role === 'user' ? 'white' : '#1e3a5f',
              marginLeft: msg.role === 'user' ? 'auto' : '0',
              marginRight: msg.role === 'user' ? '0' : 'auto',
              maxWidth: '85%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', color: '#4a6f8c', padding: '12px' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #d4e8f0' }}>
        {uploadedFile && (
          <div style={{
            marginBottom: '8px',
            padding: '8px',
            background: '#f0f4f8',
            borderRadius: '8px',
            fontSize: '12px',
          }}>
            📎 {uploadedFile.name}
            <button
              onClick={() => setUploadedFile(null)}
              style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px' }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about the material..."
            disabled={loading}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #d4e8f0' }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '10px 16px' }}
          >
            ➤
          </button>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="file"
            accept=".txt,.pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={loading}
            style={{ fontSize: '12px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default AIChatSidebar;
