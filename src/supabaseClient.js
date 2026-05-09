import { createClient } from '@supabase/supabase-js'

// Try to get credentials from localStorage first (for production)
// Otherwise fallback to environment variables (for development)
const supabaseUrl = localStorage.getItem('KAZE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = localStorage.getItem('KAZE_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export const checkIsConfigured = () => {
  return !!(localStorage.getItem('KAZE_SUPABASE_URL') && localStorage.getItem('KAZE_SUPABASE_KEY'))
}

export const setSupabaseConfig = (url, key) => {
  localStorage.setItem('KAZE_SUPABASE_URL', url)
  localStorage.setItem('KAZE_SUPABASE_KEY', key)
  window.location.reload()
}
