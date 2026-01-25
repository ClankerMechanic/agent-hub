export function AgentListItem({ agent, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-2 ${
        isSelected
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="text-lg flex-shrink-0">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{agent.name}</div>
        <div className="text-xs text-gray-500 truncate">{agent.category}</div>
      </div>
    </button>
  );
}
