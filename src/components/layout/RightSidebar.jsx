import { AgentListItem } from '../agent/AgentListItem';

export function RightSidebar({
  agents,
  selectedAgentId,
  onSelectAgent,
  onCreateAgent,
  onDeleteAgent,
  activeProjectId,
  darkMode
}) {
  const builtInAgents = agents.filter(a => !a.isCustom);
  const customAgents = agents.filter(a => a.isCustom);

  // Don't highlight agents when in project context (they have their own prompts)
  const shouldHighlight = !activeProjectId;

  return (
    <div className="flex flex-col h-full">
      {/* General Chat Button */}
      <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => onSelectAgent('general-chat')}
          className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
            shouldHighlight && selectedAgentId === 'general-chat'
              ? darkMode ? 'bg-blue-900/50 border border-blue-700' : 'bg-blue-50 border border-blue-200'
              : darkMode ? 'bg-gray-700 hover:bg-gray-600 border border-transparent' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
          }`}
        >
          <span className="text-xl">💬</span>
          <div className="text-left">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>General Chat</div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chat without a system prompt</div>
          </div>
        </button>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Agents
          </h3>
          <div className="space-y-1 mt-1">
            {builtInAgents.map(agent => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isSelected={shouldHighlight && agent.id === selectedAgentId}
                onClick={() => onSelectAgent(agent.id)}
                darkMode={darkMode}
              />
            ))}
          </div>

          {customAgents.length > 0 && (
            <>
              <h3 className={`px-2 py-1 mt-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Custom Agents
              </h3>
              <div className="space-y-1 mt-1">
                {customAgents.map(agent => (
                  <AgentListItem
                    key={agent.id}
                    agent={agent}
                    isSelected={shouldHighlight && agent.id === selectedAgentId}
                    onClick={() => onSelectAgent(agent.id)}
                    onDelete={onDeleteAgent}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </>
          )}

          {/* Create Custom Button */}
          <button
            onClick={onCreateAgent}
            className={`w-full mt-4 px-3 py-2 border-2 border-dashed rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
              darkMode
                ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-900/30'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Custom
          </button>
        </div>
      </div>
    </div>
  );
}
