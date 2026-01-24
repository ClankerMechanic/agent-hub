import { useState } from 'react';

export function HistoryView({ history, onRerun, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredHistory = history.filter((item) =>
    item.agentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  if (history.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📜</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No History Yet</h2>
          <p className="text-gray-600">Your agent executions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <button
          onClick={onClearHistory}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by agent name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.agentIcon || '🤖'}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.agentName}</h3>
                    <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-600">{truncate(item.input)}</p>
            </button>

            {expandedId === item.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Input:</h4>
                  <div className="bg-white p-3 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-gray-200">
                    {item.input}
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
                  <div className="bg-white p-3 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 max-h-64 overflow-y-auto">
                    {item.output}
                  </div>
                </div>
                <button
                  onClick={() => onRerun(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Re-run
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
}
