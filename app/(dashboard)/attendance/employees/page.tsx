import {db} from "@/db"
import {employees,employeeAttendance} from "@/db/schema"
import {and,desc,eq} from "drizzle-orm"
import {getSession,branchScope} from "@/lib/auth"
import {redirect} from "next/navigation"
import {saveEmployeeAttendanceAction} from "@/lib/actions/attendance-actions"

export default async function EmployeeAttendancePage(){
 const s=await getSession();if(!s)redirect("/login");if(!["admin","hr"].includes(s.role))redirect("/dashboard")
 const scope=branchScope(s)
 const rows=scope===null?await db.select({id:employees.id,fullName:employees.fullName,employeeCode:employees.employeeCode}).from(employees).where(eq(employees.isArchived,false)).orderBy(employees.fullName):await db.select({id:employees.id,fullName:employees.fullName,employeeCode:employees.employeeCode}).from(employees).where(and(eq(employees.isArchived,false),eq(employees.branchId,scope))).orderBy(employees.fullName)
 const today=new Date().toISOString().slice(0,10)
 const records=scope===null?await db.select().from(employeeAttendance).orderBy(desc(employeeAttendance.date)):await db.select().from(employeeAttendance).where(eq(employeeAttendance.branchId,scope)).orderBy(desc(employeeAttendance.date))
 return <div dir="rtl" className="space-y-5"><div><h1 className="text-xl font-bold">حضور الموظفين</h1></div><form action={saveEmployeeAttendanceAction} className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-4"><select name="employeeId" required className="rounded-md border px-3 py-2 text-sm">{rows.map(x=><option key={x.id} value={x.id}>{x.fullName} — {x.employeeCode}</option>)}</select><input name="date" type="date" defaultValue={today} required className="rounded-md border px-3 py-2 text-sm"/><select name="status" className="rounded-md border px-3 py-2 text-sm"><option value="present">حاضر</option><option value="absent">غائب</option><option value="late">متأخر</option><option value="left_early">انصرف مبكرًا</option></select><button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">حفظ</button><input name="notes" placeholder="ملاحظات" className="rounded-md border px-3 py-2 text-sm md:col-span-4"/></form><div className="rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">الموظف</th><th className="px-4 py-3">الحالة</th></tr></thead><tbody>{records.slice(0,100).map(r=><tr key={r.id} className="border-b"><td className="px-4 py-3">{r.date}</td><td className="px-4 py-3">{rows.find(x=>x.id===r.employeeId)?.fullName??r.employeeId}</td><td className="px-4 py-3">{r.status}</td></tr>)}</tbody></table></div></div>
}