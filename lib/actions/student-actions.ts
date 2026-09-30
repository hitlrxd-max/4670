"use server"

import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { students, studentFees, branches, academicYears, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const studentSchema = z.object({
  fullName: z.string().trim().min(2, "اسم الطالب مطلوب"),
  enrollmentNumber: z.string().trim().min(1, "رقم القيد مطلوب").max(50),
  seatNumber: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
  stage: z.string().trim().optional(),
  grade: z.string().trim().optional(),
  classroom: z.string().trim().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  totalFees: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional(),
})

export type StudentActionState = { error?: string; success?: string }

async function validateScope(branchId: number, academicYearId: number) {
  const session = await requireRole(["admin", "student_affairs"])
  const scope = branchScope(session)
  if (scope !== null && scope !== branchId) throw new Error("FORBIDDEN")

  const [branch] = await db.select({ id: branches.id }).from(branches)
    .where(and(eq(branches.id, branchId), eq(branches.status, "active"))).limit(1)
  if (!branch) throw new Error("BRANCH_NOT_FOUND")
  const [year] = await db.select({ id: academicYears.id }).from(academicYears)
    .where(eq(academicYears.id, academicYearId)).limit(1)
  if (!year) throw new Error("YEAR_NOT_FOUND")
  return session
}

export async function createStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  try {
    const data = studentSchema.parse(Object.fromEntries(formData.entries()))
    const session = await validateScope(data.branchId, data.academicYearId)
    const duplicate = await db.select({ id: students.id }).from(students).where(eq(students.enrollmentNumber, data.enrollmentNumber)).limit(1)
    if (duplicate.length) return { error: "رقم القيد مستخدم لطالب آخر" }

    const [student] = await db.insert(students).values({
      fullName: data.fullName, enrollmentNumber: data.enrollmentNumber,
      seatNumber: data.seatNumber || null, branchId: data.branchId, academicYearId: data.academicYearId,
      stage: data.stage || null, grade: data.grade || null, classroom: data.classroom || null,
      birthDate: data.birthDate || null, gender: data.gender || null,
      guardianName: data.guardianName || null, guardianPhone: data.guardianPhone || null,
      address: data.address || null, notes: data.notes || null,
    }).returning()

    if (data.totalFees !== undefined) {
      await db.insert(studentFees).values({
        studentId: student.id, academicYearId: data.academicYearId, branchId: data.branchId,
        totalFees: data.totalFees.toFixed(2),
      })
    }

    await db.insert(auditLogs).values({
      userId: session.userId, action: "create", entityType: "student", entityId: student.id,
      description: `قام ${session.fullName} بإضافة الطالب ${student.fullName}`,
    })
    revalidatePath("/students")
    revalidatePath("/dashboard")
    return { success: "تمت إضافة الطالب بنجاح" }
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.issues[0]?.message ?? "تحقق من البيانات" }
    if (err instanceof Error && err.message === "FORBIDDEN") return { error: "لا تملك صلاحية هذا الفرع" }
    return { error: "تعذر إضافة الطالب، تحقق من البيانات وحاول مرة أخرى" }
  }
}

export async function updateStudentAction(
  id: number,
  _prev: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  try {
    const data = studentSchema.parse(Object.fromEntries(formData.entries()))
    const session = await validateScope(data.branchId, data.academicYearId)
    const [existing] = await db.select().from(students).where(eq(students.id, id)).limit(1)
    if (!existing) return { error: "الطالب غير موجود" }
    const scope = branchScope(session)
    if (scope !== null && scope !== existing.branchId) return { error: "لا تملك صلاحية هذا الطالب" }

    const duplicate = await db.select({ id: students.id }).from(students)
      .where(and(eq(students.enrollmentNumber, data.enrollmentNumber), eq(students.id, id))).limit(1)
    if (!duplicate.length) {
      const other = await db.select({ id: students.id }).from(students)
        .where(eq(students.enrollmentNumber, data.enrollmentNumber)).limit(1)
      if (other.length) return { error: "رقم القيد مستخدم لطالب آخر" }
    }

    await db.update(students).set({
      fullName: data.fullName, enrollmentNumber: data.enrollmentNumber,
      seatNumber: data.seatNumber || null, branchId: data.branchId, academicYearId: data.academicYearId,
      stage: data.stage || null, grade: data.grade || null, classroom: data.classroom || null,
      birthDate: data.birthDate || null, gender: data.gender || null,
      guardianName: data.guardianName || null, guardianPhone: data.guardianPhone || null,
      address: data.address || null, notes: data.notes || null, updatedAt: new Date(),
    }).where(eq(students.id, id))

    if (data.totalFees !== undefined) {
      const [fee] = await db.select().from(studentFees)
        .where(and(eq(studentFees.studentId, id), eq(studentFees.academicYearId, data.academicYearId))).limit(1)
      if (fee) {
        await db.update(studentFees).set({ totalFees: data.totalFees.toFixed(2), branchId: data.branchId, updatedAt: new Date() }).where(eq(studentFees.id, fee.id))
      } else {
        await db.insert(studentFees).values({ studentId: id, academicYearId: data.academicYearId, branchId: data.branchId, totalFees: data.totalFees.toFixed(2) })
      }
    }

    await db.insert(auditLogs).values({
      userId: session.userId, action: "update", entityType: "student", entityId: id,
      description: `قام ${session.fullName} بتعديل بيانات الطالب ${data.fullName}`,
    })
    revalidatePath("/students")
    revalidatePath(`/students/${id}/edit`)
    revalidatePath("/dashboard")
    return { success: "تم تحديث بيانات الطالب" }
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.issues[0]?.message ?? "تحقق من البيانات" }
    if (err instanceof Error && err.message === "FORBIDDEN") return { error: "لا تملك صلاحية هذا الفرع" }
    return { error: "تعذر تحديث الطالب" }
  }
}

export async function archiveStudentAction(id: number) {
  const session = await requireRole(["admin", "student_affairs"])
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1)
  if (!student) throw new Error("NOT_FOUND")
  const scope = branchScope(session)
  if (scope !== null && scope !== student.branchId) throw new Error("FORBIDDEN")
  await db.update(students).set({ isArchived: true, status: "archived", updatedAt: new Date() }).where(eq(students.id, id))
  await db.insert(auditLogs).values({
    userId: session.userId, action: "archive", entityType: "student", entityId: id,
    description: `قام ${session.fullName} بأرشفة الطالب ${student.fullName}`,
  })
  revalidatePath("/students")
  revalidatePath("/dashboard")
}
