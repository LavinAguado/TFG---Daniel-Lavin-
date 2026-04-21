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

-- ──────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ──────────────────────────────────────────────────────────
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name
     AND c.table_schema = 'public') AS num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
