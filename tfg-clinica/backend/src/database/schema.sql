-- ============================================================
--  SCHEMA CLÍNICA DEPORTIVA — TFG Daniel Lavín
--  Base de datos: Supabase (PostgreSQL)
--  Generado: 2026-04-15
-- ============================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────
-- LIMPIEZA (orden inverso al de creación por las FK)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS seguimiento_ejercicios CASCADE;
DROP TABLE IF EXISTS seguimiento           CASCADE;
DROP TABLE IF EXISTS entrenamiento_ejercicios CASCADE;
DROP TABLE IF EXISTS entrenamientos        CASCADE;
DROP TABLE IF EXISTS ejercicios            CASCADE;
DROP TABLE IF EXISTS citas                 CASCADE;
DROP TABLE IF EXISTS historial_clinico     CASCADE;
DROP TABLE IF EXISTS pacientes             CASCADE;
DROP TABLE IF EXISTS usuarios              CASCADE;

-- ──────────────────────────────────────────────────────────
-- 1. USUARIOS
--    Profesionales de la clínica: superadmin, admin (con tipo fisio/entrenador)
-- ──────────────────────────────────────────────────────────
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(150)  NOT NULL,
  email       VARCHAR(200)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  rol         VARCHAR(20)   NOT NULL CHECK (rol IN ('superadmin', 'admin')),
  tipo        VARCHAR(50)   NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 2. PACIENTES
-- ──────────────────────────────────────────────────────────
CREATE TABLE pacientes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre            VARCHAR(150) NOT NULL,
  apellidos         VARCHAR(200) NOT NULL,
  fecha_nacimiento  DATE,
  telefono          VARCHAR(20),
  email             VARCHAR(200) UNIQUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 3. HISTORIAL CLÍNICO
