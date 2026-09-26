"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { users, auditLogs } from "@/db/schema"
import { createSession, destroySession, getSession } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
})

export type LoginState = {
  error?: string
  success?: boolean
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" }
  }

  const { email, password } = parsed.data

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)

  if (!user || !user.isActive) {
    return { error: "بيانات الدخول غير صحيحة" }
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    return { error: "بيانات الدخول غير صحيحة" }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    branchId: user.branchId,
  })

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "login",
    entityType: "auth",
    entityId: user.id,
    description: `قام ${user.fullName} بتسجيل الدخول`,
  })

  redirect("/dashboard")
}

export async function logoutAction() {
  const session = await getSession()
  if (session) {
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "logout",
      entityType: "auth",
      entityId: session.userId,
      description: `قام ${session.fullName} بتسجيل الخروج`,
    })
  }
  await destroySession()
  redirect("/login")
}
