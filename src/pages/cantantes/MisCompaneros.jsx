import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePresencia } from '../../hooks/usePresencia'
import { getCoroActual } from '../../lib/coro'

function proximoCumple(fechaNacimiento) {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  const cumple = new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())
  if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1)
  const diff = Math.ceil((cumple - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

function formatearWA(telefono) {
  if (!telefono) return ''
  const limpio = telefono.replace(/\D/g, '')
  if (telefono.startsWith('+54')) return limpio
  return '549' + limpio.replace(/^0/, '').replace(/^15/, '')
}

const VOCES_COLOR = {
  soprano:   { bg: '#FAECE7', color: '#712B13' },
  contralto: { bg: '#F3EFF8', color: '#3D1C6E' },
  tenor:     { bg: '#E6F1FB', color: '#042C53' },
  bajo:      { bg: '#E1F5EE', color: '#04342C' },
}

export default function MisCompaneros() {
  const { perfil } = useAuth()
  const activos = usePresencia()
  const [todos, setTodos]         = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [vozFiltro, setVozFiltro] = useState('')

  useEffect(() => {
  async function cargar() {
    const coro = await getCoroActual()
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre, voz, telefono, fecha_nacimiento, rol')
      .eq('coro_id', coro.id)
      .eq('estado', 'activo')
      .order('nombre')
    setTodos(data || [])
    setCargando(false)
  }
  cargar()
}, [])

  const directores = todos.filter(c => c.rol === 'director' || c.rol === 'admin')
  const cantantes  = todos.filter(c => c.rol !== 'director' && c.rol !== 'admin')

  const hoy = new Date()
  const cumpleHoy = todos.filter(c => {
    if (!c.fecha_nacimiento) return false
    const nac = new Date(c.fecha_nacimiento + 'T12:00:00')
    return nac.getMonth() === hoy.getMonth() && nac.getDate() === hoy.getDate()
  })

  const filtrados = cantantes.filter(c => {
    const coincideBusqueda = !busqueda || c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideVoz = !vozFiltro || c.voz === vozFiltro
    return coincideBusqueda && coincideVoz
  })

  const VOCES = ['soprano', 'contralto', 'tenor', 'bajo']
  const cantidadActivos = activos.length

  function TarjetaPersona({ c, esDirector = false }) {
    const vc = VOCES_COLOR[c.voz] || { bg: '#F1EFE8', color: '#5F5E5A' }
    const diasCumple = proximoCumple(c.fecha_nacimiento)
    const cumplePronto = diasCumple !== null && diasCumple <= 7
    const esMiPerfil = c.id === perfil?.id
    const estaActivo = activos.includes(c.id)
    const waUrl = 'https://wa.me/' + formatearWA(c.telefono)

    return (
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${esDirector ? '#B4D8CE' : esMiPerfil ? '#B4D8CE' : '#E8E6DF'}`,
        borderLeft: esDirector ? '3px solid #0F6E56' : undefined,
        borderRadius: '12px', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: esDirector ? '#E1F5EE' : vc.bg,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', fontWeight: '600',
            color: esDirector ? '#0F6E56' : vc.color,
          }}>
            {c.nombre?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {estaActivo && (
            <span style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: '50%',
              background: '#1D9E75', border: '2px solid #fff', display: 'block',
            }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18' }}>
              {c.nombre}
              {esMiPerfil && <span style={{ fontSize: '11px', color: '#888780', marginLeft: '6px' }}>(Yo)</span>}
            </span>
            {esDirector && (
              <span style={{ fontSize: '10px', background: '#E1F5EE', color: '#0F6E56', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                Director/a
              </span>
            )}
            {!esDirector && c.voz && (
              <span style={{ fontSize: '10px', background: vc.bg, color: vc.color, padding: '2px 8px', borderRadius: '10px', fontWeight: '600', textTransform: 'capitalize' }}>
                {c.voz}
              </span>
            )}
            {estaActivo && (
              <span style={{ fontSize: '10px', color: '#1D9E75', fontWeight: '500' }}>· en línea</span>
            )}
            {cumplePronto && (
              <span style={{ fontSize: '11px', color: '#D85A30' }}>
                {diasCumple === 0 ? '🎂 ¡Hoy!' : `🎂 en ${diasCumple} día${diasCumple !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#888780', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {c.telefono && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0F6E56', textDecoration: 'none', fontWeight: '500' }}>
                💬 {c.telefono}
              </a>
            )}
            {c.fecha_nacimiento && (
              <span>🎂 {new Date(c.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 4px' }}>
          Mis compañeros
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#888780', margin: 0 }}>
            {cargando ? 'Cargando...' : `${cantantes.length} cantante${cantantes.length !== 1 ? 's' : ''} en el coro`}
          </p>
          {cantidadActivos > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#E1F5EE', borderRadius: '20px', padding: '3px 10px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', animation: 'pulsar 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '12px', color: '#04342C', fontWeight: '500' }}>{cantidadActivos} en línea</span>
              <style>{`@keyframes pulsar { 0%,100%{box-shadow:0 0 0 2px rgba(29,158,117,0.3)} 50%{box-shadow:0 0 0 4px rgba(29,158,117,0.15)} }`}</style>
            </div>
          )}
        </div>
      </div>

      {cumpleHoy.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #D85A30, #F0A070)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🎂</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>¡Hoy cumple{cumpleHoy.length > 1 ? 'n' : ''} años!</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{cumpleHoy.map(c => c.nombre).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Director/a arriba */}
      {!cargando && directores.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Dirección
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {directores.map(c => <TarjetaPersona key={c.id} c={c} esDirector />)}
          </div>
        </div>
      )}

      {/* Filtros cantantes */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#B4B2A9" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar compañero..."
            style={{ width: '100%', height: '36px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px 0 32px', fontSize: '13px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setVozFiltro('')}
            style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${vozFiltro === '' ? '#1D9E75' : '#D3D1C7'}`, background: vozFiltro === '' ? '#E1F5EE' : 'none', color: vozFiltro === '' ? '#04342C' : '#5F5E5A' }}>
            Todas
          </button>
          {VOCES.map(v => {
            const vc = VOCES_COLOR[v] || { bg: '#F1EFE8', color: '#5F5E5A' }
            return (
              <button key={v} onClick={() => setVozFiltro(v)}
                style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize', border: `1px solid ${vozFiltro === v ? vc.color : '#D3D1C7'}`, background: vozFiltro === v ? vc.bg : 'none', color: vozFiltro === v ? vc.color : '#5F5E5A', fontWeight: vozFiltro === v ? '500' : '400' }}>
                {v}
              </button>
            )
          })}
        </div>
      </div>

      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '70px', background: '#F1EFE8', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {!cargando && filtrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888780' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>No hay compañeros que coincidan.</p>
        </div>
      )}

      {!cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtrados.map(c => <TarjetaPersona key={c.id} c={c} />)}
        </div>
      )}
    </div>
  )
}