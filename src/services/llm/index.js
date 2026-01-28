// LLM Provider Factory - routes requests to correct provider

import { claudeProvider } from './claudeProvider';
import { openaiProvider } from './openaiProvider';
import { geminiProvider } from './geminiProvider';
import { getProviderForModel, getModelConfig } from '../../config/models';
import { sendChatMessage } from '../secureKeys';

// Provider registry
const providers = {
  claude: claudeProvider,
  openai: openaiProvider,
  gemini: geminiProvider
};

// Get provider instance by ID
export function getProvider(providerId) {
  return providers[providerId] || null;
}

// Get provider for a specific model
export function getProviderForModelId(modelId) {
  const providerId = getProviderForModel(modelId);
  return providerId ? providers[providerId] : null;
}

// Send message using the appropriate provider
// If useProxy is true, routes through Supabase Edge Function (server-side keys)
// If useProxy is false, uses client-side keys directly
export async function sendMessage(
  messages,
  systemPrompt,
  apiKeys,
  model,
  options = {},
  useProxy = false
) {
  // Get the provider for this model
  const providerId = getProviderForModel(model);
  if (!providerId) {
    return {
      success: false,
      error: `Unknown model: ${model}`
    };
  }

  // Map internal provider IDs to API provider names
  const providerMap = {
    claude: 'anthropic',
    openai: 'openai',
    gemini: 'google'
  };

  // If using proxy (authenticated user with server-side keys)
  if (useProxy) {
    try {
      const result = await sendChatMessage(
        messages,
        systemPrompt,
        providerMap[providerId],
        model,
        {
          temperature: options.temperature,
          maxTokens: options.maxTokens
        }
      );
      return {
        success: true,
        content: result.content,
        usage: result.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Direct API call (client-side keys)
  const provider = providers[providerId];
  if (!provider) {
    return {
      success: false,
      error: `Provider not found: ${providerId}`
    };
  }

  // Get the API key for this provider
  const apiKey = typeof apiKeys === 'string' ? apiKeys : apiKeys[providerId];
  if (!apiKey) {
    return {
      success: false,
      error: `No API key configured for ${provider.name}`
    };
  }

  // Send the message
  return provider.sendMessage(messages, systemPrompt, apiKey, model, options);
}

// Execute agent (convenience function matching old API)
export async function executeAgent(
  systemPrompt,
  userInput,
  apiKeys,
  model,
  options = {}
) {
  const messages = [
    {
      role: 'user',
      content: userInput
    }
  ];

  return sendMessage(messages, systemPrompt, apiKeys, model, options);
}

// Validate API key for a provider
export function validateApiKey(providerId, apiKey) {
  const provider = providers[providerId];
  return provider ? provider.validateApiKey(apiKey) : false;
}

// Get all available providers
export function getAllProviders() {
  return Object.values(providers).map(p => ({
    id: p.id,
    name: p.name
  }));
}

// Check which providers have valid API keys
export function getConfiguredProviders(apiKeys) {
  const configured = [];
  for (const [id, provider] of Object.entries(providers)) {
    if (apiKeys[id] && provider.validateApiKey(apiKeys[id])) {
      configured.push({
        id: provider.id,
        name: provider.name
      });
    }
  }
  return configured;
}
