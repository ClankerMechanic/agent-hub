import { useState } from 'react';

export function ProjectView({
  project,
  agents,
  chatSessions,
  onSelectAgent,
  onStartChat,
  onSelectChat,
  onBack
}) {
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Get agents for this project
  const projectAgents = project.agentIds
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean);

  // Get the currently selected agent
  const selectedAgent = selectedAgentId
    ? agents.find(a => a.id === selectedAgentId)
    : null;

  // Get chats for this project (filtered by projectId)
  const projectChats = Object.values(chatSessions)
    .filter(session => session.projectId === project.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  // Get chats for selected agent within project
  const agentChats = selectedAgentId
    ? projectChats.filter(session => session.agentId === selectedAgentId)
    : projectChats;

  const handleAgentClick = (agentId) => {
    setSelectedAgentId(agentId);
    setChatInput('');
  };

  const handleStartChat = () => {
    if (!chatInput.trim()) return;
    onStartChat(selectedAgentId || 'general-chat', chatInput.trim(), project.id);
    setChatInput('');
  };

  const handleBackToAgents = () => {
    setSelectedAgentId(null);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to home"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-2xl">{project.icon || '📁'}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedAgent ? (
          /* Project Home - Agent Grid */
          <div className="max-w-4xl mx-auto">
            {/* Agent Cards */}
            {projectAgents.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-gray-700 mb-3">Project Agents</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {projectAgents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent.id)}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                    >
                      <span className="text-3xl block mb-2">{agent.icon}</span>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{agent.description}</p>
                    </button>
                  ))}
                  {/* General Chat option */}
                  <button
                    onClick={() => handleAgentClick('general-chat')}
                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                  >
                    <span className="text-3xl block mb-2">💬</span>
                    <h3 className="text-sm font-medium text-gray-900">General Chat</h3>
                    <p className="text-xs text-gray-500 mt-0.5">No specific agent</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 text-center">
                <span className="text-4xl block mb-3">💬</span>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No agents selected</h3>
                <p className="text-sm text-gray-500 mb-4">Start with General Chat or add agents to this project</p>
                <button
                  onClick={() => handleAgentClick('general-chat')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start General Chat
                </button>
              </div>
            )}

            {/* Previous Chats */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">Previous Chats</h2>
              {projectChats.length > 0 ? (
                <div className="space-y-2">
                  {projectChats.map(session => {
                    const agent = agents.find(a => a.id === session.agentId);
                    return (
                      <button
                        key={session.id}
                        onClick={() => onSelectChat(session.id)}
                        className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left flex items-center gap-3"
                      >
                        <span className="text-lg">{agent?.icon || '💬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {session.title || session.messages?.[0]?.content?.slice(0, 50) || 'New chat'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agent?.name || 'General Chat'} • {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No chats yet in this project</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Agent View within Project */
          <div className="max-w-3xl mx-auto">
            {/* Back to agents */}
            <button
              onClick={handleBackToAgents}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to project
            </button>

            {/* Agent Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedAgent?.icon || '💬'}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedAgent?.name || 'General Chat'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedAgent?.description || 'Chat without a specific agent'}
                  </p>
                </div>
              </div>

              {/* System Prompt */}
              {selectedAgent?.systemPrompt && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">System Prompt</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                    {selectedAgent.systemPrompt}
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartChat();
                  }
                }}
                placeholder={`Message ${selectedAgent?.name || 'General Chat'}...`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleStartChat}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>Start Chat</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Previous Chats with this Agent */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Previous Chats with {selectedAgent?.name || 'General Chat'}
              </h3>
              {agentChats.length > 0 ? (
                <div className="space-y-2">
                  {agentChats.map(session => (
                    <button
                      key={session.id}
                      onClick={() => onSelectChat(session.id)}
                      className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                    >
                      <p className="text-sm text-gray-900 truncate">
                        {session.title || session.messages?.[0]?.content?.slice(0, 50) || 'New chat'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No previous chats</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
