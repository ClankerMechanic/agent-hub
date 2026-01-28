import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || 'core-agents-default-key'

function encrypt(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  }
  return btoa(result)
}

function maskKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 7) + '...' + key.slice(-4)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const method = req.method

    // GET - List all keys (masked) for the user
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('api_keys')
        .select('provider, created_at, updated_at')
        .eq('user_id', user.id)

      if (error) throw error

      // Return which providers have keys configured
      const providers = data.reduce((acc: any, row: any) => {
        acc[row.provider] = {
          configured: true,
          updatedAt: row.updated_at
        }
        return acc
      }, {})

      return new Response(
        JSON.stringify({ providers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Save or update a key
    if (method === 'POST') {
      const { provider, apiKey } = await req.json()

      if (!provider || !apiKey) {
        return new Response(
          JSON.stringify({ error: 'Provider and apiKey are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const validProviders = ['anthropic', 'openai', 'google']
      if (!validProviders.includes(provider)) {
        return new Response(
          JSON.stringify({ error: 'Invalid provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const encryptedKey = encrypt(apiKey)

      // Upsert the key
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          provider,
          encrypted_key: encryptedKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,provider'
        })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, maskedKey: maskKey(apiKey) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Remove a key
    if (method === 'DELETE') {
      const { provider } = await req.json()

      if (!provider) {
        return new Response(
          JSON.stringify({ error: 'Provider is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('API keys error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
