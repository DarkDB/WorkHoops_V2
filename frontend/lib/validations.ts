import { z } from "zod"

export const opportunityCreateSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100, "El título no puede superar los 100 caracteres"),
  type: z.enum(["empleo", "prueba", "torneo", "clinica", "beca", "patrocinio"]),
  organizationId: z.string().cuid("ID de organización inválido"),
  level: z.enum(["amateur", "semi_pro", "cantera", "pro"]),
  city: z.string().min(2, "La ciudad es requerida"),
  region: z.string().optional(),
  country: z.string().default("España"),
  modality: z.enum(["presencial", "online", "mixta"]).default("presencial"),
  remuneration: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("EUR"),
    type: z.enum(["monthly", "annual", "per_event"]).default("annual"),
  }).optional(),
  benefits: z.string().optional(),
  description: z.string().min(50, "La descripción debe tener al menos 50 caracteres"),
  requirements: z.string().optional(),
  deadline: z.string().datetime().optional(),
  tags: z.array(z.string()).max(10, "Máximo 10 etiquetas").default([]),
})

export const applicationCreateSchema = z.object({
  opportunityId: z.string().cuid("ID de oportunidad inválido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "El mensaje no puede superar los 1000 caracteres"),
})

export const applicationUpdateSchema = z.object({
  state: z.enum(["enviada", "vista", "rechazada", "aceptada"]),
})

export const organizationCreateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede superar los 100 caracteres"),
  bio: z.string().max(500, "La biografía no puede superar los 500 caracteres").optional(),
  logo: z.string().url("URL de logo inválida").optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede superar los 50 caracteres").optional(),
  image: z.string().url("URL de imagen inválida").optional(),
  locale: z.enum(["es", "ca"]).optional(),
})

export const signUpSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede superar los 50 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["user", "org"]).default("user"),
})

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  token: z.string().min(1, "Token requerido"),
})

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "Nombre de archivo requerido"),
  fileType: z.string().min(1, "Tipo de archivo requerido"),
  fileSize: z.number().max(10 * 1024 * 1024, "El archivo no puede superar los 10MB"),
})

// Type exports
export type OpportunityCreateInput = z.infer<typeof opportunityCreateSchema>
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>
export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>