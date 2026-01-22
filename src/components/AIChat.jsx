import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AIChat = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Я PolyKitchen AI. Могу порекомендовать блюда или ответить на вопросы по меню.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const messagesEndRef = useRef(null);

  // Initialize API URL
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        const { getAutoApiUrl } = await import('../utils/apiConfig');
        const url = await getAutoApiUrl();
        setApiUrl(url);
      } catch (error) {
        console.error('Failed to auto-detect API URL:', error);
      }
    };
    initializeApiUrl();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Use backend proxy to avoid CORS and hide n8n URL
      const response = await fetch(`${apiUrl}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: 'user-123' // Temporary user ID
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Extract text from n8n response
      // Expecting { output: "text" } or { message: "text" } based on n8n workflow
      const botResponse = data.output || data.message || JSON.stringify(data);

      setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Извините, произошла ошибка соединения с сервером. Попробуйте позже.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white shadow-xl hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="AI Chat"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">PolyKitchen AI</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-red-700" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-red-700" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
                  <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите что-нибудь..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
