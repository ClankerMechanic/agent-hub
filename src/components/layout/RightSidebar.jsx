import { LLMSelector } from '../agent/LLMSelector';
import { AgentListItem } from '../agent/AgentListItem';

export function RightSidebar({
  agents,
  selectedAgentId,
  onSelectAgent,
  selectedModel,
  onModelChange,
  onCreateAgent
}) {
  const builtInAgents = agents.filter(a => !a.isCustom);
  const customAgents = agents.filter(a => a.isCustom);

  return (
    <div className="flex flex-col h-full">
      {/* LLM Selector */}
      <div className="p-3 border-b border-gray-200">
        <LLMSelector
          value={selectedModel}
          onChange={onModelChange}
        />
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Agents
          </h3>
          <div className="space-y-1 mt-1">
            {builtInAgents.map(agent => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                onClick={() => onSelectAgent(agent.id)}
              />
            ))}
          </div>

          {customAgents.length > 0 && (
            <>
              <h3 className="px-2 py-1 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Custom Agents
              </h3>
              <div className="space-y-1 mt-1">
                {customAgents.map(agent => (
                  <AgentListItem
                    key={agent.id}
                    agent={agent}
                    isSelected={agent.id === selectedAgentId}
                    onClick={() => onSelectAgent(agent.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Create Custom Button */}
          <button
            onClick={onCreateAgent}
            className="w-full mt-4 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
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
