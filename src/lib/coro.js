import { supabase } from './supabase'

const CORO_SLUG = import.meta.env.VITE_CORO_SLUG

let coroCache = null

export async function getCoroActual() {
  if (coroCache) return coroCache
  const { data, error } = await supabase
    .from('coros')
    .select('*')
    .eq('slug', CORO_SLUG)
    .single()
  if (error) throw error
  coroCache = data
  return data
}