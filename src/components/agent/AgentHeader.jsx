export function AgentHeader({ agent, sessionUsage, activeModel }) {
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

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {agent.category}
              </span>
              {agent.preferredModel && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  {agent.preferredModel.split('-').slice(0, 2).join(' ')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
        </div>

        {/* Session usage stats */}
        {totalTokens > 0 && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {formatCost(sessionUsage?.totalCost)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTokens(totalTokens)} tokens
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
