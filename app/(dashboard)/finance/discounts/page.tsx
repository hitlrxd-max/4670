import {db} from "@/db"
import {discounts,studentFees,students,academicYears} from "@/db/schema"
import {eq,desc} from "drizzle-orm"
import {getSession,branchScope} from "@/lib/auth"
import {redirect} from "next/navigation"
import {DiscountForm} from "./discount-form"

export default async function DiscountsPage(){
 const session=await getSession();if(!session)redirect("/login")
 const scope=branchScope(session)
 const studentsRows=scope===null?await db.select({id:students.id,fullName:students.fullName}).from(students).where(eq(students.isArchived,false)).orderBy(students.fullName):await db.select({id:students.id,fullName:students.fullName}).from(students).where(eq(students.isArchived,false))
 const rows=scope===null?await db.select({id:discounts.id,amount:discounts.amount,reason:discounts.reason,createdAt:discounts.createdAt,studentName:students.fullName}).from(discounts).leftJoin(studentFees,eq(discounts.studentFeeId,studentFees.id)).leftJoin(students,eq(studentFees.studentId,students.id)).orderBy(desc(discounts.createdAt)):await db.select({id:discounts.id,amount:discounts.amount,reason:discounts.reason,createdAt:discounts.createdAt,studentName:students.fullName}).from(discounts).leftJoin(studentFees,eq(discounts.studentFeeId,studentFees.id)).leftJoin(students,eq(studentFees.studentId,students.id)).where(eq(studentFees.branchId,scope!)).orderBy(desc(discounts.createdAt))
 return <div className="space-y-6"><div><h1 className="text-lg font-bold">الخصومات</h1><p className="text-sm text-zinc-500">تسجيل الخصم وربطه برسوم الطالب</p></div><DiscountForm students={studentsRows}/><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-right text-sm"><thead className="border-b bg-zinc-50"><tr><th className="px-4 py-3">الطالب</th><th className="px-4 py-3">الخصم</th><th className="px-4 py-3">السبب</th><th className="px-4 py-3">التاريخ</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b last:border-0"><td className="px-4 py-3">{r.studentName??"—"}</td><td className="px-4 py-3">{Number(r.amount).toFixed(2)}</td><td className="px-4 py-3">{r.reason??"—"}</td><td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString("ar-LY")}</td></tr>)}</tbody></table></div></div>
}
