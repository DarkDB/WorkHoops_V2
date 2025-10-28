-- WorkHoops - Row Level Security (RLS) Policies
-- Fecha: 28 de Octubre 2024
-- Descripción: Políticas RLS para todas las tablas de perfiles

-- =====================================================
-- IMPORTANTE: Ejecutar DESPUÉS de crear las tablas
-- =====================================================

-- =====================================================
-- 1. RLS PARA TALENT_PROFILES (Jugadores)
-- =====================================================

-- Habilitar RLS
ALTER TABLE "talent_profiles" ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver perfiles públicos
CREATE POLICY "talent_profiles_select_public" 
ON "talent_profiles" FOR SELECT 
USING ("isPublic" = true);

-- Política: Usuarios autenticados pueden ver todos los perfiles públicos
CREATE POLICY "talent_profiles_select_authenticated" 
ON "talent_profiles" FOR SELECT 
TO authenticated
USING ("isPublic" = true);

-- Política: Usuario puede ver su propio perfil (público o privado)
CREATE POLICY "talent_profiles_select_own" 
ON "talent_profiles" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "userId");

-- Política: Usuario puede insertar su propio perfil
CREATE POLICY "talent_profiles_insert_own" 
ON "talent_profiles" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede actualizar su propio perfil
CREATE POLICY "talent_profiles_update_own" 
ON "talent_profiles" FOR UPDATE 
TO authenticated
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede eliminar su propio perfil
CREATE POLICY "talent_profiles_delete_own" 
ON "talent_profiles" FOR DELETE 
TO authenticated
USING (auth.uid()::text = "userId");

-- =====================================================
-- 2. RLS PARA PLAYER_SKILLS
-- =====================================================

ALTER TABLE "player_skills" ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver skills de perfiles públicos
CREATE POLICY "player_skills_select_public" 
ON "player_skills" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "player_skills"."talentProfileId" 
    AND "talent_profiles"."isPublic" = true
  )
);

-- Política: Usuario puede ver sus propias skills
CREATE POLICY "player_skills_select_own" 
ON "player_skills" FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "player_skills"."talentProfileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- Política: Usuario puede insertar sus propias skills
CREATE POLICY "player_skills_insert_own" 
ON "player_skills" FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "player_skills"."talentProfileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- Política: Usuario puede actualizar sus propias skills
CREATE POLICY "player_skills_update_own" 
ON "player_skills" FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "player_skills"."talentProfileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- Política: Usuario puede eliminar sus propias skills
CREATE POLICY "player_skills_delete_own" 
ON "player_skills" FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "player_skills"."talentProfileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- =====================================================
-- 3. RLS PARA COACH_PROFILES (Entrenadores)
-- =====================================================

ALTER TABLE "coach_profiles" ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver perfiles públicos de entrenadores
CREATE POLICY "coach_profiles_select_public" 
ON "coach_profiles" FOR SELECT 
USING ("isPublic" = true);

-- Política: Usuarios autenticados pueden ver todos los perfiles públicos
CREATE POLICY "coach_profiles_select_authenticated" 
ON "coach_profiles" FOR SELECT 
TO authenticated
USING ("isPublic" = true);

-- Política: Usuario puede ver su propio perfil
CREATE POLICY "coach_profiles_select_own" 
ON "coach_profiles" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "userId");

-- Política: Usuario puede insertar su propio perfil
CREATE POLICY "coach_profiles_insert_own" 
ON "coach_profiles" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede actualizar su propio perfil
CREATE POLICY "coach_profiles_update_own" 
ON "coach_profiles" FOR UPDATE 
TO authenticated
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede eliminar su propio perfil
CREATE POLICY "coach_profiles_delete_own" 
ON "coach_profiles" FOR DELETE 
TO authenticated
USING (auth.uid()::text = "userId");

-- =====================================================
-- 4. RLS PARA CLUB_AGENCY_PROFILES
-- =====================================================

ALTER TABLE "club_agency_profiles" ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver perfiles públicos de clubs/agencias
CREATE POLICY "club_agency_profiles_select_public" 
ON "club_agency_profiles" FOR SELECT 
USING ("isPublic" = true);

-- Política: Usuarios autenticados pueden ver todos los perfiles públicos
CREATE POLICY "club_agency_profiles_select_authenticated" 
ON "club_agency_profiles" FOR SELECT 
TO authenticated
USING ("isPublic" = true);

-- Política: Usuario puede ver su propio perfil
CREATE POLICY "club_agency_profiles_select_own" 
ON "club_agency_profiles" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "userId");

-- Política: Usuario puede insertar su propio perfil
CREATE POLICY "club_agency_profiles_insert_own" 
ON "club_agency_profiles" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede actualizar su propio perfil
CREATE POLICY "club_agency_profiles_update_own" 
ON "club_agency_profiles" FOR UPDATE 
TO authenticated
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- Política: Usuario puede eliminar su propio perfil
CREATE POLICY "club_agency_profiles_delete_own" 
ON "club_agency_profiles" FOR DELETE 
TO authenticated
USING (auth.uid()::text = "userId");

-- =====================================================
-- 5. RLS PARA INTEREST_NOTIFICATIONS
-- =====================================================

ALTER TABLE "interest_notifications" ENABLE ROW LEVEL SECURITY;

-- Política: Usuario puede ver notificaciones de su propio perfil
CREATE POLICY "interest_notifications_select_profile_owner" 
ON "interest_notifications" FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "interest_notifications"."profileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- Política: Usuario puede ver las notificaciones que ha enviado
CREATE POLICY "interest_notifications_select_sender" 
ON "interest_notifications" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "interestedUserId");

-- Política: Usuario autenticado puede crear notificaciones
CREATE POLICY "interest_notifications_insert_authenticated" 
ON "interest_notifications" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "interestedUserId");

-- Política: Dueño del perfil puede actualizar notificaciones (marcar como leído)
CREATE POLICY "interest_notifications_update_profile_owner" 
ON "interest_notifications" FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "talent_profiles" 
    WHERE "talent_profiles"."id" = "interest_notifications"."profileId" 
    AND "talent_profiles"."userId" = auth.uid()::text
  )
);

-- Política: Usuario puede eliminar notificaciones que envió
CREATE POLICY "interest_notifications_delete_sender" 
ON "interest_notifications" FOR DELETE 
TO authenticated
USING (auth.uid()::text = "interestedUserId");

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Políticas RLS aplicadas exitosamente para:';
  RAISE NOTICE '   - talent_profiles';
  RAISE NOTICE '   - player_skills';
  RAISE NOTICE '   - coach_profiles';
  RAISE NOTICE '   - club_agency_profiles';
  RAISE NOTICE '   - interest_notifications';
  RAISE NOTICE '';
  RAISE NOTICE 'Seguridad de datos configurada correctamente.';
END $$;
