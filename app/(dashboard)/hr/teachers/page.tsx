import { db } from "@/db"
import { employees, teachers, branches } from "@/db/schema"
import { and, eq, asc } from "drizzle-orm"
import { requireRole, branchScope } from "@/lib/auth"
import { createTeacherAction, removeTeacherAction } from "@/lib/actions/academic-actions"
import { redirect } from "next/navigation"

export default async function TeachersPage() {
  const session = await requireRole(["admin","hr"]).catch(()=>null)
  if (!session) redirect("/dashboard")
  const scope = branchScope(session)
  const rows = scope === null
    ? await db.select({id:teachers.id, employeeId:employees.id, name:employees.fullName, code:employees.employeeCode, position:employees.position, branch:branches.name}).from(teachers).innerJoin(employees,eq(teachers.employeeId,employees.id)).leftJoin(branches,eq(employees.branchId,branches.id)).orderBy(asc(employees.fullName))
    : await db.select({id:teachers.id, employeeId:employees.id, name:employees.fullName, code:employees.employeeCode, position:employees.position, branch:branches.name}).from(teachers).innerJoin(employees,eq(teachers.employeeId,employees.id)).leftJoin(branches,eq(employees.branchId,branches.id)).where(eq(employees.branchId,scope)).orderBy(asc(employees.fullName))
  const available = scope === null
    ? await db.select({id:employees.id,name:employees.fullName,code:employees.employeeCode}).from(employees).where(eq(employees.isArchived,false)).orderBy(asc(employees.fullName))
    : await db.select({id:employees.id,name:employees.fullName,code:employees.employeeCode}).from(employees).where(and(eq(employees.isArchived,false),eq(employees.branchId,scope))).orderBy(asc(employees.fullName))
  const used = new Set(rows.map(r=>r.employeeId))
  return <div dir="rtl" className="space-y-6">
    <div><h1 className="text-xl font-bold">المعلمون</h1><p className="text-sm text-zinc-500">تحويل الموظف إلى معلم وربطه بالمواد والجداول.</p></div>
    <form action={createTeacherAction} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
      <select name="employeeId" required className="rounded-md border px-3 py-2 text-sm"><option value="">اختر الموظف</option>{available.filter(e=>!used.has(e.id)).map(e=><option key={e.id} value={e.id}>{e.name} — {e.code}</option>)}</select>
      <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">إضافة معلم</button>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">المعلم</th><th className="px-4 py-3">رقم الموظف</th><th className="px-4 py-3">الوظيفة</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{rows.length===0?<tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400">لا يوجد معلمون</td></tr>:rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3">{r.code}</td><td className="px-4 py-3">{r.position??"—"}</td><td className="px-4 py-3">{r.branch??"—"}</td><td className="px-4 py-3"><form action={removeTeacherAction}><input type="hidden" name="id" value={r.id}/><button className="rounded border px-2 py-1 text-xs">إزالة من المعلمين</button></form></td></tr>)}</tbody></table></div>
  </div>
}