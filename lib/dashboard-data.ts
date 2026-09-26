import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { branches, students } from '@/lib/db/schema'

export async function getDashboardData() {
  const [{ value: studentCount }, { value: branchCount }] = await Promise.all([
    db.select({ value: count() }).from(students).where(eq(students.status, 'active')),
    db.select({ value: count() }).from(branches).where(eq(branches.isActive, true)),
  ])
  return { studentCount: Number(studentCount), branchCount: Number(branchCount) }
}
