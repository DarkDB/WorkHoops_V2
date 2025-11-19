import { z } from "zod"

export const opportunityCreateSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100, "El título no puede superar los 100 caracteres"),
  type: z.enum(["empleo", "prueba", "torneo", "clinica", "beca", "patrocinio", "campus"]),
  organizationId: z.string().cuid("ID de organización inválido").optional(),
  level: z.enum([
    "acb", 
    "primera_feb", 
    "segunda_feb", 
    "tercera_feb", 
    "autonomica", 
    "provincial", 
    "cantera", 
    "amateur",
    // Legacy values for backward compatibility
    "semipro", 
    "semi_profesional", 
    "profesional", 
    "juvenil", 
    "infantil"
  ]),
  city: z.string().min(2, "La ciudad es requerida"),
  region: z.string().optional(),
  country: z.string().default("España"),
  modality: z.enum(["presencial", "online", "mixta"]).default("presencial").optional(),
  remuneration: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("EUR"),
    type: z.enum(["monthly", "annual", "per_event"]).default("annual"),
  }).optional(),
  remunerationType: z.string().optional(),
  remunerationMin: z.union([z.string(), z.number()]).optional(),
  remunerationMax: z.union([z.string(), z.number()]).optional(),
  benefits: z.string().optional(),
  description: z.string().min(50, "La descripción debe tener al menos 50 caracteres"),
  requirements: z.string().optional(),
  deadline: z.union([z.string(), z.date()]).optional(),
  startDate: z.union([z.string(), z.date()]).optional(),
  contactEmail: z.string().email("Email inválido").optional(),
  contactPhone: z.string().optional(),
  applicationUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  tags: z.array(z.string()).max(10, "Máximo 10 etiquetas").default([]),
})

// Schema específico para actualización (más flexible)
export const opportunityUpdateSchema = opportunityCreateSchema.partial()

export const applicationCreateSchema = z.object({
  opportunityId: z.string().cuid("ID de oportunidad inválido"),
  message: z.string().max(1000, "El mensaje no puede superar los 1000 caracteres").optional().or(z.literal('')),
})

export const applicationUpdateSchema = z.object({
  state: z.enum(["pendiente", "en_revision", "vista", "rechazada", "aceptada"]),
})

export const organizationCreateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede superar los 100 caracteres"),
  description: z.string().max(500, "La descripción no puede superar los 500 caracteres").optional(),
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
  role: z.enum(["jugador", "entrenador", "club", "agencia"]).default("jugador"),
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
export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>
export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>