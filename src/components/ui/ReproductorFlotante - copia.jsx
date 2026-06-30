import { useAudioPlayer } from '../../hooks/useAudioPlayer'

export default function ReproductorFlotante() {
  const { audioActivo, playing, togglePlay, detener } = useAudioPlayer()

  if (!audioActivo) return null

  const url = `https://drive.google.com/file/d/${audioActivo.fileId}/preview`

  return (
    <div style={{
      position: 'fixed', bottom: '16px', left: '50%',
      transform: 'translateX(-50%)',
      background: '#0A4A3A',
      borderRadius: '14px',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 100,
      minWidth: '280px', maxWidth: '90vw',
    }}>
      {/* Icono música */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: '#1D9E75', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      {/* Nombre del audio */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.7)', marginBottom: '2px' }}>
          Reproduciendo
        </div>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {audioActivo.nombre}
        </div>
      </div>

      {/* Iframe oculto con el audio */}
      <iframe
        src={url}
        width="0"
        height="0"
        allow="autoplay"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Botón cerrar */}
      <button onClick={detener}
        style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          borderRadius: '50%', width: '28px', height: '28px',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  )
}