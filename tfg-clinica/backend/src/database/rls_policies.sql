-- ============================================================
--  POLÍTICAS RLS (Row Level Security) — Clínica Deportiva
-- ============================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_clinico ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamiento_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos_paciente ENABLE ROW LEVEL SECURITY;

-- 2. Funciones auxiliares para obtener contexto del usuario desde la sesión
--    Esto permite que RLS funcione con un backend externo (Node.js)
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
  BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS TEXT AS $$
  BEGIN
    RETURN current_setting('app.current_user_role', TRUE);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql STABLE;

-- 3. POLÍTICAS PARA LA TABLA 'usuarios'
-- El superadmin puede ver todo. Los admin solo pueden ver su propio perfil.
CREATE POLICY usuarios_superadmin_all ON usuarios
  FOR ALL USING (get_current_user_role() = 'superadmin');

CREATE POLICY usuarios_self_read ON usuarios
  FOR SELECT USING (id = get_current_user_id());

-- 4. POLÍTICAS PARA LA TABLA 'pacientes'
-- Todos los profesionales (admin y superadmin) pueden ver y gestionar pacientes.
CREATE POLICY pacientes_profesionales_all ON pacientes
  FOR ALL USING (get_current_user_role() IN ('superadmin', 'admin'));

-- 5. POLÍTICAS PARA LA TABLA 'citas'
-- Superadmin: todo. Admin: solo sus propias citas.
CREATE POLICY citas_superadmin_all ON citas
  FOR ALL USING (get_current_user_role() = 'superadmin');

CREATE POLICY citas_admin_registros ON citas
  FOR ALL USING (usuario_id = get_current_user_id());

-- 6. POLÍTICAS PARA LA TABLA 'entrenamientos'
-- Superadmin: todo. Admin: solo sus propios entrenamientos.
CREATE POLICY entrenamientos_superadmin_all ON entrenamientos
  FOR ALL USING (get_current_user_role() = 'superadmin');

CREATE POLICY entrenamientos_admin_registros ON entrenamientos
  FOR ALL USING (usuario_id = get_current_user_id());

-- 7. POLÍTICAS PARA 'entrenamiento_ejercicios'
-- Acceso si se tiene acceso al entrenamiento padre.
CREATE POLICY entreno_ej_access ON entrenamiento_ejercicios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM entrenamientos e 
      WHERE e.id = entrenamiento_id
    )
  );

-- 8. POLÍTICAS PARA 'seguimiento'
-- Acceso si se tiene acceso al entrenamiento padre.
CREATE POLICY seguimiento_access ON seguimiento
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM entrenamientos e 
      WHERE e.id = entrenamiento_id
    )
  );

-- 9. POLÍTICAS PARA 'archivos_paciente'
-- Todos los profesionales pueden gestionar archivos de pacientes.
CREATE POLICY archivos_profesionales_all ON archivos_paciente
  FOR ALL USING (get_current_user_role() IN ('superadmin', 'admin'));

-- 10. POLÍTICAS PARA 'ejercicios'
-- Catálogo de ejercicios: lectura para todos, gestión para superadmin.
CREATE POLICY ejercicios_read ON ejercicios
  FOR SELECT USING (get_current_user_role() IN ('superadmin', 'admin'));

CREATE POLICY ejercicios_write_superadmin ON ejercicios
  FOR ALL USING (get_current_user_role() = 'superadmin');

-- 11. POLÍTICAS PARA 'historial_clinico'
-- Gestión por parte de cualquier profesional.
CREATE POLICY historial_profesionales_all ON historial_clinico
  FOR ALL USING (get_current_user_role() IN ('superadmin', 'admin'));
