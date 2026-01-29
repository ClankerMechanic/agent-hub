// Claude (Anthropic) provider implementation

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const claudeProvider = {
  id: 'claude',
  name: 'Anthropic Claude',

  async sendMessage(messages, systemPrompt, apiKey, model, options = {}) {
    if (!apiKey) {
      return { success: false, error: 'API key is required' };
    }

    try {
      const body = {
        model: model,
        max_tokens: options.maxTokens || 4096,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      };

      // Add system prompt if provided
      if (systemPrompt) {
        body.system = systemPrompt;
      }

      // Extended thinking for supported models
      if (options.extendedThinking) {
        body.thinking = {
          type: 'enabled',
          budget_tokens: options.thinkingBudget || 1024
        };
      } else if (options.temperature !== undefined) {
        // Temperature is not compatible with extended thinking
        body.temperature = options.temperature;
      }

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Extract text content and thinking content from response
      let textContent = '';
      let thinkingContent = '';

      for (const block of data.content) {
        if (block.type === 'text') {
          textContent += block.text;
        } else if (block.type === 'thinking') {
          thinkingContent += block.thinking;
        }
      }

      return {
        success: true,
        content: textContent,
        thinking: thinkingContent || undefined,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          thinkingTokens: data.usage?.thinking_tokens || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },

  validateApiKey(apiKey) {
    return apiKey && apiKey.startsWith('sk-ant-');
  }
};
