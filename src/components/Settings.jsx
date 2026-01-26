import { useState } from 'react';
import { PROVIDERS } from '../config/models';

const providerList = Object.values(PROVIDERS);

export function Settings({ onSave, initialApiKeys = {} }) {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [showKeys, setShowKeys] = useState({});

  const handleKeyChange = (providerId, value) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: value
    }));
  };

  const toggleShowKey = (providerId) => {
    setShowKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const clearKey = (providerId) => {
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      return newKeys;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only save non-empty keys
    const validKeys = {};
    for (const [key, value] of Object.entries(apiKeys)) {
      if (value && value.trim()) {
        validKeys[key] = value.trim();
      }
    }
    onSave(validKeys);
  };

  // Check if at least one key is configured
  const hasAnyKey = Object.values(apiKeys).some(key => key && key.trim());

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Hub</h1>
          <p className="text-gray-600">Configure your LLM API keys</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {providerList.map((provider) => {
              const hasKey = apiKeys[provider.id] && apiKeys[provider.id].trim();
              const isVisible = showKeys[provider.id];

              return (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {provider.name}
                    </label>
                    {hasKey && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Configured
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                        placeholder={`${provider.keyPrefix}...`}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {isVisible ? (
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
                    {hasKey && (
                      <button
                        type="button"
                        onClick={() => clearKey(provider.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove key"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {provider.models.length} models available
                  </p>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={!hasAnyKey}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save & Continue
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Your API keys are stored locally in your browser and never sent to our servers.
          Configure at least one provider to continue.
        </p>
      </div>
    </div>
  );
}
