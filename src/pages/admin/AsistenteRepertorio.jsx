export default function AsistenteRepertorio() {
  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 80px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #0F6E56', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0F6E56' }}>Asistente de Repertorio</div>
          <div style={{ fontSize: 12, color: '#888' }}>Recurso Coral · Biblioteca Coral Colaborativa</div>
        </div>
      </div>
      <iframe
        src="https://recursocoral.com.ar/asistente-embed.php"
        width="100%"
        height="100%"
        style={{ border: '1px solid #e0ddd5', borderRadius: 12, display: 'block', flex: 1, minHeight: 0 }}
        title="Asistente de Repertorio"
      />
    </div>
  )
}
