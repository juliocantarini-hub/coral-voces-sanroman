import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { crearObra, actualizarObra, publicarObra } from '../../hooks/useObras'
import { driveUrlPDF, driveUrlAudio } from '../../components/drive/DriveComponents'

const ESTADOS = ['estudio', 'activo', 'concierto', 'archivado']

const CAMPOS_DRIVE = [
  { key: 'drive_partitura_id',    label: 'Partitura PDF',   tipo: 'pdf',   icono: '📄' },
  { key: 'drive_audio_general',   label: 'Audio general',   tipo: 'audio', icono: '🎵' },
  { key: 'drive_audio_soprano',   label: 'Audio soprano',   tipo: 'audio', icono: '🎵' },
  { key: 'drive_audio_contralto', label: 'Audio contralto', tipo: 'audio', icono: '🎵' },
  { key: 'drive_audio_tenor',     label: 'Audio tenor',     tipo: 'audio', icono: '🎵' },
  { key: 'drive_audio_bajo',      label: 'Audio bajo',      tipo: 'audio', icono: '🎵' },
]

const VACIO = {
  titulo: '', compositor: '', estado: 'estudio', descripcion: '', notas_director: '',
  drive_partitura_id: '', drive_audio_general: '',
  drive_audio_soprano: '', drive_audio_contralto: '',
  drive_audio_tenor: '', drive_audio_bajo: '',
}

// Extrae el ID de un link de Google Drive (acepta formatos variados)
function extraerDriveId(input) {
  if (!input) return ''
  input = input.trim()
  // Si ya es un ID puro (sin slashes ni espacios)
  if (/^[\w-]{25,}$/.test(input)) return input
  // Extraer de URL /d/ID/
  const m1 = input.match(/\/d\/([\w-]+)/)
  if (m1) return m1[1]
  // Extraer de ?id=ID
  const m2 = input.match(/[?&]id=([\w-]+)/)
  if (m2) return m2[1]
  return input
}

