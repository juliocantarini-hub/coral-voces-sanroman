-- ═══════════════════════════════════════════════════════════════
-- CORAL VOCES — SQL de configuración inicial (Fase 1)
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Tabla de perfiles ────────────────────────────────────────────────────
-- Se vincula 1:1 con auth.users de Supabase
CREATE TABLE IF NOT EXISTS perfiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        TEXT        NOT NULL DEFAULT '',
  voz           TEXT        CHECK (voz IN ('soprano', 'contralto', 'tenor', 'bajo')),
  rol           TEXT        NOT NULL DEFAULT 'cantante'
                              CHECK (rol IN ('cantante', 'director', 'admin')),
  estado        TEXT        NOT NULL DEFAULT 'activo'
                              CHECK (estado IN ('activo', 'pausa', 'inactivo')),
  telefono      TEXT,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Trigger: crear perfil automáticamente al registrarse ─────────────────
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Eliminar trigger anterior si existe y recrear
DROP TRIGGER IF EXISTS al_crear_usuario ON auth.users;
CREATE TRIGGER al_crear_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();

-- ─── 3. Row Level Security ───────────────────────────────────────────────────
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve y edita solo su propio perfil
CREATE POLICY "ver_propio_perfil"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "editar_propio_perfil"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin puede ver todos los perfiles
CREATE POLICY "admin_ve_todos_los_perfiles"
  ON perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'admin'
    )
  );

-- Admin puede modificar cualquier perfil
CREATE POLICY "admin_edita_cualquier_perfil"
  ON perfiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'admin'
    )
  );

-- ─── 4. Primer usuario admin ─────────────────────────────────────────────────
-- IMPORTANTE: Después de crear tu primer usuario desde la app,
-- ejecutar esta línea reemplazando el email para darle rol de admin.
-- Solo hace falta hacerlo una vez.
--
-- UPDATE perfiles
-- SET rol = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'
-- );

-- ─── 5. Verificar que todo está bien ─────────────────────────────────────────
SELECT
  table_name,
  row_security
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'perfiles';
-- ═══════════════════════════════════════════════════════════════════
-- CORAL VOCES — SQL Fase 2: Repertorio + Google Drive
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- (Requiere haber ejecutado el SQL de la Fase 1 antes)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Tabla de obras ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obras (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo                TEXT        NOT NULL,
  compositor            TEXT,
  estado                TEXT        NOT NULL DEFAULT 'estudio'
                                      CHECK (estado IN ('estudio','activo','concierto','archivado')),
  descripcion           TEXT,
  notas_director        TEXT,

  -- IDs de Google Drive (solo el ID, no la URL completa)
  drive_partitura_id    TEXT,
  drive_audio_general   TEXT,
  drive_audio_soprano   TEXT,
  drive_audio_contralto TEXT,
  drive_audio_tenor     TEXT,
  drive_audio_bajo      TEXT,

  publicada             BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Tabla de progreso de estudio ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progreso_estudio (
  perfil_id   UUID        NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  obra_id     UUID        NOT NULL REFERENCES obras(id)    ON DELETE CASCADE,
  estado      TEXT        NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente','en_progreso','estudiada')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (perfil_id, obra_id)
);

-- ─── 3. Row Level Security: obras ────────────────────────────────────────────
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver obras publicadas
CREATE POLICY "ver_obras_publicadas"
  ON obras FOR SELECT
  USING (
    publicada = TRUE
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('director', 'admin')
    )
  );

-- Solo admin y director pueden crear obras
CREATE POLICY "admin_crea_obras"
  ON obras FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('director', 'admin')
    )
  );

-- Solo admin y director pueden modificar obras
CREATE POLICY "admin_modifica_obras"
  ON obras FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('director', 'admin')
    )
  );

-- Solo admin puede eliminar obras
CREATE POLICY "admin_elimina_obras"
  ON obras FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ─── 4. Row Level Security: progreso_estudio ─────────────────────────────────
ALTER TABLE progreso_estudio ENABLE ROW LEVEL SECURITY;

-- Cada cantante ve y gestiona su propio progreso
CREATE POLICY "ver_propio_progreso"
  ON progreso_estudio FOR SELECT
  USING (perfil_id = auth.uid());

CREATE POLICY "gestionar_propio_progreso"
  ON progreso_estudio FOR INSERT
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "actualizar_propio_progreso"
  ON progreso_estudio FOR UPDATE
  USING (perfil_id = auth.uid());

-- Admin puede ver todo el progreso
CREATE POLICY "admin_ve_todo_progreso"
  ON progreso_estudio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('director', 'admin')
    )
  );

-- ─── 5. Trigger: actualizar fecha de modificación en obras ───────────────────
CREATE OR REPLACE FUNCTION actualizar_fecha_obra()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER obras_actualizar_fecha
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_obra();

-- ─── 6. Obras de ejemplo (opcional — borrar si no querés datos de prueba) ────
-- INSERT INTO obras (titulo, compositor, estado, notas_director, publicada)
-- VALUES
--   ('Ave Verum Corpus', 'Mozart', 'estudio', 'Atención a la entrada del compás 12.', true),
--   ('Hallelujah', 'Händel', 'activo', null, true),
--   ('Kyrie', 'Fauré', 'concierto', 'Sostener el final con buen apoyo.', true);

-- ─── 7. Verificar ────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('obras', 'progreso_estudio');
-- ═══════════════════════════════════════════════════════════════════
-- CORAL VOCES — SQL Fase 3: Calendario + Asistencias
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- (Requiere SQL de Fases 1 y 2 ejecutados antes)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Tabla de eventos ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT        NOT NULL,
  tipo         TEXT        NOT NULL DEFAULT 'ensayo'
                             CHECK (tipo IN ('ensayo','concierto','reunion','extra')),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin    TIMESTAMPTZ,
  lugar        TEXT,
  direccion    TEXT,
  notas        TEXT,
  publicado    BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Tabla de relación evento ↔ obras ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos_obras (
  evento_id  UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  obra_id    UUID NOT NULL REFERENCES obras(id)   ON DELETE CASCADE,
  orden      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (evento_id, obra_id)
);

