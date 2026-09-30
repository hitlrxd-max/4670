import { db } from "@/db"
import { academicYears, branches, discounts, payments, studentFees, students } from "@/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function FeesPage() {
  const session = await getSession(); if (!session) redirect("/login")
  const scope = branchScope(session)
  const conditions = [eq(students.isArchived,false)]
  if (scope !== null) conditions.push(eq(students.branchId,scope))
  const rows = await db.select({
    id: students.id, fullName: students.fullName, enrollmentNumber: students.enrollmentNumber,
    branchId: students.branchId, yearId: students.academicYearId, branchName: branches.name, yearName: academicYears.name,
    feeId: studentFees.id, totalFees: studentFees.totalFees,
  }).from(students)
    .leftJoin(branches,eq(students.branchId,branches.id))
    .leftJoin(academicYears,eq(students.academicYearId,academicYears.id))
    .leftJoin(studentFees,and(eq(studentFees.studentId,students.id),eq(studentFees.academicYearId,students.academicYearId)))
    .where(and(...conditions)).orderBy(desc(students.createdAt))

  const ids=rows.map(r=>r.id)
  const [paidRows,discountRows]=await Promise.all([
    ids.length?db.select({studentId:payments.studentId,amount:payments.amount}).from(payments).where(and(eq(payments.isArchived,false), ...[scope!==null?eq(payments.branchId,scope):undefined].filter(Boolean) as any[])):Promise.resolve([]),
    Promise.resolve([] as Array<{studentFeeId:number;amount:string}>)
  ])
  const paidMap=new Map<number,number>()
  for(const p of paidRows) paidMap.set(p.studentId,(paidMap.get(p.studentId)||0)+Number(p.amount))
  const feeIds=rows.map(r=>r.feeId).filter((x):x is number=>x!==null)
  const ds=feeIds.length?await db.select({studentFeeId:discounts.studentFeeId,amount:discounts.amount}).from(discounts):[]
  for(const d of ds) discountRows.push(d)
  const discountMap=new Map<number,number>()
  for(const d of discountRows) discountMap.set(d.studentFeeId,(discountMap.get(d.studentFeeId)||0)+Number(d.amount))

  return <div className="space-y-5">
    <div><h1 className="text-lg font-bold">أقساط الطلاب</h1><p className="text-sm text-zinc-500">إجمالي الرسوم والخصومات والمدفوع والمتبقي من قاعدة البيانات</p></div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[850px] text-right text-sm">
      <thead className="border-b bg-zinc-50 text-zinc-500"><tr><th className="px-4 py-3">الطالب</th><th className="px-4 py-3">الفرع</th><th className="px-4 py-3">السنة</th><th className="px-4 py-3">الرسوم</th><th className="px-4 py-3">الخصم</th><th className="px-4 py-3">المدفوع</th><th className="px-4 py-3">المتبقي</th></tr></thead>
      <tbody>{rows.length===0?<tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">لا توجد سجلات</td></tr>:rows.map(r=>{const total=Number(r.totalFees||0),discount=discountMap.get(r.feeId||0)||0,paid=paidMap.get(r.id)||0,remaining=Math.max(0,total-discount-paid);return <tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{r.fullName}<div className="text-xs text-zinc-400">{r.enrollmentNumber}</div></td><td className="px-4 py-3">{r.branchName??"—"}</td><td className="px-4 py-3">{r.yearName??"—"}</td><td className="px-4 py-3">{total.toFixed(2)}</td><td className="px-4 py-3">{discount.toFixed(2)}</td><td className="px-4 py-3">{paid.toFixed(2)}</td><td className="px-4 py-3 font-semibold">{remaining.toFixed(2)}</td></tr>})}</tbody>
    </table></div>
  </div>
}
