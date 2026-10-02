import { db } from "@/db"
import { schedules, teachers, employees, subjects, classes, branches } from "@/db/schema"
import { asc, eq } from "drizzle-orm"
import { requireRole, branchScope } from "@/lib/auth"
import { createScheduleAction, deleteScheduleAction } from "@/lib/actions/academic-actions"
import { redirect } from "next/navigation"

export default async function SchedulesPage(){
 const session=await requireRole(["admin","hr"]).catch(()=>null);if(!session)redirect("/dashboard");const scope=branchScope(session)
 const [rows,ts,ss,cs]=await Promise.all([
  scope===null?db.select({id:schedules.id,teacher:employees.fullName,subject:subjects.name,className:classes.name,day:schedules.dayOfWeek,start:schedules.startTime,end:schedules.endTime,branch:branches.name}).from(schedules).innerJoin(teachers,eq(schedules.teacherId,teachers.id)).innerJoin(employees,eq(teachers.employeeId,employees.id)).innerJoin(subjects,eq(schedules.subjectId,subjects.id)).innerJoin(classes,eq(schedules.classId,classes.id)).leftJoin(branches,eq(classes.branchId,branches.id)).orderBy(asc(schedules.dayOfWeek),asc(schedules.startTime))
  :db.select({id:schedules.id,teacher:employees.fullName,subject:subjects.name,className:classes.name,day:schedules.dayOfWeek,start:schedules.startTime,end:schedules.endTime,branch:branches.name}).from(schedules).innerJoin(teachers,eq(schedules.teacherId,teachers.id)).innerJoin(employees,eq(teachers.employeeId,employees.id)).innerJoin(subjects,eq(schedules.subjectId,subjects.id)).innerJoin(classes,eq(schedules.classId,classes.id)).leftJoin(branches,eq(classes.branchId,branches.id)).where(eq(classes.branchId,scope)).orderBy(asc(schedules.dayOfWeek),asc(schedules.startTime)),
  scope===null?db.select({id:teachers.id,name:employees.fullName}).from(teachers).innerJoin(employees,eq(teachers.employeeId,employees.id)).orderBy(asc(employees.fullName)):db.select({id:teachers.id,name:employees.fullName}).from(teachers).innerJoin(employees,eq(teachers.employeeId,employees.id)).where(eq(employees.branchId,scope)).orderBy(asc(employees.fullName)),
  db.select({id:subjects.id,name:subjects.name}).from(subjects).orderBy(asc(subjects.name)),
  scope===null?db.select({id:classes.id,name:classes.name,grade:classes.grade}).from(classes).orderBy(asc(classes.name)):db.select({id:classes.id,name:classes.name,grade:classes.grade}).from(classes).where(eq(classes.branchId,scope)).orderBy(asc(classes.name))
 ])
 return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">الجداول الدراسية</h1><p className="text-sm text-zinc-500">إسناد معلم ومادة وفصل إلى يوم ووقت.</p></div>
 <form action={createScheduleAction} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-6">
  <select name="teacherId" required className="rounded-md border px-3 py-2 text-sm"><option value="">المعلم</option>{ts.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
  <select name="subjectId" required className="rounded-md border px-3 py-2 text-sm"><option value="">المادة</option>{ss.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
  <select name="classId" required className="rounded-md border px-3 py-2 text-sm"><option value="">الفصل</option>{cs.map(c=><option key={c.id} value={c.id}>{c.name}{c.grade ? " — "+c.grade : ""}</option>)}</select>
  <select name="dayOfWeek" required className="rounded-md border px-3 py-2 text-sm">{["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","السبت"].map(d=><option key={d}>{d}</option>)}</select>
  <input type="time" name="startTime" required className="rounded-md border px-3 py-2 text-sm"/><input type="time" name="endTime" required className="rounded-md border px-3 py-2 text-sm"/>
  <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white md:col-span-6">حفظ الجدول</button>
 </form>
 <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[850px] text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">المعلم</th><th className="px-4 py-3">المادة</th><th className="px-4 py-3">الفصل</th><th className="px-4 py-3">اليوم</th><th className="px-4 py-3">الوقت</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">إجراء</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3">{r.teacher}</td><td className="px-4 py-3">{r.subject}</td><td className="px-4 py-3">{r.className}</td><td className="px-4 py-3">{r.day}</td><td className="px-4 py-3">{r.start} - {r.end}</td><td className="px-4 py-3">{r.branch??"—"}</td><td className="px-4 py-3"><form action={deleteScheduleAction}><input type="hidden" name="id" value={r.id}/><button className="rounded border px-2 py-1 text-xs">حذف</button></form></td></tr>)}</tbody></table></div>
 </div>
}