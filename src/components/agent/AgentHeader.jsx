export function AgentHeader({ agent }) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{agent.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {agent.category}
            </span>
          </div>
          <p className="text-sm text-gray-600">{agent.description}</p>
        </div>
      </div>
    </div>
  );
}
