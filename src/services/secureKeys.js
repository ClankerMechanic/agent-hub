// API Keys Service - manages user API keys via Supabase
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kefjklkgnfvswbflgams.supabase.co'

// Save an API key for the current user
export async function saveApiKey(provider, apiKey) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ provider, apiKey })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save API key')
  }

  return data
}

// Get which providers have keys configured
export async function getConfiguredProviders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { providers: {} }
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get API keys')
  }

  return data
}

// Delete an API key
export async function deleteApiKey(provider) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ provider })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete API key')
  }

  return data
}

// Send a chat message through the secure proxy
export async function sendChatMessage(messages, systemPrompt, provider, model, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      messages,
      systemPrompt,
      provider,
      model,
      options
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Chat request failed')
  }

  return data
}
