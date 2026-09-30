import { db } from "@/db"
import { academicYears, branches, students, studentFees } from "@/db/schema"
import { desc, eq, and } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { StudentEditForm } from "../../student-edit-form"

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const scope = branchScope(session)
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1)
  if (!student) notFound()
  if (scope !== null && scope !== student.branchId) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">لا تملك صلاحية الوصول إلى هذا الطالب.</div>
  }
  const [branchesRows, years, feeRows] = await Promise.all([
    scope === null ? db.select().from(branches).where(eq(branches.status, "active")) : db.select().from(branches).where(eq(branches.id, scope)),
    db.select().from(academicYears).orderBy(desc(academicYears.name)),
    db.select().from(studentFees).where(and(eq(studentFees.studentId, id), eq(studentFees.academicYearId, student.academicYearId))).limit(1),
  ])
  return <StudentEditForm student={student} branches={branchesRows} years={years} initialFees={feeRows[0]?.totalFees ?? ""} />
}
