// ─── Componentes UI compartidos para las páginas de auth ─────────────────────

// Campo de formulario con label y mensaje de error
export function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        color: '#5F5E5A',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#A32D2D' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// Input estilizado
export function Input({ type = 'text', mostrarToggle = false, ...props }) {
  const [mostrar, setMostrar] = useState(false)
  const tipo = mostrarToggle ? (mostrar ? 'text' : 'password') : type

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={tipo}
        style={{
          width: '100%',
          height: '42px',
          border: '1px solid #D3D1C7',
          borderRadius: '8px',
          padding: mostrarToggle ? '0 44px 0 14px' : '0 14px',
          fontSize: '14px',
          color: '#1A1A18',
          background: '#FFFFFF',
          outline: 'none',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#1D9E75'}
        onBlur={e => e.target.style.borderColor = '#D3D1C7'}
        {...props}
      />
      {mostrarToggle && (
        <button
          type="button"
          onClick={() => setMostrar(v => !v)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888780',
            fontSize: '12px',
            padding: '2px 4px',
          }}
        >
          {mostrar ? 'Ocultar' : 'Mostrar'}
        </button>
      )}
    </div>
  )
}

// Botón primario
export function Boton({ children, cargando = false, variante = 'primary', ...props }) {
  const estilos = {
    primary: {
      background: cargando ? '#9FE1CB' : '#0F6E56',
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      background: '#FFFFFF',
      color: '#0F6E56',
      border: '1px solid #1D9E75',
    },
    ghost: {
      background: 'none',
      color: '#5F5E5A',
      border: '1px solid #D3D1C7',
    },
  }
  return (
    <button
      disabled={cargando}
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: cargando ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...estilos[variante],
      }}
      {...props}
    >
      {cargando ? <Spinner /> : children}
    </button>
  )
}

// Spinner de carga inline
function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}

// Mensaje de alerta (error / éxito / info)
export function Alerta({ tipo = 'error', children }) {
  const colores = {
    error:   { bg: '#FCEBEB', border: '#E24B4A', text: '#501313' },
    exito:   { bg: '#E1F5EE', border: '#1D9E75', text: '#04342C' },
    info:    { bg: '#E6F1FB', border: '#378ADD', text: '#042C53' },
  }
  const c = colores[tipo]
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      padding: '12px 14px',
      fontSize: '13px',
      color: c.text,
      marginBottom: '16px',
      lineHeight: '1.5',
    }}>
      {children}
    </div>
  )
}

// Divisor "o continuar con"
export function Divisor({ texto = 'o' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '20px 0',
    }}>
      <div style={{ flex: 1, height: '1px', background: '#D3D1C7' }} />
      <span style={{ fontSize: '12px', color: '#888780', whiteSpace: 'nowrap' }}>{texto}</span>
      <div style={{ flex: 1, height: '1px', background: '#D3D1C7' }} />
    </div>
  )
}

// Botón de Google OAuth
export function BotonGoogle({ onClick, cargando }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '8px',
        border: '1px solid #D3D1C7',
        background: '#FFFFFF',
        cursor: cargando ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        color: '#1A1A18',
        fontWeight: '500',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#888780'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#D3D1C7'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continuar con Google
    </button>
  )
}

// Layout envolvente para las páginas de auth
export function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F1EFE8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
      }}>
        {/* Logo Coro */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: '#0F6E56',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            fontWeight: 'normal',
            color: '#1A1A18',
            margin: 0,
          }}>
            {import.meta.env.VITE_CORO_NOMBRE || 'Coro'}
          </h1>
          <p style={{ fontSize: '13px', color: '#888780', margin: '4px 0 0' }}>
            Plataforma de estudio coral
          </p>
        </div>

        {/* Tarjeta */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #E8E6DF',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {children}
        </div>

        {/* Logo CORUM */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 78 20 A 38 38 0 1 0 78 80"
              stroke="rgba(15,110,86,0.5)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <line x1="28" y1="38" x2="66" y2="38" stroke="rgba(15,110,86,0.5)" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="50" x2="66" y2="50" stroke="rgba(15,110,86,0.5)" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="62" x2="66" y2="62" stroke="rgba(15,110,86,0.5)" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(15,110,86,0.5)', letterSpacing: '2px', lineHeight: 1 }}>
              CORUM
            </div>
            <div style={{ fontSize: '8px', color: 'rgba(15,110,86,0.35)', letterSpacing: '0.5px', lineHeight: 1.4 }}>
              by Recurso Coral
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Necesario para el Input con toggle
import { useState } from 'react'