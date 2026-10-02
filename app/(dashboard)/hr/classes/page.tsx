import { db } from "@/db"
import { classes, branches, academicYears } from "@/db/schema"
import { asc, eq } from "drizzle-orm"
import { requireRole, branchScope } from "@/lib/auth"
import { createClassAction, deleteClassAction } from "@/lib/actions/academic-actions"
import { redirect } from "next/navigation"

export default async function ClassesPage(){
  const session=await requireRole(["admin","hr"]).catch(()=>null); if(!session) redirect("/dashboard")
  const scope=branchScope(session)
  const [rows,bs,ys]=await Promise.all([
    scope===null?db.select({id:classes.id,name:classes.name,grade:classes.grade,branch:branches.name,year:academicYears.name}).from(classes).leftJoin(branches,eq(classes.branchId,branches.id)).leftJoin(academicYears,eq(classes.academicYearId,academicYears.id)).orderBy(asc(classes.name))
      :db.select({id:classes.id,name:classes.name,grade:classes.grade,branch:branches.name,year:academicYears.name}).from(classes).leftJoin(branches,eq(classes.branchId,branches.id)).leftJoin(academicYears,eq(classes.academicYearId,academicYears.id)).where(eq(classes.branchId,scope)).orderBy(asc(classes.name)),
    scope===null?db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.status,"active")).orderBy(asc(branches.name)):db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.id,scope)),
    db.select({id:academicYears.id,name:academicYears.name}).from(academicYears).orderBy(asc(academicYears.name))
  ])
  return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">الفصول</h1><p className="text-sm text-zinc-500">الفصول مرتبطة بالفرع والسنة الدراسية.</p></div>
    <form action={createClassAction} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-5"><input name="name" required placeholder="اسم الفصل" className="rounded-md border px-3 py-2 text-sm"/><input name="grade" placeholder="الصف" className="rounded-md border px-3 py-2 text-sm"/><select name="branchId" required className="rounded-md border px-3 py-2 text-sm">{bs.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select><select name="academicYearId" required className="rounded-md border px-3 py-2 text-sm">{ys.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}</select><button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">إضافة فصل</button></form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الفصل</th><th className="px-4 py-3">الصف</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">السنة</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3">{r.grade??"—"}</td><td className="px-4 py-3">{r.branch??"—"}</td><td className="px-4 py-3">{r.year??"—"}</td><td className="px-4 py-3"><form action={deleteClassAction}><input type="hidden" name="id" value={r.id}/><button className="rounded border px-2 py-1 text-xs">حذف</button></form></td></tr>)}</tbody></table></div>
  </div>
}