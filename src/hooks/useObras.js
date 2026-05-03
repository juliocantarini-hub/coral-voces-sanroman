import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getCoroActual } from '../lib/coro'
import { useAuth } from './useAuth'

export function useObras(filtros = {}) {
  const { usuario } = useAuth()
  const [obras, setObras]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const coro = await getCoroActual()
      let query = supabase
        .from('obras')
        .select(`*, progreso_estudio!left(estado)`)
        .eq('coro_id', coro.id)
        .eq('publicada', true)
        .order('orden', { ascending: true }).order('titulo')

      if (filtros.estado)   query = query.eq('estado', filtros.estado)
      if (filtros.busqueda) {
        query = query.or(`titulo.ilike.%${filtros.busqueda}%,compositor.ilike.%${filtros.busqueda}%`)
      }

      const { data, error: err } = await query
      if (err) throw err

      const obras = (data || []).map(o => ({
        ...o,
        progreso: o.progreso_estudio?.[0]?.estado || 'pendiente',
      }))
      setObras(obras)
    } catch (err) {
      setError('No pudimos cargar el repertorio. Intentá de nuevo.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [filtros.estado, filtros.busqueda])

  useEffect(() => { cargar() }, [cargar])

  return { obras, cargando, error, recargar: cargar }
}

export function useObra(id) {
  const [obra, setObra]         = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!id) return
    async function cargar() {
      setCargando(true)
      const coro = await getCoroActual()
      const { data, error: err } = await supabase
        .from('obras')
        .select(`*, progreso_estudio!left(estado), eventos_obras(evento_id, orden, eventos(id, titulo, fecha_inicio))`)
        .eq('id', id)
        .eq('coro_id', coro.id)
        .eq('publicada', true)
        .single()

      if (err) { setError('Obra no encontrada.'); setCargando(false); return }
      setObra({
        ...data,
        progreso: data.progreso_estudio?.[0]?.estado || 'pendiente',
        eventos: data.eventos_obras?.map(eo => eo.eventos).filter(Boolean) || [],
      })
      setCargando(false)
    }
    cargar()
  }, [id])

  return { obra, cargando, error }
}

export async function marcarProgreso(usuarioId, obraId, estado) {
  const { error } = await supabase
    .from('progreso_estudio')
    .upsert({
      perfil_id: usuarioId,
      obra_id: obraId,
      estado,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'perfil_id,obra_id' })

  return { ok: !error, error: error?.message }
}

export async function crearObra(datos) {
  const coro = await getCoroActual()
  const { data, error } = await supabase
    .from('obras')
    .insert([{ ...datos, coro_id: coro.id, publicada: false }])
    .select()
    .single()
  return { ok: !error, data, error: error?.message }
}

export async function actualizarObra(id, datos) {
  const { data, error } = await supabase
    .from('obras')
    .update({ ...datos, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { ok: !error, data, error: error?.message }
}

export async function publicarObra(id, publicada) {
  const { error } = await supabase
    .from('obras')
    .update({ publicada })
    .eq('id', id)
  return { ok: !error, error: error?.message }
}

export async function eliminarObra(id) {
  const { error } = await supabase
    .from('obras')
    .delete()
    .eq('id', id)
  return { ok: !error, error: error?.message }
}

export function useObrasAdmin() {
  const [obras, setObras]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    const coro = await getCoroActual()
    const { data, error: err } = await supabase
      .from('obras')
      .select('*')
      .eq('coro_id', coro.id)
      .order('orden', { ascending: true }).order('creado_en', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setObras(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { obras, cargando, error, recargar: cargar }
}