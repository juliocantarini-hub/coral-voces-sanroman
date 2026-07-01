import { useMisPagos } from '../hooks/usePagos'
import { useAuth } from '../hooks/useAuth'

export default function MisPagos({ posicion }) {
  const { perfil } = useAuth()
  const { cuotaPendiente, colectasPendientes, cargando } = useMisPagos(perfil?.id)

  if (cargando) return null

  const hoy = new Date()
  const dia = hoy.getDate()
  const hayAlertaCuota = cuotaPendiente && cuotaPendiente.estado === 'pendiente' && dia > 15
  const hayAlgo = cuotaPendiente || colectasPendientes.length > 0
  if (!hayAlgo) return null

  // Si posicion='arriba' solo renderiza cuando hay alerta de cuota
  if (posicion === 'arriba' && !hayAlertaCuota) return null
  // Si posicion='abajo' solo renderiza cuando NO hay alerta de cuota
  if (posicion === 'abajo' && hayAlertaCuota) return null

  return (
    <div style={{
      background: hayAlertaCuota ? '#FFF4F1' : '#FFFFFF',
      borderRadius: '14px',
      padding: '16px 18px',
      border: `1px solid ${hayAlertaCuota ? '#F5C4B5' : '#E8E6DF'}`,
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
          💰 Mis pagos
        </h3>
      </div>

      {cuotaPendiente && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 0',
          borderBottom: colectasPendientes.length > 0 ? '1px solid #F1EFE8' : 'none',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: cuotaPendiente.estado === 'pagado' ? '#0F6E56' : cuotaPendiente.estado === 'exento' ? '#888780' : '#D85A30',
          }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '13px', color: '#1A1A18' }}>{cuotaPendiente.nombre}</span>
            {cuotaPendiente.monto && (
              <span style={{ fontSize: '12px', color: '#888780', marginLeft: '6px' }}>
                ${Number(cuotaPendiente.monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px',
            background: cuotaPendiente.estado === 'pagado' ? '#E1F5EE' : cuotaPendiente.estado === 'exento' ? '#F1EFE8' : '#FAECE7',
            color: cuotaPendiente.estado === 'pagado' ? '#0F6E56' : cuotaPendiente.estado === 'exento' ? '#888780' : '#D85A30',
          }}>
            {cuotaPendiente.estado === 'pagado' ? 'Pagada' : cuotaPendiente.estado === 'exento' ? 'Exenta' : 'Pendiente'}
          </span>
        </div>
      )}

      {colectasPendientes.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F1EFE8' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: '#D85A30' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '13px', color: '#1A1A18' }}>{c.nombre}</span>
            {c.monto && (
              <span style={{ fontSize: '12px', color: '#888780', marginLeft: '6px' }}>
                ${Number(c.monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#FAECE7', color: '#D85A30' }}>
            Pendiente
          </span>
        </div>
      ))}

      {hayAlertaCuota && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#D85A30', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ Tenés la cuota del mes sin abonar.
        </div>
      )}
    </div>
  )
}