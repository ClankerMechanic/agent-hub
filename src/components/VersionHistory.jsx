import { useState, useEffect } from 'react';
import { getAgentHistory, getAgentAtVersion } from '../services/github';

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function VersionHistory({
  isOpen,
  onClose,
  agent,
  githubConfig,
  onRevert,
  onFork
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [versionContent, setVersionContent] = useState(null);
  const [loadingVersion, setLoadingVersion] = useState(false);

  useEffect(() => {
    if (isOpen && agent && githubConfig?.enabled) {
      loadHistory();
    }
  }, [isOpen, agent?.id]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const commits = await getAgentHistory(
        githubConfig.token,
        githubConfig.owner,
        githubConfig.repo,
        agent.id,
        githubConfig.agentsPath
      );
      setHistory(commits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = async (sha) => {
    setLoadingVersion(true);
    try {
      const result = await getAgentAtVersion(
        githubConfig.token,
        githubConfig.owner,
        githubConfig.repo,
        agent.id,
        sha,
        githubConfig.agentsPath
      );
      setVersionContent(result.content);
      setViewingVersion(sha);
    } catch (err) {
      setError(`Failed to load version: ${err.message}`);
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleRevert = (version) => {
    if (onRevert && versionContent) {
      onRevert(versionContent);
      setViewingVersion(null);
      setVersionContent(null);
      onClose();
    }
  };

  const handleFork = (version) => {
    if (onFork && versionContent) {
      onFork(versionContent);
      setViewingVersion(null);
      setVersionContent(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
            {agent && (
              <span className="text-sm text-gray-500">
                {agent.icon} {agent.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg
                className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!githubConfig?.enabled && (
            <div className="text-center py-8 text-gray-500">
              <p>GitHub sync is not enabled.</p>
              <p className="text-sm mt-1">Configure GitHub in Settings to see version history.</p>
            </div>
          )}

          {githubConfig?.enabled && loading && (
            <div className="flex items-center justify-center py-8">
              <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {githubConfig?.enabled && error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {githubConfig?.enabled && !loading && !error && history.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No version history found.</p>
              <p className="text-sm mt-1">History will appear after you sync this agent to GitHub.</p>
            </div>
          )}

          {githubConfig?.enabled && !loading && history.length > 0 && (
            <div className="space-y-3">
              {history.map((commit, index) => (
                <div
                  key={commit.sha}
                  className={`p-3 rounded-lg border ${
                    index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(commit.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mt-1 truncate">
                        {commit.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        by {commit.author}
                      </p>
                    </div>
                    {index > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleViewVersion(commit.sha)}
                          disabled={loadingVersion}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Version viewer modal */}
        {viewingVersion && versionContent && (
          <div className="absolute inset-0 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Viewing Version</h3>
              <button
                onClick={() => {
                  setViewingVersion(null);
                  setVersionContent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{versionContent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{versionContent.description || '(none)'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {versionContent.systemPrompt}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleRevert(viewingVersion)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Revert to This Version
              </button>
              <button
                onClick={() => handleFork(viewingVersion)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fork as New Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
