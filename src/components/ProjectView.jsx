import { useState } from 'react';

export function ProjectView({
  project,
  agents,
  allAgents,
  chatSessions,
  onStartChat,
  onSelectChat,
  onBack,
  onAddAgentToProject,
  onUpdateProjectPrompt,
  projectPromptOverrides = {},
  onSelectAgent
}) {
  const [chatInput, setChatInput] = useState('');
  const [showAddAgent, setShowAddAgent] = useState(false);

  // Get agents for this project (handle both old agentId and new agentIds format)
  const agentIds = project.agentIds || (project.agentId ? [project.agentId] : []);
  const projectAgents = agentIds
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean);

  // Get agents not in this project (for add agent dropdown)
  const availableAgents = allAgents.filter(
    a => a.id !== 'general-chat' && !agentIds.includes(a.id)
  );

  // Get chats for this project (filtered by projectId)
  const projectChats = Object.values(chatSessions)
    .filter(session => session.projectId === project.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleAgentClick = (agentId) => {
    // Navigate to agent view (MainContent) while keeping project context
    onSelectAgent?.(agentId);
  };

  const handleStartChat = (agentId = null) => {
    if (!chatInput.trim()) return;
    const targetAgentId = agentId || 'general-chat';
    onStartChat(targetAgentId, chatInput.trim(), project.id);
    setChatInput('');
  };

  const handleAddAgent = (agentId) => {
    onAddAgentToProject(project.id, agentId);
    setShowAddAgent(false);
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
        {/* Project Home - Agent Grid + Chat Input */}
        <div className="max-w-4xl mx-auto">
          {/* Agent Cards */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Project Agents</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {projectAgents.map(agent => {
                const overrideKey = `${project.id}:${agent.id}`;
                const hasOverride = !!projectPromptOverrides[overrideKey];
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group relative"
                  >
                    {hasOverride && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Custom prompt" />
                    )}
                    <span className="text-3xl block mb-2">{agent.icon}</span>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{agent.description}</p>
                  </button>
                );
              })}

              {/* Add Agent Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddAgent(!showAddAgent)}
                  className="w-full h-full min-h-[120px] p-4 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-500">Add Agent</span>
                </button>

                {/* Add Agent Dropdown */}
                {showAddAgent && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-64 overflow-y-auto min-w-[280px] w-max">
                    {availableAgents.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">All agents already added</p>
                    ) : (
                      availableAgents.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => handleAddAgent(agent.id)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                        >
                          <span className="text-lg flex-shrink-0">{agent.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.description}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* General Chat Input */}
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Chat</p>
            <div className="relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartChat('general-chat');
                  }
                }}
                placeholder="Type a message to start a general chat..."
                rows={2}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
              <button
                onClick={() => handleStartChat('general-chat')}
                disabled={!chatInput.trim()}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

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
      </div>

      {/* Click outside to close add agent dropdown */}
      {showAddAgent && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAddAgent(false)}
        />
      )}
    </div>
  );
}
