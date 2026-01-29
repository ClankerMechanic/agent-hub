import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kefjklkgnfvswbflgams.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FN9yxizn-boUD9X5ImPhaQ_l5wp0Ew1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
