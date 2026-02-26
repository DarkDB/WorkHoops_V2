# INFORME TÉCNICO - WorkHoops
## Plataforma de Oportunidades de Baloncesto

**Fecha**: 26 de Febrero de 2026  
**Versión**: 1.0.0  
**Preparado para**: Revisión CTO Externo

---

## 1. ARQUITECTURA GENERAL

### 1.1 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2.5 |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Runtime** | Node.js | ≥18.0.0 |
| **Base de Datos** | PostgreSQL | (via Supabase) |
| **ORM** | Prisma | 5.15.0 |
| **Autenticación** | NextAuth.js | 4.24.7 |
| **Pagos** | Stripe | 16.2.0 |
| **Email** | Resend | 3.4.0 |
| **Storage** | Supabase Storage | 2.83.0 |
| **Estilos** | Tailwind CSS | 3.4.4 |
| **UI Components** | Radix UI / shadcn | Latest |
| **Analytics** | Vercel Analytics | 1.5.0 |

### 1.2 Dependencias Clave

```json
{
  "core": {
    "next": "14.2.5",
    "react": "18.3.1",
    "typescript": "5.9.3"
  },
  "database": {
    "@prisma/client": "5.15.0",
    "prisma": "5.15.0"
  },
  "auth": {
    "next-auth": "4.24.7",
    "@auth/prisma-adapter": "2.4.0",
    "bcryptjs": "3.0.2"
  },
  "payments": {
    "stripe": "16.2.0"
  },
  "email": {
    "resend": "3.4.0"
  },
  "storage": {
    "@supabase/supabase-js": "2.83.0",
    "@aws-sdk/client-s3": "3.614.0"
  },
  "ui": {
    "tailwindcss": "3.4.4",
    "lucide-react": "0.400.0",
    "@radix-ui/*": "latest"
  },
  "forms": {
    "react-hook-form": "7.52.1",
    "zod": "3.23.8",
    "@hookform/resolvers": "3.6.0"
  },
  "utilities": {
    "date-fns": "3.6.0",
    "nanoid": "5.0.7",
    "dompurify": "3.1.6"
  }
}
```

### 1.3 Estructura de Carpetas

```
/app
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (36 endpoints)
│   │   ├── admin/               # Admin endpoints
│   │   ├── applications/        # Job applications
│   │   ├── auth/                # Authentication
│   │   ├── club-agency/         # Club/Agency profiles
│   │   ├── coach/               # Coach profiles
│   │   ├── dashboard/           # Dashboard analytics
│   │   ├── favorites/           # Saved opportunities
│   │   ├── notifications/       # Real-time notifications
│   │   ├── opportunities/       # Job opportunities CRUD
│   │   ├── organizations/       # Organization management
│   │   ├── resources/           # Blog/Resources
│   │   ├── stripe/              # Payment webhooks
│   │   ├── talent/              # Talent profiles
│   │   ├── uploads/             # File uploads
│   │   └── user/                # User management
│   │
│   ├── admin/                    # Admin pages
│   ├── auth/                     # Login/Register pages
│   ├── checkout/                 # Payment flow
│   ├── clubes/                   # Club directory
│   ├── dashboard/                # User dashboard
│   ├── legal/                    # Legal pages
│   ├── oportunidades/            # Opportunities listing
│   ├── planes/                   # Pricing page
│   ├── profile/                  # User profile
│   ├── publicar/                 # Create opportunity
│   ├── recursos/                 # Blog/Resources
│   ├── sobre/                    # About page
│   └── talento/                  # Talent directory
│
├── components/                   # React Components (53 files)
│   ├── ui/                       # shadcn/UI base components
│   ├── onboarding/              # Multi-step onboarding
│   └── providers/               # Context providers
│
├── lib/                          # Utilities & Services
│   ├── auth.ts                   # NextAuth configuration
│   ├── email.ts                  # Email templates (665 lines)
│   ├── notifications.ts          # Notification helpers
│   ├── prisma.ts                 # Database client
│   ├── rate-limit.ts            # Rate limiting
│   ├── s3.ts                     # S3/Storage utilities
│   ├── sanitize.ts              # XSS protection
│   ├── stripe.ts                 # Payment integration
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod schemas
│
├── prisma/
│   ├── schema.prisma             # Database schema (611 lines)
│   ├── seed.ts                   # Development seeding
│   └── seed-production.ts        # Production seeding
│
├── types/
│   └── next-auth.d.ts            # TypeScript augmentation
│
└── public/                       # Static assets
```

