import { useState, useEffect } from 'react';
import {
  validateToken,
  checkRepo,
  ensureAgentsDirectory,
  DEFAULT_GITHUB_CONFIG
} from '../services/github';

export function GitHubSettings({ config, onConfigChange, onClose, isOpen }) {
  // All hooks must be called before any early returns (React rules of hooks)
  const [localConfig, setLocalConfig] = useState(config || DEFAULT_GITHUB_CONFIG);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Don't render if not open - AFTER all hooks
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    setTestStatus(null); // Reset test status on change
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Validating token...');

    try {
      // Validate token
      const tokenResult = await validateToken(localConfig.token);
      if (!tokenResult.valid) {
        setTestStatus('error');
        setTestMessage(`Invalid token: ${tokenResult.error}`);
        return;
      }

      setTestMessage(`Token valid (${tokenResult.user}). Checking repository...`);

      // Check repo access
      const repoResult = await checkRepo(localConfig.token, localConfig.owner, localConfig.repo);
      if (!repoResult.exists) {
        setTestStatus('error');
        setTestMessage(`Repository not found or not accessible: ${repoResult.error}`);
        return;
      }

      if (!repoResult.permissions?.push) {
        setTestStatus('error');
        setTestMessage('You do not have write access to this repository');
        return;
      }

      setTestMessage('Repository accessible. Ensuring agents directory...');

      // Ensure agents directory exists
      const dirResult = await ensureAgentsDirectory(
        localConfig.token,
        localConfig.owner,
        localConfig.repo,
        localConfig.agentsPath
      );

      if (!dirResult.success) {
        setTestStatus('error');
        setTestMessage(`Failed to create agents directory: ${dirResult.error}`);
        return;
      }

      setTestStatus('success');
      setTestMessage(
        dirResult.created
          ? `Success! Created ${localConfig.agentsPath}/ directory in repository.`
          : `Success! Connected to ${localConfig.owner}/${localConfig.repo}`
      );
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${error.message}`);
    }
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const isConfigValid = localConfig.token && localConfig.owner && localConfig.repo;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">GitHub Sync Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Enable toggle */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Enable GitHub Sync</span>
                <p className="text-xs text-gray-500">Store and version agents in your GitHub repository</p>
              </div>
            </label>

            {localConfig.enabled && (
              <>
                {/* Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={localConfig.token}
                      onChange={(e) => handleChange('token', e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showToken ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Create at GitHub Settings → Developer settings → Personal access tokens. Needs 'repo' scope.
                  </p>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    value={localConfig.owner}
                    onChange={(e) => handleChange('owner', e.target.value)}
                    placeholder="your-username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Repo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={localConfig.repo}
                    onChange={(e) => handleChange('repo', e.target.value)}
                    placeholder="my-agents"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Agents path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agents Directory
                  </label>
                  <input
                    type="text"
                    value={localConfig.agentsPath}
                    onChange={(e) => handleChange('agentsPath', e.target.value)}
                    placeholder="agent-hub"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Directory in your repo where agent JSON files will be stored.
                  </p>
                </div>

                {/* Test connection */}
                <div className="pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={!isConfigValid || testStatus === 'testing'}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Test Connection
                      </>
                    )}
                  </button>

                  {/* Test result message */}
                  {testMessage && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${
                      testStatus === 'success' ? 'bg-green-50 text-green-700' :
                      testStatus === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {testMessage}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
