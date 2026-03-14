import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader, FiCpu } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance.js';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI support assistant for Ecom. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

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
      // Create a temporary simplified chat history array to send to the backend
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content: userMsg });

      // Call the AI chat endpoint
      const res = await axiosInstance.post('/ai/chat', { message: userMsg, history: chatHistory });
      
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response || 'Sorry, I am having trouble connecting to my brain right now.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Oops! Something went wrong on my end. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-primary-600 text-white shadow-xl flex items-center justify-center gap-2 font-medium hover:scale-105 transition-transform z-40 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open support chat"
      >
        <FiMessageSquare className="h-5 w-5" />
        <span>Chat with AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-primary-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <FiCpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Ecom. AI Support</h3>
                <p className="text-indigo-100 text-xs text-opacity-80">Usually replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-500/20' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 text-sm rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-gray-400">
                  <FiLoader className="animate-spin h-4 w-4" /> AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-primary-600 p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                aria-label="Send message"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">Powered by Gemini AI</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportChat;
