export function AgentCard({ agent, onClick, onEdit, onDelete }) {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(agent);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${agent.name}"?`)) {
      onDelete?.(agent.id);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 text-left w-full border border-gray-100 hover:border-blue-200"
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-1.5">
              {agent.category}
            </span>
            <h3 className="text-base font-semibold text-gray-900 mb-0.5 truncate">{agent.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{agent.description}</p>
          </div>
        </div>
      </button>

      {agent.isCustom && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function CreateAgentCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all p-5 text-left w-full flex items-center justify-center min-h-[120px]"
    >
      <div className="text-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700">Create Custom Agent</span>
      </div>
    </button>
  );
}
