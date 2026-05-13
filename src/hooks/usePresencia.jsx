import { useEffect, useState, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const PresenciaContext = createContext([])

export function PresenciaProvider({ perfil, children }) {
  const [activos, setActivos] = useState([])

  useEffect(() => {
    if (!perfil?.id) return

    const canal = supabase.channel('presencia-coro')

    canal
      .on('presence', { event: 'sync' }, () => {
        const state = canal.presenceState()
        setActivos(Object.keys(state))
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const ids = newPresences.map(p => p.id)
        setActivos(prev => [...new Set([...prev, ...ids])])
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const ids = leftPresences.map(p => p.id)
        setActivos(prev => prev.filter(id => !ids.includes(id)))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await canal.track({ id: perfil.id, nombre: perfil.nombre })
        }
      })

    return () => {
      canal.untrack()
      supabase.removeChannel(canal)
    }
  }, [perfil?.id])

  return (
    <PresenciaContext.Provider value={activos}>
      {children}
    </PresenciaContext.Provider>
  )
}

export function usePresencia() {
  return useContext(PresenciaContext)
}