export default function ObraForm() {
  const { id } = useParams() // si hay id = edición, si no = creación
  const navigate = useNavigate()
  const esEdicion = !!id

  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')
  const [publicada, setPublicada] = useState(false)
  const [previews, setPreviews] = useState({}) // campo → 'ok' | 'error' | null

  // Cargar datos si es edición
  useEffect(() => {
    if (!esEdicion) return
    supabase.from('obras').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setErrorGlobal('No se pudo cargar la obra.'); return }
        setForm({
          titulo: data.titulo || '',
          compositor: data.compositor || '',
          estado: data.estado || 'estudio',
          descripcion: data.descripcion || '',
          notas_director: data.notas_director || '',
          drive_partitura_id: data.drive_partitura_id || '',
          drive_audio_general: data.drive_audio_general || '',
          drive_audio_soprano: data.drive_audio_soprano || '',
          drive_audio_contralto: data.drive_audio_contralto || '',
          drive_audio_tenor: data.drive_audio_tenor || '',
          drive_audio_bajo: data.drive_audio_bajo || '',
        })
        setPublicada(data.publicada || false)
        setCargando(false)
      })
  }, [id, esEdicion])

  function set(campo) {
    return e => {
      const raw = e.target.value
      // Si el campo es de Drive, extraer el ID automáticamente al pegar
      const valor = campo.startsWith('drive_') ? extraerDriveId(raw) : raw
      setForm(f => ({ ...f, [campo]: valor }))
      setErrores(er => ({ ...er, [campo]: undefined }))
    }
  }

  // Previsualizar un archivo de Drive (PDF o audio)
  function previsualizar(campo, tipo) {
    const fileId = form[campo]
    if (!fileId) return
    const url = tipo === 'pdf' ? driveUrlPDF(fileId) : driveUrlAudio(fileId)
    window.open(url, '_blank', 'noopener')
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio.'
    return e
  }

  async function guardar(publicar = false) {
    setErrorGlobal('')
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setGuardando(true)

    const datos = {
      titulo: form.titulo.trim(),
      compositor: form.compositor.trim(),
      estado: form.estado,
      descripcion: form.descripcion.trim() || null,
      notas_director: form.notas_director.trim() || null,
      drive_partitura_id: form.drive_partitura_id || null,
      drive_audio_general: form.drive_audio_general || null,
      drive_audio_soprano: form.drive_audio_soprano || null,
      drive_audio_contralto: form.drive_audio_contralto || null,
      drive_audio_tenor: form.drive_audio_tenor || null,
      drive_audio_bajo: form.drive_audio_bajo || null,
    }

    if (publicar) datos.publicada = true

    const { ok, data, error } = esEdicion
      ? await actualizarObra(id, datos)
      : await crearObra(datos)

    if (!ok) { setErrorGlobal(error || 'No se pudo guardar.'); setGuardando(false); return }

    if (publicar && !esEdicion && data?.id) {
      await publicarObra(data.id, true)
    }

    setGuardando(false)
    navigate('/admin/obras')
  }

  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888780' }}>Cargando obra...</div>
  }

  return (
    <div style={{ maxWidth: '680px', width: '100%', boxSizing: 'border-box' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/obras')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver
        </button>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: 0 }}>
          {esEdicion ? 'Editar obra' : 'Nueva obra'}
        </h2>
        {esEdicion && (
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
            background: publicada ? '#EAF3DE' : '#F1EFE8',
            color: publicada ? '#27500A' : '#888780',
            fontWeight: '600',
          }}>
            {publicada ? 'Publicada' : 'Borrador'}
          </span>
        )}
      </div>

      {errorGlobal && (
        <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#501313', marginBottom: '16px' }}>
          {errorGlobal}
        </div>
      )}

      {/* ── Datos básicos ── */}
      <Seccion titulo="Información de la obra">
        <div style={{  display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Campo label="Título *" error={errores.titulo}>
            <input value={form.titulo} onChange={set('titulo')} placeholder="Ave Verum Corpus" style={inputStyle} />
          </Campo>
          <Campo label="Compositor / Arreglista">
            <input value={form.compositor} onChange={set('compositor')} placeholder="Mozart" style={inputStyle} />
          </Campo>
        </div>
        <Campo label="Estado">
          <select value={form.estado} onChange={set('estado')} style={inputStyle}>
            {ESTADOS.map(e => (
              <option key={e} value={e}>
                {e === 'estudio' ? 'En estudio' : e === 'activo' ? 'Repertorio activo' : e === 'concierto' ? 'Próximo ensayo' : 'Archivado'}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Descripción breve">
          <textarea
            value={form.descripcion} onChange={set('descripcion')}
            placeholder="Breve descripción de la obra (opcional)"
            rows={2}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
          />
        </Campo>
      </Seccion>

      {/* ── Archivos de Drive ── */}
      <Seccion titulo="Archivos de Google Drive">
        <div style={{
          background: '#E6F1FB', border: '1px solid #B8D4F0',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
          fontSize: '12px', color: '#042C53', lineHeight: '1.6',
        }}>
          <strong>Cómo agregar archivos:</strong> Abrí el archivo en Google Drive,
          copiá la URL de la barra del navegador y pegala en el campo. La app extrae el ID automáticamente.
          Asegurate de que el archivo esté compartido como <em>"Cualquiera con el enlace puede ver"</em>.
        </div>

        {CAMPOS_DRIVE.map(({ key, label, tipo, icono }) => (
          <Campo key={key} label={`${icono} ${label}`}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder="Pegá el link o ID de Drive"
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
              />
              {form[key] && (
                <button
                  type="button"
                  onClick={() => previsualizar(key, tipo)}
                  style={{
                    padding: '0 12px', borderRadius: '8px', border: '1px solid #D3D1C7',
                    background: '#FFFFFF', cursor: 'pointer', fontSize: '12px',
                    color: '#0F6E56', fontWeight: '500', whiteSpace: 'nowrap',
                    height: '38px',
                  }}
                >
                  Ver ↗
                </button>
              )}
            </div>
            {form[key] && (
              <p style={{ fontSize: '11px', color: '#888780', margin: '4px 0 0' }}>
                ID: <code style={{ background: '#F1EFE8', padding: '1px 5px', borderRadius: '3px' }}>{form[key]}</code>
              </p>
            )}
          </Campo>
        ))}
      </Seccion>

      {/* ── Notas del director ── */}
      <Seccion titulo="Notas del director">
        <Campo label="Notas para los cantantes">
          <textarea
            value={form.notas_director}
            onChange={set('notas_director')}
            placeholder='Ej: "Atención a la entrada del compás 12. Sopranos sostener el mi con apoyo."'
            rows={4}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
          />
        </Campo>
      </Seccion>

      {/* ── Botones ── */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button
          onClick={() => guardar(false)}
          disabled={guardando}
          style={{
            flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #D3D1C7',
            background: '#FFFFFF', color: '#1A1A18', fontSize: '14px',
            cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: '400',
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando}
          style={{
            flex: 2, height: '42px', borderRadius: '8px', border: 'none',
            background: guardando ? '#9FE1CB' : '#0F6E56', color: '#FFFFFF',
            fontSize: '14px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: '500',
          }}
        >
          {guardando ? 'Guardando...' : publicada ? 'Guardar y publicar' : 'Publicar para cantantes'}
        </button>
      </div>
    </div>
  )
}

// ── Componentes internos ──────────────────────────────────────────────────────
function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '12px', fontWeight: '600', color: '#5F5E5A',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        margin: '0 0 12px', paddingBottom: '8px',
        borderBottom: '1px solid #E8E6DF',
      }}>
        {titulo}
      </h3>
      {children}
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#5F5E5A', marginBottom: '5px' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '12px', color: '#A32D2D', margin: '4px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputStyle = {
  width: '100%', height: '38px',
  border: '1px solid #D3D1C7', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px',
  color: '#1A1A18', background: '#FFFFFF',
  outline: 'none', boxSizing: 'border-box',
}