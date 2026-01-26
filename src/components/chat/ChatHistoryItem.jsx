// Color mapping for agent categories
export const categoryColors = {
  'Communication': 'bg-blue-100 text-blue-700',
  'Productivity': 'bg-green-100 text-green-700',
  'Writing': 'bg-purple-100 text-purple-700',
  'Research': 'bg-yellow-100 text-yellow-700',
  'Analysis': 'bg-orange-100 text-orange-700',
  'Custom': 'bg-pink-100 text-pink-700',
  'General': 'bg-gray-100 text-gray-600'
};

export function getCategoryColor(category) {
  return categoryColors[category] || categoryColors['General'];
}

function formatRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ChatHistoryItem({ session, isActive, onClick, agent }) {
  // Get first user message for preview - increased to 80 chars
  const firstUserMessage = session.messages?.find(m => m.role === 'user');
  const preview = firstUserMessage?.content?.substring(0, 80) || 'New conversation';

  // Get category color
  const tagColor = getCategoryColor(agent?.category);

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm flex-shrink-0">{agent?.icon || '💬'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-900 truncate">
            {preview}{preview.length >= 80 ? '...' : ''}
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-gray-500">
              {formatRelativeTime(session.createdAt)}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded truncate max-w-[100px] ${tagColor}`}>
              {agent?.name || 'General'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
