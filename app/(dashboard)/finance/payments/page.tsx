import { db } from "@/db"
import { academicYears, branches, payments, students } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { getSession, branchScope } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PaymentForm } from "./payment-form"

export default async function PaymentsPage() {
  const session=await getSession(); if(!session) redirect("/login")
  const scope=branchScope(session)
  const studentsRows=scope===null?await db.select({id:students.id,fullName:students.fullName,branchId:students.branchId}).from(students).where(eq(students.isArchived,false)).orderBy(students.fullName):await db.select({id:students.id,fullName:students.fullName,branchId:students.branchId}).from(students).where(eq(students.isArchived,false))
  const rows=scope===null?await db.select({id:payments.id,operationNumber:payments.operationNumber,amount:payments.amount,paymentDate:payments.paymentDate,paymentMethod:payments.paymentMethod,studentName:students.fullName}).from(payments).leftJoin(students,eq(payments.studentId,students.id)).orderBy(desc(payments.createdAt)):await db.select({id:payments.id,operationNumber:payments.operationNumber,amount:payments.amount,paymentDate:payments.paymentDate,paymentMethod:payments.paymentMethod,studentName:students.fullName}).from(payments).leftJoin(students,eq(payments.studentId,students.id)).where(eq(payments.branchId,scope!)).orderBy(desc(payments.createdAt))
  return <div className="space-y-6"><div><h1 className="text-lg font-bold">المدفوعات</h1><p className="text-sm text-zinc-500">تسجيل دفعة حقيقية وإنشاء فاتورة مرتبطة بها</p></div><PaymentForm students={studentsRows}/><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[700px] text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">رقم العملية</th><th className="px-4 py-3">الطالب</th><th className="px-4 py-3">المبلغ</th><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">طريقة الدفع</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3">{r.operationNumber}</td><td className="px-4 py-3">{r.studentName??"—"}</td><td className="px-4 py-3">{Number(r.amount).toFixed(2)}</td><td className="px-4 py-3">{r.paymentDate}</td><td className="px-4 py-3">{r.paymentMethod}</td></tr>)}</tbody></table></div></div>
}
