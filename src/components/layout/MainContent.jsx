import { useState } from 'react';
import { AgentHeader } from '../agent/AgentHeader';
import { EditablePrompt } from '../agent/EditablePrompt';
import { ChatWindow } from '../chat/ChatWindow';
import { ChatInput } from '../chat/ChatInput';

export function MainContent({
  agent,
  messages,
  isLoading,
  promptExpanded,
  onTogglePrompt,
  onSendMessage,
  onUpdatePrompt,
  onStartGeneralChat,
  sessionUsage,
  selectedModel,
  onModelChange,
  apiKeys,
  githubEnabled,
  onShowVersionHistory,
  onClose
}) {
  const [homeInput, setHomeInput] = useState('');

  // Handle sending message from home screen (starts general chat)
  const handleHomeSend = () => {
    if (homeInput.trim()) {
      onStartGeneralChat(homeInput.trim());
      setHomeInput('');
    }
  };

  // No agent selected - show welcome state with chat input
  if (!agent) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">What can I help you with?</h2>
              <p className="text-gray-500">
                Type below to start a general chat, or select an agent from the sidebar
              </p>
            </div>

            {/* Chat Input Box */}
            <div className="relative">
              <textarea
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleHomeSend();
                  }
                }}
                placeholder="Message General Chat..."
                rows={3}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
              />
              <button
                onClick={handleHomeSend}
                disabled={!homeInput.trim()}
                className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Agent Header */}
      <AgentHeader
        agent={agent}
        sessionUsage={sessionUsage}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        apiKeys={apiKeys}
        onClose={onClose}
      />

      {/* Editable Prompt */}
      <EditablePrompt
        prompt={agent.systemPrompt}
        expanded={promptExpanded}
        onToggle={onTogglePrompt}
        onUpdate={onUpdatePrompt}
        isCustom={agent.isCustom}
        githubEnabled={githubEnabled}
        onShowVersionHistory={onShowVersionHistory}
      />

      {/* Chat Window */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        agentIcon={agent.icon}
      />

      {/* Chat Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder={`Message ${agent.name}...`}
      />
    </div>
  );
}
