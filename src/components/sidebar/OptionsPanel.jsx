export function OptionsPanel({ onNewChat, onSettingsClick }) {
  return (
    <div className="p-3 border-b border-gray-200">
      <button
        onClick={onNewChat}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>
    </div>
  );
}
