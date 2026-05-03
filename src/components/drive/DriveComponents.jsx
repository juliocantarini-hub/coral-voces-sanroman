import { useState } from 'react'

export function driveUrlPDF(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
}
export function driveUrlAudio(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
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
          
         <a href={driveUrlPDF(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={estilos.linkBtn}
            onClick={() => onAbrir && onAbrir()}
          >
            Abrir ↗
          </a>
          
         <a href={driveUrlDescarga(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...estilos.linkBtn, color: '#5F5E5A' }}
          >
            Descargar
          </a>
          
          <a href={driveUrlImprimir(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...estilos.linkBtn, color: '#5F5E5A' }}
          >
            🖨 Abrir para imprimir
          </a>
        </div>
      )}
    </div>
  )
}

export function AudioPlayer({ fileId, nombre, destacado = false, onReproducir }) {
  const [activo, setActivo] = useState(false)

  function handlePlay() {
    setActivo(true)
    if (onReproducir) onReproducir({ fileId, nombre })
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activo ? '#D85A30' : '#D3D1C7', flexShrink: 0 }} />
        <div style={estilos.audioNombre(destacado)}>{nombre}</div>
      </div>
      <iframe
        src={driveUrlAudio(fileId)}
        width="100%"
        height="80px"
        allow="autoplay"
        style={{ border: 'none', borderRadius: '8px' }}
        onLoad={handlePlay}
      />
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
}