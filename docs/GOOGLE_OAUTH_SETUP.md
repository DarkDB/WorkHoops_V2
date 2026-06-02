# Google OAuth Setup — WorkHoops V2

Esta guía explica cómo obtener las credenciales de Google OAuth y configurarlas tanto en desarrollo local como en Vercel.

---

## 1. Crear el proyecto en Google Cloud Console

1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/) e inicia sesión con tu cuenta de Google.
2. En la barra superior, haz clic en el selector de proyecto y luego en **"Nuevo proyecto"**.
3. Asigna un nombre (por ejemplo, `WorkHoops`) y haz clic en **"Crear"**.

---

## 2. Habilitar la API de Google Identity

1. Con el proyecto seleccionado, ve al menú lateral y selecciona **APIs y servicios > Biblioteca**.
2. Busca **"Google Identity"** o **"Google+ API"**.
3. Haz clic en el resultado y luego en **"Habilitar"**.

---

## 3. Configurar la pantalla de consentimiento OAuth

1. Ve a **APIs y servicios > Pantalla de consentimiento de OAuth**.
2. Selecciona **"Externo"** como tipo de usuario y haz clic en **"Crear"**.
3. Completa los campos obligatorios:
   - **Nombre de la aplicación**: WorkHoops
   - **Correo electrónico de soporte**: tu email
   - **Dominio autorizado**: `workhoops.com` (y `localhost` para desarrollo si es necesario)
4. En la sección **"Alcances"**, añade `email` y `profile`.
5. Guarda y continúa hasta finalizar el asistente.

---

## 4. Crear las credenciales OAuth 2.0

1. Ve a **APIs y servicios > Credenciales**.
2. Haz clic en **"+ Crear credenciales"** y selecciona **"ID de cliente de OAuth"**.
3. Tipo de aplicación: **"Aplicación web"**.
4. Nombre: `WorkHoops Web`.
5. En **"URI de redireccionamiento autorizados"**, añade:

   **Desarrollo local:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **Producción (sustituye por tu dominio real):**
   ```
   https://workhoops.com/api/auth/callback/google
   https://tu-proyecto.vercel.app/api/auth/callback/google
   ```

6. Haz clic en **"Crear"**.
7. Copia el **Client ID** y el **Client Secret** que aparecen en el modal.

---

## 5. Configurar en desarrollo local

En el archivo `.env.local` de la raíz del proyecto, añade:

```env
GOOGLE_CLIENT_ID=tu-client-id-aqui
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
```

Reinicia el servidor de desarrollo (`npm run dev`) para que surtan efecto.

---

## 6. Configurar en Vercel

1. Entra en tu proyecto en [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. Ve a **Settings > Environment Variables**.
3. Añade las siguientes variables para los entornos **Production**, **Preview** y **Development**:

   | Name                  | Value                     |
   |-----------------------|---------------------------|
   | `GOOGLE_CLIENT_ID`    | tu-client-id-aqui         |
   | `GOOGLE_CLIENT_SECRET`| tu-client-secret-aqui     |

4. Haz un nuevo deploy (o usa **Redeploy**) para que las variables sean efectivas.

---

## 7. Verificar que funciona

- En local: visita `http://localhost:3000/auth/login` y haz clic en **"Continuar con Google"**.
- En producción: visita tu dominio y prueba el flujo completo.
- Si hay errores, revisa los logs de NextAuth activando `NEXTAUTH_DEBUG=true` en las variables de entorno.

---

## Notas adicionales

- Los nuevos usuarios que se registren via Google obtendrán automáticamente el rol `jugador` y el plan `free_amateur`.
- Si necesitas cambiar el rol por defecto para usuarios de Google, modifica el callback `signIn` en `lib/auth.ts`.
- En el modo de prueba de Google Cloud, solo los usuarios añadidos como "testers" pueden autenticarse. Publica la app cuando estés listo para producción.
