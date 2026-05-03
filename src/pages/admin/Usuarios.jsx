import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { getCoroActual } from '../../lib/coro'

const ROLES   = ['cantante', 'director', 'admin']
const VOCES   = ['soprano', 'contralto', 'tenor', 'bajo']
const ESTADOS = ['activo', 'pausa', 'inactivo']

const ROLE_STYLE = {
  cantante: { bg: '#E1F5EE', color: '#04342C' },
  director: { bg: '#FAECE7', color: '#712B13' },
  admin:    { bg: '#E6F1FB', color: '#042C53' },
}

function useEsMovil() {
  return window.innerWidth <= 768
}

export default function Usuarios() {
  const [usuarios, setUsuarios]     = useState([])
  const [cargando, setCargando]     = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [editando, setEditando]     = useState(null)
  const [guardando, setGuardando]   = useState(false)
  const [mensaje, setMensaje]       = useState('')
  const [confirmDesactivar, setConfirmDesactivar] = useState(null)
  const [confirmEliminar, setConfirmEliminar]     = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [resetPass, setResetPass]   = useState(null)
  const [nuevaPass, setNuevaPass]   = useState('')
  const [confirmarPass, setConfirmarPass] = useState('')
  const [resetando, setResetando]   = useState(false)
  const [coroId, setCoroId]         = useState(null)
  const esMovil = useEsMovil()

  const cargar = useCallback(async () => {
    setCargando(true)
    const coro = await getCoroActual()
    setCoroId(coro.id)
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('coro_id', coro.id)
      .order('nombre')
    setUsuarios(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (resetPass) setBusqueda('')
  }, [resetPass])

  const filtrados = usuarios.filter(u =>
    !busqueda ||
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.voz?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const activos    = usuarios.filter(u => u.estado === 'activo').length
  const pendientes = usuarios.filter(u => u.estado === 'pendiente').length

  function actualizarLocal(id, cambios) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...cambios } : u))
  }

  async function guardarEdicion() {
    if (!editando) return
    setGuardando(true)
    const cambios = {
      rol: editando.rol,
      voz: editando.voz,
      estado: editando.estado,
      mail: editando.mail || null,
      fecha_nacimiento: editando.fecha_nacimiento || null,
      dni: editando.dni || null,
    }
    await supabase.from('perfiles').update(cambios).eq('id', editando.id).eq('coro_id', coroId)
    setGuardando(false)
    setEditando(null)
    actualizarLocal(editando.id, cambios)
    setMensaje('Usuario actualizado.')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function handleDesactivar() {
    if (!confirmDesactivar) return
    setProcesando(true)
    await supabase.from('perfiles').update({ estado: 'inactivo' }).eq('id', confirmDesactivar.id).eq('coro_id', coroId)
    actualizarLocal(confirmDesactivar.id, { estado: 'inactivo' })
    setProcesando(false)
    setConfirmDesactivar(null)
    setMensaje('Cantante desactivado.')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function handleEliminar() {
    if (!confirmEliminar) return
    setProcesando(true)
    await supabase.from('perfiles').delete().eq('id', confirmEliminar.id).eq('coro_id', coroId)
    setUsuarios(prev => prev.filter(u => u.id !== confirmEliminar.id))
    setProcesando(false)
    setConfirmEliminar(null)
    setMensaje('Cantante eliminado. Recordá borrarlo también de Supabase Auth.')
    setTimeout(() => setMensaje(''), 5000)
  }

  async function handleResetPassword() {
    if (!resetPass) return
    if (!nuevaPass || nuevaPass.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      setTimeout(() => setMensaje(''), 3000)
      return
    }
    if (nuevaPass !== confirmarPass) {
      setMensaje('Las contraseñas no coinciden.')
      setTimeout(() => setMensaje(''), 3000)
      return
    }
    setResetando(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(
        'https://xfddjbldwfqkdlhnwwhk.supabase.co/functions/v1/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: resetPass.id, new_password: nuevaPass }),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')
      setMensaje(`Contraseña de ${resetPass.nombre} actualizada correctamente.`)
      setTimeout(() => setMensaje(''), 4000)
      setResetPass(null)
      setNuevaPass('')
      setConfirmarPass('')
    } catch (err) {
      setMensaje(`Error: ${err.message}`)
      setTimeout(() => setMensaje(''), 4000)
    } finally {
      setResetando(false)
    }
  }

  function abrirReset(u) {
    setResetPass(u)
    setNuevaPass('')
    setConfirmarPass('')
    setBusqueda('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 2px' }}>Cantantes</h2>
          <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>
            {cargando ? 'Cargando...' : (
              <>
                <span>{activos} activo{activos !== 1 ? 's' : ''}</span>
                {pendientes > 0 && (
                  <span style={{ color: '#D85A30', fontWeight: '500' }}>
                    {' · '}{pendientes} en espera de activación
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        {mensaje && <div style={{ fontSize: '13px', color: '#04342C', background: '#E1F5EE', padding: '6px 12px', borderRadius: '8px' }}>{mensaje}</div>}
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '320px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#B4B2A9" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cantante..."
          autoComplete="off"
          style={{ width: '100%', height: '36px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px 0 32px', fontSize: '13px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }} />
      </div>

      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '56px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {/* MÓVIL: tarjetas */}
      {!cargando && esMovil && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>No hay usuarios que coincidan.</div>
          )}
          {filtrados.map(u => {
            const rs = ROLE_STYLE[u.rol] || ROLE_STYLE.cantante
            return (
              <div key={u.id} style={{ background: '#FFFFFF', border: u.estado === 'pendiente' ? '1px solid #F0C5B4' : '1px solid #E8E6DF', borderRadius: '12px', padding: '14px', opacity: u.estado === 'inactivo' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18' }}>{u.nombre || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#888780', marginTop: '2px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u.voz || '—'}
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.estado === 'activo' ? '#639922' : u.estado === 'pendiente' ? '#D85A30' : '#D3D1C7', display: 'inline-block' }} />
                      {u.estado === 'pendiente' ? <span style={{ color: '#D85A30', fontWeight: '500' }}>En espera</span> : u.estado}
                    </div>
                    {u.mail && <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>{u.mail}</div>}
                    {u.dni && <div style={{ fontSize: '11px', color: '#888780' }}>DNI: {u.dni}</div>}
                  </div>
                  <span style={{ background: rs.bg, color: rs.color, fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>
                    {u.rol}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => setEditando({ ...u })}
                    style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', color: '#0F6E56', fontWeight: '500' }}>
                    Editar
                  </button>
                  <button onClick={() => abrirReset(u)}
                    style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #C5D8F0', background: 'none', cursor: 'pointer', color: '#1A5276', fontWeight: '500' }}>
                    Contraseña
                  </button>
                  {u.estado !== 'inactivo' && u.estado !== 'pendiente' && (
                    <button onClick={() => setConfirmDesactivar(u)}
                      style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #F0C5B4', background: 'none', cursor: 'pointer', color: '#A32D2D' }}>
                      Desactivar
                    </button>
                  )}
                  {u.estado === 'inactivo' && (
                    <button onClick={() => setConfirmEliminar(u)}
                      style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: 'none', background: '#A32D2D', cursor: 'pointer', color: '#FFFFFF', fontWeight: '500' }}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ESCRITORIO: filas */}
      {!cargando && !esMovil && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>No hay usuarios que coincidan.</div>
          )}
          {filtrados.map(u => {
            const rs = ROLE_STYLE[u.rol] || ROLE_STYLE.cantante
            return (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 80px auto', alignItems: 'center', gap: '12px', background: '#FFFFFF', border: u.estado === 'pendiente' ? '1px solid #F0C5B4' : '1px solid #E8E6DF', borderRadius: '10px', padding: '10px 14px', opacity: u.estado === 'inactivo' ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>{u.nombre || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#888780', marginTop: '1px' }}>
                    {u.mail || u.telefono || ''}
                    {u.dni && ` · DNI: ${u.dni}`}
                    {u.fecha_nacimiento && ` · ${new Date(u.fecha_nacimiento).toLocaleDateString('es-AR')}`}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#5F5E5A', textTransform: 'capitalize' }}>{u.voz || '—'}</span>
                <span style={{ background: rs.bg, color: rs.color, fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize', display: 'inline-block' }}>{u.rol}</span>
                <span style={{ fontSize: '11px', color: u.estado === 'activo' ? '#27500A' : u.estado === 'pendiente' ? '#D85A30' : '#888780', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.estado === 'activo' ? '#639922' : u.estado === 'pendiente' ? '#D85A30' : '#D3D1C7', display: 'inline-block' }} />
                  {u.estado === 'pendiente' ? 'En espera' : u.estado}
                </span>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditando({ ...u })}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', color: '#0F6E56', fontWeight: '500' }}>
                    Editar
                  </button>
                  <button onClick={() => abrirReset(u)}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #C5D8F0', background: 'none', cursor: 'pointer', color: '#1A5276', fontWeight: '500' }}>
                    Contraseña
                  </button>
                  {u.estado !== 'inactivo' && u.estado !== 'pendiente' && (
                    <button onClick={() => setConfirmDesactivar(u)}
                      style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #F0C5B4', background: 'none', cursor: 'pointer', color: '#A32D2D' }}>
                      Desactivar
                    </button>
                  )}
                  {u.estado === 'inactivo' && (
                    <button onClick={() => setConfirmEliminar(u)}
                      style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: 'none', background: '#A32D2D', cursor: 'pointer', color: '#FFFFFF', fontWeight: '500' }}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal reset contraseña */}
      {resetPass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 4px' }}>Resetear contraseña</h3>
            <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 20px' }}>{resetPass.nombre}</p>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input type="password" value={nuevaPass} onChange={e => setNuevaPass(e.target.value)}
                placeholder="Mínimo 6 caracteres" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" value={confirmarPass} onChange={e => setConfirmarPass(e.target.value)}
                placeholder="Repetí la contraseña" style={inputStyle} />
            </div>
            {nuevaPass && confirmarPass && nuevaPass !== confirmarPass && (
              <p style={{ fontSize: '12px', color: '#A32D2D', margin: '-12px 0 16px', background: '#FCEBEB', padding: '6px 10px', borderRadius: '6px' }}>
                Las contraseñas no coinciden.
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setResetPass(null); setNuevaPass(''); setConfirmarPass('') }}
                style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Cancelar
              </button>
              <button onClick={handleResetPassword} disabled={resetando}
                style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: resetando ? '#7FB5A8' : '#0F6E56', color: '#FFFFFF', cursor: resetando ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {resetando ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px', overflowY: 'auto' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', margin: 'auto' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 4px' }}>Editar usuario</h3>
            <p style={{ fontSize: '13px', color: '#888780', margin: '0 0 16px' }}>{editando.nombre}</p>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Voz</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {VOCES.map(v => (
                  <button key={v} onClick={() => setEditando(e => ({ ...e, voz: v }))}
                    style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: `1.5px solid ${editando.voz === v ? '#1D9E75' : '#D3D1C7'}`, background: editando.voz === v ? '#E1F5EE' : '#FFFFFF', color: editando.voz === v ? '#04342C' : '#5F5E5A', textTransform: 'capitalize' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Rol</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ROLES.map(r => {
                  const rs = ROLE_STYLE[r]
                  return (
                    <button key={r} onClick={() => setEditando(e => ({ ...e, rol: r }))}
                      style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: `1.5px solid ${editando.rol === r ? rs.color : '#D3D1C7'}`, background: editando.rol === r ? rs.bg : '#FFFFFF', color: editando.rol === r ? rs.color : '#5F5E5A', textTransform: 'capitalize' }}>
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Estado</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ESTADOS.map(es => (
                  <button key={es} onClick={() => setEditando(e => ({ ...e, estado: es }))}
                    style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: `1.5px solid ${editando.estado === es ? '#0F6E56' : '#D3D1C7'}`, background: editando.estado === es ? '#E1F5EE' : '#FFFFFF', color: editando.estado === es ? '#04342C' : '#5F5E5A', textTransform: 'capitalize' }}>
                    {es}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Correo electrónico</label>
              <input value={editando.mail || ''} onChange={e => setEditando(ed => ({ ...ed, mail: e.target.value }))}
                placeholder="correo@ejemplo.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Teléfono / Celular</label>
              <input value={editando.telefono || ''} onChange={e => setEditando(ed => ({ ...ed, telefono: e.target.value }))}
                placeholder="+54 11 0000-0000" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>DNI</label>
                <input value={editando.dni || ''} onChange={e => setEditando(ed => ({ ...ed, dni: e.target.value }))}
                  placeholder="12345678" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de nacimiento</label>
                <input type="date" value={editando.fecha_nacimiento || ''} onChange={e => setEditando(ed => ({ ...ed, fecha_nacimiento: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setEditando(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardando} style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: '#0F6E56', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal desactivar */}
      {confirmDesactivar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 8px' }}>Desactivar cantante</h3>
            <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 8px' }}>
              ¿Desactivás a <strong>{confirmDesactivar.nombre}</strong>?
            </p>
            <p style={{ fontSize: '12px', color: '#888780', margin: '0 0 24px', background: '#F1EFE8', padding: '8px 10px', borderRadius: '8px' }}>
              Ya no podrá ingresar a la app. Podés volver a activarlo en cualquier momento editando su perfil.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDesactivar(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Cancelar
              </button>
              <button onClick={handleDesactivar} disabled={procesando}
                style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: procesando ? '#F0C5B4' : '#A32D2D', color: '#FFFFFF', cursor: procesando ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {procesando ? 'Desactivando...' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {confirmEliminar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 8px' }}>Eliminar cantante</h3>
            <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 8px' }}>
              ¿Eliminás definitivamente a <strong>{confirmEliminar.nombre}</strong>?
            </p>
            <p style={{ fontSize: '12px', color: '#888780', margin: '0 0 24px', background: '#FCEBEB', padding: '8px 10px', borderRadius: '8px' }}>
              Esta acción no se puede deshacer. Recordá eliminar también el usuario en Supabase Auth.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmEliminar(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Cancelar
              </button>
              <button onClick={handleEliminar} disabled={procesando}
                style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: procesando ? '#F0C5B4' : '#A32D2D', color: '#FFFFFF', cursor: procesando ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {procesando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#5F5E5A', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.4px' }
const inputStyle = { width: '100%', height: '38px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#1A1A18', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }