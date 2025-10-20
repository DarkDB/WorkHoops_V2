-- HABILITAR RLS Y CREAR POLÍTICAS BÁSICAS
-- Ejecutar en Supabase SQL Editor después del setup principal

-- Habilitar RLS en todas las tablas
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas (temporalmente para que funcione todo)
-- NOTA: En producción final, estas políticas deberían ser más restrictivas

-- Políticas para users
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para accounts (NextAuth)
CREATE POLICY "Allow all operations on accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);

-- Políticas para sessions (NextAuth)
CREATE POLICY "Allow all operations on sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

-- Políticas para verification_tokens (NextAuth)
CREATE POLICY "Allow all operations on verification_tokens" ON public.verification_tokens FOR ALL USING (true) WITH CHECK (true);

-- Políticas para organizations
CREATE POLICY "Allow all operations on organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);

-- Políticas para opportunities
CREATE POLICY "Allow all operations on opportunities" ON public.opportunities FOR ALL USING (true) WITH CHECK (true);

-- Políticas para applications
CREATE POLICY "Allow all operations on applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

-- Políticas para favorites
CREATE POLICY "Allow all operations on favorites" ON public.favorites FOR ALL USING (true) WITH CHECK (true);

-- Políticas para email_subscriptions
CREATE POLICY "Allow all operations on email_subscriptions" ON public.email_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'accounts', 'sessions', 'verification_tokens', 'organizations', 'opportunities', 'applications', 'favorites', 'email_subscriptions')
ORDER BY tablename;