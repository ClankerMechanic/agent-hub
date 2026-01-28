export function AgentListItem({ agent, isSelected, onClick, onDelete }) {
  return (
    <div
      className={`group w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-2 cursor-pointer ${
        isSelected
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
      title={agent.description}
    >
      <span className="text-lg flex-shrink-0">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{agent.name}</div>
        <div className="text-xs text-gray-500 truncate">{agent.description}</div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(agent.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
          title="Delete agent"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
