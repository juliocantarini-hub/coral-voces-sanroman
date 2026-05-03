import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useObra, marcarProgreso } from '../../hooks/useObras'
import { useAuth } from '../../hooks/useAuth'
import { DriveVisor } from '../../components/drive/DriveComponents'
import { supabase } from '../../lib/supabase'

const PROGRESO_OPTS = [
  { valor: 'pendiente',   label: 'Pendiente',   color: '#888780', bg: '#F1EFE8' },
  { valor: 'en_progreso', label: 'En progreso', color: '#D85A30', bg: '#FAECE7' },
  { valor: 'estudiada',   label: 'Estudiada ✓', color: '#27500A', bg: '#EAF3DE' },
]

const NOMBRES_AUDIO = {
  drive_audio_general:   'DEMO',
  drive_audio_soprano:   'Soprano',
  drive_audio_contralto: 'Contralto',
  drive_audio_tenor:     'Tenor',
  drive_audio_bajo:      'Bajo',
}

function useEsMovil() {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setEsMovil(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return esMovil
}

async function registrarActividad(usuarioId, obraId, tipo) {
  try {
    await supabase.from('actividad_estudio').insert({ usuario_id: usuarioId, obra_id: obraId, tipo })
  } catch (e) {}
}

export default function ObraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, perfil } = useAuth()
  const { obra, cargando, error } = useObra(id)
  const esMovil = useEsMovil()
  const [progreso, setProgreso] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState('')
  const [audioSeleccionado, setAudioSeleccionado] = useState(null)

  useEffect(() => {
    if (obra && usuario) {
      registrarActividad(usuario.id, id, 'apertura')
    }
  }, [obra, usuario, id])

  const progresoActual = progreso ?? obra?.progreso ?? 'pendiente'

  function handleSeleccionarAudio(audio) {
    setAudioSeleccionado(audio)
  }

  async function cambiarProgreso(nuevoEstado) {
    if (!usuario || guardando) return
    setGuardando(true)
    const { ok } = await marcarProgreso(usuario.id, id, nuevoEstado)
    if (ok) {
      setProgreso(nuevoEstado)
      setMensajeGuardado('Guardado')
      setTimeout(() => setMensajeGuardado(''), 2000)
    }
    setGuardando(false)
  }

  if (cargando) {
    return (
      <div>
        <div style={{ height: '24px', width: '120px', background: '#F1EFE8', borderRadius: '6px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '60px', background: '#F1EFE8', borderRadius: '10px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '400px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    )
  }

  if (error || !obra) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: '#A32D2D', marginBottom: '16px' }}>{error || 'No encontramos esta obra.'}</p>
        <button onClick={() => navigate('/repertorio')}
          style={{ color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
          ← Volver al repertorio
        </button>
      </div>
    )
  }

  const audiosDisponibles = Object.entries(NOMBRES_AUDIO)
    .filter(([key]) => obra[key])
    .map(([key, nombre]) => ({ key, nombre, fileId: obra[key] }))

  const audioMostrado = audioSeleccionado
    || audiosDisponibles.find(a => a.key === `drive_audio_${perfil?.voz}`)
    || audiosDisponibles[0]
    || null

  return (
    <div>
      <button onClick={() => navigate('/repertorio')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888780', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Volver al repertorio
      </button>

      {/* Cabecera */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 4px' }}>
              {obra.titulo}
            </h2>
            <p style={{ fontSize: '14px', color: '#888780', margin: '0 0 10px' }}>
              {obra.compositor || 'Compositor desconocido'}
            </p>
            <EstadoBadge estado={obra.estado} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '11px', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Mi progreso</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {PROGRESO_OPTS.map(op => (
                <button key={op.valor} onClick={() => cambiarProgreso(op.valor)} disabled={guardando}
                  style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: guardando ? 'not-allowed' : 'pointer', border: `1px solid ${progresoActual === op.valor ? op.color : '#D3D1C7'}`, background: progresoActual === op.valor ? op.bg : 'none', color: progresoActual === op.valor ? op.color : '#888780', fontWeight: progresoActual === op.valor ? '600' : '400' }}>
                  {op.label}
                </button>
              ))}
            </div>
            {mensajeGuardado && <span style={{ fontSize: '11px', color: '#639922' }}>✓ {mensajeGuardado}</span>}
          </div>
        </div>
      </div>

      {/* Panel de audios — solo en móvil */}
      {esMovil && audiosDisponibles.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Audios
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {audiosDisponibles.map(audio => {
              const esVozPropia = audio.key === `drive_audio_${perfil?.voz}`
              const seleccionado = audioMostrado?.key === audio.key
              return (
                <button key={audio.key} onClick={() => handleSeleccionarAudio(audio)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                    cursor: 'pointer',
                    border: `1.5px solid ${seleccionado ? '#0F6E56' : esVozPropia ? '#D85A30' : '#D3D1C7'}`,
                    background: seleccionado ? '#E1F5EE' : esVozPropia ? '#FAECE7' : '#FFFFFF',
                    color: seleccionado ? '#04342C' : esVozPropia ? '#712B13' : '#5F5E5A',
                    fontWeight: seleccionado || esVozPropia ? '600' : '400',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  {esVozPropia && <span>★</span>}
                  {audio.nombre}
                </button>
              )
            })}
          </div>
          {audioMostrado && (
            <iframe
              key={audioMostrado.fileId}
              src={`https://drive.google.com/file/d/${audioMostrado.fileId}/preview`}
              width="100%"
              height="80px"
              allow="autoplay"
              style={{ border: 'none', borderRadius: '8px', display: 'block' }}
            />
          )}
        </div>
      )}

      {/* Notas del director — solo en móvil */}
      {esMovil && obra.notas_director && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Notas del director
          </div>
          <div style={{ fontSize: '12px', color: '#3D1608', lineHeight: '1.6', fontStyle: 'italic', background: '#FAECE7', borderLeft: '3px solid #D85A30', borderRadius: '0 6px 6px 0', padding: '8px 10px' }}>
            "{obra.notas_director}"
          </div>
        </div>
      )}

      {/* Partitura — siempre abajo en móvil */}
      {esMovil && (
        <DriveVisor
          fileId={obra.drive_partitura_id}
          titulo={obra.titulo}
          onAbrir={() => usuario && registrarActividad(usuario.id, id, 'partitura_abierta')}
        />
      )}

      {/* Desktop: partitura izquierda, panel derecha */}
      {!esMovil && (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <DriveVisor
              fileId={obra.drive_partitura_id}
              titulo={obra.titulo}
              onAbrir={() => usuario && registrarActividad(usuario.id, id, 'partitura_abierta')}
            />
          </div>
          <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {audiosDisponibles.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Audios
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {audiosDisponibles.map(audio => {
                    const esVozPropia = audio.key === `drive_audio_${perfil?.voz}`
                    const seleccionado = audioMostrado?.key === audio.key
                    return (
                      <button key={audio.key} onClick={() => handleSeleccionarAudio(audio)}
                        style={{
                          padding: '7px 10px', borderRadius: '8px', fontSize: '12px',
                          cursor: 'pointer', textAlign: 'left',
                          border: `1.5px solid ${seleccionado ? '#0F6E56' : esVozPropia ? '#D85A30' : '#D3D1C7'}`,
                          background: seleccionado ? '#E1F5EE' : esVozPropia ? '#FAECE7' : '#FFFFFF',
                          color: seleccionado ? '#04342C' : esVozPropia ? '#712B13' : '#5F5E5A',
                          fontWeight: seleccionado || esVozPropia ? '600' : '400',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                        {esVozPropia && <span style={{ fontSize: '10px' }}>★</span>}
                        {audio.nombre}
                      </button>
                    )
                  })}
                </div>
                {audioMostrado && (
                  <iframe
                    key={audioMostrado.fileId}
                    src={`https://drive.google.com/file/d/${audioMostrado.fileId}/preview`}
                    width="100%"
                    height="80px"
                    allow="autoplay"
                    style={{ border: 'none', borderRadius: '8px' }}
                  />
                )}
              </div>
            )}
            {obra.notas_director && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Notas del director
                </div>
                <div style={{ fontSize: '12px', color: '#3D1608', lineHeight: '1.6', fontStyle: 'italic', background: '#FAECE7', borderLeft: '3px solid #D85A30', borderRadius: '0 6px 6px 0', padding: '8px 10px' }}>
                  "{obra.notas_director}"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EstadoBadge({ estado }) {
  const map = {
    estudio:   { bg: '#E1F5EE', color: '#04342C', txt: 'En estudio' },
    activo:    { bg: '#EAF3DE', color: '#27500A', txt: 'Activo' },
    concierto: { bg: '#FAECE7', color: '#712B13', txt: 'Próximo ensayo' },
    archivado: { bg: '#F1EFE8', color: '#888780', txt: 'Archivado' },
  }
  const b = map[estado] || map.archivado
  return (
    <span style={{ background: b.bg, color: b.color, fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '10px' }}>
      {b.txt}
    </span>
  )
}