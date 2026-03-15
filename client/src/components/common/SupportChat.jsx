import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Headphones, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Ecom. support! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content: userMsg });

      const res = await axiosInstance.post('/ai/chat', { message: userMsg, history: chatHistory });
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: res.data.response || 'Sorry, I am having trouble connecting right now. Please try again.' 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = err.response?.data?.message || 'Our support service is temporarily unavailable. Please try again in a moment.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 px-5 rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-600/25 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-primary-700 hover:scale-105 transition-all z-40 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open customer support"
      >
        <Headphones className="h-5 w-5" strokeWidth={2} />
        <span>Support</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-32px)] sm:w-96 max-h-[80vh] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-xl">
                <Headphones className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Ecom. Support</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-white/75 text-xs">Online 24/7</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Headphones className="h-3.5 w-3.5 text-primary-600" strokeWidth={2} />
                  </div>
                )}
                <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Headphones className="h-3.5 w-3.5 text-primary-600" strokeWidth={2} />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 text-sm rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about orders, products, returns..."
                className="w-full pl-4 pr-12 py-3 bg-surface-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 focus:bg-white transition-all"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-primary-600 p-2 rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:bg-gray-300 transition-colors"
                aria-label="Send"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-1.5">Ecom. Customer Support · 24/7</p>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportChat;