### 1.4 Servicios Externos Conectados

| Servicio | Propósito | Estado |
|----------|-----------|--------|
| **Supabase** | PostgreSQL + Storage + Auth | ✅ Producción |
| **Stripe** | Pagos y suscripciones | ✅ Producción |
| **Resend** | Emails transaccionales | ✅ Producción |
| **Vercel** | Hosting + Analytics + Speed Insights | ✅ Producción |

### 1.5 Variables de Entorno (.env.example)

```env
# Database - PostgreSQL (Supabase)
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="min-32-chars-secret-key"

# Email Service (Resend)
RESEND_API_KEY="re_xxxxx"

# Application
APP_URL="https://your-domain.com"
SUPPORT_EMAIL="support@your-domain.com"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
STRIPE_PRICE_PRO_SEMIPRO="price_xxxxx"
STRIPE_PRICE_PRO_SEMIPRO_ANNUAL="price_xxxxx"
STRIPE_PRICE_DESTACADO="price_xxxxx"

# Upload Settings
MAX_FILE_SIZE_MB="10"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

---

## 2. BASE DE DATOS

### 2.1 Esquema Completo (Diagrama Simplificado)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │  Organization   │     │   Opportunity   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ ownerId (FK)    │     │ id (PK)         │
│ email           │     │ id (PK)         │────<│ organizationId  │
│ name            │     │ name            │     │ authorId (FK)   │>───┐
│ role (enum)     │     │ slug            │     │ title           │    │
│ planType        │     │ verified        │     │ type (enum)     │    │
│ stripeCustomerId│     └─────────────────┘     │ status (enum)   │    │
└────────┬────────┘                             │ level (enum)    │    │
         │                                      │ deadline        │    │
         │     ┌────────────────────────────────┴─────────────────┘    │
         │     │                                                        │
         │     │  ┌─────────────────┐     ┌─────────────────┐          │
         │     │  │   Application   │     │    Favorite     │          │
         │     │  ├─────────────────┤     ├─────────────────┤          │
         │     └─>│ opportunityId   │     │ opportunityId   │<─────────┤
         │        │ userId (FK)     │<────│ userId (FK)     │          │
         └───────>│ state (enum)    │     └─────────────────┘          │
                  │ message         │                                   │
                  └─────────────────┘                                   │
                                                                        │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐    │
│  TalentProfile  │     │  CoachProfile   │     │ClubAgencyProfile│    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤    │
│ userId (FK,UK)  │<────│ userId (FK,UK)  │<────│ userId (FK,UK)  │<───┘
│ fullName        │     │ fullName        │     │ legalName       │
│ position        │     │ currentLevel    │     │ entityType      │
│ height/weight   │     │ skills (1-5)    │     │ city            │
│ playerSkills    │>──┐ │ certifications  │     │ verified        │
└─────────────────┘   │ └─────────────────┘     └─────────────────┘
                      │
                      │  ┌─────────────────┐
                      │  │  PlayerSkills   │
                      │  ├─────────────────┤
                      └─>│ talentProfileId │
                         │ threePointShot  │
                         │ defense (1-5)   │
                         └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Subscription   │     │   Notification  │     │    Resource     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ userId (FK)     │     │ userId (FK)     │     │ userId (FK)     │
│ stripeSubId     │     │ type            │     │ title           │
│ status          │     │ title           │     │ category (enum) │
│ planType        │     │ read            │     │ status (enum)   │
│ periodStart/End │     │ link            │     │ views           │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Tablas con Campos y Tipos

#### Users (`users`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | String | PK, cuid() |
| email | String | UNIQUE |
| emailVerified | DateTime? | - |
| name | String? | - |
| image | String? | - |
| role | UserRole | DEFAULT: jugador |
| locale | String | DEFAULT: "es" |
| verified | Boolean | DEFAULT: false |
| planType | String | DEFAULT: "free_amateur" |
| planStart | DateTime? | - |
| planEnd | DateTime? | - |
| isActive | Boolean | DEFAULT: true |
| stripeCustomerId | String? | - |
| stripeSubscriptionId | String? | - |
| createdAt | DateTime | DEFAULT: now() |
| updatedAt | DateTime | @updatedAt |

#### Opportunities (`opportunities`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | String | PK, cuid() |
| title | String | NOT NULL |
| slug | String | UNIQUE |
| description | String | NOT NULL |
| type | OpportunityType | NOT NULL |
| status | OpportunityStatus | DEFAULT: borrador |
| level | OpportunityLevel | NOT NULL |
| city | String? | - |
| country | String | DEFAULT: "España" |
| latitude | Float? | - |
| longitude | Float? | - |
| modality | Modality | DEFAULT: presencial |
| remunerationType | String? | - |
| remunerationMin | Float? | - |
| remunerationMax | Float? | - |
| currency | String | DEFAULT: "EUR" |
| benefits | String? | - |
| deadline | DateTime? | - |
| startDate | DateTime? | - |
| endDate | DateTime? | - |
| publishedAt | DateTime? | - |
| tags | String? | - |
| verified | Boolean | DEFAULT: false |
| contactEmail | String | NOT NULL |
| contactPhone | String? | - |
| applicationUrl | String? | - |
| organizationId | String? | FK → organizations |
| authorId | String | FK → users |
| createdAt | DateTime | DEFAULT: now() |
| updatedAt | DateTime | @updatedAt |

#### Applications (`applications`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | String | PK, cuid() |
| state | ApplicationState | DEFAULT: enviada |
| message | String? | - |
| opportunityId | String | FK → opportunities |
| userId | String | FK → users |
| createdAt | DateTime | DEFAULT: now() |
| updatedAt | DateTime | @updatedAt |

**Constraint**: UNIQUE(userId, opportunityId)

#### TalentProfile (`talent_profiles`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | String | PK, cuid() |
| userId | String | FK → users, UNIQUE |
| fullName | String | NOT NULL |
| birthDate | DateTime | NOT NULL |
| role | String | NOT NULL |
| city | String | NOT NULL |
| country | String | DEFAULT: "España" |
| position | String? | - |
| secondaryPosition | String? | - |
| height | Int? | cm |
| weight | Int? | kg |
| wingspan | Int? | cm |
| dominantHand | String? | - |
| currentLevel | String? | - |
| lastTeam | String? | - |
| playingStyle | String? | JSON array |
| languages | String? | JSON array |
| willingToTravel | Boolean | DEFAULT: false |
| bio | String? | - |
| videoUrl | String? | - |
| photoUrls | String? | JSON array |
| profileCompletionPercentage | Int | DEFAULT: 0 |
| isPublic | Boolean | DEFAULT: true |
| verified | Boolean | DEFAULT: false |

### 2.3 Enums

```sql
-- Roles de usuario
CREATE TYPE "UserRole" AS ENUM ('admin', 'jugador', 'entrenador', 'club', 'agencia');

