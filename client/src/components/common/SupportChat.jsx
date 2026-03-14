import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader, FiHeadphones } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance.js';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! 👋 Welcome to Ecom. support. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content: userMsg });

      const res = await axiosInstance.post('/ai/chat', { message: userMsg, history: chatHistory });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response || 'Sorry, I am having trouble connecting right now. Please try again.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 px-5 rounded-full bg-gradient-to-r from-indigo-600 to-primary-600 text-white shadow-xl flex items-center justify-center gap-2 font-semibold text-sm hover:scale-105 transition-all z-40 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open customer support"
      >
        <FiHeadphones className="h-5 w-5" />
        <span>Support</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-48px)] sm:w-96 max-h-[80vh] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-primary-600 p-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-full">
                <FiHeadphones className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Ecom. Support</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-white/80 text-xs">Online 24/7</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <FiHeadphones className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                    : 'bg-white text-gray-800 border border-gray-150 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <FiHeadphones className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="bg-white border border-gray-150 px-4 py-3 text-sm rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2 text-gray-400">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                  </span>
                  <span className="text-xs">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about orders, products, returns..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-indigo-600 p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-300 transition-colors"
                aria-label="Send"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-1.5">Ecom. Customer Support · 24/7</p>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportChat;
