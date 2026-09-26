'use server'

import { requireSession } from '@/lib/auth'
import { and, asc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auditLogs, branches, students } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

const studentInput = z.object({
  fullName: z.string().trim().min(2),
  registrationNumber: z.string().trim().min(1),
  branchId: z.string().uuid().optional().or(z.literal('')),
  academicYearId: z.string().uuid().optional().or(z.literal('')),
  stage: z.string().trim().optional(),
  grade: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  notes: z.string().trim().optional(),
})

export async function listBranches() { await requireSession(); return db.select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.name)) }
export async function listStudents(query = '') {
  await requireSession()
  return db.select().from(students).where(query ? and(eq(students.status, 'active'), ilike(students.fullName, `%${query}%`)) : eq(students.status, 'active')).orderBy(asc(students.fullName))
}
export async function createStudent(input: unknown) {
  await requireSession()
  const parsed = studentInput.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'يرجى مراجعة بيانات الطالب' }
  try {
    const [student] = await db.insert(students).values({ ...parsed.data, branchId: parsed.data.branchId || null, academicYearId: parsed.data.academicYearId || null }).returning()
    await db.insert(auditLogs).values({ action: 'create', entityType: 'student', entityId: student.id, metadata: { registrationNumber: student.registrationNumber } })
    revalidatePath('/')
    return { ok: true, student }
  } catch { return { ok: false, error: 'تعذر حفظ الطالب. قد يكون رقم التسجيل مستخدماً.' } }
}

export async function archiveStudent(id: string) {
  await requireSession()
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'معرّف غير صالح' }
  await db.update(students).set({ status: 'archived', updatedAt: new Date() }).where(eq(students.id, id))
  await db.insert(auditLogs).values({ action: 'archive', entityType: 'student', entityId: id })
  revalidatePath('/')
  return { ok: true }
}
