import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthLayout, Campo, Input, Boton, Alerta } from '../../components/ui/AuthUI'

export default function RecuperarContrasena() {
  const { recuperarContrasena } = useAuth()

  const [email, setEmail]         = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [errorGlobal, setErrorGlobal] = useState('')
  const [enviado, setEnviado]     = useState(false)
  const [cargando, setCargando]   = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrorGlobal('')
    setErrorEmail('')

    if (!email.trim())           { setErrorEmail('Ingresá tu correo electrónico.'); return }
    if (!email.includes('@'))    { setErrorEmail('Escribí un correo válido.'); return }

    setCargando(true)
    const { ok, error } = await recuperarContrasena(email)
    setCargando(false)

    if (!ok) { setErrorGlobal(error); return }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: '56px', height: '56px',
            background: '#E1F5EE',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0F6E56">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: '20px',
            fontWeight: 'normal', color: '#1A1A18', margin: '0 0 10px',
          }}>
            Revisá tu correo
          </h2>
          <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 8px' }}>
            Si existe una cuenta con{' '}
            <strong>{email}</strong>,
            te enviamos un enlace para restablecer tu contraseña.
          </p>
          <p style={{ fontSize: '12px', color: '#B4B2A9', margin: '0 0 24px' }}>
            El enlace expira en 1 hora. Si no lo ves, revisá la carpeta de spam.
          </p>

          <Boton
            type="button"
            variante="secondary"
            cargando={cargando}
            onClick={() => { setEnviado(false); setEmail('') }}
          >
            Enviar de nuevo
          </Boton>

          <div style={{ marginTop: '16px' }}>
            <Link to="/login" style={{
              color: '#0F6E56', fontWeight: '500',
              fontSize: '14px', textDecoration: 'none',
            }}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 style={{
        fontSize: '18px', fontWeight: '500', color: '#1A1A18',
        margin: '0 0 6px', fontFamily: 'Georgia, serif',
      }}>
        Recuperar acceso
      </h2>
      <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 24px' }}>
        Ingresá tu correo y te enviamos un enlace para crear una nueva contraseña.
      </p>

      {errorGlobal && <Alerta tipo="error">{errorGlobal}</Alerta>}

      <form onSubmit={handleSubmit} noValidate>
        <Campo label="Correo electrónico" error={errorEmail}>
          <Input
            type="email"
            placeholder="maria@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </Campo>

        <Boton type="submit" cargando={cargando}>
          Enviar enlace de recuperación
        </Boton>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/login" style={{
          color: '#5F5E5A', fontSize: '13px',
          textDecoration: 'none',
        }}>
          ← Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  )
}
