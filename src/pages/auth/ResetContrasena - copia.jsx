import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthLayout, Campo, Input, Boton, Alerta } from '../../components/ui/AuthUI'
import { supabase } from '../../lib/supabase'

export default function ResetContrasena() {
  const { actualizarContrasena } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword]     = useState('')
  const [confirmar, setConfirmar]   = useState('')
  const [errores, setErrores]       = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')
  const [cargando, setCargando]     = useState(false)
  const [sesionLista, setSesionLista] = useState(false)
  const [linkInvalido, setLinkInvalido] = useState(false)

  useEffect(() => {
    // Supabase parsea automáticamente el token de la URL de reset
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesionLista(true)
      }
    })

    // Verificar si hay sesión activa (por si el usuario ya hizo click en el link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSesionLista(true)
      else {
        // Si no hay sesión y no hay token en la URL, el link es inválido
        const hash = window.location.hash
        if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
          setLinkInvalido(true)
        }
      }
    })
  }, [])

  function validar() {
    const e = {}
    if (!password)                e.password = 'Ingresá una nueva contraseña.'
    else if (password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (password !== confirmar)   e.confirmar = 'Las contraseñas no coinciden.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrorGlobal('')
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setErrores({})
    setCargando(true)
    const { ok, error } = await actualizarContrasena(password)
    setCargando(false)
    if (!ok) { setErrorGlobal(error); return }
    navigate('/', { replace: true })
  }

  if (linkInvalido) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: '56px', height: '56px',
            background: '#FCEBEB',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#A32D2D">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: '20px',
            fontWeight: 'normal', color: '#1A1A18', margin: '0 0 10px',
          }}>
            Enlace inválido o expirado
          </h2>
          <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 24px' }}>
            Este enlace ya fue usado o expiró. Solicitá uno nuevo desde la pantalla de recuperación.
          </p>
          <Boton
            type="button"
            onClick={() => navigate('/recuperar')}
          >
            Solicitar nuevo enlace
          </Boton>
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
        Nueva contraseña
      </h2>
      <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 24px' }}>
        Elegí una contraseña segura para tu cuenta.
      </p>

      {errorGlobal && <Alerta tipo="error">{errorGlobal}</Alerta>}

      {!sesionLista && (
        <Alerta tipo="info">
          Verificando el enlace... Si esto demora, volvé a hacer clic en el correo.
        </Alerta>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Campo label="Nueva contraseña" error={errores.password}>
          <Input
            mostrarToggle
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
            disabled={!sesionLista}
          />
        </Campo>

        <Campo label="Confirmá la contraseña" error={errores.confirmar}>
          <Input
            mostrarToggle
            placeholder="Repetí tu contraseña"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            autoComplete="new-password"
            disabled={!sesionLista}
          />
        </Campo>

        <Boton type="submit" cargando={cargando} disabled={!sesionLista}>
          Guardar nueva contraseña
        </Boton>
      </form>
    </AuthLayout>
  )
}