-- ─── 3. Tabla de asistencias ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asistencias (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID        NOT NULL REFERENCES eventos(id)  ON DELETE CASCADE,
  perfil_id   UUID        NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  estado      TEXT        NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('confirmado','no_asiste','pendiente')),
  actualizado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (evento_id, perfil_id)
);

-- ─── 4. RLS: eventos ─────────────────────────────────────────────────────────
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver_eventos_publicados"
  ON eventos FOR SELECT
  USING (
    publicado = TRUE
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin'))
  );

CREATE POLICY "admin_crea_eventos"
  ON eventos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_modifica_eventos"
  ON eventos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_elimina_eventos"
  ON eventos FOR DELETE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'));

-- ─── 5. RLS: eventos_obras ───────────────────────────────────────────────────
ALTER TABLE eventos_obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver_eventos_obras"
  ON eventos_obras FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM eventos WHERE id = evento_id AND publicado = TRUE)
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin'))
  );

CREATE POLICY "admin_gestiona_eventos_obras"
  ON eventos_obras FOR ALL
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

-- ─── 6. RLS: asistencias ─────────────────────────────────────────────────────
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Cada cantante ve y gestiona su propia asistencia
CREATE POLICY "ver_propia_asistencia"
  ON asistencias FOR SELECT
  USING (perfil_id = auth.uid());

CREATE POLICY "gestionar_propia_asistencia"
  ON asistencias FOR INSERT
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "actualizar_propia_asistencia"
  ON asistencias FOR UPDATE
  USING (perfil_id = auth.uid());

-- Admin y director ven todas las asistencias
CREATE POLICY "admin_ve_todas_asistencias"
  ON asistencias FOR SELECT
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

-- ─── 7. Índices de rendimiento ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_publicado ON eventos(publicado);
CREATE INDEX IF NOT EXISTS idx_asistencias_evento ON asistencias(evento_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_perfil ON asistencias(perfil_id);

-- ─── 8. Verificar ────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('eventos','eventos_obras','asistencias');
-- ═══════════════════════════════════════════════════════════════════
-- CORAL VOCES — SQL Fase 4: Avisos + Blog
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Tabla de avisos ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avisos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT        NOT NULL,
  cuerpo      TEXT,
  tipo        TEXT        NOT NULL DEFAULT 'material'
                            CHECK (tipo IN ('material','horario','evento','blog','urgente')),
  obra_id     UUID        REFERENCES obras(id)    ON DELETE SET NULL,
  evento_id   UUID        REFERENCES eventos(id)  ON DELETE SET NULL,
  publicado   BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Tabla de lecturas de avisos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avisos_leidos (
  aviso_id    UUID        NOT NULL REFERENCES avisos(id)   ON DELETE CASCADE,
  perfil_id   UUID        NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  leido_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (aviso_id, perfil_id)
);

-- ─── 3. Tabla de artículos del blog ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articulos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT        NOT NULL,
  resumen     TEXT,
  contenido   TEXT,
  categoria   TEXT        CHECK (categoria IN ('tecnica','estudio','noticias','formacion','avisos')),
  autor_id    UUID        REFERENCES perfiles(id) ON DELETE SET NULL,
  publicado   BOOLEAN     NOT NULL DEFAULT FALSE,
  destacado   BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. RLS: avisos ──────────────────────────────────────────────────────────
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver_avisos_publicados"
  ON avisos FOR SELECT
  USING (
    publicado = TRUE
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin'))
  );

CREATE POLICY "admin_crea_avisos"
  ON avisos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_modifica_avisos"
  ON avisos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_elimina_avisos"
  ON avisos FOR DELETE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

-- ─── 5. RLS: avisos_leidos ───────────────────────────────────────────────────
ALTER TABLE avisos_leidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gestionar_propias_lecturas"
  ON avisos_leidos FOR ALL
  USING (perfil_id = auth.uid())
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "admin_ve_lecturas"
  ON avisos_leidos FOR SELECT
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

-- ─── 6. RLS: articulos ───────────────────────────────────────────────────────
ALTER TABLE articulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver_articulos_publicados"
  ON articulos FOR SELECT
  USING (
    publicado = TRUE
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin'))
  );

CREATE POLICY "admin_crea_articulos"
  ON articulos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_modifica_articulos"
  ON articulos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

CREATE POLICY "admin_elimina_articulos"
  ON articulos FOR DELETE
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('director','admin')));

-- ─── 7. Trigger: autor automático en artículos ───────────────────────────────
CREATE OR REPLACE FUNCTION asignar_autor_articulo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autor_id IS NULL THEN
    NEW.autor_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER articulos_asignar_autor
  BEFORE INSERT ON articulos
  FOR EACH ROW
  EXECUTE FUNCTION asignar_autor_articulo();

-- ─── 8. Índices ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_avisos_publicado   ON avisos(publicado);
CREATE INDEX IF NOT EXISTS idx_avisos_tipo        ON avisos(tipo);
CREATE INDEX IF NOT EXISTS idx_avisos_creado      ON avisos(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_articulos_publicado ON articulos(publicado);
CREATE INDEX IF NOT EXISTS idx_articulos_categoria ON articulos(categoria);
CREATE INDEX IF NOT EXISTS idx_articulos_destacado ON articulos(destacado);

-- ─── 9. Verificar ────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('avisos','avisos_leidos','articulos');
