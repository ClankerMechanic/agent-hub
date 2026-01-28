import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple XOR encryption for API keys (in production, use proper encryption)
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || 'core-agents-default-key'

function encrypt(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  }
  return btoa(result)
}

function decrypt(encoded: string): string {
  const text = atob(encoded)
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  }
  return result
}

async function callClaude(apiKey: string, messages: any[], systemPrompt: string, options: any) {
  const body: any = {
    model: options.model || 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 4096,
    messages: messages
  }

  if (systemPrompt) {
    body.system = systemPrompt
  }

  if (options.temperature !== undefined) {
    body.temperature = options.temperature
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.content?.[0]?.text || '',
    usage: {
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0
    }
  }
}

async function callOpenAI(apiKey: string, messages: any[], systemPrompt: string, options: any) {
  const apiMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4-turbo-preview',
      messages: apiMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0
    }
  }
}

async function callGemini(apiKey: string, messages: any[], systemPrompt: string, options: any) {
  const model = options.model || 'gemini-pro'
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  const body: any = { contents }
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { messages, systemPrompt, provider, model, options = {} } = await req.json()

    // Get user's API key for the requested provider
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: `No API key found for ${provider}. Please add your API key in Settings.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = decrypt(keyData.encrypted_key)
    const callOptions = { ...options, model }

    let result
    switch (provider) {
      case 'anthropic':
        result = await callClaude(apiKey, messages, systemPrompt, callOptions)
        break
      case 'openai':
        result = await callOpenAI(apiKey, messages, systemPrompt, callOptions)
        break
      case 'google':
        result = await callGemini(apiKey, messages, systemPrompt, callOptions)
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
