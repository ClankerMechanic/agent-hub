import { PROVIDERS } from '../../config/models';

export function AgentHeader({ agent, sessionUsage, selectedModel, onModelChange, apiKeys = {}, serverConfiguredProviders = {}, onClose, activeProject }) {
  // Map local key names to server provider names
  const localToServerMap = { claude: 'anthropic', openai: 'openai', gemini: 'google' };
  // Format token count
  const formatTokens = (count) => {
    if (!count) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Format cost
  const formatCost = (cost) => {
    if (!cost || cost === 0) return '$0.00';
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  const totalTokens = sessionUsage
    ? (sessionUsage.inputTokens || 0) + (sessionUsage.outputTokens || 0)
    : 0;

  // Effective model: agent's preferred or global selection
  const effectiveModel = agent.preferredModel || selectedModel;

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            {/* Project breadcrumb if in project context */}
            {activeProject && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                <span>{activeProject.name}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {agent.category}
              </span>
            </div>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
        </div>

        {/* Right side: Model selector + Stats */}
        <div className="flex items-center gap-4">
          {/* Model Selector */}
          <div className="flex flex-col items-end">
            <label className="text-xs text-gray-500 mb-0.5">Model</label>
            <select
              value={effectiveModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer min-w-[140px]"
            >
              {Object.entries(PROVIDERS).map(([providerId, provider]) => {
                // Check for local key OR server-configured key
                const hasLocalKey = !!apiKeys[providerId];
                const serverProviderName = localToServerMap[providerId];
                const hasServerKey = serverConfiguredProviders[serverProviderName]?.configured;
                const hasKey = hasLocalKey || hasServerKey;
                return (
                  <optgroup key={providerId} label={`${provider.name}${!hasKey ? ' (no API key)' : ''}`}>
                    {provider.models.map(model => (
                      <option
                        key={model.id}
                        value={model.id}
                        disabled={!hasKey}
                        className={!hasKey ? 'text-gray-400' : ''}
                      >
                        {model.name}{!hasKey ? ' - requires API key' : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {agent.preferredModel && (
              <span className="text-xs text-purple-600 mt-0.5">Agent default</span>
            )}
          </div>

          {/* Session usage stats */}
          {totalTokens > 0 && (
            <div className="text-right border-l border-gray-200 pl-4">
              <div className="text-sm font-medium text-gray-700">
                {formatCost(sessionUsage?.totalCost)}
              </div>
              <div className="text-xs text-gray-500">
                {formatTokens(totalTokens)} tokens
              </div>
            </div>
          )}

          {/* Close/Back button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors ml-2"
              title={activeProject ? `Back to ${activeProject.name}` : "Close agent"}
            >
              {activeProject ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
