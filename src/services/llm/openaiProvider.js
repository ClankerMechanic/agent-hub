// OpenAI provider implementation

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const openaiProvider = {
  id: 'openai',
  name: 'OpenAI',

  async sendMessage(messages, systemPrompt, apiKey, model, options = {}) {
    if (!apiKey) {
      return { success: false, error: 'API key is required' };
    }

    try {
      // Build messages array with system prompt first
      const apiMessages = [];

      if (systemPrompt) {
        apiMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add conversation messages
      for (const m of messages) {
        apiMessages.push({
          role: m.role,
          content: m.content
        });
      }

      const body = {
        model: model,
        max_tokens: options.maxTokens || 4096,
        messages: apiMessages
      };

      // Add temperature if specified
      if (options.temperature !== undefined) {
        body.temperature = options.temperature;
      }

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Extract content from response
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        content: content,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          thinkingTokens: 0
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
    return apiKey && apiKey.startsWith('sk-');
  }
};
