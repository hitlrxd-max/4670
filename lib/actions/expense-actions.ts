"use server"

import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { branches, expenseCategories, expenses, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const schema=z.object({
 branchId:z.coerce.number().int().positive(),
 categoryId:z.coerce.number().int().positive().nullable(),
 description:z.string().trim().min(2,"وصف المصروف مطلوب"),
 amount:z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
 expenseDate:z.string().min(1),
 paymentMethod:z.enum(["cash","bank_transfer","card","check","other"]),
 notes:z.string().trim().optional(),
})
export type ExpenseActionState={error?:string;success?:string}

export async function createExpenseAction(_prev:ExpenseActionState,formData:FormData):Promise<ExpenseActionState>{
 try{
  const session=await requireRole(["admin","finance"])
  const rawCat=String(formData.get("categoryId")??"").trim()
  const data=schema.parse({...Object.fromEntries(formData.entries()),categoryId:rawCat?rawCat:null})
  const scope=branchScope(session);if(scope!==null&&scope!==data.branchId)return{error:"لا تملك صلاحية هذا الفرع"}
  const [branch]=await db.select({id:branches.id}).from(branches).where(and(eq(branches.id,data.branchId),eq(branches.status,"active"))).limit(1)
  if(!branch)return{error:"الفرع غير موجود"}
  if(data.categoryId){const[c]=await db.select({id:expenseCategories.id}).from(expenseCategories).where(eq(expenseCategories.id,data.categoryId)).limit(1);if(!c)return{error:"تصنيف المصروف غير موجود"}}
  const [expense]=await db.insert(expenses).values({branchId:data.branchId,categoryId:data.categoryId,description:data.description,amount:data.amount.toFixed(2),expenseDate:data.expenseDate,paymentMethod:data.paymentMethod,employeeId:session.userId,notes:data.notes||null}).returning({id:expenses.id})
  await db.insert(auditLogs).values({userId:session.userId,action:"create",entityType:"expense",entityId:expense.id,description:"تم تسجيل مصروف"})
  revalidatePath("/finance/expenses");revalidatePath("/finance/reports");revalidatePath("/dashboard")
  return{success:"تم تسجيل المصروف بنجاح"}
 }catch(err){if(err instanceof z.ZodError)return{error:err.issues[0]?.message??"تحقق من البيانات"};return{error:"تعذر تسجيل المصروف"}}
}