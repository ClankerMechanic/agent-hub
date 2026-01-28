export function AgentListItem({ agent, isSelected, onClick, onDelete, darkMode }) {
  return (
    <div
      className={`group w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-2 cursor-pointer ${
        isSelected
          ? darkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
          : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
      title={agent.description}
    >
      <span className="text-lg flex-shrink-0">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{agent.name}</div>
        <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{agent.description}</div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(agent.id);
          }}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
            darkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
          }`}
          title="Delete agent"
        >
          <svg className={`w-4 h-4 hover:text-red-500 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
