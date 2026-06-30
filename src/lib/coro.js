import { supabase } from './supabase'

const CORO_SLUG = import.meta.env.VITE_CORO_SLUG

let coroCache = null

export async function getCoroActual() {
  if (coroCache) return coroCache
  try {
    const { data, error } = await supabase
      .from('coros')
      .select('*')
      .eq('slug', CORO_SLUG)
      .single()
    if (error) return null
    coroCache = data
    return data
  } catch {
    return null
  }
}