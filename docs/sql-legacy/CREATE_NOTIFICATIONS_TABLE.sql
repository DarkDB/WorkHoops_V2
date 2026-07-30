-- Crear tabla de notificaciones
-- Ejecutar este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    
    CONSTRAINT "notifications_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");

-- Verificar que se creó correctamente
SELECT COUNT(*) as total_notifications FROM notifications;
