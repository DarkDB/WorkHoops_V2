-- =========================================
-- VERIFICAR DATOS ANTES DE LIMPIAR
-- Script de consulta (solo lectura)
-- =========================================
-- INSTRUCCIONES:
-- Ejecuta este script ANTES del script de limpieza
-- para ver qué datos tienes en la base de datos
-- =========================================

-- Ver todos los usuarios
SELECT 
  id,
  name,
  email,
  role,
  "planType",
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== OPORTUNIDADES ====================' as info;

-- Ver todas las oportunidades
SELECT 
  id,
  slug,
  title,
  "organizationName",
  status,
  "createdAt",
  "userId"
FROM "Opportunity"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== PERFILES DE TALENTO (JUGADORES) ====================' as info;

-- Ver perfiles de jugadores
SELECT 
  id,
  "fullName",
  position,
  city,
  "profileCompletionPercentage",
  "isPublic",
  "createdAt",
  "userId"
FROM "TalentProfile"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== PERFILES DE COACH ====================' as info;

-- Ver perfiles de coaches
SELECT 
  id,
  "fullName",
  city,
  "currentLevel",
  "profileCompletionPercentage",
  "isPublic",
  "createdAt",
  "userId"
FROM "CoachProfile"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== PERFILES DE CLUB/AGENCIA ====================' as info;

-- Ver perfiles de clubs/agencias
SELECT 
  id,
  "commercialName",
  "legalName",
  city,
  "profileCompletionPercentage",
  "createdAt",
  "userId"
FROM "ClubAgencyProfile"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== APLICACIONES ====================' as info;

-- Ver aplicaciones
SELECT 
  id,
  "applicantName",
  "applicantEmail",
  status,
  "createdAt",
  "opportunityId",
  "userId"
FROM "Application"
ORDER BY "createdAt" DESC;

-- Separador
SELECT '==================== RESUMEN ====================' as info;

-- Resumen de conteos
SELECT 
  (SELECT COUNT(*) FROM "User") as total_usuarios,
  (SELECT COUNT(*) FROM "User" WHERE email = 'admin@workhoops.com') as admin_existe,
  (SELECT COUNT(*) FROM "Opportunity") as total_oportunidades,
  (SELECT COUNT(*) FROM "Application") as total_aplicaciones,
  (SELECT COUNT(*) FROM "TalentProfile") as total_perfiles_talento,
  (SELECT COUNT(*) FROM "CoachProfile") as total_perfiles_coach,
  (SELECT COUNT(*) FROM "ClubAgencyProfile") as total_perfiles_club;
