import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: "user" | "org" | "admin"
    }
  }

  interface User {
    role: "user" | "org" | "admin"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "user" | "org" | "admin"
  }
}