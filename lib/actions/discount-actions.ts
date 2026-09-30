"use server"

import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { discounts, studentFees, students, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const schema=z.object({studentId:z.coerce.number().int().positive(),amount:z.coerce.number().positive(),reason:z.string().trim().optional()})
export type DiscountActionState={error?:string;success?:string}

export async function createDiscountAction(_prev:DiscountActionState,formData:FormData):Promise<DiscountActionState>{
 try{
  const data=schema.parse(Object.fromEntries(formData.entries()))
  const session=await requireRole(["admin","finance"])
  const [student]=await db.select().from(students).where(eq(students.id,data.studentId)).limit(1)
  if(!student||student.isArchived)return{error:"الطالب غير موجود"}
  const scope=branchScope(session); if(scope!==null&&scope!==student.branchId)return{error:"لا تملك صلاحية هذا الفرع"}
  const [fee]=await db.select().from(studentFees).where(and(eq(studentFees.studentId,student.id),eq(studentFees.academicYearId,student.academicYearId))).limit(1)
  if(!fee)return{error:"لم يتم تحديد رسوم الطالب"}
  const rows=await db.select({amount:discounts.amount}).from(discounts).where(eq(discounts.studentFeeId,fee.id))
  const used=rows.reduce((s,x)=>s+Number(x.amount),0)
  if(data.amount>Math.max(0,Number(fee.totalFees)-used))return{error:"قيمة الخصم أكبر من الرسوم المتبقية للخصم"}
  const [discount]=await db.insert(discounts).values({studentFeeId:fee.id,amount:data.amount.toFixed(2),reason:data.reason||null,createdBy:session.userId}).returning()
  await db.insert(auditLogs).values({userId:session.userId,action:"create",entityType:"discount",entityId:discount.id,description:`قام ${session.fullName} بإضافة خصم ${data.amount.toFixed(2)} للطالب ${student.fullName}`})
  revalidatePath("/finance/discounts");revalidatePath("/finance/fees")
  return{success:"تم تسجيل الخصم"}
 }catch(err){if(err instanceof z.ZodError)return{error:err.issues[0]?.message??"بيانات غير صحيحة"};if(err instanceof Error&&err.message==="FORBIDDEN")return{error:"لا تملك صلاحية تنفيذ هذه العملية"};return{error:"تعذر تسجيل الخصم"}}
}
