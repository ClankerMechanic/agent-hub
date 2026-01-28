import { useState, useRef, useEffect } from 'react';

export function ChatInput({ onSend, disabled, placeholder, darkMode }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full px-4 py-3 border rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:cursor-not-allowed ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100'
            }`}
            style={{ maxHeight: '200px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={`flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:cursor-not-allowed transition-colors ${
            darkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