--    Cada entrada pertenece a un paciente.
--    Si el paciente se elimina, su historial también.
-- ──────────────────────────────────────────────────────────
CREATE TABLE historial_clinico (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id  UUID         NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  descripcion  TEXT         NOT NULL,
  fecha        DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 4. CITAS
--    Relaciona un paciente con un profesional (usuario).
--    Si el paciente o el usuario se eliminan → CASCADE.
-- ──────────────────────────────────────────────────────────
CREATE TABLE citas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id  UUID        NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  usuario_id   UUID        NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  fecha        TIMESTAMPTZ NOT NULL,
  estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 5. EJERCICIOS
--    Catálogo de ejercicios de la clínica.
-- ──────────────────────────────────────────────────────────
CREATE TABLE ejercicios (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  video_url    VARCHAR(500),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 6. ENTRENAMIENTOS
--    Sesión de entrenamiento asignada a un paciente
--    por un administrador profesional (fisio o entrenador).
-- ──────────────────────────────────────────────────────────
CREATE TABLE entrenamientos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id  UUID        NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  usuario_id   UUID        NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  fecha        DATE        NOT NULL DEFAULT CURRENT_DATE,
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 7. ENTRENAMIENTO_EJERCICIOS (tabla intermedia N:M)
--    Un entrenamiento tiene varios ejercicios, con sus
--    parámetros específicos: series, repeticiones, esfuerzo.
-- ──────────────────────────────────────────────────────────
CREATE TABLE entrenamiento_ejercicios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrenamiento_id  UUID    NOT NULL REFERENCES entrenamientos(id) ON DELETE CASCADE,
  ejercicio_id      UUID    NOT NULL REFERENCES ejercicios(id)     ON DELETE CASCADE,
  series            INT     CHECK (series > 0),
  repeticiones      INT     CHECK (repeticiones > 0),
  esfuerzo          INT     CHECK (esfuerzo BETWEEN 1 AND 10)
);

-- ──────────────────────────────────────────────────────────
-- 8. SEGUIMIENTO
--    El paciente registra cómo le fue en el entrenamiento.
--    Si el entrenamiento se elimina → CASCADE.
-- ──────────────────────────────────────────────────────────
CREATE TABLE seguimiento (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrenamiento_id  UUID        NOT NULL REFERENCES entrenamientos(id) ON DELETE CASCADE,
  dolor             INT         CHECK (dolor BETWEEN 0 AND 10),
  esfuerzo          INT         CHECK (esfuerzo BETWEEN 0 AND 10),
  comentarios       TEXT,
  fecha             DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 9. SEGUIMIENTO_EJERCICIOS
--    Detalle por ejercicio dentro de un seguimiento:
--    esfuerzo real, dificultad y comentario del paciente.
-- ──────────────────────────────────────────────────────────
CREATE TABLE seguimiento_ejercicios (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seguimiento_id UUID        NOT NULL REFERENCES seguimiento(id) ON DELETE CASCADE,
  ejercicio_id   UUID        NOT NULL REFERENCES ejercicios(id),
  esfuerzo_real  INT         CHECK (esfuerzo_real BETWEEN 0 AND 10),
  dificultad     INT         CHECK (dificultad BETWEEN 0 AND 10),
  comentario     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 10. ARCHIVOS DE PACIENTE
--    Documentos, informes y pruebas almacenadas en Supabase Storage.
-- ──────────────────────────────────────────────────────────
CREATE TABLE archivos_paciente (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id  UUID         NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre       VARCHAR(255) NOT NULL,
  path         TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- ÍNDICES (para mejorar rendimiento en consultas frecuentes)
-- ──────────────────────────────────────────────────────────
CREATE INDEX idx_historial_paciente   ON historial_clinico(paciente_id);
CREATE INDEX idx_citas_paciente       ON citas(paciente_id);
CREATE INDEX idx_citas_usuario        ON citas(usuario_id);
CREATE INDEX idx_citas_fecha          ON citas(fecha);
CREATE INDEX idx_entreno_paciente     ON entrenamientos(paciente_id);
CREATE INDEX idx_entreno_usuario      ON entrenamientos(usuario_id);
CREATE INDEX idx_entreno_ej_entreno   ON entrenamiento_ejercicios(entrenamiento_id);
CREATE INDEX idx_entreno_ej_ejercicio ON entrenamiento_ejercicios(ejercicio_id);
CREATE INDEX idx_seguimiento_entreno  ON seguimiento(entrenamiento_id);
CREATE INDEX idx_seg_ej_seguimiento   ON seguimiento_ejercicios(seguimiento_id);
CREATE INDEX idx_seg_ej_ejercicio     ON seguimiento_ejercicios(ejercicio_id);
CREATE INDEX idx_archivos_paciente    ON archivos_paciente(paciente_id);

-- ──────────────────────────────────────────────────────────
-- 10. SEGURIDAD — ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_clinico ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamiento_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos_paciente ENABLE ROW LEVEL SECURITY;

-- Forzar RLS para todos los roles (incluyendo propietarios de tabla)
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;
ALTER TABLE pacientes FORCE ROW LEVEL SECURITY;
ALTER TABLE historial_clinico FORCE ROW LEVEL SECURITY;
ALTER TABLE citas FORCE ROW LEVEL SECURITY;
ALTER TABLE ejercicios FORCE ROW LEVEL SECURITY;
ALTER TABLE entrenamientos FORCE ROW LEVEL SECURITY;
ALTER TABLE entrenamiento_ejercicios FORCE ROW LEVEL SECURITY;
ALTER TABLE seguimiento FORCE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_ejercicios FORCE ROW LEVEL SECURITY;
ALTER TABLE archivos_paciente FORCE ROW LEVEL SECURITY;

-- Funciones para obtener contexto del usuario (Backend Node.js Integration)
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
  BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
  EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS TEXT AS $$
  BEGIN
    RETURN current_setting('app.current_user_role', TRUE);
  EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$ LANGUAGE plpgsql STABLE;

-- Políticas de Usuarios
CREATE POLICY usuarios_superadmin ON usuarios FOR ALL USING (get_current_user_role() = 'superadmin');
CREATE POLICY usuarios_self ON usuarios FOR SELECT USING (id = get_current_user_id());

-- Políticas de Pacientes
CREATE POLICY pacientes_access ON pacientes FOR ALL USING (get_current_user_role() IN ('superadmin', 'admin'));

-- Políticas de Citas (RESTRICCIÓN DE PROPIEDAD)
CREATE POLICY citas_superadmin ON citas FOR ALL USING (get_current_user_role() = 'superadmin');
CREATE POLICY citas_admin ON citas FOR ALL USING (usuario_id = get_current_user_id());

-- Políticas de Entrenamientos (RESTRICCIÓN DE PROPIEDAD)
CREATE POLICY entrenamientos_superadmin ON entrenamientos FOR ALL USING (get_current_user_role() = 'superadmin');
CREATE POLICY entrenamientos_admin ON entrenamientos FOR ALL USING (usuario_id = get_current_user_id());

-- Políticas de Seguimiento y Ejercicios (Herencia de acceso)
CREATE POLICY seguimiento_access ON seguimiento FOR ALL USING (EXISTS (SELECT 1 FROM entrenamientos e WHERE e.id = entrenamiento_id));
CREATE POLICY entreno_ej_access ON entrenamiento_ejercicios FOR ALL USING (EXISTS (SELECT 1 FROM entrenamientos e WHERE e.id = entrenamiento_id));
CREATE POLICY seguimiento_ej_access ON seguimiento_ejercicios FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM seguimiento s
    JOIN entrenamientos e ON e.id = s.entrenamiento_id
    WHERE s.id = seguimiento_id
  )
);

-- Políticas de Archivos
CREATE POLICY archivos_access ON archivos_paciente FOR ALL USING (get_current_user_role() IN ('superadmin', 'admin'));
