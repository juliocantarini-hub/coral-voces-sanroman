import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  AuthLayout, Campo, Input, Boton, Alerta
} from '../../components/ui/AuthUI'

const VOCES = ['soprano', 'contralto', 'tenor', 'bajo']

export default function Registro() {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', email: '', password: '', confirmar: '',
    voz: '', fecha_nacimiento: '', dni: '', telefono: ''
  })
  const [errores, setErrores] = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  function set(campo) {
    return e => setForm(f => ({ ...f, [campo]: e.target.value }))
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim())            e.nombre   = 'Ingresá tu nombre completo.'
    if (!form.email.trim())             e.email    = 'Ingresá tu correo electrónico.'
    else if (!form.email.includes('@')) e.email    = 'Escribí un correo válido.'
    if (!form.voz)                      e.voz      = 'Seleccioná tu cuerda vocal.'
    if (!form.password)                 e.password = 'Ingresá una contraseña.'
    else if (form.password.length < 6)  e.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrorGlobal('')
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setErrores({})
    setCargando(true)
    const { ok, error, necesitaConfirmacion } = await registro(
      form.email, form.password, form.nombre, form.voz,
      form.fecha_nacimiento || null, form.dni || null, form.telefono || null
    )
    setCargando(false)
    if (!ok) { setErrorGlobal(error); return }
    if (necesitaConfirmacion) {
      setExito(true)
    } else {
      navigate('/')
    }
  }

  if (exito) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: '56px', height: '56px', background: '#E1F5EE', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0F6E56">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 10px' }}>
            ¡Revisá tu correo!
          </h2>
          <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 24px' }}>
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link to="/login" style={{ color: '#0F6E56', fontWeight: '500', fontSize: '14px', textDecoration: 'none' }}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1A1A18', margin: '0 0 6px', fontFamily: 'Georgia, serif' }}>
        Solicitá acceso
      </h2>
      <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 24px' }}>
        Completá tus datos para unirte al coro.
      </p>

      {errorGlobal && <Alerta tipo="error">{errorGlobal}</Alerta>}

      <form onSubmit={handleSubmit} noValidate>
        <Campo label="Nombre completo *" error={errores.nombre}>
          <Input type="text" placeholder="María López" value={form.nombre} onChange={set('nombre')} autoComplete="name" autoFocus />
        </Campo>

        <Campo label="Correo electrónico *" error={errores.email}>
          <Input type="email" placeholder="maria@ejemplo.com" value={form.email} onChange={set('email')} autoComplete="email" />
        </Campo>

        <Campo label="Cuerda vocal *" error={errores.voz}>
          <select value={form.voz} onChange={set('voz')}
            style={{ width: '100%', height: '42px', border: `1px solid ${errores.voz ? '#E24B4A' : '#D3D1C7'}`, borderRadius: '8px', padding: '0 14px', fontSize: '14px', color: form.voz ? '#1A1A18' : '#B4B2A9', background: '#FFFFFF', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
            <option value="" disabled>Seleccioná tu voz</option>
            {VOCES.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Teléfono / Celular">
          <Input type="tel" placeholder="+54 11 0000-0000" value={form.telefono} onChange={set('telefono')} />
        </Campo>

        <Campo label="Fecha de nacimiento">
          <Input type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')} />
        </Campo>

        <Campo label="DNI">
          <Input type="text" placeholder="12345678" value={form.dni} onChange={set('dni')} />
        </Campo>

        <Campo label="Contraseña *" error={errores.password}>
          <Input mostrarToggle placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Campo>

        <Campo label="Confirmá la contraseña *" error={errores.confirmar}>
          <Input mostrarToggle placeholder="Repetí tu contraseña" value={form.confirmar} onChange={set('confirmar')} autoComplete="new-password" />
        </Campo>

        <Boton type="submit" cargando={cargando}>
          Crear cuenta
        </Boton>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: '#888780', marginTop: '24px', marginBottom: 0 }}>
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" style={{ color: '#0F6E56', fontWeight: '500', textDecoration: 'none' }}>
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  )
}