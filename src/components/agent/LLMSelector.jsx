import { useState } from 'react';
import { PROVIDERS, getModelConfig, getProviderForModel } from '../../config/models';

export function LLMSelector({ value, onChange, llmSettings, onLlmSettingsChange, apiKeys = {} }) {
  const [showSettings, setShowSettings] = useState(false);

  // Get available models (only from providers with API keys)
  const availableModels = [];
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    if (apiKeys[providerId]) {
      for (const model of provider.models) {
        availableModels.push({
          ...model,
          providerId,
          providerName: provider.name
        });
      }
    }
  }

  // Get current model config for extended thinking check
  const currentModel = getModelConfig(value);
  const supportsExtendedThinking = currentModel?.supportsExtendedThinking;

  const handleSettingChange = (key, val) => {
    onLlmSettingsChange?.({
      ...llmSettings,
      [key]: val
    });
  };

  return (
    <div className="space-y-3">
      {/* Model Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Model
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
        >
          {Object.entries(PROVIDERS).map(([providerId, provider]) => {
            // Only show providers with API keys
            if (!apiKeys[providerId]) return null;

            return (
              <optgroup key={providerId} label={provider.name}>
                {provider.models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span className="font-medium">Model Settings</span>
        <svg
          className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Temperature</label>
              <span className="text-xs text-gray-500">{llmSettings?.temperature?.toFixed(1) || '0.7'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={llmSettings?.temperature ?? 0.7}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
              disabled={llmSettings?.extendedThinking}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Tokens</label>
            <input
              type="number"
              min="256"
              max="32768"
              step="256"
              value={llmSettings?.maxTokens ?? 4096}
              onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value) || 4096)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Extended Thinking (Claude only) */}
          {supportsExtendedThinking && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={llmSettings?.extendedThinking ?? false}
                  onChange={(e) => handleSettingChange('extendedThinking', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-gray-600">Extended Thinking</span>
                <span className="text-xs text-gray-400">(Claude)</span>
              </label>

              {llmSettings?.extendedThinking && (
                <div className="ml-6">
                  <label className="block text-xs text-gray-500 mb-1">Thinking Budget (tokens)</label>
                  <input
                    type="number"
                    min="256"
                    max="10000"
                    step="256"
                    value={llmSettings?.thinkingBudget ?? 1024}
                    onChange={(e) => handleSettingChange('thinkingBudget', parseInt(e.target.value) || 1024)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              {llmSettings?.extendedThinking && (
                <p className="text-xs text-amber-600 ml-6">
                  Note: Temperature is disabled when Extended Thinking is enabled.
                </p>
              )}
            </div>
          )}

          {/* No keys warning */}
          {availableModels.length === 0 && (
            <p className="text-xs text-amber-600">
              No API keys configured. Add keys in Settings to use models.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
