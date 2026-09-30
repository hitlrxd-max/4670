"use server"

import { z } from "zod"
import { and, desc, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { academicYears, auditLogs } from "@/db/schema"
import { requireRole } from "@/lib/auth"

const schema = z.object({
  name: z.string().trim().regex(/^\d{4}\/\d{4}$/, "صيغة السنة يجب أن تكون مثل 2026/2027"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type AcademicYearState = { error?: string; success?: string }

export async function createAcademicYearAction(
  _prev: AcademicYearState,
  formData: FormData
): Promise<AcademicYearState> {
  try {
    const session = await requireRole(["admin"])
    const parsed = schema.safeParse({
      name: formData.get("name"),
      startDate: formData.get("startDate") || undefined,
      endDate: formData.get("endDate") || undefined,
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" }

    const existing = await db.select({ id: academicYears.id }).from(academicYears)
      .where(eq(academicYears.name, parsed.data.name)).limit(1)
    if (existing.length) return { error: "هذه السنة الدراسية موجودة بالفعل" }

    const [year] = await db.insert(academicYears).values({
      name: parsed.data.name,
      startDate: parsed.data.startDate || null,
      endDate: parsed.data.endDate || null,
      isActive: false,
    }).returning()

    await db.insert(auditLogs).values({
      userId: session.userId, action: "create", entityType: "academic_year", entityId: year.id,
      description: `قام ${session.fullName} بإضافة السنة الدراسية ${year.name}`,
    })
    revalidatePath("/academic-years")
    return { success: "تمت إضافة السنة الدراسية" }
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") return { error: "لا تملك صلاحية تنفيذ هذه العملية" }
    return { error: "تعذر حفظ السنة الدراسية" }
  }
}

export async function activateAcademicYearAction(id: number) {
  const session = await requireRole(["admin"])
  const [year] = await db.select().from(academicYears).where(eq(academicYears.id, id)).limit(1)
  if (!year) throw new Error("NOT_FOUND")

  await db.update(academicYears).set({ isActive: false }).where(ne(academicYears.id, id))
  await db.update(academicYears).set({ isActive: true }).where(eq(academicYears.id, id))
  await db.insert(auditLogs).values({
    userId: session.userId, action: "activate", entityType: "academic_year", entityId: id,
    description: `قام ${session.fullName} بتفعيل السنة الدراسية ${year.name}`,
  })
  revalidatePath("/academic-years")
  revalidatePath("/students")
  revalidatePath("/students/new")
}
