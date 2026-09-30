"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { users, branches, employees, auditLogs } from "@/db/schema"
import { requireRole } from "@/lib/auth"

const schema = z.object({
  fullName: z.string().trim().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  role: z.enum(["admin","finance","student_affairs","hr","archive"]),
  branchId: z.coerce.number().int().positive().nullable(),
  employeeId: z.coerce.number().int().positive().nullable(),
})

export type UserActionState = { error?: string; success?: string }

export async function createUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    const session = await requireRole(["admin"])
    const rawBranch = String(formData.get("branchId") ?? "").trim()
    const rawEmployee = String(formData.get("employeeId") ?? "").trim()
    const data = schema.parse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      branchId: rawBranch ? rawBranch : null,
      employeeId: rawEmployee ? rawEmployee : null,
    })
    if (data.role !== "admin" && !data.branchId) return { error: "يجب اختيار الفرع لهذا الحساب" }
    if (data.role === "admin") data.branchId = null
    const email = data.email.toLowerCase().trim()
    const [existing] = await db.select({id: users.id}).from(users).where(eq(users.email,email)).limit(1)
    if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" }
    if (data.branchId) {
      const [branch] = await db.select({id: branches.id}).from(branches).where(and(eq(branches.id,data.branchId),eq(branches.status,"active"))).limit(1)
      if (!branch) return { error: "الفرع غير موجود أو غير نشط" }
    }
    if (data.employeeId) {
      const [employee] = await db.select({id:employees.id,branchId:employees.branchId,userId:employees.userId}).from(employees).where(eq(employees.id,data.employeeId)).limit(1)
      if (!employee) return { error: "الموظف غير موجود" }
      if (employee.userId) return { error: "الموظف مرتبط بحساب مسبقًا" }
      if (data.role !== "admin" && data.branchId !== employee.branchId) return { error: "الفرع المحدد لا يطابق فرع الموظف" }
    }
    const passwordHash = await bcrypt.hash(data.password, 12)
    await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({fullName:data.fullName,email,passwordHash,role:data.role,branchId:data.branchId}).returning({id:users.id})
      if (data.employeeId) await tx.update(employees).set({userId:user.id}).where(eq(employees.id,data.employeeId))
      await tx.insert(auditLogs).values({userId:session.userId,action:"create",entityType:"user",entityId:user.id,description:"تم إنشاء حساب مستخدم وربطه بالموظف إن وجد"})
    })
    revalidatePath("/users"); revalidatePath("/hr/employees")
    return { success: "تم إنشاء الحساب وربطه بالموظف بنجاح" }
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.issues[0]?.message ?? "تحقق من البيانات" }
    if (err instanceof Error && err.message === "FORBIDDEN") return { error: "هذه العملية للمدير فقط" }
    return { error: "تعذر إنشاء الحساب" }
  }
}

export async function toggleUserAction(id: number) {
  const session = await requireRole(["admin"])
  const [user] = await db.select().from(users).where(eq(users.id,id)).limit(1)
  if (!user) throw new Error("NOT_FOUND")
  if (user.id === session.userId && user.isActive) throw new Error("SELF_DISABLE")
  await db.update(users).set({isActive:!user.isActive,updatedAt:new Date()}).where(eq(users.id,id))
  await db.insert(auditLogs).values({userId:session.userId,action:"update",entityType:"user",entityId:id,description:"تم تغيير حالة حساب المستخدم"})
  revalidatePath("/users")
}