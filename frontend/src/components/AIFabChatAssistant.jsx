import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AIFabChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      setMessages([{
        type: 'assistant',
        content: t('chat.welcome', "Hello! I'm Naveen's AI assistant. I can answer questions about his experience, projects, and skills. What would you like to know?"),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          type: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'assistant',
        content: t('chat.error', "Sorry, I encountered an error. Please try again."),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const formatMessage = (content) => {
    // Simple formatting for line breaks and bullet points
    return content
      .split('\n')
      .map((line, index) => {
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <div key={index} className="ml-4 flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </div>;
        }
        if (line.trim().startsWith('🎓') || line.trim().startsWith('💼') || line.trim().startsWith('🚀') || line.trim().startsWith('📜')) {
          return <div key={index} className="font-medium text-blue-300 mt-2">{line}</div>;
        }
        return line.trim() ? <div key={index} className="mb-1">{line}</div> : <div key={index} className="h-2"></div>;
      });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          aria-label="Open AI Chat Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {t('chat.title', 'AI Assistant')}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 theme-card rounded-2xl shadow-2xl border theme-border transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b theme-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium theme-text-primary text-sm">
                  {t('chat.title', 'AI Assistant')}
                </h3>
                <p className="text-xs theme-text-tertiary">
                  {isLoading ? t('chat.thinking', 'Thinking...') : 'Online'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={minimizeChat}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded theme-transition"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded theme-transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                          : 'theme-bg-secondary theme-text-primary'
                      }`}
                    >
                      {message.type === 'assistant' ? (
                        <div className="space-y-1">
                          {formatMessage(message.content)}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.type === 'user' && (
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="theme-bg-secondary p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin theme-text-tertiary" />
                        <span className="text-sm theme-text-tertiary">
                          {t('chat.thinking', 'Thinking...')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t theme-border">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.placeholder', "Ask me about Naveen's projects, skills, or experience...")}
                    className="flex-1 theme-input rounded-xl px-3 py-2 text-sm resize-none h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIFabChatAssistant;