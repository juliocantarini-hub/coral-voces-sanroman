import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  AuthLayout, Campo, Input, Boton, BotonGoogle, Divisor, Alerta
} from '../../components/ui/AuthUI'

export default function Login() {
  const { login, loginConGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores]   = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)

  function validar() {
    const e = {}
    if (!email.trim())         e.email    = 'Ingresá tu correo electrónico.'
    else if (!email.includes('@')) e.email = 'Escribí un correo válido.'
    if (!password)             e.password = 'Ingresá tu contraseña.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrorGlobal('')
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setErrores({})
    setCargando(true)
    const { ok, error } = await login(email, password)
    setCargando(false)
    if (!ok) { setErrorGlobal(error); return }
    navigate('/')
  }

  async function handleGoogle() {
    setErrorGlobal('')
    setCargandoGoogle(true)
    await loginConGoogle()
    setCargandoGoogle(false)
  }

  return (
    <AuthLayout>
      <h2 style={{
        fontSize: '18px', fontWeight: '500', color: '#1A1A18',
        margin: '0 0 6px', fontFamily: 'Georgia, serif',
      }}>
        Bienvenida/o
      </h2>
      <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 24px' }}>
        Accedé para ver repertorio, ensayos y avisos.
      </p>

      {errorGlobal && <Alerta tipo="error">{errorGlobal}</Alerta>}

      <form onSubmit={handleSubmit} noValidate>
        <Campo label="Correo electrónico" error={errores.email}>
          <Input
            type="email"
            placeholder="maria@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </Campo>

        <Campo label="Contraseña" error={errores.password}>
          <Input
            mostrarToggle
            placeholder="Tu contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Campo>

        <Boton type="submit" cargando={cargando}>
          Entrar
        </Boton>
      </form>

      <p style={{
        textAlign: 'center', fontSize: '13px',
        color: '#888780', marginTop: '24px', marginBottom: 0,
      }}>
        ¿Primera vez?{' '}
        <Link to="/registro" style={{
          color: '#0F6E56', fontWeight: '500', textDecoration: 'none',
        }}>
          Solicitá acceso
        </Link>
      </p>

      <p style={{
        textAlign: 'center', fontSize: '12px',
        color: '#B4B2A9', marginTop: '16px', marginBottom: 0, lineHeight: '1.8',
      }}>
        ¿Necesitás ayuda?<br />
        <span style={{ color: '#0F6E56', fontWeight: '500' }}>¿Olvidaste tu contraseña?</span><br />
        Contactá a tu director.
      </p>
    </AuthLayout>
  )
}