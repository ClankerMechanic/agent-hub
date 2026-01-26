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
  onStartGenericChat,
  sessionUsage,
  selectedModel,
  onModelChange,
  apiKeys
}) {
  // No agent selected - show welcome state with generic chat option
  if (!agent) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Agent Hub</h2>
            <p className="text-gray-600 max-w-md mb-6">
              Select an agent from the right sidebar to start a conversation, or start a generic chat below.
            </p>
            <button
              onClick={onStartGenericChat}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Generic Chat
            </button>
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
      />

      {/* Editable Prompt */}
      <EditablePrompt
        prompt={agent.systemPrompt}
        expanded={promptExpanded}
        onToggle={onTogglePrompt}
        onUpdate={onUpdatePrompt}
        isCustom={agent.isCustom}
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
