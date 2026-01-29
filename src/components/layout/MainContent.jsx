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
  serverConfiguredProviders = {},
  githubEnabled,
  onShowVersionHistory,
  onClose,
  activeProject,
  onBackToProject,
  darkMode
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
      <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>What can I help you with?</h2>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
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
                className={`w-full px-4 py-3 pr-12 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
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

            <p className={`text-xs text-center mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Project Header - shown when viewing agent within a project */}
      {activeProject && (
        <div className={`px-4 py-2 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToProject}
              className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Back to project"
            >
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="text-lg">{activeProject.icon || '📁'}</span>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{activeProject.name}</span>
          </div>
        </div>
      )}

      {/* Agent Header */}
      <AgentHeader
        agent={agent}
        sessionUsage={sessionUsage}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        apiKeys={apiKeys}
        serverConfiguredProviders={serverConfiguredProviders}
        onClose={onClose}
        darkMode={darkMode}
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
        darkMode={darkMode}
      />

      {/* Chat Window */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        agentIcon={agent.icon}
        darkMode={darkMode}
      />

      {/* Chat Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder={`Message ${agent.name}...`}
        darkMode={darkMode}
      />
    </div>
  );
}
