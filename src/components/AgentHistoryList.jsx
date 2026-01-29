import { useState } from 'react';

export function AgentHistoryList({ history, onRerun, onDelete, limit = 5 }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const truncate = (text, length = 150) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  const displayHistory = limit ? history.slice(0, limit) : history;

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500">No history yet. Try running this agent!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {displayHistory.map((item) => (
          <div key={item.id} className="p-4">
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {truncate(item.input)}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                  expandedId === item.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {expandedId === item.id && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Input</label>
                  <div className="mt-1 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {item.input}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Output</label>
                  <div className="mt-1 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {item.output}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRerun?.(item);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Rerun
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this history entry?')) {
                        onDelete?.(item.id);
                      }
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {limit && history.length > limit && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <span className="text-sm text-gray-500">
            Showing {limit} of {history.length} entries
          </span>
        </div>
      )}
    </div>
  );
}
