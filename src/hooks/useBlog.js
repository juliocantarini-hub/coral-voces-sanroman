import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getCoroActual } from '../lib/coro'

export function useArticulos(filtros = {}) {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const coro = await getCoroActual()
      let query = supabase
        .from('textos')
        .select('*')
        .eq('coro_id', coro.id)
        .eq('publicado', true)
        .order('creado_en', { ascending: false })

      if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
      if (filtros.busqueda) {
        query = query.or(`titulo.ilike.%${filtros.busqueda}%,resumen.ilike.%${filtros.busqueda}%`)
      }
      if (filtros.limite) query = query.limit(filtros.limite)

      const { data, error: err } = await query
      if (err) throw err
      setArticulos(data || [])
    } catch (err) {
      setError('No pudimos cargar los textos.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [filtros.categoria, filtros.busqueda, filtros.limite])

  useEffect(() => { cargar() }, [cargar])
  return { articulos, cargando, error, recargar: cargar }
}

export function useArticulo(id) {
  const [articulo, setArticulo]   = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    async function cargar() {
      const coro = await getCoroActual()
      const { data, error: err } = await supabase
        .from('textos')
        .select('*')
        .eq('id', id)
        .eq('coro_id', coro.id)
        .eq('publicado', true)
        .single()
      if (err) { setError('Texto no encontrado.'); setCargando(false); return }
      setArticulo(data)
      setCargando(false)
    }
    cargar()
  }, [id])

  return { articulo, cargando, error }
}

export function useArticulosAdmin() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    const coro = await getCoroActual()
    const { data, error: err } = await supabase
      .from('textos')
      .select('*')
      .eq('coro_id', coro.id)
      .order('creado_en', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setArticulos(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])
  return { articulos, cargando, error, recargar: cargar }
}

export async function crearArticulo(datos) {
  const coro = await getCoroActual()
  const { data, error } = await supabase
    .from('textos')
    .insert([{ ...datos, coro_id: coro.id, publicado: false }])
    .select()
    .single()
  return { ok: !error, data, error: error?.message }
}

export async function actualizarArticulo(id, datos) {
  const { data, error } = await supabase
    .from('textos')
    .update(datos)
    .eq('id', id)
    .select()
  return { ok: !error, data: data?.[0], error: error?.message }
}

export async function publicarArticulo(id, publicado) {
  const { error } = await supabase
    .from('textos')
    .update({ publicado })
    .eq('id', id)
  return { ok: !error, error: error?.message }
}

export async function eliminarArticulo(id) {
  const { error } = await supabase.from('textos').delete().eq('id', id)
  return { ok: !error, error: error?.message }
}

export const CATEGORIAS = []

export const CATEGORIA_COLOR = {
  tecnica:   { bg: '#E1F5EE', color: '#04342C' },
  estudio:   { bg: '#E6F1FB', color: '#042C53' },
  noticias:  { bg: '#FAECE7', color: '#712B13' },
  formacion: { bg: '#F3EFF8', color: '#3D1C6E' },
  avisos:    { bg: '#F1EFE8', color: '#5F5E5A' },
}