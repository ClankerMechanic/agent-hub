// Google Gemini provider implementation

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const geminiProvider = {
  id: 'gemini',
  name: 'Google Gemini',

  async sendMessage(messages, systemPrompt, apiKey, model, options = {}) {
    if (!apiKey) {
      return { success: false, error: 'API key is required' };
    }

    try {
      // Build contents array for Gemini format
      const contents = [];

      // Add conversation messages
      for (const m of messages) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      }

      const body = {
        contents: contents,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4096
        }
      };

      // Add system instruction if provided
      if (systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      // Add temperature if specified
      if (options.temperature !== undefined) {
        body.generationConfig.temperature = options.temperature;
      }

      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Check for blocked content
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return {
          success: false,
          error: 'Response was blocked due to safety settings'
        };
      }

      // Extract content from response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Extract usage metadata
      const usageMetadata = data.usageMetadata || {};

      return {
        success: true,
        content: content,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
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
    // Gemini API keys typically start with 'AI'
    return apiKey && apiKey.length > 10;
  }
};
