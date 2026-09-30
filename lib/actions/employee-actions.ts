"use server"

import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { employees, branches, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const schema=z.object({
 fullName:z.string().trim().min(2,"اسم الموظف مطلوب"),
 employeeCode:z.string().trim().min(1,"رقم الموظف مطلوب").max(50),
 position:z.string().trim().optional(),
 department:z.string().trim().optional(),
 branchId:z.coerce.number().int().positive(),
 phone:z.string().trim().optional(),
 hireDate:z.string().optional(),
 qualifications:z.string().trim().optional(),
 notes:z.string().trim().optional(),
})
export type EmployeeActionState={error?:string;success?:string}

export async function createEmployeeAction(_prev:EmployeeActionState,formData:FormData):Promise<EmployeeActionState>{
 try{
  const session=await requireRole(["admin","hr"])
  const data=schema.parse(Object.fromEntries(formData.entries()))
  const scope=branchScope(session)
  if(scope!==null&&scope!==data.branchId)return{error:"لا تملك صلاحية هذا الفرع"}
  const [branch]=await db.select({id:branches.id}).from(branches).where(and(eq(branches.id,data.branchId),eq(branches.status,"active"))).limit(1)
  if(!branch)return{error:"الفرع غير موجود أو غير نشط"}
  const [dup]=await db.select({id:employees.id}).from(employees).where(eq(employees.employeeCode,data.employeeCode)).limit(1)
  if(dup)return{error:"رقم الموظف مستخدم بالفعل"}
  const [employee]=await db.insert(employees).values({
   fullName:data.fullName,employeeCode:data.employeeCode,position:data.position||null,department:data.department||null,
   branchId:data.branchId,phone:data.phone||null,hireDate:data.hireDate||null,qualifications:data.qualifications||null,notes:data.notes||null
  }).returning({id:employees.id})
  await db.insert(auditLogs).values({userId:session.userId,action:"create",entityType:"employee",entityId:employee.id,description:"تمت إضافة موظف جديد"})
  revalidatePath("/hr/employees");revalidatePath("/users");revalidatePath("/dashboard")
  return{success:"تمت إضافة الموظف بنجاح"}
 }catch(err){
  if(err instanceof z.ZodError)return{error:err.issues[0]?.message??"تحقق من البيانات"}
  return{error:"تعذر إضافة الموظف"}
 }
}