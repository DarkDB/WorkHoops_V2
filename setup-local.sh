#!/bin/bash

echo "🏀 WorkHoops - Setup Local Development"
echo "======================================"

echo "1️⃣ Limpiando cache y generando Prisma..."
rm -rf node_modules/.prisma
rm -rf .next

echo "2️⃣ Asegurando schema SQLite..."
cp prisma/schema-sqlite.prisma prisma/schema.prisma

echo "3️⃣ Configurando entorno local..."
if [ ! -f .env ]; then
    echo "DATABASE_URL=\"file:./dev.db\"" > .env
    echo "NEXTAUTH_SECRET=\"workhoops-secret-key-min-32-chars-local-dev\"" >> .env
    echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env
    echo "APP_URL=\"http://localhost:3000\"" >> .env
    echo "SUPPORT_EMAIL=\"support@workhoops.es\"" >> .env
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

echo "4️⃣ Instalando dependencias..."
yarn install

echo "5️⃣ Inicializando base de datos..."
yarn db:push
yarn db:seed

echo "6️⃣ Verificando build..."
yarn build

echo ""
echo "🎉 ¡Setup completado!"
echo "💻 Ejecuta: yarn dev"
echo "🌐 Visita: http://localhost:3000"
echo ""
echo "📝 Notas:"
echo "   - SQLite para desarrollo local"
echo "   - PostgreSQL para producción (Vercel)"
echo "   - Schema switching automático"