const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function executeAgent(systemPrompt, userInput, apiKey, model = DEFAULT_MODEL) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!userInput.trim()) {
    throw new Error('User input is required');
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userInput
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract text content from response
    const textContent = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      success: true,
      content: textContent,
      usage: data.usage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}
