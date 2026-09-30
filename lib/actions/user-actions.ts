"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { users, branches, auditLogs } from "@/db/schema"
import { requireRole } from "@/lib/auth"

const schema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin","finance","student_affairs","hr","archive"]),
  branchId: z.coerce.number().int().positive().nullable(),
})

export async function createUserAction(formData: FormData) {
  const session = await requireRole(["admin"])
  const data = schema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    branchId: formData.get("branchId") || null,
  })
  if (data.role !== "admin" && !data.branchId) throw new Error("BRANCH_REQUIRED")
  if (data.role === "admin") data.branchId = null
  const email = data.email.toLowerCase().trim()
  const [existing] = await db.select({id: users.id}).from(users).where(eq(users.email,email)).limit(1)
  if (existing) throw new Error("EMAIL_EXISTS")
  if (data.branchId) {
    const [branch] = await db.select({id: branches.id}).from(branches).where(and(eq(branches.id,data.branchId),eq(branches.status,"active"))).limit(1)
    if (!branch) throw new Error("BRANCH_NOT_FOUND")
  }
  const passwordHash = await bcrypt.hash(data.password, 12)
  const [user] = await db.insert(users).values({
    fullName:data.fullName,email,passwordHash,role:data.role,branchId:data.branchId
  }).returning({id:users.id,fullName:users.fullName})
  await db.insert(auditLogs).values({
    userId:session.userId,action:"create",entityType:"user",entityId:user.id,
    description:"تم إنشاء حساب مستخدم جديد"
  })
  revalidatePath("/users")
  return {success:true}
}