-- Tipos de oportunidad
CREATE TYPE "OpportunityType" AS ENUM ('empleo', 'prueba', 'torneo', 'clinica', 'beca', 'patrocinio');

-- Estados de oportunidad
CREATE TYPE "OpportunityStatus" AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada', 'cancelada');

-- Niveles de oportunidad
CREATE TYPE "OpportunityLevel" AS ENUM ('amateur', 'semi_profesional', 'profesional', 'cantera');

-- Modalidad
CREATE TYPE "Modality" AS ENUM ('presencial', 'online', 'mixta');

-- Estados de aplicación
CREATE TYPE "ApplicationState" AS ENUM ('enviada', 'en_revision', 'aceptada', 'rechazada', 'finalizada');

-- Estados de recursos
CREATE TYPE "ResourceStatus" AS ENUM ('draft', 'published');

-- Categorías de recursos
CREATE TYPE "ResourceCategory" AS ENUM ('preparacion', 'carrera', 'recursos', 'salud', 'tactica', 'mental');
```

### 2.4 Índices

```sql
-- Users
CREATE UNIQUE INDEX users_email_key ON users(email);

-- Opportunities
CREATE UNIQUE INDEX opportunities_slug_key ON opportunities(slug);

-- Applications
CREATE UNIQUE INDEX applications_userId_opportunityId_key ON applications("userId", "opportunityId");

