import { db } from "@/db"
import { subjects } from "@/db/schema"
import { asc } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { createSubjectAction, deleteSubjectAction } from "@/lib/actions/academic-actions"
import { redirect } from "next/navigation"

export default async function SubjectsPage(){
  const session=await requireRole(["admin","hr"]).catch(()=>null); if(!session) redirect("/dashboard")
  const rows=await db.select().from(subjects).orderBy(asc(subjects.name))
  return <div dir="rtl" className="space-y-6">
    <div><h1 className="text-xl font-bold">المواد الدراسية</h1><p className="text-sm text-zinc-500">إدارة المواد المستخدمة في الجداول.</p></div>
    <form action={createSubjectAction} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4"><input name="name" required placeholder="اسم المادة" className="rounded-md border px-3 py-2 text-sm"/><input name="stage" placeholder="المرحلة" className="rounded-md border px-3 py-2 text-sm"/><input name="grade" placeholder="الصف" className="rounded-md border px-3 py-2 text-sm"/><button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">إضافة المادة</button></form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">المادة</th><th className="px-4 py-3">المرحلة</th><th className="px-4 py-3">الصف</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3">{r.stage??"—"}</td><td className="px-4 py-3">{r.grade??"—"}</td><td className="px-4 py-3"><form action={deleteSubjectAction}><input type="hidden" name="id" value={r.id}/><button className="rounded border px-2 py-1 text-xs">حذف</button></form></td></tr>)}</tbody></table></div>
  </div>
}