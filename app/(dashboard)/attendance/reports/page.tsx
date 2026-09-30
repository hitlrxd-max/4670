import {db} from "@/db"
import {studentAttendance,employeeAttendance} from "@/db/schema"
import {eq,count} from "drizzle-orm"
import {getSession,branchScope} from "@/lib/auth"
import {redirect} from "next/navigation"

export default async function AttendanceReportsPage(){
 const s=await getSession();if(!s)redirect("/login")
 const scope=branchScope(s)
 const student=scope===null?await db.select({status:studentAttendance.status,value:count()}).from(studentAttendance).groupBy(studentAttendance.status):await db.select({status:studentAttendance.status,value:count()}).from(studentAttendance).where(eq(studentAttendance.branchId,scope)).groupBy(studentAttendance.status)
 const employee=scope===null?await db.select({status:employeeAttendance.status,value:count()}).from(employeeAttendance).groupBy(employeeAttendance.status):await db.select({status:employeeAttendance.status,value:count()}).from(employeeAttendance).where(eq(employeeAttendance.branchId,scope)).groupBy(employeeAttendance.status)
 return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold">تقارير الحضور والغياب</h1><p className="text-sm text-zinc-500">إحصائيات مباشرة من سجلات الحضور.</p></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-semibold">الطلاب</h2>{student.map(x=><div key={x.status} className="flex justify-between border-b py-2"><span>{x.status}</span><b>{x.value}</b></div>)}</div><div className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-semibold">الموظفون</h2>{employee.map(x=><div key={x.status} className="flex justify-between border-b py-2"><span>{x.status}</span><b>{x.value}</b></div>)}</div></div></div>
}