import { useState } from 'react';

export function EditablePrompt({ prompt, expanded, onToggle, onUpdate, isCustom, githubEnabled, onShowVersionHistory }) {
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate?.(editedPrompt);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrompt(prompt);
    setIsEditing(false);
  };

  // Reset edited prompt when prompt changes (e.g., switching agents)
  if (editedPrompt !== prompt && !isEditing) {
    setEditedPrompt(prompt);
  }

  // Truncate for collapsed view
  const truncatedPrompt = prompt?.length > 100
    ? prompt.substring(0, 100) + '...'
    : prompt || '(No system prompt)';

  // Don't show prompt section for direct chat
  if (!prompt && prompt !== '') {
    return null;
  }

  return (
    <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">System Prompt</span>
        <div className="flex items-center gap-2">
          {githubEnabled && isCustom && (
            <button
              onClick={onShowVersionHistory}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              title="View version history"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          )}
          {expanded && !isEditing && prompt && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit {!isCustom && '(session only)'}
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {expanded ? 'Collapse' : 'Expand'}
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded ? (
        isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full h-32 px-3 py-2 text-sm font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-200 max-h-48 overflow-y-auto">
            {prompt}
          </pre>
        )
      ) : (
        <p className="text-sm text-gray-600 font-mono truncate">
          {truncatedPrompt}
        </p>
      )}
    </div>
  );
}
