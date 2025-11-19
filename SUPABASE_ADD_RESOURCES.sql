-- =========================================
-- AGREGAR TABLA DE RECURSOS (BLOG)
-- WorkHoops - Sistema de Gestión de Contenido
-- =========================================

-- Crear ENUM para estado de recursos
CREATE TYPE "ResourceStatus" AS ENUM ('draft', 'published');

-- Crear ENUM para categorías de recursos
CREATE TYPE "ResourceCategory" AS ENUM ('preparacion', 'carrera', 'recursos', 'salud', 'tactica', 'mental');

-- Crear tabla de recursos
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    
    CONSTRAINT "resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear índices para mejor performance
CREATE INDEX "resources_slug_idx" ON "resources"("slug");
CREATE INDEX "resources_category_idx" ON "resources"("category");
CREATE INDEX "resources_status_idx" ON "resources"("status");
CREATE INDEX "resources_featured_idx" ON "resources"("featured");
CREATE INDEX "resources_publishedAt_idx" ON "resources"("publishedAt");
CREATE INDEX "resources_userId_idx" ON "resources"("userId");

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla de recursos creada exitosamente';
    RAISE NOTICE '✅ Índices creados para optimización';
    RAISE NOTICE '✅ Relación con tabla users establecida';
END $$;

-- =========================================
-- DATOS DE EJEMPLO (OPCIONAL - puedes comentar si no quieres)
-- =========================================

-- Obtener un usuario admin para asignar recursos
DO $$
DECLARE
    admin_user_id TEXT;
BEGIN
    -- Buscar usuario admin
    SELECT id INTO admin_user_id FROM "users" WHERE email = 'admin@workhoops.com' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insertar recursos de ejemplo
        INSERT INTO "resources" (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "category",
            "status",
            "featured",
            "featuredImage",
            "author",
            "readTime",
            "userId",
            "createdAt",
            "updatedAt",
            "publishedAt"
        ) VALUES
        (
            'res_' || gen_random_uuid()::text,
            'Cómo prepararte para una prueba de baloncesto profesional',
            'como-prepararte-prueba-baloncesto-profesional',
            'Guía completa con ejercicios específicos, preparación mental y consejos de expertos para destacar en tu próxima prueba.',
            '<h2>Introducción</h2><p>Prepararse para una prueba de baloncesto profesional requiere más que solo habilidades técnicas. En esta guía completa, te mostraremos todos los aspectos que debes considerar.</p><h2>Preparación Física</h2><ul><li>Entrenamiento cardiovascular específico</li><li>Desarrollo de fuerza funcional</li><li>Trabajo de agilidad y velocidad</li></ul><h2>Preparación Mental</h2><p>La confianza y la mentalidad correcta son fundamentales...</p>',
            'preparacion',
            'published',
            true,
            'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
            'Carlos Martínez',
            8,
            admin_user_id,
            NOW(),
            NOW(),
            NOW()
        ),
        (
            'res_' || gen_random_uuid()::text,
            'Plantilla de CV deportivo: Ejemplo práctico',
            'plantilla-cv-deportivo-ejemplo-practico',
            'Descarga nuestra plantilla gratuita y aprende a estructurar tu experiencia deportiva para impresionar a los reclutadores.',
            '<h2>Estructura del CV Deportivo</h2><p>Un CV deportivo efectivo debe incluir las siguientes secciones...</p><h3>1. Datos Personales</h3><p>Información básica de contacto y datos relevantes.</p><h3>2. Experiencia Deportiva</h3><p>Lista cronológica de equipos, logros y estadísticas...</p>',
            'recursos',
            'published',
            false,
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
            'Ana García',
            5,
            admin_user_id,
            NOW(),
            NOW(),
            NOW()
        ),
        (
            'res_' || gen_random_uuid()::text,
            'Prevención de lesiones en baloncesto',
            'prevencion-lesiones-baloncesto',
            'Rutinas de calentamiento, fortalecimiento y estiramientos específicos para evitar las lesiones más comunes.',
            '<h2>Lesiones Más Comunes</h2><p>En el baloncesto, las lesiones más frecuentes incluyen esguinces de tobillo, tendinitis rotuliana y lesiones de rodilla.</p><h2>Prevención Activa</h2><h3>Calentamiento Adecuado</h3><p>Un calentamiento de 15-20 minutos es esencial...</p><h3>Fortalecimiento</h3><ul><li>Ejercicios de core</li><li>Fortalecimiento de tobillos</li><li>Trabajo propioceptivo</li></ul>',
            'salud',
            'published',
            true,
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
            'Dra. Laura Sánchez',
            10,
            admin_user_id,
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Se insertaron 3 recursos de ejemplo';
    ELSE
        RAISE WARNING '⚠️ No se encontró usuario admin. No se insertaron recursos de ejemplo.';
    END IF;
END $$;

-- =========================================
-- VERIFICACIÓN FINAL
-- =========================================
DO $$
DECLARE
    resource_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO resource_count FROM "resources";
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECURSOS CREADOS: %', resource_count;
    RAISE NOTICE '========================================';
END $$;
