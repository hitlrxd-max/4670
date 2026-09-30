import { db } from "@/db"
import { branches, employees } from "@/db/schema"
import { asc, eq } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EmployeeForm } from "./employee-form"

export default async function EmployeesPage(){
 const session=await getSession();if(!session)redirect("/login")
 const scope=branchScope(session)
 if(!["admin","hr"].includes(session.role))redirect("/dashboard")
 const [rows,branchRows]=await Promise.all([
  scope===null?db.select({id:employees.id,fullName:employees.fullName,employeeCode:employees.employeeCode,position:employees.position,department:employees.department,phone:employees.phone,branchName:branches.name,userId:employees.userId,isArchived:employees.isArchived}).from(employees).leftJoin(branches,eq(employees.branchId,branches.id)).where(eq(employees.isArchived,false)).orderBy(asc(employees.fullName))
  :db.select({id:employees.id,fullName:employees.fullName,employeeCode:employees.employeeCode,position:employees.position,department:employees.department,phone:employees.phone,branchName:branches.name,userId:employees.userId,isArchived:employees.isArchived}).from(employees).leftJoin(branches,eq(employees.branchId,branches.id)).where(eq(employees.branchId,scope)).orderBy(asc(employees.fullName)),
  scope===null?db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.status,"active")).orderBy(asc(branches.name)):db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.id,scope))
 ])
 return <div dir="rtl" className="space-y-6">
  <div><h1 className="text-xl font-bold">الموظفون</h1><p className="text-sm text-zinc-500">سجل الموظفين مرتبط بالفروع والحسابات.</p></div>
  <EmployeeForm branches={branchRows}/>
  <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[850px] text-right text-sm">
   <thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الموظف</th><th className="px-4 py-3">رقم الموظف</th><th className="px-4 py-3">الوظيفة</th><th className="px-4 py-3">القسم</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">الحساب</th></tr></thead>
   <tbody>{rows.length===0?<tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">لا توجد سجلات</td></tr>:rows.map(e=><tr key={e.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{e.fullName}</td><td className="px-4 py-3">{e.employeeCode}</td><td className="px-4 py-3">{e.position??"—"}</td><td className="px-4 py-3">{e.department??"—"}</td><td className="px-4 py-3">{e.branchName??"—"}</td><td className="px-4 py-3">{e.userId?"مرتبط":"لا يوجد حساب"}</td></tr>)}</tbody>
  </table></div>
 </div>
}