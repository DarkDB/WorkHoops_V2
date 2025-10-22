import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: "admin" | "jugador" | "entrenador" | "club" | "agencia"
      planType?: string | null
    }
  }

  interface User {
    role: "admin" | "jugador" | "entrenador" | "club" | "agencia"
    planType?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "admin" | "jugador" | "entrenador" | "club" | "agencia"
    planType?: string | null
  }
}