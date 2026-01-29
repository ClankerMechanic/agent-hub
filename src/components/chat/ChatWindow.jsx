import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';

export function ChatWindow({ messages, isLoading, agentIcon, darkMode }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-sm">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id || index}
          message={message}
          agentIcon={agentIcon}
          darkMode={darkMode}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <span className="text-lg">{agentIcon}</span>
          </div>
          <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
