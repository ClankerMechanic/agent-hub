import { useState, useRef, useEffect } from 'react';

export function ChatInput({ onSend, disabled, placeholder }) {
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
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ maxHeight: '200px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
