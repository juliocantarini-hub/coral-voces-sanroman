import { useState, useRef, useEffect } from 'react'

export function driveUrlPDF(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
}
export function driveUrlAudio(fileId) {
  return `https://drive.google.com/uc?export=open&id=${fileId}`
}
export function driveUrlDescarga(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}
export function driveUrlImprimir(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`
}

export function DriveVisor({ fileId, titulo = 'Partitura', onAbrir }) {
  const [estado, setEstado] = useState('cargando')
  if (!fileId) {
    return (
      <div style={estilos.vacio}>
        <p style={estilos.vaciTxt}>Partitura no disponible todavía.</p>
      </div>
    )
  }
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E8E6DF' }}>
      {estado === 'cargando' && (
        <div style={{ ...estilos.vacio, height: '80px' }}>
          <p style={{ fontSize: '12px', color: '#888780' }}>Cargando partitura...</p>
        </div>
      )}
      <iframe
        src={driveUrlPDF(fileId)}
        title={titulo}
        width="100%"
        height="520px"
        allow="autoplay"
        style={{ border: 'none', display: estado === 'error' ? 'none' : 'block' }}
        onLoad={() => setEstado('ok')}
        onError={() => setEstado('error')}
      />
      {estado === 'ok' && (
        <div style={estilos.pdfFooter}>
          <a href={driveUrlPDF(fileId)} target="_blank" rel="noopener noreferrer"
            style={estilos.linkBtn} onClick={() => onAbrir && onAbrir()}>
            Abrir ↗
          </a>
          <a href={driveUrlDescarga(fileId)} target="_blank" rel="noopener noreferrer"
            style={{ ...estilos.linkBtn, color: '#5F5E5A' }}>
            Descargar
          </a>
          <a href={driveUrlImprimir(fileId)} target="_blank" rel="noopener noreferrer"
            style={{ ...estilos.linkBtn, color: '#5F5E5A' }}>
            🖨 Abrir para imprimir
          </a>
        </div>
      )}
    </div>
  )
}

export function AudioPlayer({ fileId, nombre, destacado = false, onReproducir }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  function formatTiempo(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => setError(true))
      setPlaying(true)
      if (onReproducir) onReproducir({ fileId, nombre })
    }
  }

  function retroceder() {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    setTiempoActual(audioRef.current.currentTime)
    setProgreso(audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)
  }

  function handleLoadedMetadata() {
    if (audioRef.current) setDuracion(audioRef.current.duration)
  }

  function handleEnded() {
    setPlaying(false)
    setProgreso(0)
    setTiempoActual(0)
    if (audioRef.current) audioRef.current.currentTime = 0
  }

  function handleBarClick(e) {
    if (!audioRef.current || !duracion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audioRef.current.currentTime = pct * duracion
  }

  if (!fileId) {
    return (
      <div style={{ padding: '8px 0', borderBottom: '1px solid #F1EFE8', opacity: 0.45 }}>
        <div style={estilos.audioNombre(false)}>{nombre}</div>
        <div style={{ fontSize: '11px', color: '#B4B2A9' }}>No disponible</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #F1EFE8' }}>
      <audio
        ref={audioRef}
        src={driveUrlAudio(fileId)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError(true)}
        preload="metadata"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: playing ? '#D85A30' : '#D3D1C7', flexShrink: 0
        }} />
        <div style={estilos.audioNombre(destacado)}>{nombre}</div>
      </div>

      {error ? (
        <div style={{ fontSize: '11px', color: '#B4B2A9', padding: '4px 0' }}>
          No se pudo cargar el audio.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Botón -10s */}
            <button onClick={retroceder} style={estilos.btnControl} title="Retroceder 10s">
              ⏮ 10s
            </button>
            {/* Play/Pause */}
            <button onClick={togglePlay} style={estilos.btnPlay}>
              {playing ? '⏸' : '▶'}
            </button>
            {/* Tiempo */}
            <span style={{ fontSize: '11px', color: '#888780', minWidth: '75px' }}>
              {formatTiempo(tiempoActual)} / {formatTiempo(duracion)}
            </span>
          </div>

          {/* Barra de progreso */}
          <div
            onClick={handleBarClick}
            style={{
              height: '4px', background: '#E8E6DF', borderRadius: '2px',
              cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{
              width: `${progreso}%`, height: '100%',
              background: playing ? '#D85A30' : '#0F6E56',
              borderRadius: '2px', transition: 'width 0.1s linear'
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

export function ListaAudios({ obra, vozUsuario, onReproducir }) {
  const audios = [
    { key: 'drive_audio_general',   nombre: 'Audio general',   voz: null },
    { key: 'drive_audio_soprano',   nombre: 'Soprano',         voz: 'soprano' },
    { key: 'drive_audio_contralto', nombre: 'Contralto',       voz: 'contralto' },
    { key: 'drive_audio_tenor',     nombre: 'Tenor',           voz: 'tenor' },
    { key: 'drive_audio_bajo',      nombre: 'Bajo',            voz: 'bajo' },
  ]
  if (audios.filter(a => obra[a.key]).length === 0) {
    return (
      <div style={estilos.vacio}>
        <p style={estilos.vaciTxt}>No hay audios disponibles todavía.</p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {audios.map(audio => (
        <AudioPlayer
          key={audio.key}
          fileId={obra[audio.key]}
          nombre={audio.nombre}
          destacado={audio.voz === vozUsuario}
          onReproducir={onReproducir}
        />
      ))}
    </div>
  )
}

const estilos = {
  vacio: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 16px', gap: '10px',
    background: '#F8F7F3', borderRadius: '10px',
    border: '1px solid #E8E6DF',
  },
  vaciTxt: { fontSize: '13px', color: '#888780', margin: 0 },
  pdfFooter: {
    display: 'flex', gap: '12px', padding: '10px 14px',
    background: '#F8F7F3', borderTop: '1px solid #E8E6DF',
  },
  linkBtn: {
    fontSize: '12px', color: '#0F6E56', fontWeight: '500',
    textDecoration: 'none', padding: '4px 0',
  },
  audioNombre: (destacado) => ({
    fontSize: '13px', fontWeight: destacado ? '600' : '400',
    color: destacado ? '#D85A30' : '#1A1A18',
  }),
  btnPlay: {
    background: '#0F6E56', color: '#fff', border: 'none',
    borderRadius: '50%', width: '32px', height: '32px',
    cursor: 'pointer', fontSize: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  btnControl: {
    background: 'transparent', color: '#5F5E5A', border: '1px solid #D3D1C7',
    borderRadius: '6px', padding: '3px 7px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '500',
  },
}