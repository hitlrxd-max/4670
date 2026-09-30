import { db } from "@/db"
import { branches, users, students, employees, payments, expenses, studentFees } from "@/db/schema"
import { and, count, eq, sum } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  const scope = branchScope(session)
  const [branchCountRow, userCountRow, studentCountRow, employeeCountRow, incomeRow, expenseRow, feeRow] = await Promise.all([
    scope === null ? db.select({ value: count() }).from(branches).where(eq(branches.status,"active")) : db.select({ value: count() }).from(branches).where(eq(branches.id,scope)),
    scope === null ? db.select({ value: count() }).from(users) : db.select({ value: count() }).from(users).where(eq(users.branchId,scope)),
    scope === null ? db.select({ value: count() }).from(students).where(eq(students.isArchived,false)) : db.select({ value: count() }).from(students).where(and(eq(students.isArchived,false),eq(students.branchId,scope))),
    scope === null ? db.select({ value: count() }).from(employees).where(eq(employees.isArchived,false)) : db.select({ value: count() }).from(employees).where(and(eq(employees.isArchived,false),eq(employees.branchId,scope))),
    scope === null ? db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.isArchived,false)) : db.select({ value: sum(payments.amount) }).from(payments).where(and(eq(payments.isArchived,false),eq(payments.branchId,scope))),
    scope === null ? db.select({ value: sum(expenses.amount) }).from(expenses).where(eq(expenses.isArchived,false)) : db.select({ value: sum(expenses.amount) }).from(expenses).where(and(eq(expenses.isArchived,false),eq(expenses.branchId,scope))),
    scope === null ? db.select({ value: sum(studentFees.totalFees) }).from(studentFees) : db.select({ value: sum(studentFees.totalFees) }).from(studentFees).where(eq(studentFees.branchId,scope)),
  ])
  const cards=[["الفروع",Number(branchCountRow[0]?.value??0)],["المستخدمون",Number(userCountRow[0]?.value??0)],["الطلاب",Number(studentCountRow[0]?.value??0)],["الموظفون",Number(employeeCountRow[0]?.value??0)],["الإيرادات",Number(incomeRow[0]?.value??0).toFixed(2)],["المصروفات",Number(expenseRow[0]?.value??0).toFixed(2)],["إجمالي الرسوم",Number(feeRow[0]?.value??0).toFixed(2)]]
  const branchRows = scope === null ? await db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.status,"active")) : await db.select({id:branches.id,name:branches.name}).from(branches).where(eq(branches.id,scope))
  const branchStats=await Promise.all(branchRows.map(async b=>{const [s,p,e]=await Promise.all([db.select({value:count()}).from(students).where(and(eq(students.branchId,b.id),eq(students.isArchived,false))),db.select({value:sum(payments.amount)}).from(payments).where(and(eq(payments.branchId,b.id),eq(payments.isArchived,false))),db.select({value:sum(expenses.amount)}).from(expenses).where(and(eq(expenses.branchId,b.id),eq(expenses.isArchived,false)))]);return{id:b.id,name:b.name,students:Number(s[0]?.value??0),income:Number(p[0]?.value??0),expenses:Number(e[0]?.value??0)}}))
  return <div dir="rtl" className="space-y-6"><div><h1 className="text-xl font-bold text-zinc-900">لوحة التحكم</h1><p className="text-sm text-zinc-500">{scope===null?"المدير — عرض جميع الفروع":"عرض بيانات فرعك فقط"}</p></div><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{cards.map(([label,value])=><div key={label} className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div><div><h2 className="mb-3 font-bold">ملخص الفروع</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{branchStats.map(b=><div key={b.id} className="rounded-xl border bg-white p-5"><p className="font-semibold">{b.name}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><div><p className="text-zinc-500">طلاب</p><p className="font-bold">{b.students}</p></div><div><p className="text-zinc-500">إيرادات</p><p className="font-bold">{b.income.toFixed(2)}</p></div><div><p className="text-zinc-500">مصروفات</p><p className="font-bold">{b.expenses.toFixed(2)}</p></div></div></div>)}</div></div></div>
}