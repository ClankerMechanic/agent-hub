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
  allAgents = [],
  chatSessions = {},
  onSelectAgent,
  onSelectChat
}) {
  const [homeInput, setHomeInput] = useState('');

  // Handle sending message from home screen (starts general chat)
  const handleHomeSend = () => {
    if (homeInput.trim()) {
      onStartGeneralChat(homeInput.trim());
      setHomeInput('');
    }
  };

  // Get recent chats sorted by date
  const recentChats = Object.values(chatSessions)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  // No agent selected - show welcome state with agent grid and chat input
  if (!agent) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">What can I help you with?</h2>
              <p className="text-gray-500">
                Select an agent below, or start a general chat
              </p>
            </div>

            {/* Agent Cards Grid */}
            {allAgents.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Agents</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allAgents.slice(0, 8).map(agentItem => (
                    <button
                      key={agentItem.id}
                      onClick={() => onSelectAgent?.(agentItem.id)}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                      <span className="text-3xl block mb-2">{agentItem.icon}</span>
                      <h4 className="text-sm font-medium text-gray-900 truncate">{agentItem.name}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{agentItem.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Chat Input */}
            <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Chat</p>
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
                  placeholder="Type a message to start a general chat..."
                  rows={2}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
                <button
                  onClick={handleHomeSend}
                  disabled={!homeInput.trim()}
                  className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>

            {/* Recent Chats */}
            {recentChats.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Chats</h3>
                <div className="space-y-2">
                  {recentChats.map(session => {
                    const sessionAgent = allAgents.find(a => a.id === session.agentId);
                    return (
                      <button
                        key={session.id}
                        onClick={() => onSelectChat?.(session.id)}
                        className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left flex items-center gap-3"
                      >
                        <span className="text-lg">{sessionAgent?.icon || '💬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {session.title || session.messages?.[0]?.content?.slice(0, 50) || 'New chat'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sessionAgent?.name || 'General Chat'} • {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
        serverConfiguredProviders={serverConfiguredProviders}
        onClose={onClose}
        activeProject={activeProject}
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
