import { db } from "@/db"
import { academicYears, branches, students, studentFees } from "@/db/schema"
import { and, desc, eq, ilike } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArchiveStudentButton } from "./archive-button"

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string; branch?: string; year?: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const params = await searchParams
  const conditions = [eq(students.isArchived, false)]
  const scope = branchScope(session)
  if (scope !== null) conditions.push(eq(students.branchId, scope))
  if (params.q?.trim()) conditions.push(ilike(students.fullName, `%${params.q.trim()}%`))
  if (params.branch && scope === null) conditions.push(eq(students.branchId, Number(params.branch)))
  if (params.year) conditions.push(eq(students.academicYearId, Number(params.year)))

  const [rows, allBranches, years] = await Promise.all([
    db.select({
      id: students.id, fullName: students.fullName, enrollmentNumber: students.enrollmentNumber,
      seatNumber: students.seatNumber, grade: students.grade, classroom: students.classroom,
      branchName: branches.name, yearName: academicYears.name, totalFees: studentFees.totalFees,
    }).from(students)
      .leftJoin(branches, eq(students.branchId, branches.id))
      .leftJoin(academicYears, eq(students.academicYearId, academicYears.id))
      .leftJoin(studentFees, and(eq(studentFees.studentId, students.id), eq(studentFees.academicYearId, students.academicYearId)))
      .where(and(...conditions)).orderBy(desc(students.createdAt)),
    scope === null ? db.select().from(branches).where(eq(branches.status, "active")) : Promise.resolve([]),
    db.select().from(academicYears).orderBy(desc(academicYears.name)),
  ])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-lg font-bold">الطلاب</h1><p className="text-sm text-zinc-500">بيانات الطلاب المدخلة فعليًا في Neon</p></div>
        <Link href="/students/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">+ إضافة طالب</Link>
      </div>
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input name="q" defaultValue={params.q} placeholder="بحث باسم الطالب" className="rounded-md border px-3 py-2 text-sm" />
        {scope === null && <select name="branch" defaultValue={params.branch ?? ""} className="rounded-md border px-3 py-2 text-sm"><option value="">كل الفروع</option>{allBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>}
        <select name="year" defaultValue={params.year ?? ""} className="rounded-md border px-3 py-2 text-sm"><option value="">كل السنوات</option>{years.map(y => <option key={y.id} value={y.id}>{y.name}{y.isActive ? " (نشطة)" : ""}</option>)}</select>
        <button className="rounded-md border bg-zinc-50 px-3 py-2 text-sm">بحث</button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[900px] text-right text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500"><tr>
            <th className="px-4 py-3">الطالب</th><th className="px-4 py-3">رقم القيد</th><th className="px-4 py-3">رقم الجلوس</th><th className="px-4 py-3">الصف/الفصل</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">السنة</th><th className="px-4 py-3">الرسوم</th><th className="px-4 py-3">إجراء</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">لا توجد نتائج</td></tr>}
            {rows.map(s => <tr key={s.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{s.fullName}</td><td className="px-4 py-3">{s.enrollmentNumber}</td><td className="px-4 py-3">{s.seatNumber ?? "—"}</td>
              <td className="px-4 py-3">{[s.grade, s.classroom].filter(Boolean).join(" / ") || "—"}</td><td className="px-4 py-3">{s.branchName ?? "—"}</td><td className="px-4 py-3">{s.yearName ?? "—"}</td><td className="px-4 py-3">{s.totalFees ?? "—"}</td>
              <td className="flex gap-2 px-4 py-3"><Link href={`/students/${s.id}/edit`} className="rounded border px-2 py-1 text-xs">تعديل</Link><ArchiveStudentButton id={s.id} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