-- Favorites
CREATE UNIQUE INDEX favorites_userId_opportunityId_key ON favorites("userId", "opportunityId");

-- Talent Profiles
CREATE UNIQUE INDEX talent_profiles_userId_key ON talent_profiles("userId");

-- Coach Profiles
CREATE UNIQUE INDEX coach_profiles_userId_key ON coach_profiles("userId");

-- Club Agency Profiles
CREATE UNIQUE INDEX club_agency_profiles_userId_key ON club_agency_profiles("userId");

-- Resources
CREATE INDEX resources_slug_idx ON resources(slug);
CREATE INDEX resources_category_idx ON resources(category);
CREATE INDEX resources_status_idx ON resources(status);
CREATE INDEX resources_featured_idx ON resources(featured);
CREATE INDEX resources_publishedAt_idx ON resources("publishedAt");

-- Notifications
CREATE INDEX notifications_userId_idx ON notifications("userId");
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_createdAt_idx ON notifications("createdAt");

-- Interest Notifications
CREATE INDEX interest_notifications_profileId_idx ON interest_notifications("profileId");
CREATE INDEX interest_notifications_interestedUserId_idx ON interest_notifications("interestedUserId");
CREATE INDEX interest_notifications_status_idx ON interest_notifications(status);
```

### 2.5 RLS Policies (Supabase)

> **Nota**: RLS está actualmente DESHABILITADO en todas las tablas para simplificar el desarrollo. Se recomienda habilitar antes de producción.

```sql
-- Ejemplo de políticas recomendadas para producción:

-- Users: Solo lectura del propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Opportunities: Lectura pública de publicadas
CREATE POLICY "Public can view published opportunities" ON opportunities
  FOR SELECT USING (status = 'publicada');

-- Applications: Solo el aplicante o dueño de la oportunidad
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (
    auth.uid() = "userId" OR 
    auth.uid() IN (SELECT "authorId" FROM opportunities WHERE id = "opportunityId")
  );
```

### 2.6 Migraciones

El proyecto utiliza `prisma db push` para sincronización directa con la base de datos. No hay migraciones versionadas en este momento.

**Scripts de migración manual disponibles en `/app/`:**
- `SUPABASE_ADD_COACH_AND_CLUB_PROFILES.sql`
- `SUPABASE_ADD_TALENT_TABLE.sql`
- `SUPABASE_ADD_RESOURCES.sql`
- `CREATE_NOTIFICATIONS_TABLE.sql`
- `SUPABASE_MIGRATE_APPLICATION_STATES.sql`

---

## 3. SISTEMA DE AUTENTICACIÓN

### 3.1 Flujo de Autenticación

```
┌──────────────────────────────────────────────────────────────────┐
│                     FLUJO DE AUTENTICACIÓN                        │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │     │   NextAuth  │     │   Prisma    │
│  (Browser)  │     │   (Server)  │     │    (DB)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                   │
       │  1. POST /api/auth/register            │
       │────────────────────>                   │
       │                    │                   │
       │                    │  2. Check email   │
       │                    │────────────────────>
       │                    │                   │
       │                    │  3. Create user   │
       │                    │────────────────────>
       │                    │                   │
       │  4. Return success │<──────────────────│
       │<───────────────────│                   │
       │                    │                   │
       │  5. POST /api/auth/signin              │
       │────────────────────>                   │
       │                    │                   │
       │                    │  6. Validate      │
       │                    │────────────────────>
       │                    │                   │
       │                    │  7. Return user   │
       │                    │<──────────────────│
       │                    │                   │
       │  8. Generate JWT   │                   │
       │<───────────────────│                   │
       │                    │                   │
       │  9. Set cookie     │                   │
       │  (next-auth.session-token)             │
       │                    │                   │
