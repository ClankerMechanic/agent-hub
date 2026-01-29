import { useState } from 'react';
import { TokenDisplay } from './TokenDisplay';

export function ChatMessage({ message, agentIcon, darkMode }) {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600 text-white' : message.isError ? (darkMode ? 'bg-red-900' : 'bg-red-100') : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
      }`}>
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : message.isError ? (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <span className="text-lg">{agentIcon}</span>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        {/* Thinking toggle (for extended thinking) */}
        {message.thinking && (
          <button
            onClick={() => setShowThinking(!showThinking)}
            className={`inline-flex items-center gap-1 text-xs mb-1 ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {showThinking ? 'Hide' : 'Show'} thinking
          </button>
        )}

        {/* Thinking content */}
        {message.thinking && showThinking && (
          <div className={`mb-2 p-3 border rounded-lg text-left ${darkMode ? 'bg-purple-900/30 border-purple-800' : 'bg-purple-50 border-purple-100'}`}>
            <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Extended Thinking</p>
            <p className={`text-sm whitespace-pre-wrap ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>{message.thinking}</p>
          </div>
        )}

        {/* Main message bubble */}
        <div
          className={`inline-block px-4 py-2 rounded-2xl text-left ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : message.isError
                ? darkMode ? 'bg-red-900/50 text-red-300 border border-red-800 rounded-bl-md' : 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                : darkMode ? 'bg-gray-700 text-gray-100 rounded-bl-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Token display for assistant messages */}
          {!isUser && message.usage && (
            <TokenDisplay usage={message.usage} darkMode={darkMode} />
          )}
        </div>

        {/* Timestamp and model */}
        <div className={`flex items-center gap-2 mt-1 text-xs ${isUser ? 'justify-end' : ''} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {message.timestamp && (
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
          {message.model && !isUser && (
            <>
              <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>·</span>
              <span>{message.model.split('-').slice(0, 2).join(' ')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
