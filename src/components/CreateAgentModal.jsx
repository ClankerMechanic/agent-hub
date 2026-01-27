import { useState } from 'react';
import { categories } from '../config/agents';
import { PROVIDERS } from '../config/models';
import { executeAgent } from '../services/llm';

// System prompt for generating agent prompts
const PROMPT_GENERATOR_SYSTEM = `You are an expert at creating effective system prompts for AI assistants.
When given a description of what an agent should do, you generate a well-structured system prompt.

Your generated prompts should:
- Be clear and specific about the agent's role and capabilities
- Include guidelines for tone and communication style
- Specify how to handle edge cases or unclear requests
- Be concise but comprehensive (typically 100-300 words)

Respond ONLY with the system prompt text, no explanations or markdown formatting.`;

// Emoji categories for agent icons
const emojiCategories = {
  'AI & Tech': ['🤖', '🧠', '⚙️', '💻', '🔧', '💾', '🔌', '📡', '🛠️', '⚡'],
  'Communication': ['💬', '✉️', '📧', '📝', '📢', '🗣️', '💭', '📮', '📞', '🔔'],
  'Productivity': ['📊', '📈', '📋', '✅', '📅', '⏰', '🎯', '📌', '🗂️', '📁'],
  'Creative': ['🎨', '✨', '🌟', '💡', '🎭', '🎪', '✏️', '🖌️', '🎬', '📸'],
  'Knowledge': ['📚', '🔍', '🎓', '🔬', '🧪', '📖', '💼', '🏆', '🌐', '🗺️'],
  'Nature & More': ['🌱', '🌿', '🔥', '💧', '🌈', '☀️', '🌙', '⭐', '🍀', '🌸']
};

// Inner form component that resets when key changes
function AgentForm({ editAgent, onSave, onClose, apiKeys, selectedModel }) {
  const [name, setName] = useState(editAgent?.name || '');
  const [description, setDescription] = useState(editAgent?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(editAgent?.systemPrompt || '');
  const [category, setCategory] = useState(editAgent?.category || 'Custom');
  const [icon, setIcon] = useState(editAgent?.icon || '🤖');
  const [preferredModel, setPreferredModel] = useState(editAgent?.preferredModel || '');

  // AI generation state
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiPromptDescription, setAiPromptDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Check if any API key is configured
  const hasApiKey = apiKeys && Object.values(apiKeys).some(key => key && key.trim());

  const handleGeneratePrompt = async () => {
    if (!aiPromptDescription.trim() || !hasApiKey) return;

    setIsGenerating(true);
    setGenerateError('');

    try {
      const result = await executeAgent(
        PROMPT_GENERATOR_SYSTEM,
        `Create a system prompt for an AI agent that: ${aiPromptDescription}`,
        apiKeys,
        selectedModel
      );

      if (result.success) {
        setSystemPrompt(result.content);
        setShowAiGenerator(false);
        setAiPromptDescription('');
      } else {
        setGenerateError(result.error || 'Failed to generate prompt');
      }
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    const agent = {
      id: editAgent?.id || `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      category,
      icon,
      isCustom: true,
      preferredModel: preferredModel || undefined // Only set if not using global
    };

    onSave(agent);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {Object.entries(emojiCategories).map(([categoryName, emojis]) => (
            <div key={categoryName}>
              <p className="text-xs text-gray-500 mb-1">{categoryName}</p>
              <div className="flex gap-1 flex-wrap">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-8 h-8 text-lg rounded-md border-2 transition-colors ${
                      icon === emoji
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Custom:</span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value.slice(-2))}
            className="w-10 h-10 text-xl text-center border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Custom Agent"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Model
        </label>
        <select
          value={preferredModel}
          onChange={(e) => setPreferredModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Use Global Setting</option>
          {Object.entries(PROVIDERS).map(([providerId, provider]) => (
            <optgroup key={providerId} label={provider.name}>
              {provider.models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Override the global model for this agent, or leave as "Use Global Setting".
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            System Prompt *
          </label>
          {hasApiKey && (
            <button
              type="button"
              onClick={() => setShowAiGenerator(!showAiGenerator)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {showAiGenerator ? 'Hide AI Generator' : 'Generate with AI'}
            </button>
          )}
        </div>

        {/* AI Generator Panel */}
        {showAiGenerator && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Describe what you want your agent to do, and AI will generate a system prompt for you.
            </p>
            <textarea
              value={aiPromptDescription}
              onChange={(e) => setAiPromptDescription(e.target.value)}
              placeholder="e.g., Help users write professional emails, suggest improvements, and fix grammar mistakes"
              rows={2}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
              disabled={isGenerating}
            />
            {generateError && (
              <p className="mt-1 text-xs text-red-600">{generateError}</p>
            )}
            <button
              type="button"
              onClick={handleGeneratePrompt}
              disabled={!aiPromptDescription.trim() || isGenerating}
              className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Prompt'
              )}
            </button>
          </div>
        )}

        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are an expert at... Your task is to..."
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe how the AI should behave and what it should do with user input.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || !systemPrompt.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {editAgent ? 'Save Changes' : 'Create Agent'}
        </button>
      </div>
    </form>
  );
}

export function CreateAgentModal({ isOpen, onClose, onSave, editAgent = null, apiKeys = {}, selectedModel = '' }) {
  if (!isOpen) return null;

  // Use key to reset form state when switching between create/edit modes
  const formKey = editAgent?.id || 'new';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editAgent ? 'Edit Agent' : 'Create Custom Agent'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <AgentForm
            key={formKey}
            editAgent={editAgent}
            onSave={onSave}
            onClose={onClose}
            apiKeys={apiKeys}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    </div>
  );
}