```

### 3.2 Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **admin** | Administrador del sistema | Acceso total, aprobar ofertas, gestionar usuarios, importar CSV |
| **jugador** | Jugador de baloncesto | Crear perfil, aplicar a oportunidades, ver dashboard |
| **entrenador** | Entrenador | Crear perfil, aplicar a oportunidades, ver dashboard |
| **club** | Club deportivo | Crear organización, publicar oportunidades, ver candidatos |
| **agencia** | Agencia de representación | Crear organización, publicar oportunidades, ver candidatos |

### 3.3 Middleware y Protección de Rutas

```typescript
// Rutas protegidas por autenticación:
/dashboard/*        → Requiere sesión
/profile/*          → Requiere sesión
/publicar           → Requiere sesión
/admin/*            → Requiere sesión + rol admin
/oportunidades/*/edit → Requiere ser autor o admin

// Rutas públicas:
/                   → Pública
/oportunidades      → Pública
/oportunidades/*    → Pública (con contenido gated)
/recursos           → Pública
/auth/*             → Pública
/planes             → Pública
```

### 3.4 Configuración NextAuth

```typescript
// /lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      // Email + Password authentication
    })
  ],
  callbacks: {
    session({ session, token }) {
      // Adds: id, role, planType to session
    },
    jwt({ token, user }) {
      // Persists: id, role, planType in token
    },
  },
}
```

---

## 4. FUNCIONALIDADES IMPLEMENTADAS

### 4.1 Registro de Jugador/Entrenador

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Registro básico | ✅ | Email + contraseña |
| Onboarding multi-paso | ✅ | 5 pasos para completar perfil |
| Datos personales | ✅ | Nombre, fecha nacimiento, ciudad |
| Datos técnicos | ✅ | Posición, altura, peso, envergadura |
| Habilidades (skills) | ✅ | Sistema de rating 1-5 (15 skills) |
| Estilo de juego | ✅ | Selección múltiple |
| Multimedia | ✅ | Fotos, video highlights |
| Perfil público | ✅ | Visible en directorio |
| Barra de completitud | ✅ | % de perfil completo |

### 4.2 Registro de Club/Agencia

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Registro básico | ✅ | Email + contraseña |
| Onboarding 5 pasos | ✅ | Entidad, contacto, necesidades, condiciones, verificación |
| Datos de la entidad | ✅ | Nombre legal, tipo, ubicación |
| Redes sociales | ✅ | Instagram, Twitter, LinkedIn, YouTube |
| Criterios de fichaje | ✅ | Perfiles buscados, experiencia requerida |
| Condiciones ofrecidas | ✅ | Salario, vivienda, seguro |
| Verificación | ✅ | Logo, fotos de instalaciones |

### 4.3 Publicación de Oportunidades

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Crear oportunidad | ✅ | Formulario completo |
| Tipos soportados | ✅ | Empleo, prueba, torneo, clínica, beca, patrocinio |
| Niveles | ✅ | Amateur, semi-pro, profesional, cantera |
| Geolocalización | ✅ | Ciudad + coordenadas |
| Remuneración | ✅ | Rango min-max + tipo (hora/mes/año) |
| Fecha límite | ✅ | Con badge de vencido |
| Sistema de aprobación | ✅ | Admin aprueba antes de publicar |
| Edición | ✅ | Autor puede editar |
| Listado filtrable | ✅ | Por tipo, nivel, ubicación |
| Ofertas vencidas | ✅ | Badge visual + filtro toggle |

### 4.4 Aplicación a Oportunidades

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Aplicar | ✅ | Un clic + mensaje opcional |
| Estados | ✅ | enviada → en_revision → aceptada/rechazada |
| Prevención duplicados | ✅ | No se puede aplicar dos veces |
| Ver mis aplicaciones | ✅ | Dashboard con filtros |
| Notificación email | ✅ | Al organizador |
| Contenido gated | ✅ | Contacto oculto para no-registrados |

### 4.5 Sistema de Pagos (Stripe)

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Plan Free Amateur | ✅ | Gratis, funcionalidad básica |
| Plan Pro Semipro | ✅ | €4.99/mes o €39/año (suscripción) |
| Plan Destacado | ✅ | €49.90 pago único (60 días) |
| Checkout Stripe | ✅ | Redirect a Stripe |
| Webhooks | ✅ | Actualización automática de plan |
| Prevención re-suscripción | ✅ | No permite suscribirse al mismo plan activo |

### 4.6 Panel de Administración

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Dashboard | ✅ | Estadísticas generales |
| Gestión usuarios | ✅ | Ver, editar roles |
| Gestión oportunidades | ✅ | Aprobar, rechazar, editar |
| Gestión recursos/blog | ✅ | CRUD completo |
| Importación CSV | ✅ | Jugadores, entrenadores, clubes, oportunidades |
| Debug tools | ✅ | Herramientas de diagnóstico |

### 4.7 Funcionalidades Adicionales

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Blog/Recursos | ✅ | Sistema de artículos con categorías |
| Favoritos | ✅ | Guardar oportunidades |
| Notificaciones | 🔄 | Estructura lista, pendiente integrar eventos |
| Analytics Dashboard | ✅ | Estadísticas para usuarios |
| Contador animado | ✅ | Homepage con stats animadas |
| Empty states | ✅ | Componentes para listas vacías |
| Trust badges | ✅ | Footer con badges de confianza |
| SEO | ✅ | Meta tags, SSG para blog |
| Cookies banner | ✅ | GDPR compliant |
| Páginas legales | ✅ | Términos, privacidad, cookies |

---

## 5. ENDPOINTS API

### 5.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |

### 5.2 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| PATCH | `/api/user/update` | Actualizar perfil |
| GET | `/api/user/opportunities-count` | Contar oportunidades del usuario |

### 5.3 Oportunidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/opportunities` | Listar oportunidades |
| POST | `/api/opportunities` | Crear oportunidad |
| GET | `/api/opportunities/[slug]` | Detalle de oportunidad |
| PATCH | `/api/opportunities/[slug]` | Actualizar oportunidad |
| DELETE | `/api/opportunities/[slug]` | Eliminar oportunidad |

### 5.4 Aplicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/applications` | Mis aplicaciones |
| POST | `/api/applications` | Crear aplicación |
| GET | `/api/applications/[id]` | Detalle aplicación |
| PATCH | `/api/applications/[id]` | Cambiar estado |

### 5.5 Perfiles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/api/talent/profile` | Perfil de talento |
| POST | `/api/talent/profile-onboarding` | Onboarding jugador |
| GET | `/api/talent/list` | Listar talentos |
| POST | `/api/talent/notify-interest` | Mostrar interés |
| GET/POST | `/api/coach/profile-onboarding` | Onboarding entrenador |
| GET/POST | `/api/club-agency/profile` | Perfil club/agencia |
| POST | `/api/club-agency/profile-onboarding` | Onboarding club |

### 5.6 Administración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/import` | Importar CSV |
| PATCH | `/api/admin/opportunities/[id]` | Aprobar/rechazar |

### 5.7 Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/stripe/create-checkout` | Crear sesión Stripe |
| POST | `/api/stripe/webhook` | Webhook de Stripe |

### 5.8 Otros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/api/favorites` | Gestionar favoritos |
| GET | `/api/notifications` | Listar notificaciones |
| PATCH | `/api/notifications` | Marcar como leídas |
| GET/POST | `/api/resources` | Blog/Recursos |
| GET | `/api/dashboard/analytics` | Analytics del usuario |
| POST | `/api/uploads/sign` | URL firmada para uploads |

---

## 6. COMPONENTES PRINCIPALES DEL FRONTEND

### 6.1 Componentes de Layout

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Navbar | `Navbar.tsx` | Navegación principal con auth |
| Footer | `Footer.tsx` | Footer con trust badges |
| CookieBanner | `CookieBanner.tsx` | Banner GDPR |

### 6.2 Componentes de Dashboard

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| AdminDashboard | `AdminDashboard.tsx` | Panel admin completo |
| AdminUsersManager | `AdminUsersManager.tsx` | Gestión de usuarios |
| AdminOpportunitiesManager | `AdminOpportunitiesManager.tsx` | Gestión de ofertas |
| AdminResourcesManager | `AdminResourcesManager.tsx` | Gestión de blog |
| DashboardAnalytics | `DashboardAnalytics.tsx` | Métricas del usuario |
| DashboardClubAgency | `DashboardClubAgency.tsx` | Dashboard para clubes |
| CandidatesManager | `CandidatesManager.tsx` | Ver candidatos |

### 6.3 Componentes de Onboarding

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| PlayerProfileOnboarding | `PlayerProfileOnboarding.tsx` | Onboarding jugador |
| CoachProfileOnboarding | `CoachProfileOnboarding.tsx` | Onboarding entrenador |
| ClubAgencyProfileOnboarding | `ClubAgencyProfileOnboarding.tsx` | Onboarding club |

### 6.4 Componentes de UI

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| AnimatedCounter | `AnimatedCounter.tsx` | Contador animado |
| EmptyState | `EmptyState.tsx` | Estado vacío genérico |
| FileDropzone | `FileDropzone.tsx` | Upload de archivos |
| NotificationBell | `NotificationBell.tsx` | Campana de notificaciones |
| RegistrationGate | `RegistrationGate.tsx` | Contenido gated |
| EditOpportunityForm | `EditOpportunityForm.tsx` | Formulario de oportunidad |

### 6.5 Componentes shadcn/UI (17 componentes)

```
/components/ui/
├── alert.tsx        ├── dialog.tsx       ├── progress.tsx
├── avatar.tsx       ├── dropdown-menu.tsx├── select.tsx
├── badge.tsx        ├── form.tsx         ├── skeleton.tsx
├── button.tsx       ├── input.tsx        ├── slider.tsx
├── card.tsx         ├── label.tsx        ├── textarea.tsx
├── checkbox.tsx                          ├── toast.tsx
                                          └── toaster.tsx
```

---

## 7. RESUMEN EJECUTIVO

### 7.1 Estado Actual del Proyecto

| Área | Estado | Comentarios |
|------|--------|-------------|
| **Core Business** | ✅ Funcional | Registro, ofertas, aplicaciones |
| **Pagos** | ✅ Funcional | Stripe integrado |
| **Email** | 🔄 Parcial | Fase 1 completa, 10+ pendientes |
| **Admin** | ✅ Funcional | Panel completo + CSV import |
| **Notificaciones** | 🔄 Parcial | Estructura lista, sin eventos |
| **Analytics** | ✅ Funcional | Dashboard de usuario |
| **SEO** | ✅ Funcional | SSG para blog, meta tags |

### 7.2 Deuda Técnica

1. **RLS deshabilitado** - Se necesita habilitar policies en producción
2. **Migraciones** - No hay versionado de migraciones
3. **Tests** - Sin cobertura de tests automatizados
4. **Password hashing** - Actualmente acepta cualquier contraseña (desarrollo)
5. **Rate limiting** - Implementación básica

### 7.3 Próximos Pasos Recomendados

1. **Seguridad**: Habilitar RLS, implementar password hashing real
2. **Testing**: Implementar tests unitarios y e2e
3. **Email**: Completar las 10+ notificaciones pendientes
4. **Notificaciones**: Integrar eventos en tiempo real
5. **Performance**: Implementar caching con Redis
6. **Monitoreo**: Agregar logging estructurado y alertas

---

## 8. ANEXOS

### 8.1 Schema SQL Completo

Ver archivo: `/app/prisma/schema.prisma` (611 líneas)

### 8.2 Documentación Adicional en el Proyecto

- `EVALUACION_COMPLETA_WORKHOOPS.md` - Evaluación detallada
- `IMPORTACION_MASIVA_DOCUMENTACION.md` - Guía de importación CSV
- `SUPABASE_SETUP.md` - Configuración de Supabase
- `DEPLOYMENT.md` - Guía de despliegue
- `PRODUCTION_CHECKLIST.md` - Checklist para producción

---

**Documento generado automáticamente el 26/02/2026**  
**WorkHoops v1.0.0**
