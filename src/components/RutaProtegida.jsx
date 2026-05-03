import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Cargando() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F1EFE8',
      flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #E1F5EE', borderTopColor: '#0F6E56',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ fontSize: '13px', color: '#888780', margin: 0 }}>Cargando...</p>
    </div>
  )
}

function AccesoDenegado() {
  const { cerrarSesion } = useAuth()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1EFE8', padding: '24px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '40px 32px', maxWidth: '400px', textAlign: 'center', border: '1px solid #E8E6DF' }}>
        <div style={{ width: '56px', height: '56px', background: '#FCEBEB', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#A32D2D">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 10px' }}>
          Acceso restringido
        </h2>
        <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 24px' }}>
          No tienes permiso para ingresar.
        </p>
        <button onClick={cerrarSesion} style={{ background: 'none', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: '#5F5E5A', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function PendienteAprobacion() {
  const { cerrarSesion, perfil } = useAuth()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1EFE8', padding: '24px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '40px 32px', maxWidth: '420px', textAlign: 'center', border: '1px solid #E8E6DF' }}>
        <div style={{ width: '64px', height: '64px', background: '#E1F5EE', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0F6E56">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 12px' }}>
          Bienvenido/a, {perfil?.nombre?.split(' ')[0]}!
        </h2>
        <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.7', margin: '0 0 12px' }}>
          Tu cuenta está <strong>pendiente de aprobación</strong> por el director del coro.
        </p>
        <p style={{ fontSize: '13px', color: '#888780', lineHeight: '1.6', margin: '0 0 28px' }}>
          Una vez que el director apruebe tu acceso vas a poder entrar a la plataforma.
        </p>
        <button onClick={cerrarSesion}
          style={{ background: 'none', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: '#5F5E5A', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, perfil, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <Cargando />

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!perfil) return <Cargando />

  if (perfil.estado === 'pendiente') {
    return <PendienteAprobacion />
  }

  if (perfil.estado === 'inactivo') {
    return <AccesoDenegado />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(perfil.rol)) {
    return <AccesoDenegado />
  }

  return children
}