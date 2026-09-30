"use server"

import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { students, studentAttendance, employees, employeeAttendance, academicYears, auditLogs } from "@/db/schema"
import { branchScope, requireRole } from "@/lib/auth"

const studentSchema=z.object({studentId:z.coerce.number().int().positive(),status:z.enum(["present","absent","late","excused"]),date:z.string().min(1),notes:z.string().trim().optional()})
const employeeSchema=z.object({employeeId:z.coerce.number().int().positive(),status:z.enum(["present","absent","late","left_early"]),date:z.string().min(1),notes:z.string().trim().optional()})

export async function saveStudentAttendanceAction(formData:FormData){
 const session=await requireRole(["admin","student_affairs"])
 const data=studentSchema.parse(Object.fromEntries(formData.entries()))
 const [student]=await db.select().from(students).where(eq(students.id,data.studentId)).limit(1)
 if(!student)throw new Error("NOT_FOUND")
 const scope=branchScope(session);if(scope!==null&&scope!==student.branchId)throw new Error("FORBIDDEN")
 const [existing]=await db.select({id:studentAttendance.id}).from(studentAttendance).where(and(eq(studentAttendance.studentId,data.studentId),eq(studentAttendance.date,data.date))).limit(1)
 if(existing)await db.update(studentAttendance).set({status:data.status,notes:data.notes||null}).where(eq(studentAttendance.id,existing.id))
 else await db.insert(studentAttendance).values({studentId:data.studentId,branchId:student.branchId,academicYearId:student.academicYearId,date:data.date,status:data.status,notes:data.notes||null})
 await db.insert(auditLogs).values({userId:session.userId,action:"save",entityType:"student_attendance",entityId:data.studentId,description:"تم تسجيل حضور الطالب"})
 revalidatePath("/attendance/students");revalidatePath("/attendance/reports")
}

export async function saveEmployeeAttendanceAction(formData:FormData){
 const session=await requireRole(["admin","hr"])
 const data=employeeSchema.parse(Object.fromEntries(formData.entries()))
 const [employee]=await db.select().from(employees).where(eq(employees.id,data.employeeId)).limit(1)
 if(!employee)throw new Error("NOT_FOUND")
 const scope=branchScope(session);if(scope!==null&&scope!==employee.branchId)throw new Error("FORBIDDEN")
 const [existing]=await db.select({id:employeeAttendance.id}).from(employeeAttendance).where(and(eq(employeeAttendance.employeeId,data.employeeId),eq(employeeAttendance.date,data.date))).limit(1)
 if(existing)await db.update(employeeAttendance).set({status:data.status,notes:data.notes||null}).where(eq(employeeAttendance.id,existing.id))
 else await db.insert(employeeAttendance).values({employeeId:data.employeeId,branchId:employee.branchId,date:data.date,status:data.status,notes:data.notes||null})
 await db.insert(auditLogs).values({userId:session.userId,action:"save",entityType:"employee_attendance",entityId:data.employeeId,description:"تم تسجيل حضور الموظف"})
 revalidatePath("/attendance/employees");revalidatePath("/attendance/reports")
}