// Provider and model definitions for multi-LLM support
// Costs are per million tokens in USD

export const PROVIDERS = {
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    keyPrefix: 'sk-ant-',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'Fast & capable',
        inputCost: 3,
        outputCost: 15,
        maxTokens: 8192,
        supportsExtendedThinking: true
      },
      {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        description: 'Most powerful',
        inputCost: 15,
        outputCost: 75,
        maxTokens: 8192,
        supportsExtendedThinking: true
      },
      {
        id: 'claude-haiku-3-20240307',
        name: 'Claude Haiku 3',
        description: 'Quick responses',
        inputCost: 0.25,
        outputCost: 1.25,
        maxTokens: 4096,
        supportsExtendedThinking: false
      }
    ]
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    keyPrefix: 'sk-',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable GPT-4',
        inputCost: 2.5,
        outputCost: 10,
        maxTokens: 4096,
        supportsExtendedThinking: false
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast & affordable',
        inputCost: 0.15,
        outputCost: 0.6,
        maxTokens: 4096,
        supportsExtendedThinking: false
      },
      {
        id: 'o1',
        name: 'o1',
        description: 'Advanced reasoning',
        inputCost: 15,
        outputCost: 60,
        maxTokens: 32768,
        supportsExtendedThinking: false
      }
    ]
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    keyPrefix: 'AI',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast multimodal',
        inputCost: 0.075,
        outputCost: 0.3,
        maxTokens: 8192,
        supportsExtendedThinking: false
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Best quality',
        inputCost: 1.25,
        outputCost: 5,
        maxTokens: 8192,
        supportsExtendedThinking: false
      }
    ]
  }
};

// Get provider ID from model ID
export function getProviderForModel(modelId) {
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    if (provider.models.some(m => m.id === modelId)) {
      return providerId;
    }
  }
  return null;
}

// Get model config by ID
export function getModelConfig(modelId) {
  for (const provider of Object.values(PROVIDERS)) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) {
      return { ...model, provider: provider.id };
    }
  }
  return null;
}

// Get all models as flat array with provider info
export function getAllModels() {
  const models = [];
  for (const provider of Object.values(PROVIDERS)) {
    for (const model of provider.models) {
      models.push({
        ...model,
        providerId: provider.id,
        providerName: provider.name
      });
    }
  }
  return models;
}

// Get models grouped by provider
export function getModelsByProvider() {
  return Object.entries(PROVIDERS).map(([id, provider]) => ({
    providerId: id,
    providerName: provider.name,
    models: provider.models
  }));
}

// Default model
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
